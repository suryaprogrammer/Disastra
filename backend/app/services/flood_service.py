import os
import io
from pathlib import Path
from PIL import Image
from ultralytics import YOLO
from app.core.config import settings

class FloodModelService:
    def __init__(self):
        # The model is loaded once and kept in memory
        self.model_path = settings.FLOOD_MODEL_PATH
        self.model = YOLO(self.model_path)
        self.classes = self.model.names
        self.task = self.model.task
        self.name = Path(self.model_path).name

    def analyze_image(self, image_bytes: bytes, filename: str, conf_threshold: float = 0.25) -> dict:
        # Load image with PIL to verify it's valid and avoid saving to disk
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        except Exception as e:
            raise ValueError("Invalid image data")

        # Run inference
        results = self.model.predict(source=image, conf=conf_threshold, save=False)
        
        detections = []
        
        # Results is a list with one item since we passed a single image
        result = results[0]
        
        if result.boxes is not None and len(result.boxes) > 0:
            for i, box in enumerate(result.boxes):
                cls_id = int(box.cls[0].item())
                cls_name = self.classes.get(cls_id, "unknown")
                confidence = float(box.conf[0].item())
                coords = box.xyxy[0].tolist()
                
                mask_present = False
                mask_area_ratio = None
                if result.masks is not None and result.masks.data is not None and len(result.masks.data) > i:
                    mask_present = True
                    try:
                        import cv2
                        segment_xyn = result.masks.xyn[i]
                        if len(segment_xyn) >= 3:
                            # Using normalized coordinates for contourArea gives exactly the area ratio
                            # because the total normalized image area is 1.0 * 1.0 = 1.0
                            mask_area_ratio = float(cv2.contourArea(segment_xyn))
                    except Exception as e:
                        # Fallback if cv2 fails or segment is malformed
                        pass

                detections.append({
                    "class_id": cls_id,
                    "class_name": cls_name,
                    "confidence": confidence,
                    "box": {
                        "x1": coords[0],
                        "y1": coords[1],
                        "x2": coords[2],
                        "y2": coords[3]
                    },
                    "mask_present": mask_present,
                    "mask_area_ratio": mask_area_ratio
                })

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
