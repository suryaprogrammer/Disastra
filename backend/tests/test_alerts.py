import requests
import time

BASE_URL = "http://127.0.0.1:8000/api/alerts"

def test_alerts():
    print("Fetching alerts...")
    res = requests.get(BASE_URL)
    print("Alerts:", res.json())

    print("\nTriggering TEST alert...")
    res = requests.post(f"{BASE_URL}/test")
    if res.status_code == 200:
        alert = res.json()
        print("Created Alert:", alert["alert_id"])
        print("Status:", alert["status"])
        print("Message:\n", alert["message"])
    else:
        print("Failed to trigger alert:", res.text)

    print("\nFetching alerts again...")
    res = requests.get(BASE_URL)
    print(f"Total alerts: {len(res.json())}")
    
if __name__ == "__main__":
    test_alerts()
