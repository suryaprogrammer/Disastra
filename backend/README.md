# Disastra Backend

This is the FastAPI backend for the Disastra AI project, wrapping the pre-trained Flood YOLO segmentation model for real-time inference.

## Installation & Setup

1. Ensure Python 3.x is installed.
2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Copy `.env.example` to `.env` and configure the model path if necessary.
   - The default model path is `D:\Disastra\AI\models\github_best.pt`.

## Starting the Server

Run the server using Uvicorn:
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## API Documentation

Once the server is running, you can access the Swagger UI documentation at:
http://127.0.0.1:8000/docs

### Endpoints

- **`GET /`**: Root API to check backend status.
- **`GET /api/health`**: Check system health and model loading status.
- **`POST /api/analyze/flood`**: Upload an image for flood analysis.

### Request Format
For `/api/analyze/flood`, send a `multipart/form-data` request with the `file` field containing the image (JPEG, JPG, PNG, WEBP).

### Response Format
The API responds with JSON containing the model information, analysis summary, and detailed detections:

```json
{
    "success": true,
    "model": {
        "name": "github_best.pt",
        "task": "segment",
        "classes": {
            "0": "water"
        }
    },
    "image": {
        "filename": "example.jpg"
    },
    "analysis": {
        "water_detected": true,
        "detection_count": 1
    },
    "detections": [
        {
            "class_id": 0,
            "class_name": "water",
            "confidence": 0.87,
            "box": {
                "x1": 100,
                "y1": 120,
                "x2": 400,
                "y2": 500
            },
            "mask_present": true
        }
    ]
}
```

## Known Limitations
**IMPORTANT**: The underlying YOLO model detects "water", not necessarily a "flood". The API will return `water_detected: true` based on the model's output. It is the responsibility of upstream systems (like a Risk & Severity Engine) to combine this with other data (weather, location, etc.) to confirm an actual flood.
