# Migration Notes

- Current backend behavior is already FastAPI-based; the migration is a package-level refactor plus scaffolding for DB-backed handlers.
- The current auth flow is in-memory operator phone/password login with no issued JWT, session, or OAuth token.
- The current database layer is effectively absent; requests and operators are stored in Python lists inside `modules/csc_manager.py`.
- The new SQLAlchemy/Alembic stack is scaffolded and intentionally not wired into the existing routes yet to avoid breaking the demo behavior.
- If the legacy in-memory flow and the future DB-backed flow diverge, keep the route contract stable and swap persistence behind the services first.
