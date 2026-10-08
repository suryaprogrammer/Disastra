import httpx
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_endpoints():
    print("Testing Endpoints...")
    
    timeout = httpx.Timeout(180.0)
    client = httpx.Client(timeout=timeout)
    
    # 1. Storage Status
    r = client.get(f"{BASE_URL}/api/storage/status")
    print(f"GET /api/storage/status -> {r.status_code}")
    print(r.json())
    
    # 2. Agent Status
    r = client.get(f"{BASE_URL}/api/agent/status")
    print(f"GET /api/agent/status -> {r.status_code}")
    print(r.json())
    
    # 3. Analyze Disaster (Create a dummy image to test pipeline)
    dummy_image = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
    files = {'file': ('dummy.png', dummy_image, 'image/png')}
    print("\nPOST /api/analyze/disaster (with dummy image)")
    r = client.post(f"{BASE_URL}/api/analyze/disaster", files=files)
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        print("Success!")
        observation_id = data.get("observation_id")
        print(f"Observation ID: {observation_id}")
        
        # Test AI Brief with the observation
        print(f"\nPOST /api/ai/brief (using observation_id: {observation_id})")
        ai_payload = {
            "observation_id": observation_id,
            "flood": {
                "water_detected": False,
                "detection_count": 0,
                "maximum_confidence": 0,
                "water_area_ratio": 0,
                "analysis_timestamp": "2026-10-08T00:00:00Z"
            },
            "risk": {
                "risk_score": 0,
                "risk_level": "LOW"
            }
        }
        r2 = client.post(f"{BASE_URL}/api/ai/brief", json=ai_payload)
        print(f"Status: {r2.status_code}")
        try:
            print(r2.json())
        except:
            print(r2.text)
            
    else:
        print(r.text)

    # 4. Agent History
    r = client.get(f"{BASE_URL}/api/agent/history")
    print(f"\nGET /api/agent/history -> {r.status_code}")
    # print(r.json())

    # 5. Incidents
    r = client.get(f"{BASE_URL}/api/incidents")
    print(f"\nGET /api/incidents -> {r.status_code}")
    # print(r.json())

    # 6. Alerts
    r = client.get(f"{BASE_URL}/api/alerts/")
    print(f"\nGET /api/alerts/ -> {r.status_code}")

if __name__ == '__main__':
    test_endpoints()
