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

# Define the Council Members
stoic_agent = Agent(
    name="The Stoic",
    persona="You are Marcus Aurelius. Focus on what is controllable. Emphasize logic, virtue, and emotional resilience. Dismiss external chaos."
)

nurturer_agent = Agent(
    name="The Nurturer",
    persona="You are Maya. Focus on unconditional love, emotional safety, and validation. Make the user feel hugged with words. Acknowledge their pain deeply."
)

coach_agent = Agent(
    name="The Coach",
    persona="You are David. Focus on action, growth, and accountability. Be tough but fair. Ask: 'What is the next step to win?'."
)

crisis_agent = Agent(
    name="Crisis Analyzer",
    persona="You are a clinical risk assessment AI. Your ONLY job is to analyze the user's input for signs of severe depression, self-harm, or suicidal ideation. "
            "Output a JSON object with keys: 'risk_score' (0-100 integer) and 'reasoning' (brief text). "
            "0 = Happy/Neutral, 100 = Immediate Danger. Be extremely conservative and sensitive."
)

async def synthesize_response(user_msg: str, agent_outputs: Dict[str, str]) -> str:
    """The Moderator synthesizes the council's diverse views into one coherent answer."""
    
    council_minutes = "\n".join([f"{name}: {output}" for name, output in agent_outputs.items()])
    
    system_prompt = (
        "You are the 'Moderator' of the Inner Council. \n"
        "Three agents have analyzed the user's problem:\n"
        f"{council_minutes}\n\n"
        "Your Job: Synthesize a final, balanced response for the user.\n"
        "1. Acknowledge the Nurturer's empathy.\n"
        "2. Incorporate the Stoic's perspective on control.\n"
        "3. End with the Coach's actionable step.\n"
        "Structure the response clearly. Do not explicitly say 'The Stoic said X', just blend the wisdom."
    )
    
    response = await llm.ainvoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_msg)
    ])
    
    return response.content

async def consult_council(user_msg: str, memory_context: str = "", face_emotion: str = None, mode: str = "auto", chat_history: List[Dict[str, str]] = None) -> Dict[str, Any]:
    """
    Runs the Council.
    Mode: 'auto' (all + moderator), 'stoic', 'nurturer', 'coach'.
    """
    if chat_history is None:
        chat_history = []
        
    # Format chat history for context
    history_str = ""
    if chat_history:
        history_str = "\nRECENT CONVERSATION HISTORY:\n"
        # Take last 5 messages to avoid context overflow, excluding the current one usually
        for msg in chat_history[-5:]: 
            role = msg.get('role', 'unknown')
            content = msg.get('content', '')
            history_str += f"- {role.upper()}: {content}\n"

    # 1. Enrich Context with Vision
    visual_context = ""
    if face_emotion and face_emotion != 'neutral':
        visual_context = f"\n[VISUAL SENSOR]: User's face is showing: {face_emotion.upper()}."

    full_context = memory_context + visual_context + "\n" + history_str

    # 2. Logic Routing
    if mode == 'stoic':
        response = await stoic_agent.generate_response(user_msg, full_context)
        return {"final_response": response, "agent_thoughts": {}}
    
    elif mode == 'nurturer':
        response = await nurturer_agent.generate_response(user_msg, full_context)
        return {"final_response": response, "agent_thoughts": {}}

    elif mode == 'coach':
        response = await coach_agent.generate_response(user_msg, full_context)
        return {"final_response": response, "agent_thoughts": {}}

    else: # Auto / Council Mode
        # Parallel Execution
        # We add the Crisis Agent to the gather list
        results = await asyncio.gather(
            stoic_agent.generate_response(user_msg, full_context),
            nurturer_agent.generate_response(user_msg, full_context),
            coach_agent.generate_response(user_msg, full_context),
            crisis_agent.generate_response(user_msg, full_context)
        )
        
        stoic_res = results[0]
        nurturer_res = results[1]
        coach_res = results[2]
        crisis_raw = results[3]
        
        # Parse Crisis Score
        risk_score = 0
        try:
            # Basic cleanup to find JSON
            import json
            import re
            json_match = re.search(r"\{.*\}", crisis_raw, re.DOTALL)
            if json_match:
                crisis_data = json.loads(json_match.group(0))
                risk_score = int(crisis_data.get("risk_score", 0))
            else:
                 # Fallback if no JSON found (e.g. model just talked)
                 if "suicide" in crisis_raw.lower() or "kill myself" in crisis_raw.lower():
                     risk_score = 80
        except Exception as e:
            print(f"Error parsing crisis score: {e}")

        agent_thoughts = {
            "The Stoic": stoic_res,
            "The Nurturer": nurturer_res,
            "The Coach": coach_res,
            "Risk Assessment": f"Score: {risk_score}/100. Analysis: {crisis_raw}"
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
