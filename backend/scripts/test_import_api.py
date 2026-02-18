
import requests
import os

API_URL = "http://localhost:8000/api/v1"
# Login to get token first if needed, but for now we might be able to use the endpoints if they aren't super protected or we can get a token.
# Actually, the endpoints depend on `current_user`. I need a token.

def login(email, password):
    response = requests.post(f"{API_URL}/auth/login/access-token", data={"username": email, "password": password})
    if response.status_code == 200:
        return response.json()["access_token"]
    print(f"Login failed: {response.text}")
    return None

def import_calendar(token):
    file_path = "migrationParcelFair/auctionsAL.csv"
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    print("Importing Calendar...")
    with open(file_path, "rb") as f:
        files = {"file": ("auctionsAL.csv", f, "text/csv")}
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.post(
            f"{API_URL}/ingestion/import-parcelfair?import_type=calendar",
            headers=headers,
            files=files
        )
        print(f"Calendar Import Status: {response.status_code}")
        print(response.text)

def import_properties(token):
    file_path = "migrationParcelFair/Arkansas-properties-all-2026-02-16.csv"
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    print("Importing Properties...")
    with open(file_path, "rb") as f:
        files = {"file": ("Arkansas-properties-all-2026-02-16.csv", f, "text/csv")}
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.post(
            f"{API_URL}/ingestion/import-parcelfair?import_type=properties",
            headers=headers,
            files=files
        )
        print(f"Properties Import Status: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    token = login("admin@example.com", "password123")
    if token:
        import_calendar(token)
        import_properties(token)
