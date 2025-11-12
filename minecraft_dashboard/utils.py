"""Utility functions for minecraft-dashboard."""

import json
import logging
import os
import sys
from pathlib import Path
from typing import Any, Callable, TypeVar, cast

import colorlog
import httpx
from dataclass_wizard import json_field
from dotenv import load_dotenv
from mcstatus import JavaServer

from minecraft_dashboard.models import (
    ForgeInfo,
    ForgeModInfo,
    McSrvStatusData,
    McSrvStatusDebugData,
    McSrvStatusInfoData,
    McSrvStatusMapData,
    McSrvStatusModData,
    McSrvStatusMotdData,
    McSrvStatusPlayerData,
    McSrvStatusPlayersData,
    McSrvStatusPluginData,
    McSrvStatusProtocolData,
    PlayerSample,
    PlayersInfo,
    StatusData,
    VersionInfo,
)

T = TypeVar("T")

logger = logging.getLogger(__name__)


class EnvUtils:
    """Utility functions for environment variables."""

    @staticmethod
    def read(
        name: str,
        default: Any,
        parser: Callable[[str], T] | None = None,
    ) -> T:
        """Get an environment variable or return a default value."""
        load_dotenv()

        value = os.getenv(name)
        if value is None:
            return default if parser is None else parser(default)

        if parser is not None:
            return parser(value)

        return cast(T, value)


class DataclassUtils:
    """Utility functions for dataclasses."""

    @staticmethod
    def field(
        config_name: str,
        env_name: str,
        default: Any,
        parser: Callable[[str], T] | None = None,
        is_helper: bool = False,
    ) -> Any:
        """Create a dataclass field."""
        return json_field(
            config_name,
            dump=not is_helper,
            init=not is_helper,
            default=EnvUtils.read(env_name, default, parser),
            metadata={
                "config_name": config_name,
                "env_name": env_name,
                "parser": parser,
            },
        )

    @staticmethod
    def helper_field(
        config_name: str,
        env_name: str,
        default: Any,
        parser: Callable[[str], T] | None = None,
    ) -> Any:
        """Create a dataclass field for helper attributes."""
        return DataclassUtils.field(
            config_name,
            env_name,
            default,
            parser,
            is_helper=True,
        )

    @staticmethod
    def check_config_env_mismatch(instance: Any) -> None:
        """Check for mismatches between config file values and environment variables."""
        load_dotenv()

        for field in instance.__dataclass_fields__.values():
            metadata = field.metadata

            if "env_name" not in metadata:
                continue

            env_name = metadata["env_name"]

            env_value_raw = os.getenv(env_name)
            if env_value_raw is None:
                continue

            config_value = getattr(instance, field.name)
            config_value_str = str(config_value)

            if env_value_raw != config_value_str:
                logger.warning(
                    f"Configuration mismatch for field '{field.name}': "
                    f"environment variable {env_name}='{env_value_raw}' differs from "
                    f"config file value '{config_value_str}'. Using config file value."
                )


class LoggingUtils:
    """Utility functions for logging."""

    @staticmethod
    def init(
        log_path: Path | None,
        log_level: str,
        log_format_file: str,
        log_format_console: str,
        log_date_format: str,
        log_file_mode: str,
    ) -> None:
        """Initialize logging configuration."""

        color_formatter = colorlog.ColoredFormatter(
            fmt=log_format_console,
            datefmt=log_date_format,
            log_colors={
                "DEBUG": "cyan",
                "INFO": "green",
                "WARNING": "yellow",
                "ERROR": "red",
                "CRITICAL": "red,bg_white",
            },
        )

        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(color_formatter)

        handlers: list[logging.Handler] = [console_handler]

        if log_path and not log_path.is_dir():
            log_path.parent.mkdir(parents=True, exist_ok=True)
            try:
                file_handler = logging.FileHandler(log_path, mode=log_file_mode)
                file_formatter = logging.Formatter(
                    fmt=log_format_file, datefmt=log_date_format
                )
                file_handler.setFormatter(file_formatter)
                handlers.insert(0, file_handler)
            except PermissionError:
                pass

        logging.basicConfig(
            level=log_level.upper(),
            handlers=handlers,
        )


class MinecraftUtils:
    """Utility functions for Minecraft."""

    @staticmethod
    async def get_status(host: str, port: int, timeout: int) -> StatusData:
        """Get the status of the Minecraft server."""
        server = await JavaServer.async_lookup(f"{host}:{port}", timeout)
        if not server:
            return StatusData(online=False)

        try:
            status = await server.async_status()
        except Exception:
            return StatusData(online=False)

        if not status:
            return StatusData(online=False)

        players_info = PlayersInfo(
            online=status.players.online,
            max=status.players.max,
            sample=[
                PlayerSample(name=player.name, id=player.id)
                for player in (status.players.sample or [])
            ]
            if status.players.sample
            else None,
        )

        version_info = VersionInfo(
            name=status.version.name,
            protocol=status.version.protocol,
        )

        forge_info = None
        if status.forge_data:
            forge_mods = None
            if status.forge_data.mods:
                forge_mods = [
                    ForgeModInfo(
                        name=mod.name,
                        marker=mod.marker,
                    )
                    for mod in status.forge_data.mods
                ]

            forge_info = ForgeInfo(
                mods=forge_mods,
                channels=[
                    {
                        "name": channel.name,
                        "version": channel.version,
                        "required": channel.required,
                    }
                    for channel in (status.forge_data.channels or [])
                ]
                if status.forge_data.channels
                else None,
                fml_network_version=status.forge_data.fml_network_version,
            )

        motd_plain = None
        motd_html = None
        try:
            motd_plain = status.motd.to_plain()
            motd_html = status.motd.to_html()
        except Exception:
            pass

        return StatusData(
            online=True,
            latency=round(status.latency),
            players=players_info,
            version=version_info,
            description=status.description,
            motd_plain=motd_plain,
            motd_html=motd_html,
            enforces_secure_chat=status.enforces_secure_chat,
            has_icon=status.icon is not None,
            icon_base64=status.icon,
            forge_data=forge_info,
        )

    @staticmethod
    async def get_mcsrvstatus(
        server_address: str, is_bedrock: bool = False, timeout: int = 10
    ) -> McSrvStatusData:
        """Get the status from mcsrvstat API."""
        base_url = "https://api.mcsrvstat.us"
        version = "3"

        if is_bedrock:
            url = f"{base_url}/bedrock/{version}/{server_address}"
        else:
            url = f"{base_url}/{version}/{server_address}"

        headers = {"User-Agent": "minecraft-dashboard"}

        async with httpx.AsyncClient(timeout=timeout) as client:
            try:
                response = await client.get(url, headers=headers)
                response.raise_for_status()

                data = response.json()

                debug_data = McSrvStatusDebugData(**data["debug"])

                protocol_data = None
                if "protocol" in data and data["protocol"]:
                    protocol_data = McSrvStatusProtocolData(**data["protocol"])

                motd_data = None
                if "motd" in data and data["motd"]:
                    motd_data = McSrvStatusMotdData(**data["motd"])

                map_data = None
                if "map" in data and data["map"]:
                    map_data = McSrvStatusMapData(**data["map"])

                players_data = None
                if "players" in data and data["players"]:
                    players_dict = data["players"]
                    player_list = None
                    if "list" in players_dict and players_dict["list"]:
                        player_list = [
                            McSrvStatusPlayerData(**player)
                            for player in players_dict["list"]
                        ]
                    players_data = McSrvStatusPlayersData(
                        online=players_dict["online"],
                        max=players_dict["max"],
                        player_list=player_list,
                    )

                plugins_data = None
                if "plugins" in data and data["plugins"]:
                    plugins_data = [
                        McSrvStatusPluginData(**plugin) for plugin in data["plugins"]
                    ]

                mods_data = None
                if "mods" in data and data["mods"]:
                    mods_data = [McSrvStatusModData(**mod) for mod in data["mods"]]

                info_data = None
                if "info" in data and data["info"]:
                    info_data = McSrvStatusInfoData(**data["info"])

                return McSrvStatusData(
                    online=data["online"],
                    ip=data.get("ip"),
                    port=data.get("port"),
                    hostname=data.get("hostname"),
                    debug=debug_data,
                    version=data.get("version"),
                    protocol=protocol_data,
                    icon=data.get("icon"),
                    software=data.get("software"),
                    map=map_data,
                    gamemode=data.get("gamemode"),
                    serverid=data.get("serverid"),
                    eula_blocked=data.get("eula_blocked"),
                    motd=motd_data,
                    players=players_data,
                    plugins=plugins_data,
                    mods=mods_data,
                    info=info_data,
                )

            except httpx.HTTPStatusError as exception:
                logger.error(
                    f"HTTP error occurred while fetching mcsrvstat data: {exception}"
                )
                raise
            except httpx.RequestError as exception:
                logger.error(
                    f"Request error occurred while fetching mcsrvstat data: {exception}"
                )
                raise
            except Exception as exception:
                logger.error(
                    f"Unexpected error occurred while fetching mcsrvstat data: {exception}"
                )
                raise


class OpenApiUtils:
    """Utility functions for OpenAPI specification generation."""

    @staticmethod
    def generate_openapi_spec(application: Any, output_path: Path) -> dict:
        """Generate OpenAPI specification from a FastAPI application."""
        openapi_schema = application.openapi()

        output_path.parent.mkdir(parents=True, exist_ok=True)
        with output_path.open("w", encoding="utf-8") as file:
            json.dump(openapi_schema, file, indent=2, ensure_ascii=False)

        logger.info(f"OpenAPI specification written to {output_path}")

        return openapi_schema
