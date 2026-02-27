import requests

BASE_URL = "http://127.0.0.1:5000"

def test_backend():
    print("--- Testing Drishyamitra Authentication ---")
    
    # 1. Test Registration
    print("\n[1] Attempting to Register a test user...")
    register_payload = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "securepassword123"
    }
    
    try:
        reg_response = requests.post(f"{BASE_URL}/register", json=register_payload)
        print(f"Status: {reg_response.status_code}")
        print(f"Response: {reg_response.json()}")
    except requests.exceptions.ConnectionError:
        print("\n❌ FAILED to connect. Is your Flask server running in another terminal?")
        return

    # 2. Test Login
    print("\n[2] Attempting to Login with the test user...")
    login_payload = {
        "email": "test@example.com",
        "password": "securepassword123"
    }
    
    log_response = requests.post(f"{BASE_URL}/login", json=login_payload)
    print(f"Status: {log_response.status_code}")
    print(f"Response: {log_response.json()}")
    
    # Verify the outcome
    if log_response.status_code == 200 and "access_token" in log_response.json():
        print("\n✅ SUCCESS! Your database tables are created, and authentication works perfectly!")
    else:
        print("\n❌ FAILED. Something went wrong. Check the Flask console for error messages.")

if __name__ == "__main__":
    test_backend()