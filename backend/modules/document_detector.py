from typing import Any


def detect_documents(profile: dict[str, Any]) -> dict[str, bool]:
    occupation = (profile.get("occupation") or "").lower()
    income = profile.get("income")
    category = (profile.get("category") or "").lower()

    detected = {
        "aadhaar": True,
        "bank_passbook": True,
        "income_certificate": False,
        "land_record": False,
        "caste_certificate": False,
    }

    if occupation == "farmer":
        detected["land_record"] = True

    if isinstance(income, int) and income > 0:
        detected["income_certificate"] = False

    if category in {"sc", "st", "obc", "ews"}:
        detected["caste_certificate"] = True

    return detected
