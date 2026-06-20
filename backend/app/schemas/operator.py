from pydantic import BaseModel


class CSCOperator(BaseModel):
    operator_id: str
    name: str
    phone: str
    password: str
    district: str


class OperatorLoginPayload(BaseModel):
    phone: str
    password: str
