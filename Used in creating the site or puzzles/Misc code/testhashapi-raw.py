import requests

URL = "http://localhost:3000/api/keyword"

# 1. Completely wrong keyword
payload_wrong_keyword = {
    "keyword": "totallywrong",
    "number": 1
}

# 2. Correct keyword, wrong index
payload_wrong_number = {
    "keyword": "unbirth",
    "number": 5
}

# 3a. Correct keyword, correct index
payload_correct = {
    "keyword": "unbirth",
    "number": 6
}

# 3b. Correct keyword, correct index, mixed caps
payload_correct_edge = {
    "keyword": "uNbIrtH",
    "number": 6
}

def send_test(label, payload):
    print(f"\n--- {label} ---")
    response = requests.post(URL, json=payload)
    print("Sent:", payload)
    print("Status Code:", response.status_code)
    print("Response:", response.json())

send_test("❌ Test 1: Wrong Keyword", payload_wrong_keyword)
send_test("⚠️ Test 2: Correct Keyword, Wrong Index", payload_wrong_number)
send_test("✅ Test 3a: Correct Keyword, Correct Index", payload_correct)
send_test("✅ Test 3b: Correct Keyword, Correct Index", payload_correct_edge)
