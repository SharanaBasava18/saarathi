import re
from typing import Any

import numpy as np
from sentence_transformers import SentenceTransformer

from .scheme_engine import evaluate_eligibility


DEFAULT_APPLY_LINK = "https://www.myscheme.gov.in/"


class SchemeRecommender:
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2") -> None:
        self.model = SentenceTransformer(model_name)

    def _scheme_text(self, scheme: dict[str, Any]) -> str:
        tags = " ".join(scheme.get("tags", []))
        return f"{scheme.get('name', '')}. {scheme.get('description', '')}. {tags}"

    def _infer_support_types(self, scheme: dict[str, Any]) -> list[str]:
        text = self._scheme_text(scheme).lower()
        support_types: list[str] = []

        if any(token in text for token in ["education", "student", "scholarship", "school", "college"]):
            support_types.append("education")
        if any(token in text for token in ["employment", "job", "livelihood", "self employed", "skill training", "skill"]):
            support_types.append("employment")
        if any(token in text for token in ["agri", "agriculture", "farmer", "crop", "kisan"]):
            support_types.append("agriculture")

        if any(token in text for token in ["health", "insurance", "maternal", "hospital"]):
            support_types.append("healthcare")
        if any(token in text for token in ["housing", "home", "awas", "shelter"]):
            support_types.append("housing")
        if any(token in text for token in ["pension", "retirement", "old age"]):
            support_types.append("pension")
        if any(token in text for token in ["income support", "cash", "benefit", "dbt", "subsidy"]):
            support_types.append("income support")

        return support_types

    @staticmethod
    def _extract_monetary_benefit(scheme: dict[str, Any]) -> float | None:
        for key in ["benefit_amount", "benefit_amount_inr"]:
            value = scheme.get(key)
            if isinstance(value, (int, float)):
                return float(value)

        description = scheme.get("description", "")
        match = re.search(r"(?:inr|rs\.?|rupees)\s*([\d,]+)", description, flags=re.IGNORECASE)
        if not match:
            match = re.search(r"([\d,]+)\s*(?:inr|rs\.?|rupees)", description, flags=re.IGNORECASE)

        if match:
            value = match.group(1).replace(",", "")
            if value.isdigit():
                return float(value)

        return None

    @staticmethod
    def _extract_estimated_benefit(scheme: dict[str, Any]) -> int | None:
        value = scheme.get("estimated_benefit")
        if isinstance(value, (int, float)):
            return int(value)
        return None

    @staticmethod
    def _cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
        denominator = (np.linalg.norm(a) * np.linalg.norm(b))
        if denominator == 0:
            return 0.0
        return float(np.dot(a, b) / denominator)

    def recommend(
        self,
        user_input: str,
        profile: dict[str, Any],
        schemes: list[dict[str, Any]],
        top_k: int | None = 3,
    ) -> list[dict[str, Any]]:
        user_embedding = self.model.encode(user_input)

        scored: list[dict[str, Any]] = []
        for scheme in schemes:
            scheme_embedding = self.model.encode(self._scheme_text(scheme))
            semantic_raw = self._cosine_similarity(np.array(user_embedding), np.array(scheme_embedding))
            semantic_score = max(0.0, min(1.0, (semantic_raw + 1.0) / 2.0))
            eligibility_score, reasons = evaluate_eligibility(profile, scheme)

            if eligibility_score <= 0:
                continue

            combined_score = (0.65 * semantic_score) + (0.35 * eligibility_score)
            match_score = round(combined_score * 100, 1)
            support_types = self._infer_support_types(scheme)
            estimated_benefit = self._extract_estimated_benefit(scheme)
            monetary_benefit = (
                float(estimated_benefit) if estimated_benefit is not None else self._extract_monetary_benefit(scheme)
            )
            scored.append(
                {
                    "scheme_id": scheme["id"],
                    "name": scheme["name"],
                    "description": scheme.get("description", ""),
                    "apply_link": scheme.get("apply_link", DEFAULT_APPLY_LINK),
                    "documents_required": scheme.get("documents_required", []),
                    "application_steps": scheme.get("application_steps", []),
                    "estimated_benefit": estimated_benefit,
                    "match_score": match_score,
                    "support_types": support_types,
                    "scheme_categories": support_types,
                    "monetary_benefit": monetary_benefit,
                    "rationale": " ".join(reasons[:3]),
                    "eligibility_reasons": reasons[:3],
                    "welfare_gap": eligibility_score >= 0.8,
                }
            )

        scored.sort(key=lambda item: item["match_score"], reverse=True)
        if top_k is None:
            return scored
        return scored[:top_k]

    @staticmethod
    def eligibility_improvements(profile: dict[str, Any]) -> list[str]:
        suggestions_by_field = {
            "income": "Add your annual income",
            "state": "Specify your state of residence",
            "category": "Mention caste category (SC/ST/OBC/EWS)",
            "age": "Provide your age",
            "occupation": "Share your occupation",
        }

        missing_fields = profile.get("missing_fields", [])
        return [suggestions_by_field[field] for field in missing_fields if field in suggestions_by_field]
