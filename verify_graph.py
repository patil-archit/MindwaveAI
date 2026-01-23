import asyncio
import os
from dotenv import load_dotenv
from pathlib import Path
from supabase import create_client

# Load env from backend/.env
env_path = Path("./backend/.env").resolve()
load_dotenv(dotenv_path=env_path)

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

if not url or not key:
    print("❌ Missing credentials")
    exit(1)

supabase = create_client(url, key)

def check_graph():
    print("🔍 Checking 'graph_nodes' table...")
    try:
        response = supabase.table("graph_nodes").select("*").limit(1).execute()
        print("✅ Table 'graph_nodes' EXISTS.")
    except Exception as e:
        print(f"❌ Table 'graph_nodes' ERROR: {e}")

    print("🔍 Checking 'memories' table...")
    try:
        response = supabase.table("memories").select("*").limit(1).execute()
        print("✅ Table 'memories' EXISTS.")
    except Exception as e:
        print(f"❌ Table 'memories' ERROR: {e}")

if __name__ == "__main__":
    check_graph()
