from fastapi import APIRouter, HTTPException

from app.models import OperatorLoginPayload, ScheduleInput
from app.services.auth_service import AuthService
from app.services.assistance_service import AssistanceService

router = APIRouter()
auth_service = AuthService()
assistance_service = AssistanceService()


@router.post("/operator/login")
def operator_login(payload: OperatorLoginPayload):
    operator = auth_service.login_operator(payload)
    if operator is None:
        raise HTTPException(status_code=401, detail="Invalid operator credentials")
    return operator.model_dump(exclude={"password"})


@router.get("/operator/requests/{operator_id}")
def operator_requests(operator_id: str):
    return assistance_service.list_operator_requests(operator_id)


@router.post("/operator/schedule")
def operator_schedule(payload: ScheduleInput):
    updated = assistance_service.schedule_csc_request(payload)
    if updated is None:
        raise HTTPException(status_code=404, detail="Request not found")
    return updated
