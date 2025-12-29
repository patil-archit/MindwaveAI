from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Union, Dict, Any
import os
from pathlib import Path
import requests
from dotenv import load_dotenv
from huggingface_hub import InferenceClient

# LangChain + Gemini
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from supabase_client import save_message, get_chat_history, create_chat_in_db, get_user_chats_from_db, delete_chat_from_db, rename_chat_in_db

# Load environment variables (always from backend/.env)
load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")

# ... imports ...

# Initialize App
app = FastAPI(title="Emotion AI Backend (Gemini)")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize LLM
api_key = os.getenv("GOOGLE_API_KEY")
hf_api_key = os.getenv("HUGGINGFACE_API_KEY")
llm = None
if api_key:
    llm = ChatGoogleGenerativeAI(model="models/gemini-flash-latest", google_api_key=api_key)

# Initialize Hugging Face client
hf_client = None
if hf_api_key:
    hf_client = InferenceClient(api_key=hf_api_key)

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
    title: Optional[str] = None
    history: Optional[List[Message]] = None # Optional, ignored in favor of backend history

class CreateChatRequest(BaseModel):
    user_id: str
    title: str

class RenameChatRequest(BaseModel):
    title: str

class ChatResponse(BaseModel):
    response: str
    emotion: str

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    user_msg = request.message
    uid = request.uid
    chat_id = request.chat_id
    
    # 0. Persist User Message (Early save)
    # emotion is not yet known, so we default to 'neutral' or could try to classify first. 
    # For now, we save it as 'neutral' or maybe update it later? 
    # Actually, let's classify first so we can save with emotion if we want, 
    # but usually user emotion is derived from text.
    
    # 1. Detect Emotion using Hugging Face
    emotion = classify_emotion_hf(user_msg)
    
    # Save User message to Supabase
    save_message(chat_id, uid, "user", user_msg, emotion, title=request.title)

    # 2. Fetch History from Supabase (Backend Source of Truth)
    # We fetch AFTER saving the new message, so the new message is included?
    # No, typically history is "past" messages. 
    # But `supabase_client.save_message` appends to the array.
    # So if we fetch now, we get everything including current.
    # Let's see how `supabase_client` behaves. It appends.
    # So `all_messages` will contain the new one.
    
    history_dicts = get_chat_history(chat_id)
    
    # 3. Generate Response
    if not llm:
        return ChatResponse(response="Gemini API Key is missing. Please check your .env file.", emotion="neutral")
    
    try:
        system_prompt = (
            f"You are a deeply empathetic, emotionally intelligent, and supportive AI companion. "
            f"Your goal is to make the user feel heard, understood, and comforted, while providing actionable advice. "
            f"The user is currently feeling {emotion.upper()}. "
            f"1. Validation: Sincerely acknowledge their feelings and validate them (e.g., 'I hear you, and it's okay to feel this way'). "
            f"2. Tone: Be warm, caring, and gentle. Adjust your tone to match their emotional state. "
            f"3. Structure & Depth: "
            f"   - Start with empathy. "
            f"   - Provide 3-4 concrete, actionable suggestions or steps to help improve their mood or situation. "
            f"   - Use bullet points or numbered lists for clarity (like a professional GPT response). "
            f"4. Objective: Help the user feel better and empowered. Focus on emotional connection + practical help. "
            f"5. Formatting: Use standard Markdown (bold, lists). Do NOT use HTML tags."
        )

        lc_messages = [SystemMessage(content=system_prompt)]
        
        # Add history
        # We need to filter out the *current* message if it's already in history 
        # to avoid duplication when we append it again explicitly?
        # Actually, `llm.invoke` takes a list of messages.
        # If `history_dicts` includes the latest message, we just pass that.
        # But `SystemMessage` is separate.
        
        for msg in history_dicts:
             role = msg["role"]
             content = msg["content"]
             if role == "user":
                 lc_messages.append(HumanMessage(content=content))
             elif role == "ai" or role == "assistant":
                 lc_messages.append(AIMessage(content=content))
        
        # The latest message was just saved to DB, so it IS in `history_dicts`. 
        # EXCEPT `save_message` implementation in `supabase_client.py` 
        # reads the DB, appends, and writes back.
        # So `get_chat_history` calls `select` and should see it.
        # However, to be safe and avoid race conditions (consistency), 
        # we can just use the memory we have.
        # But let's trust the DB for now or just ensure we don't duplicate.
        
        # If `history_dicts` is empty (failed fetch), we at least add the current message.
        if not history_dicts:
            lc_messages.append(HumanMessage(content=user_msg))

        # Invoke
        response = llm.invoke(lc_messages)
        ai_content = response.content
        
        # Robust Content Parsing
        ai_text = ""
        if isinstance(ai_content, str):
            ai_text = ai_content
        elif isinstance(ai_content, list):
            # Extract text from list of parts
            parts = []
            for part in ai_content:
                if isinstance(part, str):
                    parts.append(part)
                elif isinstance(part, dict):
                     # Handle {'type': 'text', 'text': '...'}
                     if 'text' in part:
                         parts.append(part['text'])
                elif hasattr(part, 'text'):
                     parts.append(part.text)
                else:
                     parts.append(str(part))
            ai_text = " ".join(parts)
        else:
            ai_text = str(ai_content)
        
        # Save AI Response to Supabase
        save_message(chat_id, uid, "ai", ai_text, emotion)

        return ChatResponse(response=ai_text, emotion=emotion)

    except Exception as e:
        print(f"Error generating response: {e}")
        return ChatResponse(response=f"I'm having trouble thinking right now. (Error: {str(e)})", emotion=emotion)

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

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
