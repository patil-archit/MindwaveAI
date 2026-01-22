import asyncio
import sys
import os
import json

# Add backend to sys path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from graph_agent import extract_graph_data
from pathlib import Path

GRAPH_FILE = Path(__file__).parent / "graph_db.json"

DEMO_CHATS = [
    "I am really worried about my final year exams next week.",
    "My dad is pressuring me to get a high paying job, but I love coding.",
    "I feel happy when I listen to jazz music, it calms my anxiety.",
    "The hackathon in San Francisco was amazing, I met so many founders.",
    "Coffee makes me jittery but I need it for studying.",
    "I want to build a startup called Mindwave to help people with depression."
]

async def populate():
    print("🌌 Populating Neural Constellation...")
    
    current_graph = {"nodes": [], "links": []}
    if GRAPH_FILE.exists():
        try:
            with open(GRAPH_FILE, "r") as f:
                current_graph = json.load(f)
        except:
            pass

    for msg in DEMO_CHATS:
        print(f"Processing: '{msg}'")
        new_data = await extract_graph_data(msg)
        
        if not new_data: continue

        # Merge Nodes
        existing_ids = {n["id"] for n in current_graph["nodes"]}
        for node in new_data["nodes"]:
            if node["id"] not in existing_ids:
                current_graph["nodes"].append(node)
                existing_ids.add(node["id"])

        # Merge Links
        existing_links = {f"{l['source']}-{l['target']}-{l.get('label','')}" for l in current_graph["links"]}
        for link in new_data["links"]:
             # Ensure source/target exist in nodes to prevent errors
             source_exists = any(n['id'] == link['source'] for n in current_graph['nodes'])
             target_exists = any(n['id'] == link['target'] for n in current_graph['nodes'])
             
             if source_exists and target_exists:
                link_key = f"{link['source']}-{link['target']}-{link.get('label','')}"
                if link_key not in existing_links:
                    current_graph["links"].append(link)
                    existing_links.add(link_key)
    
    with open(GRAPH_FILE, "w") as f:
        json.dump(current_graph, f, indent=2)
    
    print("✅ Graph Populated!")

if __name__ == "__main__":
    asyncio.run(populate())
