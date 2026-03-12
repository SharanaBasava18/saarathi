from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.models import DetectedCitizenProfile, RecommendationRequest, RecommendationResponse, SchemeRecommendation
from modules.assistance_system import auto_schedule, create_request, get_all_requests, get_requests_for_operator, manual_schedule, schedule_request
from modules.document_detector import detect_documents
from modules.operator_system import authenticate_operator
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


class AssistanceRequestPayload(BaseModel):
    citizen_name: str = Field(..., min_length=2)
    phone_number: str = Field(..., min_length=5)
    state: str = Field(..., min_length=2)
    district: str = ""
    village: str = ""
    detected_profile: dict = Field(default_factory=dict)
    recommended_schemes: list[dict] = Field(default_factory=list)


class ScheduleRequestPayload(BaseModel):
    request_id: str
    operator_name: str = Field(..., min_length=2)
    scheduled_time: str = Field(..., min_length=2)


class OperatorLoginPayload(BaseModel):
    phone: str = Field(..., min_length=5)
    password: str = Field(..., min_length=3)


class AutoSchedulePayload(BaseModel):
    request_id: str


class ManualSchedulePayload(BaseModel):
    request_id: str
    scheduled_time: str = Field(..., min_length=2)


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
def request_assistance(payload: AssistanceRequestPayload) -> dict:
    return create_request(payload.model_dump())


@app.post("/operator/login")
def operator_login(payload: OperatorLoginPayload) -> dict:
    operator = authenticate_operator(phone=payload.phone, password=payload.password)
    if operator is None:
        raise HTTPException(status_code=401, detail="Invalid operator credentials")

    return {
        "operator_id": operator["id"],
        "name": operator["name"],
        "district": operator["district"],
    }


@app.get("/operator/requests")
def operator_requests(operator_id: str | None = Query(default=None)) -> list[dict]:
    if operator_id:
        return get_requests_for_operator(operator_id)
    return get_all_requests()


@app.post("/operator/schedule")
def operator_schedule(payload: ScheduleRequestPayload) -> dict:
    updated = schedule_request(
        request_id=payload.request_id,
        operator_name=payload.operator_name,
        scheduled_time=payload.scheduled_time,
    )
    if updated is None:
        raise HTTPException(status_code=404, detail="Assistance request not found")
    return updated


@app.post("/operator/auto-schedule")
def operator_auto_schedule(payload: AutoSchedulePayload) -> dict:
    updated = auto_schedule(request_id=payload.request_id)
    if updated is None:
        raise HTTPException(status_code=404, detail="Assistance request not found")
    return updated


@app.post("/operator/manual-schedule")
def operator_manual_schedule(payload: ManualSchedulePayload) -> dict:
    updated = manual_schedule(request_id=payload.request_id, scheduled_time=payload.scheduled_time)
    if updated is None:
        raise HTTPException(status_code=404, detail="Assistance request not found")
    return updated
