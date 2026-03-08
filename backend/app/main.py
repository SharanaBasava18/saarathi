from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.models import DetectedCitizenProfile, RecommendationRequest, RecommendationResponse, SchemeRecommendation
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
        extracted_profile=extracted_profile,
        recommendations=recommendations,
        eligibility_improvements=improvements,
    )
