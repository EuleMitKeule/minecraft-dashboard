"""Models module for minecraft-dashboard."""

from pydantic import BaseModel


class HealthCheckData(BaseModel):
    """Health check data model."""

    status: str = "ok"
