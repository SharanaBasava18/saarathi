from app.models import AssistanceRequestInput, ScheduleInput
from modules.csc_manager import create_request, get_requests_for_operator, schedule_request


class AssistanceService:
    @staticmethod
    def create_assistance_request(payload: AssistanceRequestInput) -> dict:
        return create_request(payload)

    @staticmethod
    def list_operator_requests(operator_id: str) -> list[dict]:
        return get_requests_for_operator(operator_id)

    @staticmethod
    def schedule_csc_request(payload: ScheduleInput) -> dict | None:
        return schedule_request(
            request_id=payload.request_id,
            schedule_type=payload.schedule_type,
            custom_time=payload.custom_time,
        )
