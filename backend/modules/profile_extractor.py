import re
from typing import Any

from deep_translator import GoogleTranslator
from langdetect import detect
from langdetect.lang_detect_exception import LangDetectException


ALLOWED_STATES = {
    "karnataka",
    "maharashtra",
    "tamil nadu",
    "kerala",
    "telangana",
    "andhra pradesh",
    "delhi",
    "uttar pradesh",
    "gujarat",
    "rajasthan",
}

EDUCATION_KEYWORDS = {
    "engineering": [
        "btech",
        "b.tech",
        "be",
        "b.e",
        "engineering",
        "cse",
        "mechanical",
        "ece",
        "civil",
        "it branch",
        "branch",
        "sem",
        "semester",
    ],
    "diploma": ["diploma", "polytechnic"],
    "school": ["school", "class", "10th", "12th", "higher secondary"],
    "undergraduate": ["undergraduate", "ug", "bachelor", "college"],
    "postgraduate": ["postgraduate", "pg", "master", "mtech", "mba", "msc", "ma"],
}


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


def _normalize_text(text: str) -> str:
    return re.sub(r"[^a-z\s]", " ", text.lower())


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


def _extract_state(text: str) -> str | None:
    lowered = _normalize_text(text)
    for state in sorted(ALLOWED_STATES, key=len, reverse=True):
        if re.search(rf"\b{re.escape(state)}\b", lowered):
            return state.title()
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


def _extract_education(text: str, occupation: str | None) -> str | None:
    lowered = _normalize_text(text)

    for education_type, aliases in EDUCATION_KEYWORDS.items():
        if any(re.search(rf"\b{re.escape(alias)}\b", lowered) for alias in aliases):
            if education_type == "engineering" and occupation == "student":
                return "engineering student"
            return education_type

    if occupation == "student":
        return "student"

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
    detected_language = "en"
    normalized_input = user_input

    try:
        detected = detect(user_input)
        if detected == "hi":
            detected_language = "hi"
            normalized_input = GoogleTranslator(source="hi", target="en").translate(user_input)
    except (LangDetectException, ValueError, TypeError):
        detected_language = "en"
    except Exception:
        # Keep extraction resilient if translation service is unavailable.
        detected_language = "en"

    occupation = _extract_occupation(normalized_input)

    profile = {
        "age": _extract_age(normalized_input),
        "occupation": occupation,
        "education": _extract_education(normalized_input, occupation),
        "state": _extract_state(normalized_input),
        "income": _extract_income(normalized_input),
        "category": _extract_category(normalized_input),
        "gender": _extract_gender(normalized_input),
    }
    profile.update(_extract_flags(normalized_input))
    profile["missing_fields"] = _detect_missing_fields(profile)
    profile["raw_text"] = user_input
    profile["translated_text"] = normalized_input
    profile["detected_language"] = detected_language
    return profile


def _detect_missing_fields(profile: dict[str, Any]) -> list[str]:
    required_fields = {
        "age": profile.get("age"),
        "income": profile.get("income"),
        "state": profile.get("state"),
        "category": profile.get("category"),
        "occupation": profile.get("occupation"),
    }

    return [field for field, value in required_fields.items() if value is None]
