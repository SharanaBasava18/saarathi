from __future__ import annotations

import random

from pydantic import BaseModel


class CSCOperator(BaseModel):
    id: str
    name: str
    phone: str
    district: str
    password: str


OPERATORS_STORE: list[CSCOperator] = [
    CSCOperator(
        id="op-1",
        name="Ravi Kumar",
        phone="9999999991",
        password="admin123",
        district="Belagavi",
    ),
    CSCOperator(
        id="op-2",
        name="Sunita Sharma",
        phone="9999999992",
        password="admin123",
        district="Dharwad",
    ),
]


def list_operators() -> list[dict[str, str]]:
    return [item.model_dump(exclude={"password"}) for item in OPERATORS_STORE]


def authenticate_operator(phone: str, password: str) -> dict[str, str] | None:
    for item in OPERATORS_STORE:
        if item.phone == phone and item.password == password:
            return item.model_dump(exclude={"password"})
    return None


def get_operator_by_id(operator_id: str) -> dict[str, str] | None:
    for item in OPERATORS_STORE:
        if item.id == operator_id:
            return item.model_dump(exclude={"password"})
    return None


def get_operator_by_district(district: str) -> dict[str, str] | None:
    target = district.strip().lower()
    if not target:
        return None

    for item in OPERATORS_STORE:
        if item.district.strip().lower() == target:
            return item.model_dump(exclude={"password"})
    return None


def get_random_operator() -> dict[str, str] | None:
    if not OPERATORS_STORE:
        return None
    return random.choice(OPERATORS_STORE).model_dump(exclude={"password"})
