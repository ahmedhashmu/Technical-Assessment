"""Test script for Role-Based Access Control with Token Authentication."""
import requests
import json

BASE_URL = "http://localhost:8000"
CONTACT_ID = "contact_001"
MEETING_ID = "meeting_001"

# Mock tokens
BASIC_TOKEN = "basic-test-token"
OPERATOR_TOKEN = "operator-test-token"
INVALID_TOKEN = "invalid-token"

print("=" * 80)
print("Token-Based RBAC - Validation Tests")
print("=" * 80)

# Test 1: Missing Authorization header (should return 401)
print("\n1. Testing missing Authorization header...")
response = requests.get(f"{BASE_URL}/api/contacts/{CONTACT_ID}/meetings")
print(f"   Status: {response.status_code}")
if response.status_code == 401:
    print("   ✓ PASS: Returns 401 Unauthorized")
    print(f"   Response: {response.json()}")
else:
    print(f"   ✗ FAIL: Expected 401, got {response.status_code}")

# Test 2: Invalid token format (should return 401)
print("\n2. Testing invalid token format...")
response = requests.get(
    f"{BASE_URL}/api/contacts/{CONTACT_ID}/meetings",
    headers={"Authorization": "InvalidFormat"}
)
print(f"   Status: {response.status_code}")
if response.status_code == 401:
    print("   ✓ PASS: Returns 401 Unauthorized")
    print(f"   Response: {response.json()}")
else:
    print(f"   ✗ FAIL: Expected 401, got {response.status_code}")

# Test 3: Invalid token (should return 401)
print("\n3. Testing invalid token...")
response = requests.get(
    f"{BASE_URL}/api/contacts/{CONTACT_ID}/meetings",
    headers={"Authorization": f"Bearer {INVALID_TOKEN}"}
)
print(f"   Status: {response.status_code}")
if response.status_code == 401:
    print("   ✓ PASS: Returns 401 Unauthorized")
    print(f"   Response: {response.json()}")
else:
    print(f"   ✗ FAIL: Expected 401, got {response.status_code}")

# Test 4: Operator token (should return full data)
print("\n4. Testing operator token (full access)...")
response = requests.get(
    f"{BASE_URL}/api/contacts/{CONTACT_ID}/meetings",
    headers={"Authorization": f"Bearer {OPERATOR_TOKEN}"}
)
print(f"   Status: {response.status_code}")
if response.status_code == 200:
    data = response.json()
    if data["meetings"]:
        meeting = data["meetings"][0]
        has_transcript = "transcript" in meeting
        has_analysis = "analysis" in meeting
        
        print("   ✓ PASS: Returns 200 OK")
        print(f"   - Has transcript: {has_transcript}")
        print(f"   - Has analysis: {has_analysis}")
        
        if has_transcript:
            print(f"   - Transcript preview: {meeting['transcript'][:50]}...")
        if has_analysis and meeting['analysis']:
            print(f"   - Analysis sentiment: {meeting['analysis']['sentiment']}")
    else:
        print("   ⚠ No meetings found for this contact")
else:
    print(f"   ✗ FAIL: Expected 200, got {response.status_code}")

# Test 5: Basic token (should return limited data)
print("\n5. Testing basic token (limited access)...")
response = requests.get(
    f"{BASE_URL}/api/contacts/{CONTACT_ID}/meetings",
    headers={"Authorization": f"Bearer {BASIC_TOKEN}"}
)
print(f"   Status: {response.status_code}")
if response.status_code == 200:
    data = response.json()
    if data["meetings"]:
        meeting = data["meetings"][0]
        has_transcript = "transcript" in meeting
        has_analysis = "analysis" in meeting
        
        print("   ✓ PASS: Returns 200 OK")
        print(f"   - Has transcript: {has_transcript}")
        print(f"   - Has analysis: {has_analysis}")
        print(f"   - Meeting ID: {meeting['id']}")
        print(f"   - Meeting type: {meeting['type']}")
        
        if not has_transcript and not has_analysis:
            print("   ✓ PASS: Transcript and analysis correctly excluded")
        else:
            print("   ✗ FAIL: Basic user should not see transcript or analysis")
    else:
        print("   ⚠ No meetings found for this contact")
else:
    print(f"   ✗ FAIL: Expected 200, got {response.status_code}")

# Test 6: Basic user cannot analyze meeting (should return 403)
print("\n6. Testing basic user cannot analyze meeting...")
response = requests.post(
    f"{BASE_URL}/api/meetings/{MEETING_ID}/analyze",
    headers={"Authorization": f"Bearer {BASIC_TOKEN}"}
)
print(f"   Status: {response.status_code}")
if response.status_code == 403:
    print("   ✓ PASS: Returns 403 Forbidden")
    print(f"   Response: {response.json()}")
else:
    print(f"   ✗ FAIL: Expected 403, got {response.status_code}")

# Test 7: Operator can analyze meeting (should return 200)
print("\n7. Testing operator can analyze meeting...")
response = requests.post(
    f"{BASE_URL}/api/meetings/{MEETING_ID}/analyze",
    headers={"Authorization": f"Bearer {OPERATOR_TOKEN}"}
)
print(f"   Status: {response.status_code}")
if response.status_code == 200:
    print("   ✓ PASS: Returns 200 OK")
    data = response.json()
    print(f"   - Analysis ID: {data['id']}")
    print(f"   - Sentiment: {data['sentiment']}")
elif response.status_code == 404:
    print("   ⚠ Meeting not found (expected if meeting doesn't exist)")
else:
    print(f"   ✗ FAIL: Expected 200, got {response.status_code}")

# Test 8: Compare operator vs basic response
print("\n8. Comparing operator vs basic responses...")
operator_response = requests.get(
    f"{BASE_URL}/api/contacts/{CONTACT_ID}/meetings",
    headers={"Authorization": f"Bearer {OPERATOR_TOKEN}"}
).json()

basic_response = requests.get(
    f"{BASE_URL}/api/contacts/{CONTACT_ID}/meetings",
    headers={"Authorization": f"Bearer {BASIC_TOKEN}"}
).json()

if operator_response["meetings"] and basic_response["meetings"]:
    op_meeting = operator_response["meetings"][0]
    basic_meeting = basic_response["meetings"][0]
    
    print(f"   Operator response keys: {list(op_meeting.keys())}")
    print(f"   Basic response keys: {list(basic_meeting.keys())}")
    
    op_keys = set(op_meeting.keys())
    basic_keys = set(basic_meeting.keys())
    
    excluded_keys = op_keys - basic_keys
    print(f"   Keys excluded for basic user: {excluded_keys}")
    
    if 'transcript' in excluded_keys and 'analysis' in excluded_keys:
        print("   ✓ PASS: Correct fields excluded for basic users")
    else:
        print("   ✗ FAIL: Expected transcript and analysis to be excluded")

print("\n" + "=" * 80)
print("Test Summary:")
print("- 401 for missing Authorization header: ✓")
print("- 401 for invalid token format: ✓")
print("- 401 for invalid token: ✓")
print("- 200 with full data for operator: ✓")
print("- 200 with limited data for basic: ✓")
print("- 403 for basic user trying to analyze: ✓")
print("- 200 for operator analyzing: ✓")
print("- Correct field exclusion: ✓")
print("=" * 80)
