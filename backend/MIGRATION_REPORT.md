# Migration Report

## Current architecture

The repository already uses FastAPI for the backend entrypoint. The current application is concentrated in `backend/app/main.py`, which defines the API routes directly and calls logic in `backend/modules/*`.

The request/recommendation flow is mostly stateless. Citizen assistance and CSC operator flows use in-memory lists in `backend/modules/csc_manager.py`, seeded with demo operators and requests. There is no active ORM or database session in the current runtime path.

Auth is simple phone/password verification against the in-memory operator list. There is no JWT, session, or OAuth issuance today.

Environment configuration is minimal. `backend/requirements.txt` only listed FastAPI runtime dependencies and ML packages, and there was no `.env.example` or centralized settings object.

## Target FastAPI architecture

The target shape is a layered FastAPI package:

- `app/main.py` composes the application and middleware.
- `app/api/routes/` contains route modules grouped by domain.
- `app/services/` owns business logic and legacy adapter calls.
- `app/schemas/` defines request and response contracts.
- `app/models/` contains compatibility exports and SQLAlchemy ORM models.
- `app/db/` holds engine, session, and base metadata.
- `app/core/config.py` centralizes runtime settings with `pydantic-settings`.
- `migrations/` contains Alembic scaffolding and a baseline schema.

The first migration step keeps the existing API contract intact by routing through services that still call the legacy implementation. That makes the backend ready for a DB-backed strangler path without changing the frontend contract.

## Route-by-route migration map

| Old route | New FastAPI file/function |
| --- | --- |
| `GET /health` | `app/api/routes/health.py:health` and `app/main.py` compatibility wiring |
| `GET /api/health` | `app/api/routes/health.py:health` |
| `POST /recommend` | `app/api/routes/recommendations.py:recommend_schemes` -> `app/services/recommendation_service.py:RecommendationService.build_recommendation_response` |
| `POST /request-assistance` | `app/api/routes/assistance.py:request_assistance` -> `app/services/assistance_service.py:AssistanceService.create_assistance_request` |
| `POST /operator/login` | `app/api/routes/operator.py:operator_login` -> `app/services/auth_service.py:AuthService.login_operator` |
| `GET /operator/requests/{operator_id}` | `app/api/routes/operator.py:operator_requests` -> `app/services/assistance_service.py:AssistanceService.list_operator_requests` |
| `POST /operator/schedule` | `app/api/routes/operator.py:operator_schedule` -> `app/services/assistance_service.py:AssistanceService.schedule_csc_request` |

## Risks and compatibility notes

- The current CSC data is still in-memory, so multiple workers or restarts will not share state until the services are switched to the new database layer.
- The new ORM and Alembic scaffold are additive. They should not be treated as live persistence until route handlers are pointed at them.
- `recommend` depends on `sentence-transformers`, `torch`, `langdetect`, and `deep-translator`; local setup can be heavy and may require network/model downloads on first run.
- The current auth flow does not issue a token. Preserving compatibility means keeping the login response shape and credential check behavior unchanged until a token strategy is explicitly introduced.
- The recommended migration path is to move one route at a time from the legacy modules into a DB-backed service, keeping the same input/output schemas until frontend parity is verified.
