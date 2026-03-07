import json
from pathlib import Path
from typing import Any


SCHEMES_FILE = Path(__file__).resolve().parents[1] / "data" / "schemes.json"


def load_schemes() -> list[dict[str, Any]]:
    with SCHEMES_FILE.open("r", encoding="utf-8") as file:
        return json.load(file)


def evaluate_eligibility(profile: dict[str, Any], scheme: dict[str, Any]) -> tuple[float, list[str]]:
    checks = scheme.get("eligibility", {})
    reasons: list[str] = []
    total_checks = 0
    matched_checks = 0

    min_age = checks.get("min_age")
    if min_age is not None:
        total_checks += 1
        if profile.get("age") is not None and profile["age"] >= min_age:
            matched_checks += 1
            reasons.append(f"Age is {profile['age']}, meeting minimum age {min_age}.")

    max_age = checks.get("max_age")
    if max_age is not None:
        total_checks += 1
        if profile.get("age") is not None and profile["age"] <= max_age:
            matched_checks += 1
            reasons.append(f"Age is within limit ({max_age}).")

    max_income = checks.get("max_income")
    if max_income is not None:
        total_checks += 1
        if profile.get("income") is not None and profile["income"] <= max_income:
            matched_checks += 1
            reasons.append(f"Income appears within allowed limit (up to INR {max_income:,}).")

    genders = checks.get("genders")
    if genders:
        total_checks += 1
        if profile.get("gender") in genders:
            matched_checks += 1
            reasons.append(f"Scheme targets {profile.get('gender')} beneficiaries.")

    occupations = checks.get("occupations")
    if occupations:
        total_checks += 1
        if profile.get("occupation") in occupations:
            matched_checks += 1
            reasons.append(f"Occupation match found ({profile.get('occupation')}).")

    categories = checks.get("categories")
    if categories:
        total_checks += 1
        if profile.get("category") in categories:
            matched_checks += 1
            reasons.append(f"Category eligibility matched ({profile.get('category')}).")

    requires_disability = checks.get("requires_disability")
    if requires_disability:
        total_checks += 1
        if profile.get("is_disabled"):
            matched_checks += 1
            reasons.append("Profile indicates disability eligibility.")

    requires_minority = checks.get("requires_minority")
    if requires_minority:
        total_checks += 1
        if profile.get("is_minority"):
            matched_checks += 1
            reasons.append("Minority criteria appears satisfied.")

    for flag_key in ["is_single_woman", "is_rural"]:
        if checks.get(flag_key) is True:
            total_checks += 1
            if profile.get(flag_key):
                matched_checks += 1
                reasons.append(f"Profile satisfies {flag_key.replace('_', ' ')} condition.")

    if total_checks == 0:
        return 0.5, ["General eligibility scheme with broad coverage."]

    score = matched_checks / total_checks
    if not reasons:
        reasons.append("Partial profile match based on available details.")

    return score, reasons
