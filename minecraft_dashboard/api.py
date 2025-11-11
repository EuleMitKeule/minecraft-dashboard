"""API module for minecraft-dashboard."""

from classy_fastapi import get
from classy_fastapi.routable import Routable
from fastapi import APIRouter

from minecraft_dashboard.config import Config
from minecraft_dashboard.models import HealthCheckData, StatusData
from minecraft_dashboard.utils import MinecraftUtils

router = APIRouter()


class DashboardApi(Routable):
    """Dashboard API class."""

    def __init__(self, config: Config) -> None:
        """Initialize the Dashboard API."""
        super().__init__()
        self.config = config

    @get(
        "/health",
        summary="Perform a health check",
        tags=["Health"],
        status_code=200,
    )
    async def health_check(self) -> HealthCheckData:
        """Health check endpoint."""
        return HealthCheckData()

    @get(
        "/status",
        summary="Get the status of the Minecraft server",
        tags=["Status"],
        status_code=200,
    )
    async def get_status(self) -> StatusData:
        """Get the status of the Minecraft server."""
        return await MinecraftUtils.get_status(
            self.config.minecraft_server_host,
            self.config.minecraft_server_port,
            self.config.minecraft_server_timeout,
        )
