from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Union, Dict, Any
import os
import asyncio
from pathlib import Path
import requests
from dotenv import load_dotenv
from huggingface_hub import InferenceClient

# LangChain + Groq
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from supabase_client import save_message, get_chat_history, create_chat_in_db, get_user_chats_from_db, delete_chat_from_db, rename_chat_in_db, update_user_risk_score, get_all_users_risk, supabase
from memory_agent import retrieve_relevant_memories, extract_facts, save_memory
from council import consult_council
from graph_agent import extract_graph_data
import json
from fastapi import BackgroundTasks

# Load environment variables (always from backend/.env)
load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")

# ... imports ...

# Initialize App
app = FastAPI(title="Emotion AI Backend (Groq)")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize LLM
api_key = os.getenv("GROQ_API_KEY")
hf_api_key = os.getenv("HUGGINGFACE_API_KEY")
llm = None
if api_key:
    llm = ChatGroq(model="llama-3.3-70b-versatile", groq_api_key=api_key)

# Initialize Hugging Face client
hf_client = None
if hf_api_key:
    hf_client = InferenceClient(api_key=hf_api_key)

def extract_and_save_memory(user_id: str, text: str):
    """Background task to learn from user messages."""
    fact = extract_facts(text)
    if fact:
        save_memory(user_id, fact)

async def update_graph_db(user_msg: str):
    """Background task to extract entities and update the persistent graph in Supabase."""
    if not supabase:
        print("Supabase not initialized. Cannot update graph.")
        return
        
    new_data = await extract_graph_data(user_msg)
    if not new_data or not new_data.get("nodes"):
        return

    try:
        # Load existing graph from Supabase
        response = supabase.table("knowledge_graph").select("*").limit(1).execute()
        
        if response.data and len(response.data) > 0:
            current_graph = {
                "nodes": response.data[0].get("nodes", []),
                "links": response.data[0].get("links", [])
            }
            graph_id = response.data[0]["id"]
        else:
            current_graph = {"nodes": [], "links": []}
            graph_id = None

        # Merge Nodes (deduplicate by id)
        existing_ids = {n["id"] for n in current_graph["nodes"]}
        for node in new_data["nodes"]:
            if node["id"] not in existing_ids:
                current_graph["nodes"].append(node)
                existing_ids.add(node["id"])

        # Merge Links (deduplicate by source-target-label)
        existing_links = {f"{l['source']}-{l['target']}-{l.get('label','')}" for l in current_graph["links"]}
        for link in new_data["links"]:
            link_key = f"{link['source']}-{link['target']}-{link.get('label','')}"
            if link_key not in existing_links:
                current_graph["links"].append(link)
                existing_links.add(link_key)

        # Save to Supabase
        from datetime import datetime
        update_data = {
            "nodes": current_graph["nodes"],
            "links": current_graph["links"],
            "updated_at": datetime.now().isoformat()
        }
        
        if graph_id:
            supabase.table("knowledge_graph").update(update_data).eq("id", graph_id).execute()
        else:
            supabase.table("knowledge_graph").insert(update_data).execute()
            
        print(f"Graph updated in Supabase: {len(current_graph['nodes'])} nodes, {len(current_graph['links'])} links")
        
    except Exception as e:
        print(f"Error updating graph in Supabase: {e}")

def classify_emotion_hf(text: str) -> str:
    """
    Classify emotion using Hugging Face InferenceClient.
    Model: j-hartmann/emotion-english-distilroberta-base
    Returns: anger, disgust, fear, joy, neutral, sadness, surprise
    """
    if not hf_client:
        return "neutral"
    
    try:
        result = hf_client.text_classification(
            text,
            model="j-hartmann/emotion-english-distilroberta-base"
        )
        
        # Result is a list of classification results
        if result and len(result) > 0:
            # Get the emotion with highest score
            top_emotion = max(result, key=lambda x: x['score'])
            emotion = top_emotion['label'].lower()
            return emotion
        
        return "neutral"
    except Exception as e:
        print(f"Error with Hugging Face emotion detection: {e}")
        return "neutral"

def classify_emotion(text: str) -> str:
    """
    Classify the emotion of the user's message.
    TEMPORARILY DISABLED to save API quota.
    """
    # Temporarily disabled to save API quota
    return "neutral"
    
    # Original code commented out to save quota
    # if not llm:
    #     return "neutral"
    # 
    # try:
    #     # Simple prompt for classification
    #     msg = HumanMessage(content=f"Classify the emotion of this text into exactly one word (e.g., happy, sad, angry, neutral, excited, anxious). Text: '{text}'. Return ONLY the word.")
    #     response = llm.invoke([msg])
    #     
    #     # Handle both string and list responses
    #     emotion_text = ""
    #     if isinstance(response.content, str):
    #         emotion_text = response.content
    #     elif isinstance(response.content, list):
    #         # Extract text from list of parts
    #         parts = []
    #         for part in response.content:
    #             if isinstance(part, str):
    #                 parts.append(part)
    #             elif isinstance(part, dict) and 'text' in part:
    #                 parts.append(part['text'])
    #             elif hasattr(part, 'text'):
    #                 parts.append(part.text)
    #             else:
    #                 parts.append(str(part))
    #         emotion_text = " ".join(parts)
    #     else:
    #         emotion_text = str(response.content)
    #     
    #     emotion = emotion_text.strip().lower()
    #     # Clean up any extra punctuation
    #     import re
    #     emotion = re.sub(r'[^\w\s]', '', emotion)
    #     return emotion
    # except Exception as e:
    #     print(f"Error classifying emotion: {e}")
    #     return "neutral"

# Models
class Message(BaseModel):
    role: str
    content: str
    emotion: Optional[str] = "neutral"

class ChatRequest(BaseModel):
    messages: Optional[List[Message]] = None # Deprecated, but kept for compatibility checks if needed
    message: str # The new user message
    uid: str
    chat_id: str
    face_emotion: Optional[str] = None
    mode: Optional[str] = "auto"
    title: Optional[str] = None
    email: Optional[str] = None # Capture email if available in frontend
    history: Optional[List[Message]] = None # Optional, ignored in favor of backend history

class CreateChatRequest(BaseModel):
    user_id: str
    title: str

class RenameChatRequest(BaseModel):
    title: str

class ChatResponse(BaseModel):
    response: str
    emotion: str
    agent_thoughts: Optional[Dict[str, str]] = None

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, background_tasks: BackgroundTasks):
    print("--- CHAT ENDPOINT CALLED ---")
    user_msg = request.message
    uid = request.uid
    chat_id = request.chat_id
    
    # 0. Persist User Message
    print("1. Classifying emotion...")
    emotion = classify_emotion_hf(user_msg)
    print(f"2. Saving user message... chat_id={chat_id}")
    await asyncio.to_thread(save_message, chat_id, uid, "user", user_msg, emotion, title=request.title)
    print("3. User message saved.")

    # 1. Fetch Chat History (for context)
    print("3b. Fetching chat history...")
    history_dicts = await asyncio.to_thread(get_chat_history, chat_id)
    # Filter out the message we just saved to avoid duplication in context if get_chat_history returns it
    # But usually LLM expects "past" conversation.
    # Logic: get_chat_history likely returns all messages including the one we just saved.
    # We should pass it as context. 
    # Let's ensure we are filtering correctly if needed, but standard practice is to pass recent history.
    
    # 3. Generate Response
    if not llm:
        return ChatResponse(response="Groq API Key is missing. Please check your .env file.", emotion="neutral")
    
    # [NEW] Retrieve Long-Term Memory
    print("4. Retrieving memories...")
    memories = retrieve_relevant_memories(uid, user_msg)
    memory_context = ""
    if memories:
        memory_context = "\nHere are some things I remember about you:\n- " + "\n- ".join(memories) + "\n"

    # 3. Generate Response via THE INNER COUNCIL
    try:
        # Run Multi-Agent Debate
        print("5. Consulting Council...")
        council_result = await consult_council(user_msg, memory_context, request.face_emotion, request.mode, chat_history=history_dicts)
        print("6. Council returned.")
        
        final_response = council_result["final_response"]
        thoughts = council_result["agent_thoughts"]
        risk_score = council_result.get("risk_score", 0)
        
        # Save AI Response to Supabase
        print("7. Saving AI response...")
        await asyncio.to_thread(save_message, chat_id, uid, "ai", final_response, emotion)
        
        # Save Risk Score (Background)
        background_tasks.add_task(update_user_risk_score, uid, risk_score, request.email)

        print("8. AI response saved.")
        
        # ... (rest of the code)

        print("9. Returning response.")
        return ChatResponse(response=final_response, emotion=emotion, agent_thoughts=thoughts)

    except Exception as e:
        print(f"Error generating response: {e}")
        return ChatResponse(response=f"I'm having trouble thinking right now. (Error: {str(e)})", emotion=emotion)

@app.get("/monitor/risk")
async def monitor_risk_endpoint():
    """
    Returns a list of all users and their latest risk scores.
    Used by n8n workflow.
    """
    return get_all_users_risk()

@app.get("/graph")
async def get_graph_endpoint():
    """
    Returns the knowledge graph from Supabase.
    """
    if not supabase:
        return {"nodes": [], "links": []}
    
    try:
        response = supabase.table("knowledge_graph").select("*").limit(1).execute()
        if response.data and len(response.data) > 0:
            return {
                "nodes": response.data[0].get("nodes", []),
                "links": response.data[0].get("links", [])
            }
        return {"nodes": [], "links": []}
    except Exception as e:
        print(f"Error fetching graph: {e}")
        return {"nodes": [], "links": []}

@app.post("/chats")
async def create_chat_endpoint(request: CreateChatRequest):
    result = create_chat_in_db(request.user_id, request.title)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to create chat")
    return result

@app.get("/chats/{uid}")
async def get_chats_endpoint(uid: str):
    chats = get_user_chats_from_db(uid)
    return chats

@app.delete("/chats/{chat_id}")
async def delete_chat_endpoint(chat_id: str):
    success = delete_chat_from_db(chat_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete chat")
    return {"status": "success"}

@app.patch("/chats/{chat_id}")
async def rename_chat_endpoint(chat_id: str, request: RenameChatRequest):
    success = rename_chat_in_db(chat_id, request.title)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to rename chat")
    return {"status": "success"}

class SearchResult(BaseModel):
    results: List[str]

@app.get("/memories/search", response_model=SearchResult)
async def search_memories_endpoint(uid: str, q: str):
    """
    Searches the user's long-term memory.
    """
    memories = retrieve_relevant_memories(uid, q, limit=5)
    return SearchResult(results=memories)

# Physical Health Endpoints
class PhysicalHealthRequest(BaseModel):
    user_id: str
    email: Optional[str] = None  # User email
    height: float  # cm
    weight: float  # kg
    age: int
    gender: Optional[str] = None
    present_illnesses: Optional[str] = None
    medications: Optional[str] = None
    allergies: Optional[str] = None

class PhysicalHealthResponse(BaseModel):
    bmi: float
    bmi_category: str
    analysis: str
    recommendations: List[str]
    health_id: int

@app.post("/health/assess", response_model=PhysicalHealthResponse)
async def assess_health_endpoint(request: PhysicalHealthRequest):
    """
    Assess physical health, calculate BMI, and provide AI recommendations
    """
    from health_agent import calculate_bmi, analyze_health
    
    # Calculate BMI
    bmi, bmi_category = calculate_bmi(request.weight, request.height)
    
    # Get AI analysis
    ai_result = await analyze_health(
        age=request.age,
        gender=request.gender or "Not specified",
        weight=request.weight,
        height=request.height,
        bmi=bmi,
        bmi_category=bmi_category,
        present_illnesses=request.present_illnesses or "",
        medications=request.medications or "",
        allergies=request.allergies or ""
    )
    
    # Save to Supabase
    if supabase:
        try:
            from datetime import datetime
            data = {
                "user_id": request.user_id,
                "email": request.email or "unknown@example.com",  # Use email from request
                "height": request.height,
                "weight": request.weight,
                "age": request.age,
                "gender": request.gender,
                "present_illnesses": request.present_illnesses,
                "medications": request.medications,
                "allergies": request.allergies,
                "bmi": bmi,
                "bmi_category": bmi_category,
                "ai_analysis": ai_result["analysis"],
                "health_recommendations": str(ai_result["recommendations"]),
                "updated_at": datetime.now().isoformat()
            }
            result = supabase.table("physical_health").insert(data).execute()
            health_id = result.data[0]["id"] if result.data else 0
        except Exception as e:
            print(f"Error saving health data: {e}")
            health_id = 0
    else:
        health_id = 0
    
    return PhysicalHealthResponse(
        bmi=bmi,
        bmi_category=bmi_category,
        analysis=ai_result["analysis"],
        recommendations=ai_result["recommendations"],
        health_id=health_id
    )

@app.get("/health/{user_id}")
async def get_user_health_history(user_id: str):
    """
    Get user's health assessment history
    """
    if not supabase:
        return []
    
    try:
        response = supabase.table("physical_health").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return response.data if response.data else []
    except Exception as e:
        print(f"Error fetching health history: {e}")
        return []

@app.get("/health/users/all")
async def get_all_users_health_data():
    """
    Get latest health assessment for all users (for n8n daily reports)
    Returns: [{ user_id, email, latest_assessment }]
    """
    if not supabase:
        return []
    
    try:
        # Get all unique users with their latest assessment
        response = supabase.table("physical_health").select("*").order("created_at", desc=True).execute()
        
        if not response.data:
            return []
        
        # Group by user_id and get latest for each
        users_map = {}
        for record in response.data:
            user_id = record["user_id"]
            if user_id not in users_map:
                users_map[user_id] = {
                    "user_id": user_id,
                    "email": record.get("email", "unknown@example.com"),
                    "latest_assessment": {
                        "bmi": record["bmi"],
                        "bmi_category": record["bmi_category"],
                        "weight": record["weight"],
                        "height": record["height"],
                        "age": record["age"],
                        "ai_analysis": record.get("ai_analysis", ""),
                        "recommendations": record.get("health_recommendations", ""),
                        "assessed_at": record["created_at"]
                    }
                }
        
        return list(users_map.values())
    
    except Exception as e:
        print(f"Error fetching all users health data: {e}")
        return []

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
