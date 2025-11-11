"""API module for minecraft-dashboard."""

from fastapi import APIRouter

from minecraft_dashboard.models import HealthCheckData

router = APIRouter()


@router.get(
    "/health",
    summary="Perform a health check",
    tags=["Health"],
    status_code=200,
)
async def health_check() -> HealthCheckData:
    """Health check endpoint."""
    return HealthCheckData()
