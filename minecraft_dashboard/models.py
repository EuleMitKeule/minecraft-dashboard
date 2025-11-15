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


class ProtocolData(BaseModel):
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


class PlayerData(BaseModel):
    """McSrvStat API player data model."""

    name: str
    uuid: str


class PlayersData(BaseModel):
    """McSrvStat API players data model."""

    online: int
    max: int
    player_list: list[PlayerData] | None = None


class PluginData(BaseModel):
    """McSrvStat API plugin data model."""

    name: str
    version: str


class ModData(BaseModel):
    """McSrvStat API mod data model."""

    name: str
    version: str


class InfoData(BaseModel):
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
    protocol: ProtocolData | None = None
    icon: str | None = None
    software: str | None = None
    map: McSrvStatusMapData | None = None
    gamemode: str | None = None
    serverid: str | None = None
    eula_blocked: bool | None = None
    motd: McSrvStatusMotdData | None = None
    players: PlayersData | None = None
    plugins: list[PluginData] | None = None
    mods: list[ModData] | None = None
    info: InfoData | None = None


@dataclass
class FrontendLinkData(YAMLWizard, JSONWizard):
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
    frontend_links: list[FrontendLinkData] = []


class MotdData(BaseModel):
    """Minecraft server motd data model."""

    plain: str
    html: str


class StatusData(BaseModel):
    """Minecraft server status data model."""

    latency: int | None = None
    ip: str | None = None
    port: int | None = None
    hostname: str | None = None
    version: str | None = None
    protocol: ProtocolData | None = None
    icon: str | None = None
    software: str | None = None
    map: str | None = None
    motd: MotdData | None = None
    players: PlayersData | None = None
    plugins: list[PluginData] | None = None
    mods: list[ModData] | None = None
    info: InfoData | None = None


class Status(BaseModel):
    """Minecraft server status model."""

    data: StatusData | None = None
    data_external: StatusData | None = None
