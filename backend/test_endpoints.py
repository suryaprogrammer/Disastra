import requests
import json

base_url = "http://127.0.0.1:8000/api"

endpoints = [
    ("GET", "/weather?lat=40.7&lon=-74", None),
    ("POST", "/analyze/disaster", {"image_path": "D:\\Disastra\\AI\\sample.jpg", "latitude": 40.7, "longitude": -74.0}),
    ("POST", "/ai/brief", {"observation_id": "test_obs_123"}),
    ("GET", "/agent/status", None),
    ("POST", "/agent/cycle", None),
    ("GET", "/alerts", None)
]

for method, path, data in endpoints:
    url = base_url + path
    try:
        if method == "GET":
            response = requests.get(url)
        else:
            response = requests.post(url, json=data)
        
        print(f"[{method}] {path} -> {response.status_code}")
        if response.status_code >= 400:
            print(f"  Response: {response.text}")
    except Exception as e:
        print(f"[{method}] {path} -> ERROR: {e}")
