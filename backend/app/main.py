from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.assistance import router as assistance_router
from app.api.routes.health import router as health_router
from app.api.routes.operator import router as operator_router
from app.api.routes.recommendations import router as recommendations_router
from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers

settings = get_settings()

app = FastAPI(title=settings.app_name, version=settings.app_version)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(recommendations_router)
app.include_router(assistance_router)
app.include_router(operator_router)

register_exception_handlers(app)
