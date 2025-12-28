from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Union, Dict, Any
import os
import requests
from dotenv import load_dotenv
from huggingface_hub import InferenceClient

# LangChain + Gemini
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory

# Load environment variables
load_dotenv()

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
    messages: List[Message]
    uid: Optional[str] = "default"
    history: List[Message] = [] # Recent chat history from frontend

class ChatResponse(BaseModel):
    response: str
    emotion: str

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    user_msg = request.messages[-1].content
    uid = request.uid
    remote_history = request.history
    
    # 1. Detect Emotion using Hugging Face
    emotion = classify_emotion_hf(user_msg)
    
    # 2. Generate Response
    if not llm:
        return ChatResponse(response="Gemini API Key is missing. Please check your .env file.", emotion="neutral")
    
    try:
        system_prompt = (
            f"You are a helpful and empathetic AI companion. "
            f"The user is currently feeling {emotion.upper()}. "
            f"Adjust your tone to support this emotion. "
            f"Keep responses concise and conversational."
        )

        # Build messages from Frontend History (Stateless Mode)
        lc_messages = [SystemMessage(content=system_prompt)]
        
        # Add history (excluding the very last user message if it's already in history, usually it's not)
        for msg in remote_history:
             if msg.role == "user":
                 lc_messages.append(HumanMessage(content=msg.content))
             elif msg.role == "ai" or msg.role == "assistant":
                 lc_messages.append(AIMessage(content=msg.content))
        
        # Add current message
        lc_messages.append(HumanMessage(content=user_msg))
        
        # Invoke directly (No internal memory needed as we pass full context)
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
        
        return ChatResponse(response=ai_text, emotion=emotion)

    except Exception as e:
        print(f"Error generating response: {e}")
        return ChatResponse(response=f"I'm having trouble thinking right now. (Error: {str(e)})", emotion=emotion)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
