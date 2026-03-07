# SAARTHI

### Smart Accessible Assistance for Real-Time Help & Inclusion

AI-powered assistant that helps citizens discover **government welfare schemes they are eligible for** using natural language.

---

## Problem

India runs **700+ welfare schemes** across healthcare, housing, agriculture, education, pensions, and employment.

However, millions of eligible citizens never receive benefits because:

* Information is fragmented across portals
* Eligibility rules are complex
* Citizens lack guidance to navigate schemes
* Language and digital literacy barriers exist

As a result, **billions of rupees in welfare benefits remain unclaimed every year**.

---

## Solution

**SAARTHI** is an AI-powered welfare assistant that allows citizens to simply describe their situation in natural language.

Example:

```
"I am a small farmer with low income"
```

SAARTHI then:

1. Extracts the citizen’s profile
2. Matches it against government schemes
3. Calculates eligibility scores
4. Estimates potential benefits
5. Provides direct application links

All through a simple **chat interface**.

---

## Key Features

### AI Citizen Profile Detection

SAARTHI extracts structured information from natural language.

Example:

User input:

```
I am a 28 year old farmer from Maharashtra with low income
```

Detected profile:

```
Occupation: Farmer
Age: 28
Income: Low
State: Maharashtra
```

---

### Intelligent Scheme Recommendations

SAARTHI ranks relevant schemes using:

* semantic similarity
* eligibility rules
* AI match scoring

Example output:

```
PM-Kisan — Eligibility Match: 92%
Crop Insurance — 87%
Soil Health Card — 84%
```

---

### Potential Benefits Summary

Users instantly see what support they may receive.

Example:

```
Total Monetary Benefits: ₹6000+
Major Support Types:
• Income support
• Crop insurance
• Agricultural advisory
```

---

### Actionable Application Guidance

Each scheme includes a direct link to apply.

```
How to Apply
Apply on MyScheme Portal
```

---

## Architecture

```
User Chat Interface
        ↓
Profile Extraction
        ↓
Semantic Matching (Embeddings)
        ↓
Eligibility Rules Engine
        ↓
Match Score Calculation
        ↓
Benefits Summary Generator
        ↓
Top Scheme Recommendations
        ↓
Apply Links
```

---

## Tech Stack

Frontend

* Next.js
* TypeScript
* TailwindCSS

Backend

* FastAPI
* Python

AI Layer

* Sentence Transformers
* Semantic Embeddings
* Rule-based Eligibility Engine

Dataset

Government welfare schemes inspired by:

https://www.myscheme.gov.in/

---

## Example Interaction

User:

```
I am a widow living in a rural area with low income
```

SAARTHI:

```
Detected Citizen Profile
Occupation: Homemaker
State: Rural Region
Income: Low

Potential Benefits
Pension Support
Housing Assistance
Food Security

Recommended Schemes

Widow Pension — Match 94%
PM Awas Yojana — 88%
National Food Security Scheme — 85%
```

---

## Running Locally

Backend

```
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Frontend

```
cd frontend
npm install
npm run dev
```

Open:

```
http://localhost:3000
```

---

## Impact

SAARTHI can help:

* Citizens discover welfare benefits they deserve
* Reduce dependence on middlemen
* Improve government scheme awareness
* Strengthen last-mile delivery of welfare

---

## Future Enhancements

* Multilingual voice interaction
* Integration with DigiLocker
* WhatsApp-based access
* Offline IVR support for rural users
* Personalized welfare tracking dashboard

---

## Project Vision

SAARTHI aims to become an **AI welfare navigator for every citizen**, ensuring that government support reaches the people who need it most.

---

## Authors

Developed as a GovTech AI project for hackathons and social impact innovation.
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000