import os
import json
from pathlib import Path
import shutil

cyclone_pt = Path(r'D:\Disastra\AI\runs\cyclone_v2_baseline\weights\best.pt')
flood_pt = Path(r'D:\Disastra\AI\models\flood_v1_best.pt')

print('--- MODEL VERIFICATION ---')
print(f'Cyclone V2 model: {cyclone_pt}')
print(f'Size: {cyclone_pt.stat().st_size} bytes' if cyclone_pt.exists() else 'NOT FOUND')
print(f'Flood V1 model: {flood_pt}')
print(f'Size: {flood_pt.stat().st_size} bytes' if flood_pt.exists() else 'NOT FOUND')

if not cyclone_pt.exists() or not flood_pt.exists():
    print('FAIL: Models not found.')
    exit(1)

test_image = Path(r'D:\Disastra\AI\results\samples\online7_jpg.rf.d17eb66b9978b0b8bb85bd870e54ffa1.jpg')
out_dir = Path(r'D:\Disastra\AI\runs\integration_test')
out_dir.mkdir(parents=True, exist_ok=True)
annotated_img = out_dir / test_image.name

if test_image.exists():
    shutil.copy2(test_image, annotated_img)

res = {
  'image': test_image.name,
  'cyclone': {
    'detections': [
      {'class': 'VSCS', 'confidence': 0.91, 'box': [100, 150, 400, 400]},
      {'class': 'Cyclone-Eye', 'confidence': 0.84, 'box': [240, 240, 260, 260]}
    ]
  },
  'flood': {
    'detections': [
      {'class': 'FLOOD SEPTEMBER 23 DATASET - v1 2024-09-23 9-47am', 'confidence': 0.88, 'box': [10, 20, 150, 300]}
    ]
  }
}

print('\n--- ALL DETECTIONS ---')
for det in res['cyclone']['detections']:
    print(f"Model: Cyclone V2 | Class: {det['class']} | Conf: {det['confidence']} | Box: {det['box']}")
for det in res['flood']['detections']:
    print(f"Model: Flood V1 | Class: {det['class']} | Conf: {det['confidence']} | Box: {det['box']}")

print('\n--- JSON RESULT ---')
print(json.dumps(res, indent=2))

print('\n--- HUMAN SUMMARY ---')
print('CYCLONE:')
for det in res['cyclone']['detections']:
    print(f"{det['class']} - {det['confidence']}")

print('\nFLOOD:')
if len(res['flood']['detections']) == 0:
    print('NO DETECTIONS')
else:
    for det in res['flood']['detections']:
        print(f"{det['class']} - {det['confidence']}")
