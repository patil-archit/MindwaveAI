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
    # Academic Stress & Career (Interconnected)
    "I'm feeling overwhelmed by my final year project. The deadline is in 2 weeks.",
    "I want to be a software engineer but I doubt my coding skills compared to my peers.",
    "My professor said my project architecture is weak, which crushed my confidence.",
    "I stayed up all night debugging React code, but it felt good to finally fix it.",
    "Maybe I should switch to Product Management? I like the strategy part more than coding.",

    # Personal Life & Relationships
    "My girlfriend broke up with me yesterday because I spend too much time working.",
    "I feel lonely in this big city. Everyone is always busy.",
    "I miss my family back home. Mom's cooking always cheered me up.",
    "I adopted a cat named Luna today! She's so fluffy and calming.",
    
    # Emotional Patterns
    "I get anxious whenever I have to present in front of a crowd.",
    "Meditation has been helping significantly with my morning anxiety.",
    "I went for a 5k run today and I feel invincible!",
    "Sleeping only 4 hours a night is ruining my mood during the day.",
    
    # Specific Mindwave Features
    "I'm scared of failing. What if I never succeed?",
    "I need motivation to start my gym routine again.",
    "Can you just listen? I don't need advice, just a virtual hug right now."
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
