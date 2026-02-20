from app.core.config import Settings
import os

def test_cors_parsing():
    # Test 1: JSON format
    os.environ["BACKEND_CORS_ORIGINS"] = '["http://localhost:3000"]'
    s = Settings()
    assert s.BACKEND_CORS_ORIGINS == ["http://localhost:3000"]
    print("Test 1 (JSON) Passed")

    # Test 2: Comma separated
    os.environ["BACKEND_CORS_ORIGINS"] = "http://foo.com,http://bar.com"
    s = Settings()
    assert s.BACKEND_CORS_ORIGINS == ["http://foo.com", "http://bar.com"]
    print("Test 2 (CSV) Passed")
    
    # Test 3: Default
    del os.environ["BACKEND_CORS_ORIGINS"]
    s = Settings()
    assert "http://localhost:3000" in s.BACKEND_CORS_ORIGINS
    print("Test 3 (Default) Passed")

if __name__ == "__main__":
    test_cors_parsing()
