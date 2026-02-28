import requests

BASE_URL = "http://127.0.0.1:5000/api"

print("--- DRISHYAMITRA SERVICE VERIFICATION ---")

# 1. Test the Groq AI Chat
print("\n1. Testing Groq AI Chat Service...")
try:
    chat_res = requests.post(f"{BASE_URL}/chat", json={"message": "Hello, are you online?"})
    if chat_res.status_code == 200:
        print("✅ SUCCESS! Groq replied:", chat_res.json().get('reply'))
    else:
        print("❌ FAILED! Check your GROQ_API_KEY in the .env file.")
        print("Error:", chat_res.text)
except Exception as e:
    print("Server not reachable. Is app.py running?")

# 2. Test the Gmail Delivery
print("\n2. Testing Gmail Service...")
# CHANGE THIS to your own personal email to see if you get the test message
test_email = "your_personal_email@example.com" 

try:
    email_res = requests.post(f"{BASE_URL}/delivery/email", json={"email": test_email})
    if email_res.status_code == 200:
        print(f"✅ SUCCESS! Email sent to {test_email}. Go check your inbox!")
    else:
        print("❌ FAILED! Check your GMAIL_EMAIL and 16-digit App Password.")
        print("Error:", email_res.text)
except Exception as e:
    print("Server not reachable.")