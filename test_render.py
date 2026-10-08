import httpx
import sys

BASE_URL = "https://disastra-backend.onrender.com"
dummy_image = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
image_data = dummy_image

client = httpx.Client(timeout=180.0)

print("Testing /api/analyze/flood ...")
files = {'file': ('image.jpg', image_data, 'image/jpeg')}
r = client.post(f"{BASE_URL}/api/analyze/flood", files=files)
print(r.status_code)
try:
    print(r.json())
except:
    print(r.text)

print("\nTesting /api/analyze/disaster ...")
files = {'file': ('image.jpg', image_data, 'image/jpeg')}
r = client.post(f"{BASE_URL}/api/analyze/disaster", files=files)
print(r.status_code)
try:
    print(r.json())
except:
    print(r.text)
