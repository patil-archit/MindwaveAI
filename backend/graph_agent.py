import json
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
import os
from dotenv import load_dotenv

load_dotenv()

# We use a strict JSON schema for the graph extraction
GRAPH_EXTRACTION_PROMPT = """
You are a Knowledge Graph Extractor.
Your goal is to extract "Entities" (Nodes) and "Relationships" (Edges) from the user's message.
Focus on: People, Places, Emotions, Events, and Concepts.

Rules:
1. Nodes should be simple nouns (e.g., "Dad", "Anxiety", "Exam").
2. Edges should be verbs or short phrases (e.g., "causes", "loves").
3. Return ONLY valid JSON. Do not use Markdown backticks.
4. Structure:
{
  "nodes": [{"id": "NodeName", "group": "Person"}],
  "links": [{"source": "NodeName1", "target": "NodeName2", "label": "relationship"}]
}

User Message: "{user_msg}"
JSON Output:
"""

import re

async def extract_graph_data(user_msg: str):
    try:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            return {"nodes": [], "links": []}
            
        llm = ChatGroq(model="llama-3.3-70b-versatile", groq_api_key=api_key)
        
        response = await llm.ainvoke([
            SystemMessage(content="You are a helpful assistant that outputs only JSON."),
            HumanMessage(content=GRAPH_EXTRACTION_PROMPT.format(user_msg=user_msg))
        ])
        
        text = response.content.strip()
        
        # Robust extraction using Regex
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
             json_str = match.group(0)
             data = json.loads(json_str)
             return data
        
        # Fallback if no JSON found
        return {"nodes": [], "links": []}
    except Exception as e:
        print(f"Graph Extraction Error: {e}")
        return {"nodes": [], "links": []}
