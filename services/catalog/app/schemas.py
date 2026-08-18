from datetime import date, time

from pydantic import BaseModel, ConfigDict


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class CategoryRead(ORMModel):
    id: int
    nom: str


class ActivityRead(ORMModel):
    id: int
    titre: str
    description: str
    prix: float
    duree: int
    localisation: str
    latitude: float | None = None
    longitude: float | None = None
    photos: str | None = None
    category_id: int
    category: CategoryRead | None = None


class AvailabilityRead(ORMModel):
    id: int
    activity_id: int
    date: date
    heure: time
    places_disponibles: int
