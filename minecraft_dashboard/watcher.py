"""Configuration file watcher module."""

import asyncio
import logging
from typing import Callable

from minecraft_dashboard.config import Config


class ConfigurationWatcher:
    """Watches configuration file for changes and reloads automatically."""

    def __init__(
        self,
        configuration: Config,
        reload_callback: Callable[[Config], None],
    ) -> None:
        """Initialize the configuration watcher."""
        self.configuration = configuration
        self.reload_callback = reload_callback
        self.configuration_file_path = configuration.config_file_path
        self.last_modified_time = self._get_modification_time()
        self.is_running = False
        self.watch_task = None

    def _get_modification_time(self) -> float:
        """Get the last modification time of the configuration file."""
        if not self.configuration_file_path.exists():
            return 0.0
        return self.configuration_file_path.stat().st_mtime

    async def start(self) -> None:
        """Start watching the configuration file."""
        self.is_running = True
        self.watch_task = asyncio.create_task(self._watch_loop())
        logging.info(
            f"Started watching configuration file: {self.configuration_file_path}"
        )

    async def stop(self) -> None:
        """Stop watching the configuration file."""
        self.is_running = False
        if self.watch_task:
            self.watch_task.cancel()
            try:
                await self.watch_task
            except asyncio.CancelledError:
                pass
        logging.info("Stopped watching configuration file")

    async def _watch_loop(self) -> None:
        """Main watch loop that checks for file changes."""
        while self.is_running:
            try:
                await asyncio.sleep(1.0)

                if not self.configuration_file_path.exists():
                    continue

                current_modification_time = self._get_modification_time()

                if current_modification_time > self.last_modified_time:
                    logging.info("Configuration file changed, reloading...")
                    self.last_modified_time = current_modification_time

                    try:
                        new_configuration = Config.load(save_after_load=False)
                        self.configuration = new_configuration
                        self.reload_callback(new_configuration)
                        logging.info("Configuration reloaded successfully")
                    except Exception as exception:
                        logging.error(
                            f"Failed to reload configuration: {exception}",
                            exc_info=True,
                        )

            except asyncio.CancelledError:
                break
            except Exception as exception:
                logging.error(
                    f"Error in configuration watch loop: {exception}", exc_info=True
                )
                await asyncio.sleep(5.0)
