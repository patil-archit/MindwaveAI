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
{{
  "nodes": [{{"id": "NodeName", "group": "Person"}}],
  "links": [{{"source": "NodeName1", "target": "NodeName2", "label": "relationship"}}]
}}

User Message: "{user_msg}"
JSON Output:
"""

import re

import traceback

async def extract_graph_data(user_msg: str):
    text = ""
    try:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            print("Missing API Key")
            return {"nodes": [], "links": []}
            
        llm = ChatGroq(model="llama-3.3-70b-versatile", groq_api_key=api_key)
        
        # Enforce JSON mode via system prompt
        response = await llm.ainvoke([
            SystemMessage(content="You are a precise Knowledge Graph Extractor. Output ONLY valid JSON. No markdown, no explanations."),
            HumanMessage(content=GRAPH_EXTRACTION_PROMPT.format(user_msg=user_msg))
        ])
        
        text = response.content.strip()
        # Debug Print
        # print(f"DEBUG LLM OUTPUT: {text[:100]}...") # reduce noise
        
        # Remove Markdown code blocks if present
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        text = text.strip()
        
        data = {}
        # Simple JSON Load attempt first
        try:
             data = json.loads(text)
        except json.JSONDecodeError:
            # Fallback regex
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                 try:
                     json_str = match.group(0)
                     data = json.loads(json_str)
                 except:
                     pass

        # Validate Data Type
        if not isinstance(data, dict):
            # print(f"Invalid Data Type: {type(data)}")
            return {"nodes": [], "links": []}

        # Ensure schema
        if "nodes" not in data: data["nodes"] = []
        if "links" not in data: data["links"] = []
        
        return data
        
    except Exception as e:
        # detailed error log
        print(f"Graph Extraction Error: {type(e).__name__}: {e}")
        return {"nodes": [], "links": []}
