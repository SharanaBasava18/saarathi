# Backend

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

## Production Run

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

If you deploy the frontend separately, set `CORS_ORIGINS` in `.env` to the exact frontend URL(s) for that environment.

## Environment

Copy [`.env.example`](.env.example) to `.env` and adjust values as needed.

```env
APP_NAME=SAARTHI API
APP_VERSION=0.1.0
API_PREFIX=/api
CORS_ORIGINS=["http://localhost:3000"]
DATABASE_URL=sqlite:///./saarathi.db
ENVIRONMENT=development
```

Add model or dataset path settings here later if you externalize them.

## Endpoints

- `GET /health`
- `GET /api/health`
- `POST /recommend`
- `POST /request-assistance`
- `POST /operator/login`
- `GET /operator/requests/{operator_id}`
- `POST /operator/schedule`

## Request Examples

`POST /recommend`

```json
{ "user_input": "I am a farmer from Karnataka with low income" }
```

`POST /operator/login`

```json
{ "phone": "9999999991", "password": "admin123" }
```

`POST /request-assistance`

```json
{
	"name": "Test Citizen",
	"phone": "9998887776",
	"village": "Gokak",
	"district": "Belagavi",
	"occupation": "Farmer",
	"recommended_schemes_count": 2
}
```

## Migration checklist

- Verify `/api/health` and `/health` return the same health payload.
- Verify `/recommend`, `/request-assistance`, and CSC operator endpoints preserve request and response shape.
- Run Alembic baseline migrations once the database-backed services are enabled.
- Keep the legacy in-memory flow in place until parity tests pass.

## Rollback notes

- The current routes still call the legacy modules, so rollback is mostly a router/config revert.
- If DB-backed logic is enabled later, keep the legacy service adapters available until the frontend has been validated against the new handlers.

## Troubleshooting

- If FastAPI fails to start, confirm the virtual environment is active and `pip install -r requirements.txt` completed successfully.
- If `/recommend` is slow on first request, the sentence-transformer model may still be loading or downloading.
- If CORS errors appear in the browser, verify `CORS_ORIGINS` includes the exact frontend origin.
