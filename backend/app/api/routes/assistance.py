from fastapi import APIRouter

from app.models import AssistanceRequestInput
from app.services.assistance_service import AssistanceService

router = APIRouter()
service = AssistanceService()


@router.post("/request-assistance")
def request_assistance(payload: AssistanceRequestInput):
    return service.create_assistance_request(payload)
