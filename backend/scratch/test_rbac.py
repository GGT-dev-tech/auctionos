
import sys
import os

# Mocking the environment
os.environ["DATABASE_URL"] = "sqlite:///./test.db"

# Adding the backend path
sys.path.append("/Users/gustavo/Downloads/auctionos/backend")

from app.api.deps import get_current_active_manager
from app.models.user import User
from fastapi import HTTPException
import pytest

def test_rbac_manager():
    # Mock user
    manager = User(role="manager", is_superuser=False)
    client = User(role="client", is_superuser=False)
    agent = User(role="agent", is_superuser=False)
    
    # Manager should pass
    assert get_current_active_manager(manager) == manager
    # Client should pass
    assert get_current_active_manager(client) == client
    
    # Agent should fail
    try:
        get_current_active_manager(agent)
        assert False, "Agent should not be allowed as manager"
    except HTTPException as e:
        assert e.status_code == 403

if __name__ == "__main__":
    try:
        test_rbac_manager()
        print("RBAC Test Passed!")
    except Exception as e:
        print(f"RBAC Test Failed: {e}")
        sys.exit(1)
