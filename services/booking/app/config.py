from functools import lru_cache

from touribook_common.config import CommonSettings
from touribook_common.database import build_postgres_url


class Settings(CommonSettings):
    SERVICE_NAME: str = "booking-service"
    PROJECT_NAME: str = "TouriBook Booking Service"

    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "touribook_booking"

    CATALOG_SERVICE_URL: str = "http://localhost:8002"
    AUTH_SERVICE_URL: str = "http://localhost:8001"
    NOTIFICATION_SERVICE_URL: str = "http://localhost:8006"

    AUTO_CREATE_TABLES: bool = True

    @property
    def DATABASE_URL(self) -> str:
        return build_postgres_url(
            self.POSTGRES_USER,
            self.POSTGRES_PASSWORD,
            self.POSTGRES_HOST,
            self.POSTGRES_PORT,
            self.POSTGRES_DB,
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
