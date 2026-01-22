# Migration to Supabase - Complete Guide

## ✅ What Has Been Migrated

All local files have been migrated to Supabase cloud storage:

### 1. **Risk Scores** (`risk_db.json` → `user_risk` table)
- **Before**: Stored in `/backend/risk_db.json`
- **After**: Stored in Supabase `user_risk` table
- **Data**: User ID, Email, Risk Score (0-100), Last Updated timestamp

### 2. **Knowledge Graph** (`graph_db.json` → `knowledge_graph` table)
- **Before**: Stored in `/backend/graph_db.json`
- **After**: Stored in Supabase `knowledge_graph` table
- **Data**: Nodes (entities) and Links (relationships) extracted from conversations

### 3. **Long-Term Memory** (Already in Supabase)
- **Table**: `memories`
- **Data**: Semantic embeddings and facts about users
- **Status**: ✅ Already cloud-based

### 4. **Chat History** (Already in Supabase)
- **Table**: `chats`
- **Data**: All conversations and messages
- **Status**: ✅ Already cloud-based

---

## 🚀 Setup Instructions

### Step 1: Run SQL Schema
1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy and paste the contents of `supabase_schema.sql`
4. Click **Run**

This will create:
- `user_risk` table
- `knowledge_graph` table
- Necessary security policies

### Step 2: Restart Your Backend
The code has been automatically updated. Just restart:
```bash
# Stop the current server (Ctrl+C)
# Then restart
./run.sh
```

### Step 3: Verify Migration
Test that everything works:
```bash
# Check risk endpoint
curl http://localhost:8000/monitor/risk

# Check graph endpoint
curl http://localhost:8000/graph
```

---

## 📊 What's Now in the Cloud

### Current Data Storage:
```
☁️  SUPABASE (Cloud)
├── user_risk          → Risk scores for all users
├── knowledge_graph    → AI's knowledge about users
├── memories           → Long-term semantic memory
├── chats              → All chat conversations
└── auth.users         → User authentication

💻 LOCAL (Your PC)
└── chroma_db/         → Vector embeddings (can be migrated later)
```

---

## 🔄 Migration Benefits

1. **Scalability**: Your app can now handle unlimited users
2. **Reliability**: Data persists even if your PC restarts
3. **Accessibility**: n8n can access data from anywhere
4. **Backup**: Supabase automatically backs up your data
5. **Production Ready**: Can deploy to Vercel, Railway, etc.

---

## ⚠️ Important Notes

### n8n Workflow
Your n8n workflow will continue to work without changes:
- `GET /monitor/risk` → Now fetches from Supabase
- Returns same JSON format
- Email alerts work exactly the same

### Old Local Files
You can safely delete these files (they're no longer used):
- `backend/risk_db.json`
- `backend/graph_db.json`

**Keep these**:
- `backend/chroma_db/` (still used for embeddings)

---

## 🧪 Testing Checklist

- [ ] SQL schema executed successfully
- [ ] Backend restarted without errors
- [ ] Can send a chat message
- [ ] Risk score appears in Supabase `user_risk` table
- [ ] Graph data appears in `knowledge_graph` table
- [ ] n8n workflow still receives data

---

## 🆘 Troubleshooting

### "Table does not exist" error
→ Run the SQL schema in Supabase SQL Editor

### "Supabase client not initialized"
→ Check your `.env` file has `SUPABASE_URL` and `SUPABASE_KEY`

### n8n shows empty data
→ Send a new chat message to populate the tables

---

## 📈 Next Steps (Optional)

1. **Migrate ChromaDB**: Move vector embeddings to Supabase pgvector
2. **Add Indexes**: Optimize queries for large datasets
3. **Enable RLS**: Add user-level security policies
4. **Deploy**: Host on Railway, Render, or DigitalOcean

Your app is now **100% cloud-ready**! 🎉
