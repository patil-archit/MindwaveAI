#!/usr/bin/env python3
"""Test Hugging Face emotion detection with InferenceClient"""

import os
from dotenv import load_dotenv
from huggingface_hub import InferenceClient

load_dotenv()

hf_api_key = os.getenv("HUGGINGFACE_API_KEY")
print(f"HF API Key loaded: {'Yes' if hf_api_key else 'No'}")

if not hf_api_key:
    print("ERROR: No Hugging Face API key found!")
    print("Get your free token at: https://huggingface.co/settings/tokens")
    exit(1)

# Initialize client
client = InferenceClient(api_key=hf_api_key)

# Test messages
test_messages = [
    "I'm so happy today!",
    "This makes me really angry",
    "I'm feeling sad and lonely",
    "Wow, that's amazing!",
    "I'm worried about the exam"
]

print("\nTesting Hugging Face emotion detection with InferenceClient:\n")

for msg in test_messages:
    try:
        result = client.text_classification(
            msg,
            model="j-hartmann/emotion-english-distilroberta-base"
        )
        
        if result and len(result) > 0:
            top_emotion = max(result, key=lambda x: x['score'])
            emotion = top_emotion['label']
            score = top_emotion['score']
            print(f"✓ '{msg}'")
            print(f"  → Emotion: {emotion} (confidence: {score:.2%})\n")
    except Exception as e:
        print(f"✗ Error: {e}\n")

print("✓✓✓ Hugging Face emotion detection test complete!")

