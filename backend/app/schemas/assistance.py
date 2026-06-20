from typing import Optional

from pydantic import BaseModel


class AssistanceRequestInput(BaseModel):
    name: str
    phone: str
    village: str
    district: str
    occupation: Optional[str] = "Not Specified"
    recommended_schemes_count: Optional[int] = 0


class CitizenRequest(BaseModel):
    request_id: str
    name: str
    phone: str
    village: str
    district: str
    occupation: str
    recommended_schemes_count: int
    assigned_operator_id: str
    status: str = "Pending"
    schedule_type: str | None = None
    appointment_time: str | None = None


class ScheduleInput(BaseModel):
    request_id: str
    schedule_type: str
    custom_time: str | None = None
