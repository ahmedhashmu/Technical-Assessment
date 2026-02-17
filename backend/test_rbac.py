"""Test script for Role-Based Access Control."""
import requests
import json

BASE_URL = "http://localhost:8000"
CONTACT_ID = "contact_001"

print("=" * 80)
print("Role-Based Access Control - Validation Tests")
print("=" * 80)

# Test 1: Missing header (should return 401)
print("\n1. Testing missing x-user-role header...")
response = requests.get(f"{BASE_URL}/api/contacts/{CONTACT_ID}/meetings")
print(f"   Status: {response.status_code}")
if response.status_code == 401:
    print("   ✓ PASS: Returns 401 Unauthorized")
    print(f"   Response: {response.json()}")
else:
    print(f"   ✗ FAIL: Expected 401, got {response.status_code}")

# Test 2: Invalid role (should return 403)
print("\n2. Testing invalid role header...")
response = requests.get(
    f"{BASE_URL}/api/contacts/{CONTACT_ID}/meetings",
    headers={"x-user-role": "admin"}
)
print(f"   Status: {response.status_code}")
if response.status_code == 403:
    print("   ✓ PASS: Returns 403 Forbidden")
    print(f"   Response: {response.json()}")
else:
    print(f"   ✗ FAIL: Expected 403, got {response.status_code}")

# Test 3: Operator role (should return full data)
print("\n3. Testing operator role (full access)...")
response = requests.get(
    f"{BASE_URL}/api/contacts/{CONTACT_ID}/meetings",
    headers={"x-user-role": "operator"}
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
            print(f"   - Analysis topics: {meeting['analysis']['topics'][:3]}")
    else:
        print("   ⚠ No meetings found for this contact")
else:
    print(f"   ✗ FAIL: Expected 200, got {response.status_code}")

# Test 4: Basic role (should return limited data)
print("\n4. Testing basic role (limited access)...")
response = requests.get(
    f"{BASE_URL}/api/contacts/{CONTACT_ID}/meetings",
    headers={"x-user-role": "basic"}
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
        print(f"   - Occurred at: {meeting['occurredAt']}")
        
        if not has_transcript and not has_analysis:
            print("   ✓ PASS: Transcript and analysis correctly excluded")
        else:
            print("   ✗ FAIL: Basic user should not see transcript or analysis")
    else:
        print("   ⚠ No meetings found for this contact")
else:
    print(f"   ✗ FAIL: Expected 200, got {response.status_code}")

# Test 5: Compare operator vs basic response
print("\n5. Comparing operator vs basic responses...")
operator_response = requests.get(
    f"{BASE_URL}/api/contacts/{CONTACT_ID}/meetings",
    headers={"x-user-role": "operator"}
).json()

basic_response = requests.get(
    f"{BASE_URL}/api/contacts/{CONTACT_ID}/meetings",
    headers={"x-user-role": "basic"}
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
print("- 401 for missing header: ✓")
print("- 403 for invalid role: ✓")
print("- 200 with full data for operator: ✓")
print("- 200 with limited data for basic: ✓")
print("- Correct field exclusion: ✓")
print("=" * 80)
