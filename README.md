# System Design Interview Evaluator

> Describe your system design solution and get structured feedback the way a senior interviewer would deliver it — covering scalability, trade-offs, bottlenecks, and what you missed.



---

## Overview

System design interviews are uniquely hard to practice because there's no automated judge — you need an experienced engineer to evaluate your design and push back on your assumptions. This tool simulates that.

Describe your design for any system (URL shortener, ride-sharing backend, distributed cache, etc.) and the AI evaluates it across the dimensions real interviewers care about: whether you asked clarifying questions, how you handle scale, what your bottlenecks are, and what you completely missed.

---

## Features

- **Problem prompt library** — 20+ classic system design prompts to practice with
- **Custom problem input** — bring any system design question
- **Structured evaluation** — scored across 5 interviewer dimensions
- **Bottleneck identification** — AI finds the weakest points in your design
- **What you missed** — explicit list of components or considerations you didn't address
- **Follow-up questions** — the probing questions an interviewer would ask next
- **Suggested improvements** — specific, technical suggestions to strengthen the design

---

## Evaluation Dimensions

| Dimension | What's Assessed |
|-----------|----------------|
| Requirements Gathering | Did you clarify scope, scale, and constraints? |
| High-Level Design | Does the architecture make sense end-to-end? |
| Scalability | Can this handle 10x, 100x growth? |
| Trade-off Awareness | Did you acknowledge CAP theorem, consistency vs availability? |
| Deep Dive Quality | How well did you explain the critical components? |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | FastAPI (Python) |
| AI | Groq API — Llama 3.3 70B |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Architecture

```
User selects/enters problem + submits design description
        ↓
Frontend → POST /evaluate (FastAPI)
        ↓
Groq LLM → evaluate against interviewer rubric
        ↓
Structured feedback JSON → Frontend renders evaluation panel
```

---

## Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Environment Variables

**Backend `.env`:**
```
GROQ_API_KEY=your_groq_api_key
```

**Frontend `.env`:**
```
VITE_API_URL=http://localhost:8000
```

---

## API

### `POST /evaluate`

**Request:**
```json
{
  "problem": "Design a URL shortener like bit.ly",
  "solution": "I would use a REST API with a hash function to generate short codes, store mappings in a SQL database, and add a CDN for reads..."
}
```

**Response:**
```json
{
  "overall_score": 7.2,
  "scores": {
    "requirements_gathering": 6,
    "high_level_design": 8,
    "scalability": 7,
    "tradeoff_awareness": 6,
    "deep_dive_quality": 8
  },
  "strengths": ["Clear API design", "Good read optimization with CDN"],
  "bottlenecks": ["Single SQL DB becomes write bottleneck at scale"],
  "missed_components": ["Cache layer for hot URLs", "Analytics pipeline", "Rate limiting"],
  "follow_up_questions": ["How would you handle 100M URLs/day?", "How do you prevent hash collisions?"],
  "improvements": ["Add Redis cache for top 20% of URLs", "Consider NoSQL for the mapping store"]
}
```

---

## Sample Problems Included

- Design a URL Shortener
- Design Twitter's Feed
- Design a Distributed Cache
- Design a Ride-Sharing Backend
- Design WhatsApp
- Design a Rate Limiter
- Design a Notification System
- Design YouTube

---

## Project Structure

```
system-design-evaluator/
├── backend/
│   ├── main.py
│   ├── routers/
│   │   └── evaluate.py
│   ├── services/
│   │   └── ai.py
│   └── requirements.txt
└── frontend/
    └── src/
        ├── App.jsx
        └── components/
            ├── ProblemSelector.jsx
            ├── SolutionInput.jsx
            ├── EvaluationResult.jsx
            └── ScoreDimension.jsx
```

---

