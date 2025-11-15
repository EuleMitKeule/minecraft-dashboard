"""Models module for minecraft-dashboard."""

from dataclass_wizard import JSONWizard, YAMLWizard
from pydantic import BaseModel
from pydantic.dataclasses import dataclass


class HealthCheckData(BaseModel):
    """Health check data model."""

    status: str = "ok"


class McSrvStatusDebugData(BaseModel):
    """McSrvStat API debug data model."""

    ping: bool
    query: bool
    bedrock: bool
    srv: bool
    querymismatch: bool
    ipinsrv: bool
    cnameinsrv: bool
    animatedmotd: bool
    cachehit: bool
    cachetime: int
    cacheexpire: int
    apiversion: int


class McSrvStatusProtocolData(BaseModel):
    """McSrvStat API protocol data model."""

    version: int
    name: str | None = None


class McSrvStatusMotdData(BaseModel):
    """McSrvStat API motd data model."""

    raw: list[str]
    clean: list[str]
    html: list[str]


class McSrvStatusMapData(BaseModel):
    """McSrvStat API map data model."""

    raw: str
    clean: str
    html: str


class McSrvStatusPlayerData(BaseModel):
    """McSrvStat API player data model."""

    name: str
    uuid: str


class McSrvStatusPlayersData(BaseModel):
    """McSrvStat API players data model."""

    online: int
    max: int
    player_list: list[McSrvStatusPlayerData] | None = None


class McSrvStatusPluginData(BaseModel):
    """McSrvStat API plugin data model."""

    name: str
    version: str


class McSrvStatusModData(BaseModel):
    """McSrvStat API mod data model."""

    name: str
    version: str


class McSrvStatusInfoData(BaseModel):
    """McSrvStat API info data model."""

    raw: list[str]
    clean: list[str]
    html: list[str]


class McSrvStatusData(BaseModel):
    """McSrvStat API status data model."""

    online: bool
    ip: str | None = None
    port: int | None = None
    hostname: str | None = None
    debug: McSrvStatusDebugData
    version: str | None = None
    protocol: McSrvStatusProtocolData | None = None
    icon: str | None = None
    software: str | None = None
    map: McSrvStatusMapData | None = None
    gamemode: str | None = None
    serverid: str | None = None
    eula_blocked: bool | None = None
    motd: McSrvStatusMotdData | None = None
    players: McSrvStatusPlayersData | None = None
    plugins: list[McSrvStatusPluginData] | None = None
    mods: list[McSrvStatusModData] | None = None
    info: McSrvStatusInfoData | None = None


@dataclass
class FrontendLink(YAMLWizard, JSONWizard):
    """Frontend link data model."""

    title: str
    url: str
    icon: str | None = None


class ConfigData(BaseModel):
    """Configuration data model."""

    use_mock_data: bool
    polling_interval: int
    simulate_offline: bool
    page_title: str
    header_title: str
    server_address: str
    frontend_links: list[FrontendLink] = []


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
    external_latency: float | None = None
    players: PlayersInfo | None = None
    version: VersionInfo | None = None
    description: str | None = None
    motd_plain: str | None = None
    motd_html: str | None = None
    enforces_secure_chat: bool | None = None
    has_icon: bool | None = None
    icon_base64: str | None = None
    forge_data: ForgeInfo | None = None
