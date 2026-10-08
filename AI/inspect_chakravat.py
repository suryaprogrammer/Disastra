import os
import hashlib
import zipfile
import json
import traceback
from pathlib import Path

ZIP_PATH = r"D:\Disastra\AI\downloads\TyphoonSat\chakravat-weights-v1.0.zip"
TARGET_HASH = "899effb7ea19bd51396f78debbfe35adb8503c5e0000530ed58967cbc8e7d251"
EXTRACT_DIR = r"D:\Disastra\AI\temp\chakravat_v1_inspection"

def calculate_sha256(filepath):
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def main():
    report = {
        "zip_exists": False,
        "zip_size": 0,
        "sha256": "",
        "hash_match": False,
        "extracted": False,
        "inventory": [],
        "model_files": [],
        "detector_info": {}
    }

    print("Checking ZIP...")
    if not os.path.exists(ZIP_PATH):
        print("ZIP not found.")
        print(json.dumps(report))
        return

    report["zip_exists"] = True
    report["zip_size"] = os.path.getsize(ZIP_PATH)
    
    print("Calculating hash...")
    actual_hash = calculate_sha256(ZIP_PATH)
    report["sha256"] = actual_hash
    report["hash_match"] = (actual_hash.lower() == TARGET_HASH.lower())

    print(f"Hash: {actual_hash} (Match: {report['hash_match']})")

    # Extract
    print(f"Extracting to {EXTRACT_DIR}...")
    os.makedirs(EXTRACT_DIR, exist_ok=True)
    try:
        with zipfile.ZipFile(ZIP_PATH, 'r') as zip_ref:
            zip_ref.extractall(EXTRACT_DIR)
        report["extracted"] = True
    except Exception as e:
        print(f"Extraction failed: {e}")
        print(json.dumps(report))
        return

    # Inventory
    model_extensions = {".pt", ".pth", ".ckpt", ".onnx", ".h5", ".keras"}
    for root, dirs, files in os.walk(EXTRACT_DIR):
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, EXTRACT_DIR)
            size = os.path.getsize(full_path)
            ext = os.path.splitext(file)[1].lower()
            
            file_info = {
                "filename": file,
                "relative_path": rel_path,
                "size": size,
                "extension": ext
            }
            report["inventory"].append(file_info)

            if ext in model_extensions:
                report["model_files"].append(file_info)

    # Inspect models
    import torch
    for model_info in report["model_files"]:
        if model_info["extension"] in {".pt", ".pth"}:
            full_path = os.path.join(EXTRACT_DIR, model_info["relative_path"])
            inspection_info = {
                "file": model_info["filename"],
                "is_torch_readable": False,
                "type": "unknown",
                "framework": "unknown",
                "ultralytics_compatible": False,
                "error": None,
                "classes": None
            }
            try:
                # Need weights_only=False to load Ultralytics checkpoints (they use custom classes like yaml configs inside)
                ckpt = torch.load(full_path, map_location="cpu")
                inspection_info["is_torch_readable"] = True
                
                # Check what type of checkpoint this is
                if isinstance(ckpt, dict):
                    inspection_info["type"] = "dict"
                    # Ultralytics checks:
                    if 'model' in ckpt and 'epoch' in ckpt:
                        # Could be YOLOv5 or YOLOv8/11
                        model_obj = ckpt['model']
                        
                        # In ultralytics, the model has an architecture
                        if hasattr(model_obj, "names"):
                            inspection_info["ultralytics_compatible"] = True
                            inspection_info["framework"] = "Ultralytics YOLO (likely v8/11)"
                            inspection_info["classes"] = model_obj.names
                        elif type(model_obj).__name__ == "Model":
                            # YOLOv5 Check
                            inspection_info["ultralytics_compatible"] = True
                            inspection_info["framework"] = "Ultralytics YOLOv5"
                            if hasattr(model_obj, "names"):
                                inspection_info["classes"] = model_obj.names
                        else:
                            inspection_info["framework"] = f"PyTorch custom dict (model type: {type(model_obj).__name__})"
                    elif 'state_dict' in ckpt:
                        inspection_info["framework"] = "PyTorch custom dict (state_dict only)"
                    else:
                        inspection_info["framework"] = "PyTorch generic dict"
                else:
                    inspection_info["type"] = type(ckpt).__name__
                    inspection_info["framework"] = "PyTorch entire model object"
                    if hasattr(ckpt, 'names'):
                        inspection_info["classes"] = ckpt.names

            except Exception as e:
                inspection_info["error"] = str(e)

            report["detector_info"][model_info["filename"]] = inspection_info

    print("Outputting JSON report...")
    with open("chakravat_report.json", "w") as f:
        json.dump(report, f, indent=2)

if __name__ == "__main__":
    main()
