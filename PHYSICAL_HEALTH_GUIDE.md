# Physical Health Assessment Feature - Setup Guide

## ✅ What Was Created

A complete physical health assessment system with:
- BMI Calculator
- AI Health Analysis (using Groq LLM)
- Personalized Recommendations
- Health History Tracking
- Supabase Storage

---

## 🚀 Setup Instructions

### Step 1: Create Supabase Table
1. Open **Supabase Dashboard** → **SQL Editor**
2. Run the SQL from `backend/physical_health_schema.sql`
3. This creates the `physical_health` table

### Step 2: Backend is Ready
The backend has been automatically updated with:
- `/health/assess` - POST endpoint for health assessment
- `/health/{user_id}` - GET endpoint for history
- `health_agent.py` - AI analysis agent

### Step 3: Access the Page
1. Go to your app: `http://localhost:5173`
2. Click **"Physical Health"** button on homepage
3. Or navigate directly to: `http://localhost:5173/physical-health`

---

## 📋 How to Use

### For Users:
1. Fill in the form:
   - **Height** (cm)
   - **Weight** (kg)
   - **Age**
   - **Gender** (optional)
   - **Present Illnesses** (optional)
   - **Medications** (optional)
   - **Allergies** (optional)

2. Click **"Get AI Health Assessment"**

3. View Results:
   - **BMI Score** and Category
   - **AI Analysis** (personalized health insights)
   - **Recommendations** (actionable steps)

### For n8n Automation:
You can create workflows to:
- Monitor BMI trends
- Alert users about health risks
- Send weekly health summaries
- Track medication adherence

**API Endpoint**: `GET /health/{user_id}`
Returns all health assessments for a user.

---

## 🎨 Features

### BMI Categories:
- **Underweight**: BMI < 18.5
- **Normal weight**: 18.5 ≤ BMI < 25
- **Overweight**: 25 ≤ BMI < 30
- **Obese**: BMI ≥ 30

### AI Analysis Includes:
- Health assessment based on BMI
- Consideration of age, gender, existing conditions
- Personalized recommendations
- Red flags and concerns
- Evidence-based advice

---

## 🔧 Technical Details

### Backend Stack:
- **FastAPI** endpoints
- **LangChain** + **Groq** for AI analysis
- **Supabase** for data storage
- **Pydantic** models for validation

### Frontend Stack:
- **React** with Framer Motion
- **Tailwind CSS** styling
- **Lucide React** icons
- Responsive design

### Data Stored:
```json
{
  "user_id": "...",
  "height": 175,
  "weight": 70,
  "age": 25,
  "gender": "Male",
  "bmi": 22.86,
  "bmi_category": "Normal weight",
  "ai_analysis": "...",
  "health_recommendations": "[...]",
  "created_at": "2026-01-23T..."
}
```

---

## 🔐 Privacy & Security

- All health data is encrypted in Supabase
- Row Level Security (RLS) enabled
- User data is isolated by `user_id`
- No data sharing with third parties
- HIPAA-compliant storage (Supabase)

---

## 📊 n8n Integration Ideas

### 1. Weekly Health Report
- Trigger: Every Sunday
- Fetch: Latest health data
- Send: Email summary with BMI trend

### 2. BMI Alert System
- Trigger: New health assessment
- Check: If BMI is outside normal range
- Action: Send notification to user

### 3. Medication Reminder
- Trigger: Daily at 9 AM
- Check: Users with medications
- Send: Reminder notification

---

## 🆘 Troubleshooting

### "Table does not exist"
→ Run the SQL schema in Supabase

### "AI analysis unavailable"
→ Check `GROQ_API_KEY` in `.env`

### Page not loading
→ Ensure frontend is running: `npm run dev`

### No data showing
→ Submit a health assessment first

---

## 🎯 Next Steps

1. ✅ Run SQL schema
2. ✅ Test the page
3. ✅ Submit a health assessment
4. ✅ View results and history
5. 🔜 Create n8n workflows

Your physical health tracking system is ready! 🏥
