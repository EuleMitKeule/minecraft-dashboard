"""Utility functions for minecraft-dashboard."""

import logging
import os
import sys
from pathlib import Path
from typing import Any, Callable, TypeVar, cast

import colorlog
from dataclass_wizard import json_field
from dotenv import load_dotenv
from mcstatus import JavaServer

from minecraft_dashboard.models import StatusData

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
        log_path: Path,
        log_level: str,
        log_format_file: str,
        log_format_console: str,
        log_date_format: str,
        log_file_mode: str,
    ) -> None:
        """Initialize logging configuration."""

        log_path.parent.mkdir(parents=True, exist_ok=True)

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

        file_handler = logging.FileHandler(log_path, mode=log_file_mode)
        file_formatter = logging.Formatter(fmt=log_format_file, datefmt=log_date_format)
        file_handler.setFormatter(file_formatter)

        logging.basicConfig(
            level=log_level.upper(),
            handlers=[file_handler, console_handler],
        )


class MinecraftUtils:
    """Utility functions for Minecraft."""

    @staticmethod
    async def get_status(host: str, port: int, timeout: int) -> StatusData:
        """Get the status of the Minecraft server."""
        server = await JavaServer.async_lookup(f"{host}:{port}", timeout)
        if not server:
            return StatusData(online=False)

        status = await server.async_status()
        if not status:
            return StatusData(online=False)

        return StatusData(
            online=True,
            players_online=status.players.online,
            max_players=status.players.max,
        )
