"""Main module for minecraft-dashboard."""

import logging
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI

from minecraft_dashboard.api import DashboardApi
from minecraft_dashboard.config import Config
from minecraft_dashboard.utils import LoggingUtils


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(title="minecraft-dashboard", lifespan=lifespan)


def main():
    config = Config.load()

    LoggingUtils.init(
        config.log_path,
        config.log_level,
        config.log_format_file,
        config.log_format_console,
        config.log_date_format,
        config.log_filemode,
    )

    logging.info("Starting minecraft-dashboard...")

    api = DashboardApi(config)
    app.include_router(api.router)
    uvicorn.run(app, host=config.api_host, port=config.api_port, log_config=None)


if __name__ == "__main__":
    main()
