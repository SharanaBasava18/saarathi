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

## Migration checklist

- Verify `/api/health` and `/health` return the same health payload.
- Verify `/recommend`, `/request-assistance`, and CSC operator endpoints preserve request and response shape.
- Run Alembic baseline migrations once the database-backed services are enabled.
- Keep the legacy in-memory flow in place until parity tests pass.

## Rollback notes

- The current routes still call the legacy modules, so rollback is mostly a router/config revert.
- If DB-backed logic is enabled later, keep the legacy service adapters available until the frontend has been validated against the new handlers.
