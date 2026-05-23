# Architecture: Stadium OPS

## System Design Philosophy
The system is built on the principles of **resilience, simplicity, and operational clarity**. Rather than employing complex WebSockets or heavyweight agent frameworks, the platform uses a highly tuned polling mechanism, lightweight stateless services, and structured LLM inference to achieve operational intelligence.

## Component Overview

### 1. Frontend: Command Center Dashboard
- **Stack**: React 18, TypeScript, Vite, Tailwind CSS 3.
- **State Management**: React hooks with a centralized API service. The `useStatus` hook manages connection health and polls the backend every 4 seconds.
- **Design**: Dark mode, command-center aesthetic, utilizing a custom scalable SVG for the stadium map with dynamic risk-based coloring.

### 2. Backend: Operational Intelligence API
- **Stack**: FastAPI, Pydantic, Uvicorn.
- **State**: Currently an in-memory singleton (`app.state.OperationalState`) for hackathon simplicity and demo determinism. Designed to be easily swapped with Redis/Firestore.
- **Simulation Engine**: (`app.simulation`) Exposes endpoints to trigger real-world scenarios (congestion, weather, network failures). This engine mutates the shared state in realistic ways.

### 3. AI & Rules Engine
- **AI Wrapper**: (`app.ai`) Uses Groq API with LLaMA 3 for fast, structured JSON inference. The prompt is injected with the real-time operational state (zones, gates, weather, alerts).
- **Rule Engine Fallback**: (`app.rules`) A deterministic fallback engine that activates automatically if the AI service fails or times out. It guarantees the operator always receives actionable intelligence.

## Deployment Model (Google Cloud)
- **Backend**: Containerized with a slim Docker image, deployed to Google Cloud Run. Scale-to-zero enabled for cost efficiency.
- **Frontend**: Built as static assets (`npm run build`) and deployed to Firebase Hosting.
- **Benefits**: Extremely low operational overhead, virtually free when idle, infinite scalability during high traffic.

                ┌──────────────────────────┐
                │   Stadium Operators      │
                │ Security / Volunteers    │
                └────────────┬─────────────┘
                             │
                             ▼
                ┌──────────────────────────-┐
                │ React Operations Dashboard│
                │  (Firebase Hosting)       │
                └────────────┬─────────────-┘
                             │
                     Poll Every 2–3 sec
                             │
                             ▼
                ┌──────────────────────────┐
                │ FastAPI Backend          │
                │  (Google Cloud Run)      │
                └────────────┬─────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────-┐
│ Operational    │  │ Simulation API │  │ Groq AI Engine  │
│ State Engine   │  │ Trigger Engine │  │ Recommendations │
└────────────────┘  └────────────────┘  └────────────────-┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                             ▼
                ┌──────────────────────────┐
                │ Realtime Dashboard State │
                │ Alerts / Routing / Risks │
                └──────────────────────────┘
