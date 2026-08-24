import shutil
import requests
import json
import os

file1 = 'test_data/chennai_optical_2024-06-28.tif'
file2 = 'test_data/chennai_optical_2024-07-28.tif'

# Create the test file for bi-temporal
if not os.path.exists(file2):
    shutil.copy(file1, file2)

url = 'http://127.0.0.1:8000/api/upload'

print("Uploading file 1...")
with open(file1, 'rb') as f1:
    r1 = requests.post(url, files={'file': (file1, f1, 'image/tiff')}).json()
    
print("Uploading file 2...")
with open(file2, 'rb') as f2:
    r2 = requests.post(url, files={'file': (file2, f2, 'image/tiff')}).json()
    
ids = [r1['id'], r2['id']]
url2 = 'http://127.0.0.1:8000/api/analysis'

print(f"Validating configuration for images {ids}...")
r = requests.post(url2, json={'image_ids': ids}).json()
print('Bi-Temporal Analysis Result:', json.dumps(r, indent=2))
