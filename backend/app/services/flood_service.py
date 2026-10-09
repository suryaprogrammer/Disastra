import os
import cv2
import numpy as np
import onnxruntime as ort
from pathlib import Path
from app.core.config import settings

class FloodModelService:
    def __init__(self):
        # Change model path from .pt to .onnx
        self.model_path = str(settings.FLOOD_MODEL_PATH).replace(".pt", ".onnx")
        self.error = None
        self.session = None
        
        try:
            # Memory optimization: bound CPU threads to avoid memory spikes
            opts = ort.SessionOptions()
            opts.intra_op_num_threads = 1
            opts.inter_op_num_threads = 1
            
            self.session = ort.InferenceSession(self.model_path, sess_options=opts, providers=['CPUExecutionProvider'])
            self.classes = {0: "water"}
            self.task = "segment"
            self.name = Path(self.model_path).name
        except Exception as e:
            import traceback
            self.error = traceback.format_exc()
            self.name = "error"
            self.task = "error"
            self.classes = {}

    def analyze_image(self, image_bytes: bytes, filename: str, conf_threshold: float = 0.25) -> dict:
        if self.error:
            raise ValueError(f"Model failed to load on server: {self.error}")
            
        # Load image directly into OpenCV using numpy
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise ValueError("Invalid image data")

        orig_shape = img.shape[:2]
        input_size = 640
        ratio = input_size / max(orig_shape)
        new_unpad = (int(round(orig_shape[1] * ratio)), int(round(orig_shape[0] * ratio)))
        
        dw = (input_size - new_unpad[0]) / 2
        dh = (input_size - new_unpad[1]) / 2
        
        img_resized = cv2.resize(img, new_unpad, interpolation=cv2.INTER_LINEAR)
        top, bottom = int(round(dh - 0.1)), int(round(dh + 0.1))
        left, right = int(round(dw - 0.1)), int(round(dw + 0.1))
        
        img_pad = cv2.copyMakeBorder(img_resized, top, bottom, left, right, cv2.BORDER_CONSTANT, value=(114, 114, 114))
        
        # Convert BGR to RGB and format for ONNX [1, C, H, W]
        img_rgb = cv2.cvtColor(img_pad, cv2.COLOR_BGR2RGB)
        img_chw = np.transpose(img_rgb, (2, 0, 1))
        img_chw = np.expand_dims(img_chw, axis=0).astype(np.float32) / 255.0

        # Inference
        input_name = self.session.get_inputs()[0].name
        outputs = self.session.run(None, {input_name: img_chw})
        
        pred = outputs[0][0].T  # (8400, 37)
        protos = outputs[1][0]  # (32, 160, 160)
        
        # Filter by confidence
        scores = pred[:, 4]
        mask_conf = scores > conf_threshold
        pred = pred[mask_conf]
        
        detections = []
        if len(pred) > 0:
            boxes = pred[:, :4]
            conf = pred[:, 4]
            mask_coeffs = pred[:, 5:]
            
            x1 = boxes[:, 0] - boxes[:, 2] / 2
            y1 = boxes[:, 1] - boxes[:, 3] / 2
            
            boxes_nms = np.column_stack((x1, y1, boxes[:, 2], boxes[:, 3])).tolist()
            indices = cv2.dnn.NMSBoxes(boxes_nms, conf.tolist(), conf_threshold, 0.45)
            
            if len(indices) > 0:
                indices = indices.flatten()
                for idx in indices:
                    c = float(conf[idx])
                    b = boxes[idx]
                    
                    # Compute box for frontend (original image scale)
                    bx1 = b[0] - b[2] / 2 - left
                    by1 = b[1] - b[3] / 2 - top
                    bx2 = b[0] + b[2] / 2 - left
                    by2 = b[1] + b[3] / 2 - top
                    
                    bx1, by1 = bx1 / ratio, by1 / ratio
                    bx2, by2 = bx2 / ratio, by2 / ratio
                    
                    # Compute mask box in 160x160 scale
                    box_x1 = b[0] - b[2] / 2
                    box_y1 = b[1] - b[3] / 2
                    box_x2 = b[0] + b[2] / 2
                    box_y2 = b[1] + b[3] / 2
                    
                    box_x1, box_y1 = int(box_x1 / 4), int(box_y1 / 4)
                    box_x2, box_y2 = int(box_x2 / 4), int(box_y2 / 4)
                    
                    box_x1 = max(0, min(160, box_x1))
                    box_y1 = max(0, min(160, box_y1))
                    box_x2 = max(0, min(160, box_x2))
                    box_y2 = max(0, min(160, box_y2))
                    
                    # Mask generation
                    coeff = mask_coeffs[idx]
                    mask = coeff @ protos.reshape(protos.shape[0], -1)
                    mask = 1 / (1 + np.exp(-mask)) # Sigmoid
                    mask = mask.reshape(protos.shape[1], protos.shape[2])
                    
                    # Zero out mask outside bounding box
                    box_mask = np.zeros_like(mask)
                    box_mask[box_y1:box_y2, box_x1:box_x2] = 1
                    mask = mask * box_mask
                    
                    mt = int(top / 4)
                    mb = 160 - int(bottom / 4)
                    ml = int(left / 4)
                    mr = 160 - int(right / 4)
                    
                    mask_cropped = mask[mt:mb, ml:mr]
                    mask_resized = cv2.resize(mask_cropped, (orig_shape[1], orig_shape[0]))
                    mask_binary = mask_resized > 0.5
                    
                    mask_area_ratio = float(np.sum(mask_binary) / (orig_shape[0] * orig_shape[1]))
                    
                    detections.append({
                        "class_id": 0,
                        "class_name": "water",
                        "confidence": c,
                        "box": {
                            "x1": float(bx1),
                            "y1": float(by1),
                            "x2": float(bx2),
                            "y2": float(by2)
                        },
                        "mask_present": True,
                        "mask_area_ratio": mask_area_ratio
                    })

        # Explicit garbage collection of large numpy arrays
        del img, img_resized, img_pad, img_rgb, img_chw, outputs
        
        return {
            "success": True,
            "model": {
                "name": self.name,
                "task": self.task,
                "classes": self.classes
            },
            "image": {
                "filename": filename
            },
            "analysis": {
                "water_detected": len(detections) > 0,
                "detection_count": len(detections)
            },
            "detections": detections
        }

# Global singleton instance for the service
flood_service = FloodModelService()
