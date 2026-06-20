from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_recommend_endpoint_preserves_contract_keys() -> None:
    response = client.post("/recommend", json={"user_input": "I am a farmer from Karnataka with low income"})
    assert response.status_code == 200
    payload = response.json()
    assert set(payload.keys()) >= {
        "detected_language",
        "detected_documents",
        "extracted_profile",
        "recommendations",
        "eligibility_improvements",
        "benefits_summary",
        "potential_unclaimed_schemes",
    }


def test_assistance_and_operator_flow_contracts() -> None:
    request_response = client.post(
        "/request-assistance",
        json={
            "name": "Test Citizen",
            "phone": "9998887776",
            "village": "Gokak",
            "district": "Belagavi",
            "occupation": "Farmer",
            "recommended_schemes_count": 2,
        },
    )
    assert request_response.status_code == 200
    request_payload = request_response.json()
    assert request_payload["status"] == "success"
    assert "request" in request_payload
    assert "assigned_operator" in request_payload

    login_response = client.post("/operator/login", json={"phone": "9999999991", "password": "admin123"})
    assert login_response.status_code == 200
    operator_payload = login_response.json()
    assert "password" not in operator_payload
    assert operator_payload["operator_id"] == "op-1"
