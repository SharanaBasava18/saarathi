from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_aliases_return_ok() -> None:
    for path in ("/health", "/api/health"):
        response = client.get(path)
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}
