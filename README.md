# 🧠 Mindwave AI

**An emotion-aware AI companion that remembers not just what you said, but how you felt.**

Built with advanced LangChain agents, real-time emotion detection, crisis intervention, and comprehensive health tracking.

---

## 🌟 Features

### 💬 **Intelligent Chat System**
- **Multi-Agent Architecture**: Specialized agents for different conversation modes
  - Therapist Agent (empathetic support)
  - Friend Agent (casual conversations)
  - Crisis Analyzer (safety monitoring)
  - Emotion Analyzer (real-time sentiment detection)
- **Long-term Memory**: Remembers your conversations and emotional patterns using RAG
- **Context-Aware Responses**: Adapts to your emotional state

### 🏥 **Physical Health Assessment**
- BMI Calculator with AI analysis
- Personalized health recommendations
- Track weight, height, age, medications, and allergies
- AI-powered health insights using Groq LLM
- Health history tracking

### 🚨 **Crisis Detection & Intervention**
- Real-time risk assessment
- Automatic alerts for high-risk conversations
- Integration with mental health hotlines
- n8n workflow automation for crisis response

### 🔍 **Memory Search**
- Search through your conversation history
- Find past discussions by topic or emotion
- Vector-based semantic search

### 📊 **Analytics & Monitoring**
- Emotion tracking over time
- Risk score monitoring
- Health metrics visualization

---

## 🛠️ Tech Stack

### **Frontend**
- React + Vite
- Framer Motion (animations)
- Tailwind CSS
- Firebase Authentication
- Lucide React (icons)

### **Backend**
- FastAPI (Python)
- LangChain + LangGraph (AI agents)
- Groq API (LLM - Llama 3.3 70B)
- ChromaDB (vector embeddings)
- Supabase (PostgreSQL database)

### **Automation**
- n8n (workflow automation)
- Daily health reports
- Crisis alert system

---

## 🚀 Deployment

### **Live URLs**
- **Frontend**: https://mindwave-ai.vercel.app
- **Backend**: https://mindwaveai-backend.onrender.com

### **Deployed On**
- Frontend: **Vercel**
- Backend: **Render**
- Database: **Supabase**
- Workflows: **n8n Cloud**

---

## 📦 Installation (Local Development)

### **Prerequisites**
- Python 3.11+
- Node.js 18+
- Supabase account
- Firebase project
- Groq API key

### **1. Clone Repository**
```bash
git clone https://github.com/patil-archit/MindwaveAI.git
cd MindwaveAI
```

### **2. Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env` file:
```env
GROQ_API_KEY=your_groq_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
FIREBASE_CREDENTIALS={"type":"service_account",...}
```

Run Supabase migrations:
```bash
# Run the SQL files in Supabase SQL Editor:
# - backend/supabase_schema.sql
# - backend/physical_health_schema.sql
```

Start backend:
```bash
uvicorn main:app --reload
```

### **3. Frontend Setup**
```bash
cd frontend
npm install
```

Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Start frontend:
```bash
npm run dev
```

### **4. Quick Start (Both Services)**
```bash
chmod +x run.sh
./run.sh
```

---

## 📚 Documentation

- **[Migration Guide](MIGRATION_GUIDE.md)** - Supabase migration details
- **[Physical Health Guide](PHYSICAL_HEALTH_GUIDE.md)** - Health feature documentation
- **[n8n Health Reports](N8N_HEALTH_REPORTS.md)** - Workflow automation setup

---

## 🗄️ Database Schema

### **Supabase Tables**

#### `chats`
- User conversation history
- Emotion tracking
- Timestamps

#### `memories`
- Long-term memory storage
- Vector embeddings (ChromaDB)
- Semantic search

#### `user_risk`
- Real-time risk scores
- Crisis detection data
- Email alerts

#### `physical_health`
- BMI calculations
- Health assessments
- AI analysis results
- Medical history

---

## 🔐 Environment Variables

### **Backend**
```env
GROQ_API_KEY=          # Groq API key for LLM
SUPABASE_URL=          # Supabase project URL
SUPABASE_KEY=          # Supabase anon/service key
FIREBASE_CREDENTIALS=  # Firebase service account JSON
PORT=8000              # Server port
```

### **Frontend**
```env
VITE_API_BASE_URL=              # Backend API URL
VITE_FIREBASE_API_KEY=          # Firebase config
VITE_FIREBASE_AUTH_DOMAIN=      # Firebase config
VITE_FIREBASE_PROJECT_ID=       # Firebase config
VITE_FIREBASE_STORAGE_BUCKET=   # Firebase config
VITE_FIREBASE_MESSAGING_SENDER_ID= # Firebase config
VITE_FIREBASE_APP_ID=           # Firebase config
VITE_SUPABASE_URL=              # Supabase URL
VITE_SUPABASE_ANON_KEY=         # Supabase anon key
```

---

## 🤖 AI Agents

### **1. Therapist Agent**
- Empathetic, professional support
- Evidence-based techniques
- Crisis-aware responses

### **2. Friend Agent**
- Casual, supportive conversations
- Relatable and encouraging
- Emotional validation

### **3. Crisis Analyzer**
- Real-time risk assessment
- Suicide/self-harm detection
- Automatic intervention

### **4. Emotion Analyzer**
- Sentiment analysis
- Emotion classification
- Intensity scoring

### **5. Health Agent**
- BMI analysis
- Personalized recommendations
- Medical history consideration

---

## 🔄 n8n Workflows

### **1. Crisis Alert System**
- Monitors risk scores
- Sends email alerts for high-risk users
- Includes hotline information

### **2. Daily Health Reports**
- Fetches latest health assessments
- Generates personalized emails
- Sends to all users with health data

---

## 🎨 Design Features

- **Glassmorphism UI**
- **Smooth animations** (Framer Motion)
- **Responsive design**
- **Dark mode support**
- **Accessibility optimized**

---

## 🧪 Testing

### **Backend Tests**
```bash
cd backend
pytest
```

### **Frontend Tests**
```bash
cd frontend
npm run test
```

---

## 📝 API Endpoints

### **Chat**
- `POST /chats` - Send message
- `GET /chats/{user_id}` - Get chat history

### **Health**
- `POST /health/assess` - Submit health assessment
- `GET /health/{user_id}` - Get health history
- `GET /health/users/all` - Get all users (for n8n)

### **Memory**
- `GET /search/memories` - Search conversation history

### **Risk Monitoring**
- `GET /monitor/risk` - Get high-risk users

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Archit Patil**
- GitHub: [@patil-archit](https://github.com/patil-archit)
- Email: architking360@gmail.com

---

## 🙏 Acknowledgments

- **Groq** - Fast LLM inference
- **LangChain** - AI agent framework
- **Supabase** - Backend as a Service
- **Vercel** - Frontend hosting
- **Render** - Backend hosting
- **n8n** - Workflow automation

---

## 🔮 Future Enhancements

- [ ] Voice chat integration
- [ ] Mobile app (React Native)
- [ ] Group therapy sessions
- [ ] Therapist dashboard
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Wearable device integration
- [ ] Medication reminders

---

## 📞 Support

For support, email architking360@gmail.com or open an issue on GitHub.

---

**Made with ❤️ and AI**
