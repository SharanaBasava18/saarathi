from app.models import CSCOperator, OperatorLoginPayload
from modules.csc_manager import authenticate_operator


class AuthService:
    @staticmethod
    def login_operator(payload: OperatorLoginPayload) -> CSCOperator | None:
        operator = authenticate_operator(phone=payload.phone, password=payload.password)
        if operator is None:
            return None
        return operator
