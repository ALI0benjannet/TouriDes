import logging

from fastapi import FastAPI

from touribook_common.exceptions import register_exception_handlers
from touribook_common.logging import setup_logging

from app.config import settings
from app.database import Base, engine
from app.routers import internal_router, public_router

setup_logging(settings.SERVICE_NAME)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Service de réservation : bookings et codes promo.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url=None,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
)

register_exception_handlers(app)


@app.on_event("startup")
def init_db() -> None:
    if settings.AUTO_CREATE_TABLES:
        Base.metadata.create_all(bind=engine)
        logger.info("Tables vérifiées/créées (AUTO_CREATE_TABLES=true)")


@app.get("/health", tags=["Système"])
def health():
    return {"service": settings.SERVICE_NAME, "status": "ok", "environment": settings.ENVIRONMENT}


app.include_router(public_router, prefix=settings.API_V1_PREFIX)
app.include_router(internal_router)
