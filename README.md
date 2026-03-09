# Cosmii

Gamified book learning app with a dark cosmic space theme. Learn from books through Duolingo-style bite-sized lessons, quizzes, and AI-powered dialogue.

## Stack

- **Frontend**: Next.js, React, Tailwind CSS, Three.js, Framer Motion, Zustand
- **Backend**: FastAPI, OpenAI, Supabase (Auth + PostgreSQL + pgvector)
- **Monorepo**: Turborepo

## Setup

### 1. Supabase
- Create a Supabase project
- Run `backend/supabase_schema.sql` in the SQL Editor
- Enable Google Auth provider in Authentication settings

### 2. Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# Copy .env and fill in your keys
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend
```bash
cd frontend
npm install
# Copy .env.local and fill in Supabase keys
npm run dev
```

## Architecture

```
cosmii/
├── frontend/          # Next.js app (mobile-first)
│   ├── src/app/       # Pages (universe, login, admin)
│   ├── src/components/# UI components
│   └── src/lib/       # Store, API, utils
├── backend/           # FastAPI
│   ├── app/api/       # Admin, Learning, Chat endpoints
│   ├── app/ingestion/ # Book parsing + smart chunking
│   ├── app/lesson/    # LLM lesson generation
│   └── app/memory/    # pgvector RAG
└── turbo.json
```
