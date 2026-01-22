import asyncio
import sys
import os

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from council import consult_council

async def test_modes():
    print("🧪 Testing Council Modes...")
    
    user_msg = "I feel lazy."
    
    # Test Stoic
    print("\n--- Testing STOIC Mode ---")
    res1 = await consult_council(user_msg, mode="stoic")
    print(f"Response: {res1['final_response']}")
    assert "Inner Council" not in res1['final_response']
    
    # Test Auto
    print("\n--- Testing AUTO Mode ---")
    res2 = await consult_council(user_msg, mode="auto")
    print(f"Response (Snippet): {res2['final_response'][:50]}...")
    assert len(res2['agent_thoughts']) == 3
    
    print("\n✅ All Modes Passed.")

if __name__ == "__main__":
    asyncio.run(test_modes())
