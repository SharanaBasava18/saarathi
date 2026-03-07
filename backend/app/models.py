from collections import Counter

from pydantic import BaseModel, Field, model_validator


class RecommendationRequest(BaseModel):
    user_input: str = Field(..., min_length=10, description="Natural language profile input")


class SchemeRecommendation(BaseModel):
    scheme_id: str
    name: str
    description: str
    apply_link: str
    match_score: float = Field(..., ge=0, le=100)
    support_types: list[str] = Field(default_factory=list)
    monetary_benefit: float | None = None
    rationale: str


class DetectedCitizenProfile(BaseModel):
    occupation: str | None = None
    income: int | None = None
    age: int | None = None
    state: str | None = None
    category: str | None = None


class BenefitsSummary(BaseModel):
    total_monetary_benefits: float
    major_support_types: list[str]


class RecommendationResponse(BaseModel):
    extracted_profile: DetectedCitizenProfile
    recommendations: list[SchemeRecommendation]
    benefits_summary: BenefitsSummary | None = None

    @model_validator(mode="after")
    def populate_benefits_summary(self) -> "RecommendationResponse":
        monetary_values = [
            scheme.monetary_benefit
            for scheme in self.recommendations
            if scheme.monetary_benefit is not None and scheme.monetary_benefit > 0
        ]
        total_monetary_benefits = round(sum(monetary_values), 2) if monetary_values else 0.0

        support_counter: Counter[str] = Counter()
        for scheme in self.recommendations:
            support_counter.update(scheme.support_types)

        preferred_order = ["healthcare", "housing", "pension", "income support"]
        major_support_types = [item for item in preferred_order if support_counter.get(item, 0) > 0]

        self.benefits_summary = BenefitsSummary(
            total_monetary_benefits=total_monetary_benefits,
            major_support_types=major_support_types,
        )
        return self
