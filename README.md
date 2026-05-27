# StadiumOPS — AI-Assisted Stadium Operations Platform

> **🏆 Top 15 Finalist — Google Agentic Premier League (Multicity, 2026)**  
> Built for Google Cloud's *"Build with AI – Agentic Premier League"* national hackathon.

---

Stadium OPS is a **real-time AI command platform** for crowd coordination, congestion prediction, and emergency response during large-scale cricket matches. It combines LLM-powered operational intelligence with a deterministic fallback engine — designed to stay functional even when AI inference is unavailable.

**Live Problem:** Stadium operators at IPL-scale events (60,000+ capacity) have no unified real-time system to coordinate zone congestion, gate routing, and emergency dispatch. Most operations run on walkie-talkies and manual coordination.

**What StadiumOPS solves:** A single command-center dashboard that gives operators AI-generated action recommendations for any scenario, backed by a rules engine that activates automatically when the AI is unavailable.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)              │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Command      │  │ Stadium SVG  │  │  Alert Feed   │  │
│  │ Dashboard    │  │ (live zone   │  │  + Actions    │  │
│  │              │  │  risk color) │  │               │  │
│  └──────┬───────┘  └──────────────┘  └───────────────┘  │
│         │ polls every 4s (useStatus hook)               │
└─────────┼───────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│               BACKEND (FastAPI + Uvicorn)               │
│                                                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │              Operational State                     │ │
│  │  (in-memory singleton → swap to Redis/Firestore)   │ │
│  └──────────────────┬─────────────────────────────────┘ │
│                     │                                   │
│     ┌───────────────┼───────────────────┐               │
│     ▼               ▼                   ▼               │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐   │
│  │Simulation│  │ AI Layer │  │  Fallback Rules      │   │
│  │ Engine   │  │ (Groq /  │  │  Engine              │   │
│  │          │  │ LLaMA 3) │  │  (deterministic)     │   │
│  └──────────┘  └──────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────┘
          │
          ▼  (Cloud Run ready)
┌──────────────────┐
│    Groq API      │
│  (LLaMA 3 fast   │
│   inference)     │
└──────────────────┘
```

**Key architectural decision:** Polling over WebSockets — chosen for hackathon reliability and simplicity. The 4-second polling interval was tuned to give near-real-time UX without WebSocket connection overhead in an unstable demo environment. The architecture doc explicitly notes this as a production tradeoff.

---

## Features

- **Real-time Command Dashboard** — Live zone status, gate congestion, and crowd density displayed on a dynamic SVG stadium map with risk-based color coding
- **AI Operational Intelligence** — Groq (LLaMA 3) processes live operational state and returns structured JSON recommendations for operator action
- **Resilient Fallback Engine** — Deterministic rule-based system activates automatically if AI is unavailable or network degrades — the system never goes dark
- **Scenario Simulation Engine** — Backend-driven simulation lets operators trigger realistic events (congestion, weather, emergencies) for training and demos
- **Production-Grade UI** — Dark mode command-center interface built with React 18 + TypeScript + TailwindCSS

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite | Type safety, fast dev loop, production-ready |
| UI | TailwindCSS 3 + SVG | Custom stadium map with dynamic coloring |
| Backend | FastAPI + Pydantic + Uvicorn | Async Python, automatic schema validation |
| AI Inference | Groq API (LLaMA 3) | Fastest open-model inference latency |
| State | In-memory singleton (Redis-ready) | Hackathon simplicity; swappable in production |
| Deployment | Cloud Run ready | Stateless backend design enables instant Cloud Run deploy |

---

## Engineering Decisions

**Why polling instead of WebSockets?**  
In a hackathon demo environment with unreliable network conditions, WebSocket connections create fragile demos. A 4-second polling interval gives operators near-real-time feedback while making the system tolerant to network blips. In production, this would be upgraded to WebSockets or Server-Sent Events.

**Why a fallback rules engine alongside the LLM?**  
An AI-only system fails silently. Stadium operations cannot tolerate a black box — if the AI is unavailable, operators still need actionable guidance. The rules engine ensures the system degrades gracefully rather than going dark.

**Why Groq + LLaMA 3 instead of OpenAI?**  
Groq's inference latency (~200ms for LLaMA 3 70B) is roughly 10× faster than GPT-4 at equivalent load. For a real-time operational dashboard where recommendations need to feel instant, this matters.

**Why structured JSON output from the LLM?**  
The AI is prompted to return structured JSON that directly maps to the UI components. This removes a parsing layer and makes the AI output type-safe via Pydantic models.

---

## Getting Started

### Backend (FastAPI + Cloud Run ready)

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Add your GROQ_API_KEY to .env

uvicorn app.main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs`

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

---

## Project Context

Built in 4 hours at the **Google Agentic Premier League (Multicity)** — a Google organized national hackathon focused on agentic AI systems. StadiumOPS reached the **Top 15** out of participants across multiple cities.

The theme: build an AI agent that solves a real operational problem in real-time. We chose stadium operations because it has genuine scale, genuine stakes (crowd safety), and zero good tooling today.

---

## What's Next (Post-Hackathon Roadmap)

- [ ] Swap in-memory state for Redis (horizontal scaling)  
- [ ] Replace polling with Server-Sent Events  
- [ ] Deploy backend to Google Cloud Run  
- [ ] Add historical incident logging to BigQuery  
- [ ] Add multi-stadium support

---

## Author

**Kiruthick B** — [GitHub](https://github.com/Kiruthick7) | [LinkedIn](https://linkedin.com/in/kiruthick)
