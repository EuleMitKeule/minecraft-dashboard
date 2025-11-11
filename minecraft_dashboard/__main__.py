"""Main module for minecraft-dashboard."""

import argparse
import logging
import sys
from contextlib import asynccontextmanager
from pathlib import Path

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from minecraft_dashboard.api import DashboardApi
from minecraft_dashboard.config import Config
from minecraft_dashboard.utils import LoggingUtils, OpenApiUtils


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title="Minecraft Dashboard API",
    description="API for monitoring Minecraft server status",
    version="0.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def main():
    parser = argparse.ArgumentParser(description="Minecraft Dashboard Server")
    parser.add_argument(
        "--generate-openapi",
        type=str,
        metavar="OUTPUT_PATH",
        help="Generate OpenAPI specification file and exit",
    )
    arguments = parser.parse_args()

    config = Config.load()

    LoggingUtils.init(
        config.log_path,
        config.log_level,
        config.log_format_file,
        config.log_format_console,
        config.log_date_format,
        config.log_filemode,
    )

    api = DashboardApi(config)
    app.include_router(api.router)

    if arguments.generate_openapi:
        output_path = Path(arguments.generate_openapi)
        OpenApiUtils.generate_openapi_spec(app, output_path)
        sys.exit(0)

    logging.info("Starting minecraft-dashboard...")
    uvicorn.run(app, host=config.api_host, port=config.api_port, log_config=None)


if __name__ == "__main__":
    main()
