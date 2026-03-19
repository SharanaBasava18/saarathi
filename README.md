# SAARTHI

Smart Accessible Assistance for Real-Time Help and Inclusion.

## Demo

Video demo: https://youtu.be/EuH1SeW8tCM

Pitch Deck (PDF): [SAARTHI_Hackathon_Pitch.pdf](./pitch/SAARTHI_Hackathon_Pitch.pdf)

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
# OR Linux/macOS
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Production (recommended for demo):

```bash
cd frontend
npm run build
npm start
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
  "detected_documents": {
    "Aadhaar Card": true,
    "Income Certificate": false
  },
  "extracted_profile": {
    "age": 30,
    "occupation": "farmer",
    "education": null,
    "state": "Karnataka",
    "income": 200000,
    "category": null
  },
  "recommendations": [
    {
      "scheme_id": "SCH001",
      "name": "PM-KISAN",
      "description": "Income support scheme for farmers",
      "apply_link": "https://pmkisan.gov.in",
      "documents_required": ["Aadhaar Card", "Bank Account"],
      "application_steps": ["Visit portal", "Enter details", "Submit"],
      "estimated_benefit": 6000,
      "match_score": 91.5,
      "support_types": ["income support", "agriculture"],
      "scheme_categories": ["agriculture", "income"],
      "monetary_benefit": 6000.0,
      "rationale": "Farmer profile matches eligibility criteria",
      "eligibility_reasons": ["Farm ownership", "Income level"],
      "welfare_gap": false
    }
  ],
  "eligibility_improvements": ["Get income certificate"],
  "benefits_summary": {
    "total_monetary_benefits": 6000.0,
    "major_support_types": ["income support", "agriculture"]
  },
  "potential_unclaimed_schemes": 0
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