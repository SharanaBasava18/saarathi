from fastapi import APIRouter, HTTPException

from app.models import RecommendationRequest, RecommendationResponse
from app.services.recommendation_service import RecommendationService

router = APIRouter()
service = RecommendationService()


@router.post("/recommend", response_model=RecommendationResponse)
def recommend_schemes(payload: RecommendationRequest) -> RecommendationResponse:
    try:
        return service.build_recommendation_response(payload)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail="schemes.json not found") from exc
