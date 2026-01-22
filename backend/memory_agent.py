import os
from typing import List, Optional
import json
import numpy as np
from dotenv import load_dotenv
from pathlib import Path
from supabase import create_client, Client
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage

# Load environment variables
load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")

# Initialize Supabase
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

# Initialize Embeddings (Google)
api_key_google = os.getenv("GOOGLE_API_KEY")
# Embedding Model (text-embedding-004 is current standard for Gemini)
embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004", google_api_key=api_key_google)

# LLM for Fact Extraction (Groq)
api_key_groq = os.getenv("GROQ_API_KEY")
llm = ChatGroq(model="llama-3.3-70b-versatile", groq_api_key=api_key_groq)

def get_embedding(text: str) -> List[float]:
    """Generates a vector embedding for the given text."""
    try:
        return embeddings.embed_query(text)
    except Exception as e:
        print(f"Error generating embedding: {e}")
        return []

def extract_facts(user_input: str) -> Optional[str]:
    """
    Uses LLM to decide if there is a permanent fact worth creating a memory for.
    Returns the fact string or None.
    """
    try:
        system_prompt = (
            "You are a 'Librarian' for an AI memory system. "
            "Your job is to read the user's message and extract PERMANENT FACTS about the user (e.g., name, hobbies, pets, job, dislikes). "
            "Ignore temporary states (e.g., 'I am hungry') or small talk (e.g., 'Hi'). "
            "If there is a fact, output ONLY the concise fact (e.g. 'User likes sci-fi'). "
            "If there is nothing worth remembering, output 'NONE'."
        )
        msg = HumanMessage(content=user_input)
        response = llm.invoke([SystemMessage(content=system_prompt), msg])
        content = response.content.strip()
        
        if content == "NONE" or "none" in content.lower():
            return None
        return content
    except Exception as e:
        print(f"Error extracting facts: {e}")
        return None

def save_memory(user_id: str, content: str):
    """Embeds and saves a fact to Supabase."""
    vector = get_embedding(content)
    if not vector:
        return
    
    data = {
        "user_id": user_id,
        "content": content,
        "embedding": vector
    }
    try:
        supabase.table("memories").insert(data).execute()
        print(f"Memory saved: {content}")
    except Exception as e:
        print(f"Error saving memory to DB: {e}")

def retrieve_relevant_memories(user_id: str, query: str, limit: int = 3) -> List[str]:
    """
    Searches Supabase for memories semantically similar to the query.
    """
    query_vector = get_embedding(query)
    if not query_vector:
        return []

    try:
        # call the 'match_memories' RPC function we created in SQL
        response = supabase.rpc(
            "match_memories",
            {
                "query_embedding": query_vector,
                "match_threshold": 0.5, # Adjust based on testing
                "match_count": limit,
                "p_user_id": user_id
            }
        ).execute()
        
        memories = [item['content'] for item in response.data]
        return memories
    except Exception as e:
        print(f"RPC 'match_memories' failed (likely missing function). Falling back to local search. Error: {e}")
        
        # FALLBACK: Local Vector Search
        try:
            # 1. Fetch all memories for this user
            response = supabase.table("memories").select("*").eq("user_id", user_id).execute()
            if not response.data:
                return []
            
            import numpy as np
            
            # 2. Calculate Cosine Similarity locally
            # query_vector is List[float], embeddings in DB are strings or lists
            
            scored_memories = []
            q_vec = np.array(query_vector)
            norm_q = np.linalg.norm(q_vec)
            
            for item in response.data:
                # Parse embedding string if needed (Supabase returns it as a string sometimes, or list)
                emb = item.get('embedding')
                if isinstance(emb, str):
                    emb = json.loads(emb)
                
                if not emb:
                    continue

                m_vec = np.array(emb)
                norm_m = np.linalg.norm(m_vec)
                
                # Cosine Similarity: (A . B) / (||A|| * ||B||)
                if norm_q == 0 or norm_m == 0:
                    score = 0
                else:
                    score = np.dot(q_vec, m_vec) / (norm_q * norm_m)
                
                if score >= 0.5: # Same threshold as RPC
                    scored_memories.append((score, item['content']))
            
            # 3. Sort by score desc and take top N
            scored_memories.sort(key=lambda x: x[0], reverse=True)
            return [m[1] for m in scored_memories[:limit]]

        except Exception as local_e:
            print(f"Local memory retrieval failed: {local_e}")
            return []
