"""Utility functions for minecraft-dashboard."""

import asyncio
import ipaddress
import json
import logging
import os
import re
import sys
from pathlib import Path
from typing import Any, Callable, TypeVar, cast

import colorlog
import httpx
from dataclass_wizard import json_field
from dotenv import load_dotenv
from mcstatus import JavaServer

from minecraft_dashboard.models import (
    InfoData,
    McSrvStatusData,
    McSrvStatusDebugData,
    McSrvStatusMapData,
    McSrvStatusMotdData,
    ModData,
    MotdData,
    PlayerData,
    PlayersData,
    PluginData,
    ProtocolData,
    Status,
    StatusData,
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
        # Check if default is mutable (list, dict, set)
        is_mutable = isinstance(default, (list, dict, set))

        if is_mutable:
            return json_field(
                config_name,
                dump=not is_helper,
                init=not is_helper,
                default_factory=lambda: EnvUtils.read(env_name, default, parser),
                metadata={
                    "config_name": config_name,
                    "env_name": env_name,
                    "parser": parser,
                },
            )
        else:
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
    async def get_status(
        host: str,
        port: int,
        host_external: str,
        port_external: int,
        timeout: int,
        ping_host: str | None,
        ping_host_external: str,
    ) -> Status:
        """Get the status of the Minecraft server."""
        status_data = await MinecraftUtils._get_status(
            host,
            port,
            timeout,
            ping_host,
        )
        status_data_external = await MinecraftUtils._get_status_external(
            host_external,
            port_external,
            timeout,
            ping_host_external,
        )

        return Status(
            data=status_data,
            data_external=status_data_external,
        )

    @staticmethod
    async def _get_status(
        host: str,
        port: int,
        timeout: int,
        ping_host: str | None,
    ) -> StatusData | None:
        """Get the status of the Minecraft server."""
        server = await JavaServer.async_lookup(f"{host}:{port}", timeout)
        query = await JavaServer.async_query(server)
        if not server:
            return None

        try:
            status = await server.async_status()
        except Exception:
            return None

        if not status:
            return None

        players = PlayersData(
            online=status.players.online,
            max=status.players.max,
            player_list=[
                PlayerData(name=player.name, uuid=player.id)
                for player in (status.players.sample or [])
            ]
            if status.players.sample
            else None,
        )

        protocol = ProtocolData(
            name=query.software.version,
            version=status.version.protocol,
        )

        plugins = [
            PluginData(
                name=plugin.split(" ")[0],
                version=plugin.split(" ")[-1],
            )
            for plugin in query.software.plugins
        ]

        mods = (
            [
                ModData(
                    name=mod.name,
                    version=mod.marker,
                )
                for mod in status.forge_data.mods
            ]
            if status.forge_data and status.forge_data.mods
            else None
        )

        motd = MotdData(
            plain=status.motd.to_plain(),
            html=status.motd.to_html(),
        )

        latency = round(
            status.latency
            if not ping_host
            else await NetUtils.get_latency(ping_host, timeout)
        )

        ip = await NetUtils.resolve_host_to_ip(host)

        return StatusData(
            latency=latency,
            ip=ip,
            port=port,
            hostname=host,
            version=query.software.version,
            protocol=protocol,
            icon=status.icon,
            software=status.version.name,
            map=query.map_name,
            motd=motd,
            players=players,
            plugins=plugins,
            mods=mods,
        )

    @staticmethod
    async def _get_status_external(
        host: str, port: int, timeout: int, ping_host: str
    ) -> StatusData | None:
        """Get the status from mcsrvstat API."""
        mcsrvstat_status = await MinecraftUtils._get_mcsrvstat_status(
            host, port, timeout
        )

        if not mcsrvstat_status:
            return None

        latency = round(await NetUtils.get_latency(ping_host, timeout))

        return StatusData(
            latency=latency,
            ip=mcsrvstat_status.ip,
            port=mcsrvstat_status.port,
            hostname=mcsrvstat_status.hostname,
            version=mcsrvstat_status.version,
            protocol=mcsrvstat_status.protocol,
            icon=mcsrvstat_status.icon,
            software=mcsrvstat_status.software,
            map=mcsrvstat_status.map.clean if mcsrvstat_status.map else "",
            motd=MotdData(
                plain="".join(mcsrvstat_status.motd.clean)
                if mcsrvstat_status.motd
                else "",
                html="".join(mcsrvstat_status.motd.html)
                if mcsrvstat_status.motd
                else "",
            ),
            players=mcsrvstat_status.players,
            plugins=mcsrvstat_status.plugins,
            mods=mcsrvstat_status.mods,
        )

    @staticmethod
    async def _get_mcsrvstat_status(
        host: str, port: int, timeout: int
    ) -> McSrvStatusData | None:
        base_url = "https://api.mcsrvstat.us"
        version = "3"

        url = f"{base_url}/{version}/{host}:{port}"

        headers = {"User-Agent": "minecraft-dashboard"}

        async with httpx.AsyncClient(timeout=timeout) as client:
            try:
                response = await client.get(url, headers=headers)
                response.raise_for_status()

                data = response.json()

                debug_data = McSrvStatusDebugData(**data["debug"])

                protocol_data = None
                if "protocol" in data and data["protocol"]:
                    protocol_data = ProtocolData(**data["protocol"])

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
                            PlayerData(**player) for player in players_dict["list"]
                        ]
                    players_data = PlayersData(
                        online=players_dict["online"],
                        max=players_dict["max"],
                        player_list=player_list,
                    )

                plugins_data = None
                if "plugins" in data and data["plugins"]:
                    plugins_data = [PluginData(**plugin) for plugin in data["plugins"]]

                mods_data = None
                if "mods" in data and data["mods"]:
                    mods_data = [ModData(**mod) for mod in data["mods"]]

                info_data = None
                if "info" in data and data["info"]:
                    info_data = InfoData(**data["info"])

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
                return None
            except httpx.RequestError as exception:
                logger.error(
                    f"Request error occurred while fetching mcsrvstat data: {exception}"
                )
                return None
            except Exception as exception:
                logger.error(
                    f"Unexpected error occurred while fetching mcsrvstat data: {exception}"
                )
                return None


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


class NetUtils:
    @staticmethod
    async def get_latency(host: str, timeout: float = 1.5) -> float:
        """Get the network latency to a host using the system ping command."""
        count_flag = "-n" if sys.platform.startswith("win") else "-c"
        cmd = ["ping", count_flag, "1", host]

        try:
            proc = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )

            try:
                stdout, _ = await asyncio.wait_for(proc.communicate(), timeout)
            except asyncio.TimeoutError:
                proc.kill()
                raise asyncio.TimeoutError("Ping command timed out")

            if proc.returncode != 0:
                raise ValueError("Ping command failed")

            output = stdout.decode(errors="ignore")

            match = re.search(
                r"time[=<]?\s*([\d.,]+)\s*ms",
                output,
                flags=re.IGNORECASE,
            )

            if not match:
                match = re.search(
                    r"[=<]\s*([\d.,]+)\s*ms[^m]*ttl",
                    output,
                    flags=re.IGNORECASE,
                )

            if match:
                val = match.group(1).replace(",", ".")
                return float(val)

        except Exception:
            raise ValueError("Ping command failed")

        raise ValueError("Ping command failed")

    @staticmethod
    async def resolve_host_to_ip(host: str) -> str:
        """Resolve a hostname to its IP address."""
        try:
            ipaddress.ip_address(host)
            return host
        except ValueError:
            pass

        try:
            try:
                loop = asyncio.get_running_loop()
            except RuntimeError:
                loop = asyncio.get_event_loop()

            infos = await loop.getaddrinfo(host, None)
            if not infos:
                return host

            sockaddr = infos[0][4]
            ip = sockaddr[0]
            return ip
        except Exception as exception:
            logger.debug(f"DNS resolution failed for host '{host}': {exception}")
            return host
