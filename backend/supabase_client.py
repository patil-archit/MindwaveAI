import os
import json
from supabase import create_client, Client
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")

url: str = os.environ.get("SUPABASE_URL")
# For backend, we ideally use the Service Role key, but for now we'll use what's available (likely Anon Key)
# or check if the user has provided a specific backend key. 
# As per plan, we assume keys are in .env.
key: str = os.environ.get("SUPABASE_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")

supabase: Client = None

if url and key:
    try:
        supabase = create_client(url, key)
    except Exception as e:
        print(f"Failed to initialize Supabase client: {e}")
else:
    print("Warning: SUPABASE_URL or SUPABASE_KEY not found in environment variables.")

def save_message(chat_id: str, user_id: str, role: str, content: str, emotion: str = "neutral", title: str = None):
    """
    Saves a message to the Supabase 'messages' table (or implicit chat structure).
    Note: The schema might vary. Based on frontend inspection, we saw a 'messages' JSONB column in 'chats' table.
    However, a robust backend solution usually prefers a separate 'messages' table.
    
    BUT, looking at frontend `ChatPage.jsx`:
    `await updateCurrentChat(chat => { const newMessages = [...chat.messages, userMessage]; ...`
    And `supabase.from('chats').update({ messages: updatedChat.messages ... })`
    
    It seems the current schema stores messages in a JSONB column named 'messages' within the 'chats' table.
    We should stick to this schema to avoid breaking the frontend unless we refactor the DB schema (which is out of scope/risky).
    
    So, we need to:
    1. Fetch the current chat.
    2. Append the new message to its 'messages' array.
    3. Update the chat.
    
    This is less efficient than a separate table but maintains compatibility.
    """
    if not supabase:
        print("Supabase client not initialized.")
        return

    try:
        # Fetch current messages
        response = supabase.table("chats").select("messages").eq("id", chat_id).single().execute()
        
        if not response.data:
            print(f"Chat {chat_id} not found.")
            return

        current_messages = response.data.get("messages", [])
        if current_messages is None:
            current_messages = []

        # Construct new message object matching frontend structure
        from datetime import datetime
        new_message = {
            "id": f"{int(datetime.now().timestamp() * 1000)}-{role}", # mimicking frontend ID gen
            "sender": "user" if role == "user" else "ai",
            "text": content,
            "role": role,
            "timestamp": datetime.now().isoformat(),
            "emotion": emotion,
            "createdAt": datetime.now().isoformat()
        }

        updated_messages = current_messages + [new_message]

        # Prepare update data
        update_data = {
            "messages": updated_messages,
            "updated_at": datetime.now().isoformat()
        }
        if title:
            update_data["title"] = title

        # Update the chat
        result = supabase.table("chats").update(update_data).eq("id", chat_id).execute()
        
        print(f"Message saved to Supabase for chat {chat_id}. Data: {result.data}")
            
    except Exception as e:
        print(f"Error saving message to Supabase: {e}")

def get_chat_history(chat_id: str):
    """
    Fetches chat history from Supabase.
    Returns a list of dicts with 'role' and 'content' keys.
    """
    if not supabase:
        return []

    try:
        response = supabase.table("chats").select("messages").eq("id", chat_id).single().execute()
        if response.data and response.data.get("messages"):
            # Transform to standard format for LLM
            messages = []
            for msg in response.data["messages"]:
                role = msg.get("role", "user")
                content = msg.get("text", "")
                messages.append({"role": role, "content": content})
            return messages
    except Exception as e:
        print(f"Error fetching chat history: {e}")
    
    return []

def create_chat_in_db(user_id: str, title: str):
    """
    Creates a new chat entry in Supabase.
    """
    if not supabase:
        return None
    
    try:
        from datetime import datetime
        response = supabase.table("chats").insert({
            "user_id": user_id,
            "title": title,
            "messages": [],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }).execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    except Exception as e:
        print(f"Error creating chat: {e}")
        return None

def get_user_chats_from_db(user_id: str):
    """
    Retrieves all chats for a specific user.
    """
    if not supabase:
        return []
    
    try:
        response = supabase.table("chats").select("*").eq("user_id", user_id).order("updated_at", desc=True).execute()
        return response.data if response.data else []
    except Exception as e:
        print(f"Error fetching user chats: {e}")
        return []

def delete_chat_from_db(chat_id: str):
    """
    Deletes a chat by ID.
    """
    if not supabase:
        return False
    
    try:
        supabase.table("chats").delete().eq("id", chat_id).execute()
        return True
    except Exception as e:
        print(f"Error deleting chat: {e}")
        return False

def rename_chat_in_db(chat_id: str, new_title: str):
    """
    Updates the title of a chat.
    """
    if not supabase:
        return False
    
    try:
        from datetime import datetime
        supabase.table("chats").update({
            "title": new_title,
            "updated_at": datetime.now().isoformat()
        }).eq("id", chat_id).execute()
        return True
    except Exception as e:
        print(f"Error renaming chat: {e}")
        return False

def update_user_risk_score(user_id: str, score: int, email: str = None):
    """
    Updates the user's risk score in Supabase.
    """
    if not supabase:
        print("Supabase client not initialized. Cannot update risk score.")
        return
    
    try:
        # 1. Try to fetch email from Supabase 'profiles' table if not provided
        user_email = email or "unknown@example.com"
        if not email:
            try:
                res = supabase.table("profiles").select("email").eq("id", user_id).single().execute()
                if res.data and res.data.get("email"):
                    user_email = res.data["email"]
            except Exception:
                pass

        from datetime import datetime
        data = {
            "user_id": user_id,
            "email": user_email,
            "risk_score": score,
            "last_updated": datetime.now().isoformat()
        }
        
        # Upsert to Supabase
        supabase.table("user_risk").upsert(data).execute()
        print(f"Updated risk score for {user_id}: {score} (Supabase)")
        
    except Exception as e:
        print(f"Error updating risk score in Supabase: {e}")

def get_all_users_risk():
    """
    Fetches all users and their risk scores from Supabase.
    """
    if not supabase:
        print("Supabase client not initialized.")
        return []
    
    try:
        response = supabase.table("user_risk").select("*").execute()
        return response.data if response.data else []
    except Exception as e:
        print(f"Error fetching user risks from Supabase: {e}")
        return []
