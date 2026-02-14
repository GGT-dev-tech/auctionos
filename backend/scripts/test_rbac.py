
import requests
import sys

API_URL = "http://localhost:8000/api/v1"
ADMIN_EMAIL = "admin@auctionpro.com"
ADMIN_PASSWORD = "password"

def get_token(email, password):
    response = requests.post(
        f"{API_URL}/auth/login/access-token",
        data={"username": email, "password": password}
    )
    if response.status_code != 200:
        print(f"Failed to login {email}: {response.text}")
        sys.exit(1)
    return response.json()["access_token"]

def test_rbac():
    print("--- Testing RBAC & Company Logic ---")

    # 1. Login as Admin
    print("\n1. Logging in as Admin...")
    admin_token = get_token(ADMIN_EMAIL, ADMIN_PASSWORD)
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("Admin logged in successfully.")

    # 2. Create Company "Test LLC"
    print("\n2. Creating Company 'Test LLC'...")
    company_data = {"name": "Test LLC"}
    resp = requests.post(f"{API_URL}/companies/", json=company_data, headers=admin_headers)
    if resp.status_code == 200:
        company = resp.json()
        print(f"Company created: {company['id']} - {company['name']}")
    elif resp.status_code == 400 and "exists" in resp.text:
        print("Company already exists. Fetching list...")
        resp = requests.get(f"{API_URL}/companies/", headers=admin_headers)
        companies = resp.json()
        company = next((c for c in companies if c["name"] == "Test LLC"), None)
        if not company:
            print("Could not find existing company.")
            sys.exit(1)
        print(f"Found existing company: {company['id']} - {company['name']}")
    else:
        print(f"Failed to create company: {resp.text}")
        sys.exit(1)

    company_id = company["id"]

    # 3. Create Manager User
    manager_email = "manager_test@example.com"
    manager_password = "password"
    print(f"\n3. Creating Manager User '{manager_email}'...")
    
    user_data = {
        "email": manager_email,
        "password": manager_password,
        "role": "manager",
        "company_ids": [company_id]
    }
    
    # Check if user exists first to avoid conflict in test rerun
    # Since we can't search easily, we'll try create and handle 400
    resp = requests.post(f"{API_URL}/users/", json=user_data, headers=admin_headers)
    if resp.status_code == 200:
        manager = resp.json()
        print(f"Manager created: {manager['id']}")
    elif resp.status_code == 400 and "exists" in resp.text:
        print("Manager already exists.")
        # We need to find the user to verifying linking. 
        # But wait, Admin List Users should verify this.
    else:
        print(f"Failed to create manager: {resp.text}")
        sys.exit(1)

    # 4. Login as Manager
    print(f"\n4. Logging in as Manager '{manager_email}'...")
    manager_token = get_token(manager_email, manager_password)
    manager_headers = {"Authorization": f"Bearer {manager_token}"}
    print("Manager logged in successfully.")

    # 5. Verify Manager sees Company
    print("\n5. Verifying Manager sees 'Test LLC'...")
    resp = requests.get(f"{API_URL}/companies/", headers=manager_headers)
    if resp.status_code == 200:
        my_companies = resp.json()
        print(f"Manager companies: {[c['name'] for c in my_companies]}")
        if any(c['id'] == company_id for c in my_companies):
            print("SUCCESS: Manager sees 'Test LLC'.")
        else:
            print("FAILURE: Manager does NOT see 'Test LLC'.")
    else:
        print(f"Failed to list companies as manager: {resp.text}")

    # 6. Create restricted Agent
    print("\n6. Creating restricted Agent...")
    # TODO: Agents not fully tested here, focusing on Manager/Company
    
    print("\n--- RBAC Test Complete ---")

if __name__ == "__main__":
    test_rbac()
