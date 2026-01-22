"""
Health Analysis Agent using LangChain + Groq
Analyzes BMI and provides personalized health recommendations
"""
import os
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")

api_key = os.getenv("GROQ_API_KEY")
llm = ChatGroq(model="llama-3.3-70b-versatile", groq_api_key=api_key) if api_key else None

def calculate_bmi(weight_kg: float, height_cm: float) -> tuple:
    """
    Calculate BMI and return category
    Returns: (bmi_value, category)
    """
    height_m = height_cm / 100
    bmi = weight_kg / (height_m ** 2)
    
    if bmi < 18.5:
        category = "Underweight"
    elif 18.5 <= bmi < 25:
        category = "Normal weight"
    elif 25 <= bmi < 30:
        category = "Overweight"
    else:
        category = "Obese"
    
    return round(bmi, 2), category

async def analyze_health(
    age: int,
    gender: str,
    weight: float,
    height: float,
    bmi: float,
    bmi_category: str,
    present_illnesses: str = "",
    medications: str = "",
    allergies: str = ""
) -> dict:
    """
    Use LangChain + Groq to analyze health data and provide recommendations
    """
    if not llm:
        return {
            "analysis": "AI analysis unavailable. Please check GROQ_API_KEY.",
            "recommendations": []
        }
    
    system_prompt = """You are a professional health advisor AI. Analyze the user's physical health data and provide:
1. A brief health assessment (2-3 sentences)
2. Specific, actionable health recommendations (3-5 bullet points)
3. Any red flags or concerns based on BMI and existing conditions

Be empathetic, professional, and evidence-based. Do NOT diagnose diseases. Always recommend consulting a doctor for serious concerns."""

    user_prompt = f"""
Patient Profile:
- Age: {age} years
- Gender: {gender}
- Weight: {weight} kg
- Height: {height} cm
- BMI: {bmi} ({bmi_category})
- Present Illnesses: {present_illnesses or 'None reported'}
- Current Medications: {medications or 'None'}
- Allergies: {allergies or 'None'}

Please provide a health assessment and personalized recommendations.
"""

    try:
        response = await llm.ainvoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ])
        
        analysis_text = response.content
        
        # Parse recommendations (simple extraction)
        lines = analysis_text.split('\n')
        recommendations = [line.strip('- ').strip() for line in lines if line.strip().startswith('-')]
        
        return {
            "analysis": analysis_text,
            "recommendations": recommendations[:5]  # Top 5
        }
    
    except Exception as e:
        print(f"Error in health analysis: {e}")
        return {
            "analysis": f"Error generating analysis: {str(e)}",
            "recommendations": []
        }
