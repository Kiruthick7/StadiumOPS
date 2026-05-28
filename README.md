 > 🏆 **Top 15 Finalist — Google Agentic Premier League (Multicity, 2026)**  
> Built for Google Cloud's *"Build with AI – Agentic Premier League"* national hackathon.

# StadiumOPS — AI-Assisted Stadium Operations Platform

A real-time AI command platform for crowd coordination, congestion prediction, and emergency response during large-scale cricket matches. Combines LLM-powered operational intelligence with a deterministic fallback engine — designed to stay functional even when AI inference is unavailable.

---

## The Problem

Stadium operators at IPL-scale events (60,000+ capacity) have no unified real-time tooling. Gate congestion, crowd surges, weather incidents, and emergency dispatch are all coordinated manually — via walkie-talkies and instinct.

StadiumOPS gives operators a single command center: live zone status, AI-generated action recommendations, and a fallback system that keeps working when the AI doesn't.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                  FRONTEND (React 18 + Vite)                  │
│                                                              │
│   ┌─────────────────┐  ┌──────────────────┐  ┌───────────┐   │
│   │ Command         │  │ Stadium SVG Map  │  │ Alert     │   │
│   │ Dashboard       │  │ (live zone risk  │  │ Feed +    │   │
│   │                 │  │  coloring)       │  │ Actions   │   │
│   └────────┬────────┘  └──────────────────┘  └───────────┘   │
│            │  useStatus hook — polls every 4 seconds         │
└────────────┼─────────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────────┐
│               BACKEND (FastAPI + Uvicorn)                    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐     │
│  │           Operational State                         │     │
│  │   in-memory singleton → swappable to Redis/Firestore│     │
│  └──────────────────┬──────────────────────────────────┘     │
│                     │                                        │
│     ┌───────────────┼──────────────────┐                     │
│     ▼               ▼                  ▼                     │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────────┐   │
│  │Simulation│  │  AI Layer    │  │  Fallback Rules Engine│   │
│  │ Engine   │  │  Groq API    │  │  (deterministic)      │   │
│  │          │  │  LLaMA 3     │  │  activates when AI    │   │
│  └──────────┘  └───────┬──────┘  │  is unavailable       │   │
│                        │         └───────────────────────┘   │
└────────────────────────┼─────────────────────────────────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │   Groq API   │
                  │  (LLaMA 3,   │
                  │  ~200ms p50) │
                  └──────────────┘
```

**Key design principle:** The system has two parallel decision engines — the LLM and the rules engine. The LLM provides context-aware recommendations; the rules engine provides guaranteed operational output. They don't compete — the rules engine only activates when the LLM is unavailable.

---

## Features

- **Real-time Command Dashboard** — Live zone status and crowd density on a dynamic SVG stadium map with risk-based color coding (green → amber → red)
- **AI Operational Recommendations** — Groq (LLaMA 3) processes the full operational state and returns structured JSON recommendations for operator action
- **Deterministic Fallback Engine** — Rules-based system activates automatically if AI inference fails — the system never goes dark during operations
- **Scenario Simulation Engine** — Backend endpoints to trigger realistic events (congestion, weather, network failures) for training and demo purposes
- **Production-Grade UI** — Dark mode command-center interface built with React 18 + TypeScript + TailwindCSS 3

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite | Type safety, fast dev loop |
| UI | TailwindCSS 3 + custom SVG | Dynamic risk-zone coloring on stadium map |
| Backend | FastAPI + Pydantic + Uvicorn | Async Python, automatic schema validation on LLM output |
| AI Inference | Groq API (LLaMA 3) | ~200ms p50 latency — fast enough for real-time ops |
| State | In-memory singleton | Hackathon simplicity; architecture supports Redis/Firestore swap |
| Deployment | Stateless — Cloud Run ready | No sticky sessions required |

---

## Engineering Decisions

**Why polling instead of WebSockets?**  
In a hackathon demo environment with unpredictable network conditions, WebSocket connections create fragile demos. A 4-second polling interval gives near-real-time feedback while tolerating network blips. In production, this would migrate to Server-Sent Events or WebSockets.

**Why a fallback rules engine alongside the LLM?**  
An AI-only system fails silently. Stadium operations can't tolerate a black box — if the AI is unavailable, operators still need actionable guidance. The rules engine ensures graceful degradation rather than total failure. During the final demo, the AI inference hiccupped once. The fallback activated. Nobody noticed.

**Why Groq + LLaMA 3 instead of OpenAI?**  
Groq's inference latency (~200ms for LLaMA 3 70B) is significantly faster than GPT-4 at equivalent load. For a real-time operational dashboard, recommendation latency matters — operators can't wait 3 seconds for a response.

**Why structured JSON output from the LLM via Pydantic?**  
Prompting the LLM to return structured JSON that maps directly to UI components removes a parsing layer and makes AI output type-safe via Pydantic models. If the LLM returns malformed JSON, Pydantic validation fails fast — triggering the fallback engine rather than crashing silently.

---

## Getting Started

### Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Set GROQ_API_KEY in .env

uvicorn app.main:app --reload --port 8000
```

API docs: `http://localhost:8000/docs`

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Dashboard: `http://localhost:5173`

---

## Project Context

Built at the **Google Agentic Premier League (Multicity)** — a Google-organized national hackathon across multiple Indian cities focused on building real agentic AI systems. StadiumOPS reached **Top 15** out of participants across all city qualifiers.

The hackathon theme: build an AI agent that solves a genuine operational problem in real time. Stadium operations were chosen for their scale, real stakes (crowd safety), and absence of any good existing tooling.

---

## Post-Hackathon Roadmap

- [ ] Swap in-memory state for Redis (enable horizontal scaling)
- [ ] Replace polling with Server-Sent Events
- [ ] Deploy backend to Google Cloud Run
- [ ] Add historical incident logging to BigQuery
- [ ] Multi-stadium support with tenant isolation

---

## Author

**Kiruthick B** — [GitHub](https://github.com/Kiruthick7) · [LinkedIn](https://linkedin.com/in/kiruthick)
