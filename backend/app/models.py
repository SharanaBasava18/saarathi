from collections import Counter
from typing import Optional

from pydantic import BaseModel, Field, model_validator


class RecommendationRequest(BaseModel):
    user_input: str = Field(..., min_length=10, description="Natural language profile input")


class SchemeRecommendation(BaseModel):
    scheme_id: str
    name: str
    description: str
    apply_link: str
    documents_required: list[str] = Field(default_factory=list)
    application_steps: list[str] = Field(default_factory=list)
    estimated_benefit: int | None = None
    match_score: float = Field(..., ge=0, le=100)
    support_types: list[str] = Field(default_factory=list)
    scheme_categories: list[str] = Field(default_factory=list)
    monetary_benefit: float | None = None
    rationale: str
    eligibility_reasons: list[str] = Field(default_factory=list)
    welfare_gap: bool | None = False


class DetectedCitizenProfile(BaseModel):
    age: int | None = None
    occupation: str | None = None
    education: str | None = None
    state: str | None = None
    income: int | None = None
    category: str | None = None


class BenefitsSummary(BaseModel):
    total_monetary_benefits: float
    major_support_types: list[str]


class RecommendationResponse(BaseModel):
    detected_language: str = "en"
    detected_documents: dict[str, bool] = Field(default_factory=dict)
    extracted_profile: DetectedCitizenProfile
    recommendations: list[SchemeRecommendation]
    eligibility_improvements: list[str] = Field(default_factory=list)
    benefits_summary: BenefitsSummary | None = None
    potential_unclaimed_schemes: int = 0

    @model_validator(mode="after")
    def populate_benefits_summary(self) -> "RecommendationResponse":
        monetary_values: list[float] = []
        for scheme in self.recommendations:
            if scheme.estimated_benefit is not None and scheme.estimated_benefit > 0:
                monetary_values.append(float(scheme.estimated_benefit))
            elif scheme.monetary_benefit is not None and scheme.monetary_benefit > 0:
                monetary_values.append(float(scheme.monetary_benefit))

        total_monetary_benefits = round(sum(monetary_values), 2) if monetary_values else 0.0

        support_counter: Counter[str] = Counter()
        for scheme in self.recommendations:
            support_counter.update(scheme.support_types)

        preferred_order = ["education", "employment", "healthcare", "housing", "agriculture", "pension", "income support"]
        major_support_types = [item for item in preferred_order if support_counter.get(item, 0) > 0]

        self.benefits_summary = BenefitsSummary(
            total_monetary_benefits=total_monetary_benefits,
            major_support_types=major_support_types,
        )
        self.potential_unclaimed_schemes = sum(1 for scheme in self.recommendations if scheme.welfare_gap)
        return self


# ── CSC Operator Flow Models ─────────────────────────────────────


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


class CSCOperator(BaseModel):
    operator_id: str
    name: str
    phone: str
    password: str
    district: str


class ScheduleInput(BaseModel):
    request_id: str
    schedule_type: str
    custom_time: str | None = None
