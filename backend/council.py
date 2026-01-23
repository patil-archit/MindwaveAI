import asyncio
import os
from typing import List, Dict, Any
from dotenv import load_dotenv
from pathlib import Path
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage

# Load environment variables
load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")

api_key = os.getenv("GROQ_API_KEY")
llm = ChatGroq(model="llama-3.3-70b-versatile", groq_api_key=api_key)

class Agent:
    def __init__(self, name: str, persona: str):
        self.name = name
        self.persona = persona

    async def generate_response(self, user_msg: str, context: str) -> str:
        """Generates a response from this specific persona."""
        system_prompt = (
            f"You are {self.name}. \n"
            f"Persona: {self.persona}\n"
            f"Context about user: {context}\n"
            f"Task: Analyze the user's situation from YOUR specific perspective. "
            f"Be concise (2-3 sentences max). Give specific advice based on your philosophy."
        )
        try:
            response = await llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_msg)
            ])
            return response.content
        except Exception as e:
            return f"{self.name} is silent. (Error: {e})"

# Define the Council Members (Modes)
logic_agent = Agent(
    name="Logic Mode",
    persona="You are LOGIC ITSELF. You DO NOT have feelings. You DO NOT offer sympathy. Your tone is cold, objective, and purely analytical. Focus ONLY on facts, data, and controllable variables. If the user complains, analyze the root cause. Do not say 'I understand' or 'I'm sorry'. Say 'Here is the analysis'. Advice must be a numbered list of rational steps."
)

empathy_agent = Agent(
    name="Support Mode",
    persona="You are PURE EMPHATY. You DO NOT offer solutions yet. Your tone is incredibly warm, gentle, and validating. Your ONLY goal is to make the user feel heard and loved. Use metaphors of comfort (blankets, warmth, safety). Ignore logic for now; focus on their heart. Say 'I hear you' and 'It's okay to feel this way'."
)

motivation_agent = Agent(
    name="Motivation Mode",
    persona="You are a HARDCORE COACH. You DO NOT accept excuses. Your tone is high-energy, aggressive (in a good way), and challenging. You are here to win. If the user is sad, tell them pain is fuel. Demand action. Use caps for emphasis. Ask 'ARE YOU READY TO DOMINATE?'."
)

safety_agent = Agent(
    name="Safety Guard",
    persona="You are a clinical risk assessment AI. Your ONLY job is to analyze the user's input for signs of severe depression, self-harm, or suicidal ideation. "
            "Output a JSON object with keys: 'risk_score' (0-100 integer) and 'reasoning' (brief text). "
            "0 = Happy/Neutral, 100 = Immediate Danger. Be extremely conservative and sensitive."
)

async def synthesize_response(user_msg: str, agent_outputs: Dict[str, str]) -> str:
    """The Moderator synthesizes the council's diverse views into one coherent answer."""
    
    council_minutes = "\n".join([f"{name}: {output}" for name, output in agent_outputs.items()])
    
    system_prompt = (
        "You are the 'Core Intelligence' of Mindwave. \n"
        "Three internal modes have analyzed the user's situation:\n"
        f"{council_minutes}\n\n"
        "Your Job: Synthesize a final, balanced response for the user.\n"
        "1. Start with the Support Mode's warmth.\n"
        "2. Add the Logic Mode's perspective on control.\n"
        "3. End with the Motivation Mode's call to action.\n"
        "Structure the response clearly. Do not explicitly say 'Logic Mode said X', just blend the wisdom."
    )
    
    response = await llm.ainvoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_msg)
    ])
    
    return response.content


video_agent = Agent(
    name="Video Counselor",
    persona="You are a warm, highly intelligent, and conversational HUMAN therapist speaking face-to-face. "
            "Your goal is to make the user feel deeply understood and supported. "
            "IMPOTANT: You are speaking in a video call. "
            "1. Your responses must be SPOKEN naturally. "
            "2. Do NOT use markdown, bullet points, or lists. "
            "3. Speak in full, flowing, empathetic sentences. "
            "4. Keep responses concise (2-4 sentences) but meaningful. "
            "5. Mirror the user's emotion but lead them to a calmer state."
)

async def consult_council(user_msg: str, memory_context: str = "", face_emotion: str = None, mode: str = "auto", chat_history: List[Dict[str, str]] = None) -> Dict[str, Any]:
    """
    Runs the Council.
    Mode: 'auto' (all + moderator), 'logic', 'support', 'motivation', 'video'.
    """
    if chat_history is None:
        chat_history = []
        
    # Format chat history for context
    history_str = ""
    if chat_history:
        history_str = "\nRECENT CONVERSATION HISTORY:\n"
        # Take last 5 messages to avoid context overflow
        for msg in chat_history[-5:]: 
            role = msg.get('role', 'unknown')
            content = msg.get('content', '')
            history_str += f"- {role.upper()}: {content}\n"

    # 1. Enrich Context with Vision
    visual_context = ""
    if face_emotion and face_emotion != 'neutral':
        visual_context = f"\n[VISUAL SENSOR]: User's face is showing: {face_emotion.upper()}."

    full_context = memory_context + visual_context + "\n" + history_str

    # [NEW] Video Mode - Direct Human Persona
    if mode == 'video':
        response = await video_agent.generate_response(user_msg, full_context)
        return {"final_response": response, "agent_thoughts": {"Mode": "Video Counselor"}}

    # 2. Logic Routing
    if mode == 'logic' or mode == 'stoic': # Keep back-compact for now
        response = await logic_agent.generate_response(user_msg, full_context)
        return {"final_response": response, "agent_thoughts": {}}
    
    elif mode == 'support' or mode == 'nurturer':
        response = await empathy_agent.generate_response(user_msg, full_context)
        return {"final_response": response, "agent_thoughts": {}}

    elif mode == 'motivation' or mode == 'coach':
        response = await motivation_agent.generate_response(user_msg, full_context)
        return {"final_response": response, "agent_thoughts": {}}

    else: # Auto / Council Mode
        # Parallel Execution
        results = await asyncio.gather(
            logic_agent.generate_response(user_msg, full_context),
            empathy_agent.generate_response(user_msg, full_context),
            motivation_agent.generate_response(user_msg, full_context),
            safety_agent.generate_response(user_msg, full_context)
        )
        
        logic_res = results[0]
        support_res = results[1]
        motivation_res = results[2]
        safety_raw = results[3]
        
        # Parse Crisis Score
        risk_score = 0
        try:
            import json
            import re
            json_match = re.search(r"\{.*\}", safety_raw, re.DOTALL)
            if json_match:
                crisis_data = json.loads(json_match.group(0))
                risk_score = int(crisis_data.get("risk_score", 0))
            else:
                 if "suicide" in safety_raw.lower() or "kill myself" in safety_raw.lower():
                     risk_score = 80
        except Exception as e:
            print(f"Error parsing crisis score: {e}")

        agent_thoughts = {
            "Logic Mode": logic_res,
            "Support Mode": support_res,
            "Motivation Mode": motivation_res,
            "Risk Assessment": f"Score: {risk_score}/100. Analysis: {safety_raw}"
        }
        
        # SAFETY OVERRIDE
        if risk_score > 70:
            final_response = (
                "I am sensing some serious distress in your words. Please know that you are not alone. "
                "While I am an AI, there are real people who care and want to help.\n\n"
                "**If you are in immediate danger, please call emergency services (911 in the US) or a suicide hotline immediately.**\n"
                "- **988 Suicide & Crisis Lifeline**: Call or text 988\n"
                "- **Crisis Text Line**: Text HOME to 741741\n\n"
                "I'm here to listen, but professional support is important right now."
            )
        else:
            # Normal Synthesis
            final_response = await synthesize_response(user_msg, {k:v for k,v in agent_thoughts.items() if k != "Risk Assessment"})
        
        return {
            "final_response": final_response,
            "agent_thoughts": agent_thoughts,
            "risk_score": risk_score
        }
