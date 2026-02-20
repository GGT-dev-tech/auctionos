import requests
import json
import time

base_url = "http://localhost:8000/api/v1"

# 1. Login to get token
login_data = {"username": "admin@auctionpro.com", "password": "password"}
response = requests.post(f"{base_url}/auth/login/access-token", data=login_data)
if response.status_code != 200:
    print("Login failed:", response.text)
    exit(1)

token = response.json().get("access_token")
headers = {"Authorization": f"Bearer {token}"}

# 2. Upload file
with open("auctionsCO.csv", "rb") as f:
    files = {"file": ("auctionsCO.csv", f, "text/csv")}
    upload_res = requests.post(f"{base_url}/admin/import/auctions", headers=headers, files=files)

print("Upload Status:", upload_res.status_code)
# print("Upload Response:", upload_res.text)
job_id = upload_res.json().get("job_id")
print(f"Got Job ID: {job_id}")

# 3. Poll for status
for _ in range(10):
    time.sleep(1)
    status_res = requests.get(f"{base_url}/admin/import/status/{job_id}", headers=headers)
    status = status_res.json().get("status")
    print(f"Status: {status}")
    if status != "pending":
        break
