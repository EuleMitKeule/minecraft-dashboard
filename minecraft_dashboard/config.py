"""Configuration model for minecraft-dashboard."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import yaml
from dataclass_wizard import JSONWizard, YAMLWizard
from pydantic.dataclasses import dataclass

from minecraft_dashboard.const import (
    CONF_CONFIG_FILE_PATH,
    CONF_HOST,
    CONF_LOG_DATE_FORMAT,
    CONF_LOG_FILEMODE,
    CONF_LOG_FORMAT_CONSOLE,
    CONF_LOG_FORMAT_FILE,
    CONF_LOG_LEVEL,
    CONF_LOG_PATH,
    CONF_PORT,
    DEFAULT_CONFIG_FILE_PATH,
    DEFAULT_HOST,
    DEFAULT_LOG_DATE_FORMAT,
    DEFAULT_LOG_FILEMODE,
    DEFAULT_LOG_FORMAT_CONSOLE,
    DEFAULT_LOG_FORMAT_FILE,
    DEFAULT_LOG_LEVEL,
    DEFAULT_LOG_PATH,
    DEFAULT_PORT,
    ENV_CONFIG_FILE_PATH,
    ENV_HOST,
    ENV_LOG_DATE_FORMAT,
    ENV_LOG_FILEMODE,
    ENV_LOG_FORMAT_CONSOLE,
    ENV_LOG_FORMAT_FILE,
    ENV_LOG_LEVEL,
    ENV_LOG_PATH,
    ENV_PORT,
)
from minecraft_dashboard.utils import DataclassUtils


@dataclass
class Config(YAMLWizard, JSONWizard):
    """Configuration model for minecraft-dashboard."""

    config_file_path: Path = DataclassUtils.helper_field(
        CONF_CONFIG_FILE_PATH,
        ENV_CONFIG_FILE_PATH,
        DEFAULT_CONFIG_FILE_PATH,
        Path,
    )
    host: str = DataclassUtils.field(
        CONF_HOST,
        ENV_HOST,
        DEFAULT_HOST,
    )
    port: int = DataclassUtils.field(CONF_PORT, ENV_PORT, DEFAULT_PORT)
    log_path: Path = DataclassUtils.field(
        CONF_LOG_PATH,
        ENV_LOG_PATH,
        DEFAULT_LOG_PATH,
        Path,
    )
    log_level: str = DataclassUtils.field(
        CONF_LOG_LEVEL,
        ENV_LOG_LEVEL,
        DEFAULT_LOG_LEVEL,
    )
    log_format_file: str = DataclassUtils.field(
        CONF_LOG_FORMAT_FILE,
        ENV_LOG_FORMAT_FILE,
        DEFAULT_LOG_FORMAT_FILE,
    )
    log_format_console: str = DataclassUtils.field(
        CONF_LOG_FORMAT_CONSOLE,
        ENV_LOG_FORMAT_CONSOLE,
        DEFAULT_LOG_FORMAT_CONSOLE,
    )
    log_date_format: str = DataclassUtils.field(
        CONF_LOG_DATE_FORMAT,
        ENV_LOG_DATE_FORMAT,
        DEFAULT_LOG_DATE_FORMAT,
    )
    log_filemode: str = DataclassUtils.field(
        CONF_LOG_FILEMODE,
        ENV_LOG_FILEMODE,
        DEFAULT_LOG_FILEMODE,
    )

    def save(self) -> None:
        """Write the configuration to a file."""

        self.config_file_path.parent.mkdir(parents=True, exist_ok=True)

        with self.config_file_path.open("w") as config_file:
            config_file.write(self.to_yaml())

    @classmethod
    def init(cls) -> Config:
        """Initialize the configuration with default values."""
        config = Config()
        config.save()

        return config

    @classmethod
    def load(cls) -> Config:
        """Read the configuration from a file."""
        config = Config()

        if not config.config_file_path.exists():
            return cls.init()

        with config.config_file_path.open("r") as config_file:
            config_dict: dict[str, Any] = yaml.safe_load(config_file)

        config = cls.from_dict(config_dict)
        DataclassUtils.check_config_env_mismatch(config)
        config.save()
        return config
