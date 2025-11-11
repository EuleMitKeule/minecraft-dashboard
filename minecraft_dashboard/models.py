"""Models module for minecraft-dashboard."""

from pydantic import BaseModel


class HealthCheckData(BaseModel):
    """Health check data model."""

    status: str = "ok"


class PlayerSample(BaseModel):
    """Player sample data model."""

    name: str
    id: str


class PlayersInfo(BaseModel):
    """Players information data model."""

    online: int
    max: int
    sample: list[PlayerSample] | None = None


class VersionInfo(BaseModel):
    """Version information data model."""

    name: str
    protocol: int


class ForgeModInfo(BaseModel):
    """Forge mod information data model."""

    name: str
    marker: str


class ForgeInfo(BaseModel):
    """Forge data model."""

    mods: list[ForgeModInfo] | None = None
    channels: list[dict] | None = None
    fml_network_version: int | None = None


class StatusData(BaseModel):
    """Minecraft server status data model."""

    online: bool
    latency: float | None = None
    players: PlayersInfo | None = None
    version: VersionInfo | None = None
    description: str | None = None
    motd_plain: str | None = None
    motd_html: str | None = None
    enforces_secure_chat: bool | None = None
    has_icon: bool | None = None
    icon_base64: str | None = None
    forge_data: ForgeInfo | None = None
