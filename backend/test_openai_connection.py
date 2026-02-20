#!/usr/bin/env python3
"""
Diagnostic script to test OpenAI API connectivity from Railway.
Run this to isolate connection issues.
"""
import os
import sys
import traceback

def test_basic_connectivity():
    """Test basic HTTPS connectivity to OpenAI."""
    print("=" * 60)
    print("TEST 1: Basic HTTPS Connectivity")
    print("=" * 60)
    
    try:
        import urllib.request
        import ssl
        
        # Test with default SSL context
        print("\n1.1 Testing with default SSL context...")
        req = urllib.request.Request("https://api.openai.com/v1/models")
        req.add_header("Authorization", f"Bearer {os.getenv('OPENAI_API_KEY', 'test')}")
        
        try:
            response = urllib.request.urlopen(req, timeout=10)
            print(f"✓ Connection successful! Status: {response.status}")
        except Exception as e:
            print(f"✗ Connection failed: {type(e).__name__}: {e}")
            traceback.print_exc()
        
        # Test with unverified SSL (to check if it's a cert issue)
        print("\n1.2 Testing with unverified SSL context...")
        context = ssl._create_unverified_context()
        try:
            response = urllib.request.urlopen(req, context=context, timeout=10)
            print(f"✓ Unverified connection successful! Status: {response.status}")
            print("  → This suggests a CA certificate issue")
        except Exception as e:
            print(f"✗ Unverified connection also failed: {type(e).__name__}: {e}")
            print("  → This suggests a network/firewall issue, not certs")
            
    except Exception as e:
        print(f"✗ Test failed: {e}")
        traceback.print_exc()

def test_httpx_client():
    """Test httpx client (used by OpenAI SDK)."""
    print("\n" + "=" * 60)
    print("TEST 2: HTTPX Client")
    print("=" * 60)
    
    try:
        import httpx
        
        print("\n2.1 Testing httpx GET request...")
        client = httpx.Client(timeout=10.0)
        try:
            response = client.get("https://api.openai.com/v1/models",
                                headers={"Authorization": f"Bearer {os.getenv('OPENAI_API_KEY', 'test')}"})
            print(f"✓ HTTPX connection successful! Status: {response.status_code}")
        except Exception as e:
            print(f"✗ HTTPX connection failed: {type(e).__name__}: {e}")
            traceback.print_exc()
        finally:
            client.close()
            
    except Exception as e:
        print(f"✗ Test failed: {e}")
        traceback.print_exc()

def test_openai_sdk():
    """Test OpenAI SDK directly."""
    print("\n" + "=" * 60)
    print("TEST 3: OpenAI SDK")
    print("=" * 60)
    
    try:
        from openai import OpenAI
        import httpx
        
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            print("✗ OPENAI_API_KEY not set!")
            return
        
        print(f"\n3.1 API Key: {api_key[:10]}...{api_key[-4:]}")
        print(f"    Length: {len(api_key)}")
        print(f"    Has whitespace: {api_key != api_key.strip()}")
        
        print("\n3.2 Testing OpenAI client initialization...")
        http_client = httpx.Client(
            timeout=httpx.Timeout(60.0, connect=10.0),
            follow_redirects=True
        )
        
        client = OpenAI(
            api_key=api_key.strip(),
            http_client=http_client,
            base_url="https://api.openai.com/v1"
        )
        print("✓ Client initialized")
        
        print("\n3.3 Testing models.list()...")
        try:
            models = client.models.list()
            print(f"✓ Models list successful! Found {len(models.data)} models")
        except Exception as e:
            print(f"✗ Models list failed: {type(e).__name__}: {e}")
            traceback.print_exc()
            
            # Check underlying cause
            if hasattr(e, '__cause__'):
                print(f"\nUnderlying cause: {type(e.__cause__).__name__}: {e.__cause__}")
        
        print("\n3.4 Testing chat completion...")
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": "Say 'test'"}],
                max_tokens=5
            )
            print(f"✓ Chat completion successful!")
            print(f"   Response: {response.choices[0].message.content}")
        except Exception as e:
            print(f"✗ Chat completion failed: {type(e).__name__}: {e}")
            traceback.print_exc()
            
    except Exception as e:
        print(f"✗ Test failed: {e}")
        traceback.print_exc()

def test_environment():
    """Check environment configuration."""
    print("\n" + "=" * 60)
    print("TEST 4: Environment Configuration")
    print("=" * 60)
    
    print(f"\nOPENAI_API_KEY: {'SET' if os.getenv('OPENAI_API_KEY') else 'NOT SET'}")
    print(f"OPENAI_BASE_URL: {os.getenv('OPENAI_BASE_URL', 'NOT SET')}")
    print(f"HTTP_PROXY: {os.getenv('HTTP_PROXY', 'NOT SET')}")
    print(f"HTTPS_PROXY: {os.getenv('HTTPS_PROXY', 'NOT SET')}")
    print(f"NO_PROXY: {os.getenv('NO_PROXY', 'NOT SET')}")
    
    # Check CA certificates
    print("\nCA Certificates:")
    ca_paths = [
        "/etc/ssl/certs/ca-certificates.crt",
        "/etc/pki/tls/certs/ca-bundle.crt",
        "/etc/ssl/ca-bundle.pem",
    ]
    for path in ca_paths:
        exists = os.path.exists(path)
        print(f"  {path}: {'EXISTS' if exists else 'NOT FOUND'}")

if __name__ == "__main__":
    print("OpenAI Connection Diagnostic Tool")
    print("=" * 60)
    
    test_environment()
    test_basic_connectivity()
    test_httpx_client()
    test_openai_sdk()
    
    print("\n" + "=" * 60)
    print("Diagnostic complete!")
    print("=" * 60)
