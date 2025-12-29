# Mindwave AI - Emotion-Aware Chatbot

An intelligent chatbot that detects user emotions and adapts its responses accordingly using Google's Gemini AI and LangChain.

## Features

- 🧠 **Emotion Detection**: Automatically detects user emotions (happy, sad, angry, neutral, etc.)
- 💬 **Context-Aware Responses**: AI adjusts its tone based on detected emotions
- 🔐 **Firebase Authentication**: Secure user authentication with email/password and Google OAuth
- ⚡ **Real-time Chat**: Fast, responsive chat interface
- 🎨 **Beautiful UI**: Modern, glassmorphic design with smooth animations

## Tech Stack

### Frontend
- **React** with Vite
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **Firebase Auth** for authentication
- **React Router** for navigation

### Backend
- **FastAPI** - High-performance Python web framework
- **LangChain** - Framework for LLM applications
- **Google Gemini Flash** - AI model for chat and emotion detection
- **Uvicorn** - ASGI server

## Project Structure

```
emotion-chatbot/
├── frontend/           # React frontend
│   ├── src/
│   │   ├── pages/     # Chat and Auth pages
│   │   ├── context/   # Auth context
│   │   └── firebase.js
│   └── package.json
│
└── backend/           # FastAPI backend
    ├── main.py        # Main API endpoints
    ├── requirements.txt
    └── .env           # Environment variables (not in git)
```

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- Python (3.8+)
- Google Gemini API Key
- Firebase Project

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `backend/.env` file (copy the example and fill it in):
```bash
cp .env.example .env
```

`backend/.env`:
```bash
# Required
GOOGLE_API_KEY=your_gemini_api_key_here

# Optional (enables emotion detection)
HUGGINGFACE_API_KEY=your_huggingface_token_here
```

5. Run the server:
```bash
uvicorn main:app --reload --port 8000
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `frontend/.env` (copy the example and fill it in):
```bash
cp .env.example .env
```

4. Run the development server:
```bash
npm run dev
```

5. Open http://localhost:5173 in your browser

## Environment Variables

### Backend (`backend/.env`)
```bash
GOOGLE_API_KEY=your_google_gemini_api_key
HUGGINGFACE_API_KEY=your_huggingface_token  # optional
```

### Frontend (`frontend/.env`)
```bash
VITE_API_BASE_URL=http://localhost:8000

VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=... # optional
```

## API Endpoints

### POST /chat
Send a message and get an emotion-aware response.

**Request:**
```json
{
  "messages": [
    {"role": "user", "content": "Hello!"}
  ],
  "uid": "user_id",
  "history": []
}
```

**Response:**
```json
{
  "response": "AI response text",
  "emotion": "happy"
}
```

## Features in Detail

### Emotion Detection
The system uses Gemini AI to classify user emotions from their messages. Detected emotions include:
- Happy
- Sad
- Angry
- Neutral
- Excited
- Anxious
- Curious

### Context-Aware Responses
The AI adjusts its tone and response style based on the detected emotion to provide empathetic and appropriate responses.

### Authentication
- Email/Password authentication
- Google OAuth sign-in
- Email verification for new accounts

## Development

### Testing Backend
```bash
cd backend
python test_langchain.py
```

### Building for Production
```bash
cd frontend
npm run build
```

## License

MIT

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.
