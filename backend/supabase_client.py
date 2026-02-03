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

def get_user_insights(user_id: str):
    """
    Aggregates chat data to generate real insights for the dashboard.
    """
    if not supabase:
        return {}

    try:
        # 1. Fetch all chats for the user
        response = supabase.table("chats").select("messages, updated_at").eq("user_id", user_id).execute()
        chats = response.data or []

        # 2. Flatten messages
        all_messages = []
        for chat in chats:
            msgs = chat.get("messages", []) or []
            all_messages.extend(msgs)

        if not all_messages:
            return {"mood_data": [], "stats": {"logic": 50, "empathy": 50, "motivation": 50}}

        # 3. Aggregate Moods by Day
        from datetime import datetime, timedelta
        from collections import defaultdict
        
        # Map emotions to numeric scores (0-100)
        emotion_scores = {
            "joy": 90, "happy": 90,
            "neutral": 60, "surprise": 70,
            "sadness": 40, "sad": 40,
            "fear": 30, "anger": 20, "disgust": 20
        }
        
        day_buckets = defaultdict(list)
        
        for msg in all_messages:
            # Only count USER messages for "My Mood"
            if msg.get("sender") == "user" or msg.get("role") == "user":
                ts_str = msg.get("timestamp") or msg.get("createdAt")
                if ts_str:
                    try:
                        # Normalize timestamp string
                        ts_str = ts_str.replace('Z', '+00:00').strip()
                        # Handle cases with space instead of T
                        if ' ' in ts_str and 'T' not in ts_str:
                             ts_str = ts_str.replace(' ', 'T')
                        
                        dt = datetime.fromisoformat(ts_str)
                        day_name = dt.strftime("%a") # Mon, Tue...
                        emotion = msg.get("emotion", "neutral")
                        score = emotion_scores.get(emotion, 50)
                        day_buckets[day_name].append(score)
                    except Exception as e:
                        # Fallback: try parsing with date util if standard fails, or just ignore
                        pass
        
        # Calculate Averages
        mood_trend = []
        days_order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        
        for day in days_order:
            scores = day_buckets.get(day, [])
            avg_mood = sum(scores) / len(scores) if scores else 50 # Default middle
            # Energy is simulated based on mood volatility or random for now, as we don't track it explicitly
            energy = avg_mood + (10 if len(scores) > 5 else 0) 
            mood_trend.append({"day": day, "mood": int(avg_mood), "energy": int(energy)})

        # 4. Calculate 'Modes' based on recent emotions
        # If user is sad -> Support Mode (Empathy) rises
        # If user is neutral -> Logic Mode
        last_msgs = all_messages[-10:] # Last 10 messages
        recent_emotions = [m.get("emotion", "neutral") for m in last_msgs if m.get("role") == "user"]
        
        sad_count = sum(1 for e in recent_emotions if e in ["sadness", "fear", "sad"])
        joy_count = sum(1 for e in recent_emotions if e in ["joy", "happy"])
        
        empathy_score = 50 + (sad_count * 10)
        motivation_score = 50 + (joy_count * 10)
        logic_score = 100 - (empathy_score / 2) - (motivation_score / 2)

        return {
            "mood_data": mood_trend,
            "stats": {
                "logic": int(logic_score),
                "empathy": int(empathy_score),
                "motivation": int(motivation_score)
            }
        }

    except Exception as e:
        print(f"Error calculating insights: {e}")
        return {"mood_data": [], "stats": {}}

def search_chat_history_keyword(user_id: str, query: str):
    """
    Searches recent chat history for a keyword if no specific memory is found.
    Returns: List of strings (excerpts)
    """
    if not supabase:
        return []
    
    try:
        # Fetch last 5 charts
        response = supabase.table("chats").select("messages, title").eq("user_id", user_id).order("updated_at", desc=True).limit(5).execute()
        
        results = []
        if response.data:
            for chat in response.data:
                msgs = chat.get("messages", []) or []
                for m in msgs:
                    # Case-insensitive keyword match
                    txt = m.get("text", "")
                    if query.lower() in txt.lower() and m.get("sender") == "user":
                        # meaningful context window? for now just the message
                        # Verify it's not the query itself (basic filtering)
                        results.append(f"In chat '{chat.get('title', 'Unknown')}': \"{txt}\"")
        
        # Dedupe
        results = list(set(results))
        return results[:3] # Top 3
    except Exception as e:
        print(f"Error searching chat history: {e}")
        return []
