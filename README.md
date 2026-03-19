# SAARTHI

Smart Accessible Assistance for Real-Time Help and Inclusion.

## Demo

Video demo: https://youtu.be/EuH1SeW8tCM

## Problem

Many eligible citizens miss welfare benefits because scheme information is scattered, eligibility rules are hard to understand, and guidance is limited.

## Solution

SAARTHI is an AI-assisted platform that takes natural language input, extracts user profile signals, and recommends relevant welfare schemes with actionable next steps.

## Key Features

- Natural language input for citizen needs
- Profile extraction from user input
- Scheme recommendation with eligibility-aware ranking
- Document detection hints for required paperwork
- Eligibility improvement suggestions
- Operator login and request management flows
- Assistance request and scheduling support

## Architecture / Flow

User input -> Profile extraction -> Document detection -> Scheme matching and scoring -> Recommendations -> Assistance request and operator follow-up

## Tech Stack

- Frontend: Next.js 14, TypeScript, Tailwind CSS
- Backend: FastAPI, Python
- AI: Profile extraction, document detection, recommendation and eligibility logic
- Dataset: backend/data/schemes.json

## Repo Structure

- frontend/: Next.js client application
- backend/: FastAPI application and service modules
- backend/data/schemes.json: Scheme dataset used by the recommendation pipeline

## Run Locally

Backend:

```bash
cd backend
python -m venv .venv
# Activate venv (Windows PowerShell)
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

URLs:

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- FastAPI Docs: http://localhost:8000/docs

## Environment Variables

Use frontend/.env.example as the reference file.

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## API

GET /health

```json
{ "status": "ok" }
```

POST /recommend request

```json
{ "user_input": "I am a farmer from Karnataka with low income" }
```

POST /recommend trimmed response

```json
{
  "detected_language": "en",
  "detected_documents": ["Aadhaar"],
  "extracted_profile": {
    "age": 30,
    "occupation": "farmer",
    "education": null,
    "state": "Karnataka",
    "income": "low",
    "category": null
  },
  "recommendations": [
    {
      "scheme_name": "PM-KISAN",
      "score": 0.91
    }
  ],
  "eligibility_improvements": ["Provide income certificate"]
}
```

Additional endpoints:

- POST /request-assistance
- POST /operator/login
- GET /operator/requests/{operator_id}
- POST /operator/schedule

## Dataset

The recommendation engine reads schemes from backend/data/schemes.json. To add a new scheme, append a new JSON object following the same structure as existing entries and include core details like scheme name, eligibility conditions, and benefits.

## Team

- Team Lead: Sharanabasava
- Teammates: Shreyas S, Shivraj J
- College: Ballari Institute of Technology and Management