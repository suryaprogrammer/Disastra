import httpx
import time

BASE_URL = "http://127.0.0.1:8000"

def run_demo():
    print("Starting End-to-End Demo Workflow...")
    timeout = httpx.Timeout(60.0)
    client = httpx.Client(timeout=timeout)
    
    # 1. Analyze Event -> YOLO -> Risk
    dummy_image = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
    files = {'file': ('dummy_e2e.png', dummy_image, 'image/png')}
    print("\nPOST /api/analyze/disaster")
    r = client.post(f"{BASE_URL}/api/analyze/disaster", files=files)
    print(f"Status: {r.status_code}")
    data = r.json()
    obs_id = data.get("observation_id")
    print(f"Observation ID: {obs_id}")
    
    # 2. Weather
    print("\nGET /api/weather?lat=19.076&lon=72.8777")
    r_weather = client.get(f"{BASE_URL}/api/weather?lat=19.076&lon=72.8777")
    print(f"Status: {r_weather.status_code}")
    
    # 3. Agent (trigger cycle manually)
    print("\nPOST /api/agent/cycle")
    r_agent = client.post(f"{BASE_URL}/api/agent/cycle")
    print(f"Status: {r_agent.status_code}")
    agent_data = r_agent.json()
    print("Agent Cycle details:", agent_data)
    print("Agent Action:", agent_data.get("recommended_agent_action", agent_data.get("state", {}).get("recommended_agent_action", "UNKNOWN")))
    print("Agent Cycle Observation ID:", agent_data.get("observation_id", agent_data.get("state", {}).get("observation_id", "UNKNOWN")))
    
    # 4. Alerts
    print("\nGET /api/alerts/")
    r_alerts = client.get(f"{BASE_URL}/api/alerts/")
    print(f"Status: {r_alerts.status_code}")
    alerts = r_alerts.json()
    found = False
    for a in alerts:
        if a.get("observation_id") == obs_id:
            found = True
            print("Alert found for observation_id!")
            break
    if not found:
        print("No alert found (might be because risk wasn't critical enough).")
        
    print("\nDemo Finished.")

if __name__ == '__main__':
    run_demo()
