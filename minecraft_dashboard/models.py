"""Models module for minecraft-dashboard."""

from pydantic import BaseModel


class HealthCheckData(BaseModel):
    """Health check data model."""

    status: str = "ok"


class StatusData(BaseModel):
    """Minecraft server status data model."""

    online: bool
    players_online: int | None = None
    max_players: int | None = None
