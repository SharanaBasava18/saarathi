import re
from typing import Any


INCOME_PATTERNS = [
    r"annual\s*income\s*(?:is|:)?\s*(?:rs\.?|inr)?\s*([\d,]+)",
    r"income\s*(?:is|:)?\s*(?:rs\.?|inr)?\s*([\d,]+)",
    r"earning\s*(?:is|:)?\s*(?:rs\.?|inr)?\s*([\d,]+)",
    r"salary\s*(?:is|:)?\s*(?:rs\.?|inr)?\s*([\d,]+)",
    r"([\d,]+)\s*(?:rs\.?|inr)?\s*per\s*year",
]

AGE_PATTERNS = [
    r"(\d{1,2})\s*year[s]?\s*old",
    r"age\s*(?:is|:)?\s*(\d{1,2})",
    r"i\s*am\s*(\d{1,2})",
]


def _extract_income(text: str) -> int | None:
    for pattern in INCOME_PATTERNS:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            raw_value = match.group(1).replace(",", "")
            if raw_value.isdigit():
                return int(raw_value)
    return None


def _extract_age(text: str) -> int | None:
    for pattern in AGE_PATTERNS:
        age_match = re.search(pattern, text, flags=re.IGNORECASE)
        if age_match:
            return int(age_match.group(1))
    return None


def _extract_gender(text: str) -> str | None:
    gender_map = {
        "female": ["female", "woman", "girl", "mother", "widow"],
        "male": ["male", "man", "boy", "father"],
        "transgender": ["transgender", "trans"],
    }
    lowered = text.lower()
    for gender, aliases in gender_map.items():
        if any(alias in lowered for alias in aliases):
            return gender
    return None


def _extract_location(text: str) -> str | None:
    state_match = re.search(r"(?:from|in|living in|resident of)\s+([A-Za-z\s]{3,30})", text, flags=re.IGNORECASE)
    if state_match:
        return state_match.group(1).strip().title()
    return None


def _extract_category(text: str) -> str | None:
    categories = ["sc", "st", "obc", "ews", "general"]
    lowered = text.lower()
    for category in categories:
        if re.search(rf"\b{category}\b", lowered):
            return category.upper()
    return None


def _extract_occupation(text: str) -> str | None:
    occupation_keywords = [
        "student",
        "farmer",
        "laborer",
        "self employed",
        "business",
        "unemployed",
        "homemaker",
        "senior citizen",
        "pregnant",
        "artisan",
        "fisherman",
    ]
    lowered = text.lower()
    for keyword in occupation_keywords:
        if keyword in lowered:
            return keyword
    return None


def _extract_flags(text: str) -> dict[str, bool]:
    lowered = text.lower()
    return {
        "is_disabled": any(token in lowered for token in ["disabled", "disability", "divyang"]),
        "is_minority": any(token in lowered for token in ["minority", "muslim", "christian", "sikh", "jain", "buddhist", "parsi"]),
        "is_single_woman": any(token in lowered for token in ["single mother", "single woman", "widow", "divorced woman"]),
        "is_rural": any(token in lowered for token in ["village", "rural", "gram"]),
    }


def extract_profile(user_input: str) -> dict[str, Any]:
    profile = {
        "age": _extract_age(user_input),
        "gender": _extract_gender(user_input),
        "location": _extract_location(user_input),
        "income": _extract_income(user_input),
        "category": _extract_category(user_input),
        "occupation": _extract_occupation(user_input),
    }
    profile.update(_extract_flags(user_input))
    profile["missing_fields"] = _detect_missing_fields(profile)
    profile["raw_text"] = user_input
    return profile


def _detect_missing_fields(profile: dict[str, Any]) -> list[str]:
    required_fields = {
        "age": profile.get("age"),
        "income": profile.get("income"),
        "state": profile.get("location"),
        "category": profile.get("category"),
        "occupation": profile.get("occupation"),
    }

    return [field for field, value in required_fields.items() if value is None]
