from app.schemas.assistance import AssistanceRequestInput, CitizenRequest, ScheduleInput
from app.schemas.operator import CSCOperator, OperatorLoginPayload
from app.schemas.recommendation import (
    BenefitsSummary,
    DetectedCitizenProfile,
    RecommendationRequest,
    RecommendationResponse,
    SchemeRecommendation,
)
from app.models.orm import CitizenRequestORM, CSCOperatorORM
