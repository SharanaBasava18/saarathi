from __future__ import annotations

import random
import uuid
from datetime import datetime, timedelta

from app.models import AssistanceRequestInput, CitizenRequest, CSCOperator

# ── In-memory stores ──────────────────────────────────────────────

operators: list[CSCOperator] = [
    CSCOperator(
        operator_id="op-1",
        name="Ravi Kumar",
        phone="9999999991",
        password="admin123",
        district="Belagavi",
    ),
    CSCOperator(
        operator_id="op-2",
        name="Sunita Sharma",
        phone="9999999992",
        password="admin123",
        district="Dharwad",
    ),
]

# ── Pre-seed demo data ─────────────────────────────────────────────

citizen_requests: list[CitizenRequest] = [
    CitizenRequest(
        request_id=str(uuid.uuid4()),
        name="Ramesh Patil",
        phone="9876543210",
        village="Gokak",
        district="Belagavi",
        occupation="Farmer",
        recommended_schemes_count=3,
        assigned_operator_id="op-1",
        status="Pending"
    ),
    CitizenRequest(
        request_id=str(uuid.uuid4()),
        name="Kavita Desai",
        phone="8765432109",
        village="Nipani",
        district="Belagavi",
        occupation="Homemaker",
        recommended_schemes_count=2,
        assigned_operator_id="op-1",
        status="Pending"
    ),
    CitizenRequest(
        request_id=str(uuid.uuid4()),
        name="Rahul Joshi",
        phone="7654321098",
        village="Hubballi",
        district="Dharwad",
        occupation="Student",
        recommended_schemes_count=4,
        assigned_operator_id="op-2",
        status="Pending"
    )
]


# ── Helper functions ──────────────────────────────────────────────


def assign_operator(citizen_district: str) -> str:
    """Return matching operator_id by district, or a random one."""
    target = citizen_district.strip().lower()
    for op in operators:
        if op.district.strip().lower() == target:
            return op.operator_id
    return random.choice(operators).operator_id


def get_operator_by_id(operator_id: str) -> CSCOperator | None:
    for op in operators:
        if op.operator_id == operator_id:
            return op
    return None


def create_request(data: AssistanceRequestInput) -> dict:
    """Create a citizen request, assign an operator, and return details."""
    request_id = str(uuid.uuid4())
    operator_id = assign_operator(data.district)

    request = CitizenRequest(
        request_id=request_id,
        name=data.name,
        phone=data.phone,
        village=data.village,
        district=data.district,
        occupation=data.occupation,
        recommended_schemes_count=data.recommended_schemes_count,
        assigned_operator_id=operator_id,
    )
    citizen_requests.append(request)

    operator = get_operator_by_id(operator_id)
    return {
        "status": "success",
        "message": "CSC assistance request created",
        "request": request.model_dump(),
        "assigned_operator": (
            operator.model_dump(exclude={"password"}) if operator else None
        ),
    }


def authenticate_operator(phone: str, password: str) -> CSCOperator | None:
    """Return operator if credentials match, else None."""
    for op in operators:
        if op.phone == phone and op.password == password:
            return op
    return None


def get_requests_for_operator(operator_id: str) -> list[dict]:
    """Return all citizen requests assigned to a given operator."""
    return [
        r.model_dump()
        for r in citizen_requests
        if r.assigned_operator_id == operator_id
    ]


def schedule_request(
    request_id: str,
    schedule_type: str,
    custom_time: str | None = None,
) -> dict | None:
    """Schedule appointment — 'Auto' = tomorrow 11 AM, 'Manual' = custom_time."""
    for r in citizen_requests:
        if r.request_id == request_id:
            r.schedule_type = schedule_type
            if schedule_type == "Auto":
                tomorrow = datetime.now() + timedelta(days=1)
                slot = tomorrow.replace(hour=11, minute=0, second=0, microsecond=0)
                r.appointment_time = slot.strftime("%Y-%m-%d %H:%M")
            elif schedule_type == "Manual" and custom_time:
                r.appointment_time = custom_time
            r.status = "Scheduled"
            return r.model_dump()
    return None
