#!/usr/bin/env python3
"""Test script to verify LangChain + Gemini integration"""

import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

# Load environment
load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")
print(f"API Key loaded: {'Yes' if api_key else 'No'}")
print(f"Key starts with: {api_key[:20] if api_key else 'N/A'}")

if not api_key:
    print("ERROR: No API key found!")
    exit(1)

# Initialize LLM
print("\nInitializing LangChain with Gemini...")
try:
    llm = ChatGoogleGenerativeAI(
        model="models/gemini-flash-latest",
        google_api_key=api_key
    )
    print("✓ LLM initialized successfully")
except Exception as e:
    print(f"✗ Failed to initialize LLM: {e}")
    exit(1)

# Test a simple call
print("\nTesting API call...")
try:
    msg = HumanMessage(content="Say 'Hello, I am working!' in exactly those words.")
    response = llm.invoke([msg])
    print(f"✓ API call successful!")
    print(f"Response: {response.content}")
except Exception as e:
    print(f"✗ API call failed: {e}")
    import traceback
    traceback.print_exc()
    exit(1)

print("\n✓✓✓ All tests passed! LangChain + Gemini is working correctly.")
