from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any, Literal
from uuid import UUID, uuid4

from pydantic import BaseModel, Field

from .operator_system import get_operator_by_id, get_operator_by_district, get_random_operator

RequestStatus = Literal["pending", "assigned", "scheduled", "completed"]


class CitizenRequest(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    citizen_name: str
    phone_number: str
    state: str
    district: str = ""
    village: str = ""
    detected_profile: dict[str, Any] = Field(default_factory=dict)
    recommended_schemes: list[dict[str, Any]] = Field(default_factory=list)
    status: RequestStatus = "pending"
    assigned_operator_id: str | None = None
    assigned_csc_operator: str | None = None
    scheduled_time: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


REQUESTS_STORE: list[CitizenRequest] = []


def _select_operator_for_request(district: str) -> dict[str, str] | None:
    operator = get_operator_by_district(district)
    if operator is not None:
        return operator
    return get_random_operator()


def _to_json(data: CitizenRequest) -> dict[str, Any]:
    return data.model_dump(mode="json")


def create_request(data: dict[str, Any]) -> dict[str, Any]:
    request = CitizenRequest(**data)
    assigned_operator = _select_operator_for_request(request.district)
    if assigned_operator is not None:
        request.assigned_operator_id = assigned_operator.get("id")
        request.assigned_csc_operator = assigned_operator.get("name")
        request.status = "assigned"
    REQUESTS_STORE.append(request)
    return _to_json(request)


def get_all_requests() -> list[dict[str, Any]]:
    return [_to_json(item) for item in REQUESTS_STORE]


def get_requests_for_operator(operator_id: str) -> list[dict[str, Any]]:
    return [_to_json(item) for item in REQUESTS_STORE if item.assigned_operator_id == operator_id]


def assign_operator(request_id: str, operator_name: str) -> dict[str, Any] | None:
    for item in REQUESTS_STORE:
        if str(item.id) == request_id:
            item.assigned_csc_operator = operator_name
            if item.status == "pending":
                item.status = "assigned"
            return _to_json(item)
    return None


def assign_operator_by_id(request_id: str, operator_id: str) -> dict[str, Any] | None:
    operator = get_operator_by_id(operator_id)
    if operator is None:
        return None

    for item in REQUESTS_STORE:
        if str(item.id) == request_id:
            item.assigned_operator_id = operator_id
            item.assigned_csc_operator = operator.get("name")
            if item.status == "pending":
                item.status = "assigned"
            return _to_json(item)
    return None


def schedule_request(request_id: str, operator_name: str, scheduled_time: str) -> dict[str, Any] | None:
    assigned = assign_operator(request_id=request_id, operator_name=operator_name)
    if assigned is None:
        return None

    for item in REQUESTS_STORE:
        if str(item.id) == request_id:
            item.scheduled_time = scheduled_time
            item.status = "scheduled"
            return _to_json(item)

    return None


def auto_schedule(request_id: str) -> dict[str, Any] | None:
    for item in REQUESTS_STORE:
        if str(item.id) == request_id:
            tomorrow = datetime.utcnow() + timedelta(days=1)
            slot = tomorrow.replace(hour=11, minute=0, second=0, microsecond=0)
            item.scheduled_time = slot.isoformat()
            item.status = "scheduled"
            return {
                "message": "Appointment scheduled with CSC operator",
                "request": _to_json(item),
            }
    return None


def manual_schedule(request_id: str, scheduled_time: str) -> dict[str, Any] | None:
    for item in REQUESTS_STORE:
        if str(item.id) == request_id:
            item.scheduled_time = scheduled_time
            item.status = "scheduled"
            return {
                "message": "Appointment scheduled with CSC operator",
                "request": _to_json(item),
            }
    return None


def _seed_demo_requests() -> None:
    if REQUESTS_STORE:
        return

    demo_payloads = [
        {
            "citizen_name": "Ramesh",
            "phone_number": "9000000001",
            "state": "Karnataka",
            "district": "Belagavi",
            "village": "Kakati",
            "detected_profile": {"occupation": "farmer"},
            "recommended_schemes": [
                {"scheme_id": "demo-1", "name": "Farmer Subsidy"},
                {"scheme_id": "demo-2", "name": "Crop Insurance"},
                {"scheme_id": "demo-3", "name": "Irrigation Support"},
            ],
        },
        {
            "citizen_name": "Lakshmi",
            "phone_number": "9000000002",
            "state": "Karnataka",
            "district": "Dharwad",
            "village": "Hubballi",
            "detected_profile": {"occupation": "widow"},
            "recommended_schemes": [
                {"scheme_id": "demo-4", "name": "Widow Pension"},
                {"scheme_id": "demo-5", "name": "Food Security"},
            ],
        },
        {
            "citizen_name": "Rahul",
            "phone_number": "9000000003",
            "state": "Maharashtra",
            "district": "Kolhapur",
            "village": "Shiroli",
            "detected_profile": {"occupation": "student"},
            "recommended_schemes": [
                {"scheme_id": "demo-6", "name": "Student Scholarship"},
                {"scheme_id": "demo-7", "name": "Skill Training"},
            ],
        },
    ]

    for payload in demo_payloads:
        create_request(payload)


_seed_demo_requests()
