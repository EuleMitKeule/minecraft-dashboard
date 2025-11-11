"""API module for minecraft-dashboard."""

import logging

from classy_fastapi import get
from classy_fastapi.routable import Routable
from fastapi import APIRouter

from minecraft_dashboard.config import Config
from minecraft_dashboard.models import ConfigData, HealthCheckData, StatusData
from minecraft_dashboard.utils import MinecraftUtils

router = APIRouter()


class DashboardApi(Routable):
    """Dashboard API class."""

    def __init__(self, config: Config) -> None:
        """Initialize the Dashboard API."""
        super().__init__()
        self.config = config

    def reload_configuration(self, new_configuration: Config) -> None:
        """Reload the configuration."""
        logging.info("Reloading API configuration...")
        self.config = new_configuration
        logging.info("API configuration reloaded successfully")

    @get(
        "/health",
        summary="Perform a health check",
        tags=["Health"],
        status_code=200,
        response_model=HealthCheckData,
    )
    async def health_check(self) -> HealthCheckData:
        """Health check endpoint."""
        return HealthCheckData()

    @get(
        "/config",
        summary="Get dashboard configuration",
        tags=["Config"],
        status_code=200,
        response_model=ConfigData,
    )
    async def get_config(self) -> ConfigData:
        """Get dashboard configuration endpoint."""
        return ConfigData(
            use_mock_data=self.config.frontend_use_mock_data,
            polling_interval=self.config.frontend_polling_interval,
        )

    @get(
        "/status",
        summary="Get the status of the Minecraft server",
        tags=["Status"],
        status_code=200,
        response_model=StatusData,
    )
    async def get_status(self) -> StatusData:
        """Get the status of the Minecraft server."""
        return await MinecraftUtils.get_status(
            self.config.minecraft_server_host,
            self.config.minecraft_server_port,
            self.config.minecraft_server_timeout,
        )
