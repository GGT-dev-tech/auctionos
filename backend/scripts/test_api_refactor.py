import requests
import json

API_URL = "http://localhost:8000/api/v1"

def get_token():
    try:
        data = {
            "username": "admin@example.com",
            "password": "admin"
        }
        response = requests.post(f"{API_URL}/auth/login/access-token", data=data)
        if response.status_code == 200:
            return response.json()["access_token"]
        else:
            print(f"Login failed: {response.text}")
            return None
    except Exception as e:
        print(f"Login error: {e}")
        return None

def test_api():
    token = get_token()
    if not token:
        print("Skipping API test due to login failure.")
        return

    headers = {"Authorization": f"Bearer {token}"}

    try:
        # Test List API
        print("Testing Property List API...")
        response = requests.get(f"{API_URL}/properties/?skip=0&limit=5", headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"Received {len(data)} properties")
            if len(data) > 0:
                prop = data[0]
                # print("Sample Property Keys:", prop.keys())
                print(f"Parcel Number: {prop.get('parcel_number')}")
                print(f"Amount Due: {prop.get('amount_due')}")
                
                prop_id = prop['id']
                print(f"Testing Property Detail API for ID: {prop_id}...")
                response = requests.get(f"{API_URL}/properties/{prop_id}", headers=headers)
                if response.status_code == 200:
                    prop_detail = response.json()
                    print("Detail retrieved successfully.")
                    print(f"Owner: {prop_detail.get('owner_name')}")
                else:
                     print(f"Failed to fetch property details: {response.status_code}")
        else:
            print(f"Failed to fetch properties: {response.status_code} - {response.text}")

    except Exception as e:
        print(f"Error testing API: {e}")

if __name__ == "__main__":
    test_api()
