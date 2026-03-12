from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.models import (
    AssistanceRequestInput,
    DetectedCitizenProfile,
    RecommendationRequest,
    RecommendationResponse,
    ScheduleInput,
    SchemeRecommendation,
)
from modules.csc_manager import (
    authenticate_operator,
    create_request,
    get_requests_for_operator,
    schedule_request,
)
from modules.document_detector import detect_documents
from modules.profile_extractor import extract_profile
from modules.recommender import SchemeRecommender
from modules.scheme_engine import load_schemes

app = FastAPI(title="SAARTHI API", version="0.1.0")
recommender = SchemeRecommender()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class OperatorLoginPayload(BaseModel):
    phone: str = Field(..., min_length=5)
    password: str = Field(..., min_length=3)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/recommend", response_model=RecommendationResponse)
def recommend_schemes(payload: RecommendationRequest) -> RecommendationResponse:
    try:
        schemes = load_schemes()
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail="schemes.json not found") from exc

    profile = extract_profile(payload.user_input)
    detected_documents = detect_documents(profile)
    recommendations_raw = recommender.recommend(payload.user_input, profile, schemes, top_k=None)
    improvements = recommender.eligibility_improvements(profile)

    extracted_profile = DetectedCitizenProfile(
        age=profile.get("age"),
        occupation=profile.get("occupation"),
        education=profile.get("education"),
        state=profile.get("state"),
        income=profile.get("income"),
        category=profile.get("category"),
    )

    recommendations = [SchemeRecommendation(**item) for item in recommendations_raw]
    return RecommendationResponse(
        detected_language=profile.get("detected_language", "en"),
        detected_documents=detected_documents,
        extracted_profile=extracted_profile,
        recommendations=recommendations,
        eligibility_improvements=improvements,
    )


@app.post("/request-assistance")
def request_assistance(payload: AssistanceRequestInput):
    return create_request(payload)


@app.post("/operator/login")
def operator_login(payload: OperatorLoginPayload):
    operator = authenticate_operator(phone=payload.phone, password=payload.password)
    if operator is None:
        raise HTTPException(status_code=401, detail="Invalid operator credentials")
    return operator.model_dump(exclude={"password"})


@app.get("/operator/requests/{operator_id}")
def operator_requests(operator_id: str):
    return get_requests_for_operator(operator_id)


@app.post("/operator/schedule")
def operator_schedule(payload: ScheduleInput):
    updated = schedule_request(
        request_id=payload.request_id,
        schedule_type=payload.schedule_type,
        custom_time=payload.custom_time,
    )
    if updated is None:
        raise HTTPException(status_code=404, detail="Request not found")
    return updated
