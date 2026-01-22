import asyncio
import sys
import os

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from council import consult_council

async def test_council():
    print("🧠 Testing Inner Council...")
    user_msg = "I feel like a failure because I missed my deadline."
    print(f"User: {user_msg}\n")
    
    try:
        result = await consult_council(user_msg, memory_context="User is a software engineer.")
        
        print("--- FINAL RESPONSE ---")
        print(result["final_response"])
        print("\n--- AGENT THOUGHTS ---")
        for agent, thought in result["agent_thoughts"].items():
            print(f"[{agent}]: {thought}")
            
        print("\n✅ TEST PASSED: Council successfully debated and synthesized.")
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")

if __name__ == "__main__":
    asyncio.run(test_council())
