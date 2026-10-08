# Cyclone Model Integration Guide

This document explains how the resulting `best.pt` from the Roboflow/Ultralytics Cloud training phase will be integrated into the Disastra application backend.

## Expected Inference Flow

Once the model is deployed locally, the future Disastra application backend will execute the following pipeline:

1. **Input**: Receive an image or video feed.
2. **Detection (Cyclone YOLO model)**: Process the feed using `best.pt`.
3. **Classification**: Extract Cyclone classifications (e.g., `CS`, `VSCS`, `Cyclone-Eye`).
4. **Confidence**: Filter out low-confidence predictions (e.g., `< 0.6`).
5. **Bounding Box**: Extract spatial coordinates of the detected cyclone elements.
6. **Severity/Risk Engine**: A heuristic engine will combine the detection results with geospatial metadata to assess risk.
7. **LLM Reasoning Layer**: Pass structured detection data to an LLM to generate plain-language disaster reports.
8. **Disaster Alert**: Broadcast the final structured alert.

## Backend Implementation Status
**NOTE:** Do not implement the backend yet. Do not modify the existing backend. This flow is strictly an integration blueprint for the future when the `best.pt` artifact is returned from cloud training.
