from app.models import DetectedCitizenProfile, RecommendationRequest, RecommendationResponse, SchemeRecommendation
from modules.document_detector import detect_documents
from modules.profile_extractor import extract_profile
from modules.recommender import SchemeRecommender
from modules.scheme_engine import load_schemes


class RecommendationService:
    def __init__(self) -> None:
        self.recommender = SchemeRecommender()

    def build_recommendation_response(self, payload: RecommendationRequest) -> RecommendationResponse:
        schemes = load_schemes()
        profile = extract_profile(payload.user_input)
        detected_documents = detect_documents(profile)
        recommendations_raw = self.recommender.recommend(payload.user_input, profile, schemes, top_k=None)
        improvements = self.recommender.eligibility_improvements(profile)

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
