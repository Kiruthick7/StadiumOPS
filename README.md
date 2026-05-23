# Stadium OPS — AI-Assisted Stadium Operations Platform

Stadium OPS is a real-time command platform for crowd coordination, congestion prediction, and emergency response during large cricket matches. Designed specifically as a hackathon-grade production-style system for Google Cloud’s “Build with AI – Agentic Premier League”.

## Features

- **Real-time Monitoring**: Polling-based live dashboard with low-latency updates.
- **AI Operational Recommendations**: Uses Groq (LLaMA 3) to process operational state and return structured JSON recommendations.
- **Resilient Fallback Engine**: Deterministic rule-based engine activates automatically if the AI is unavailable or network degrades.
- **Deterministic Simulation**: A backend-driven simulation engine allows operators to trigger realistic events (congestion, weather, emergencies) with predictable outcomes.
- **Production UI**: Dark mode command center aesthetic using TailwindCSS and React.

## Getting Started

### 1. Backend (FastAPI + Cloud Run ready)

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Add your Groq API key
cp .env.example .env
# Edit .env to set GROQ_API_KEY

uvicorn app.main:app --reload --port 8000
```

### 2. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

The frontend will start at `http://localhost:5173`.

## Architecture Highlights

- **Stateless Backend**: While the demo uses an in-memory singleton for simplicity, the architecture is designed to easily migrate to Redis or Firestore for multi-instance Cloud Run deployments.
- **Graceful Degradation**: The frontend tracks connection health (Connecting -> Live -> Degraded -> Offline) and the backend falls back to rule-based logic when AI APIs fail.
- **Explainable AI**: The AI is instructed to return `confidence` scores, `priority` levels, and `reasoning` alongside its recommendations, avoiding the "black box" problem.

## Deployment

### Deploying Backend to Cloud Run

The backend is fully containerized and ready for Google Cloud Run.

```bash
cd backend
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/stadium-ops-backend
gcloud run deploy stadium-ops-backend \
  --image gcr.io/YOUR_PROJECT_ID/stadium-ops-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GROQ_API_KEY=your_api_key_here,CORS_ORIGINS="http://localhost:5173,http://localhost:3000,https://your-frontend-domain.web.app"
```

### Deploying Frontend to Firebase Hosting

The frontend is pre-configured with `firebase.json` for static hosting. Before building, create a `.env.production` file in the `frontend` folder and set your Cloud Run URL:

```env
VITE_API_URL=https://stadium-ops-backend-xxxxxx.a.run.app
```

```bash
cd frontend
# Install Firebase CLI if you haven't
npm install -g firebase-tools

# Login and initialize
firebase login
firebase use YOUR_PROJECT_ID

# Build the production assets
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```
