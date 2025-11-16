FROM node:24.11-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install

COPY frontend ./
COPY scripts ../scripts

RUN apk add --no-cache python3 curl ca-certificates
ADD https://astral.sh/uv/install.sh /uv-installer.sh
RUN sh /uv-installer.sh && rm /uv-installer.sh
ENV PATH="/root/.local/bin/:$PATH"

COPY pyproject.toml uv.lock ../
COPY minecraft_dashboard ../minecraft_dashboard

RUN npm run build


FROM python:3.13-slim AS backend

RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates iputils-ping

ADD https://astral.sh/uv/install.sh /uv-installer.sh

RUN sh /uv-installer.sh && rm /uv-installer.sh

ENV PATH="/root/.local/bin/:$PATH"

WORKDIR /app

COPY pyproject.toml uv.lock ./
RUN uv sync

COPY minecraft_dashboard ./minecraft_dashboard

RUN mkdir -p ./minecraft_dashboard/static
COPY --from=frontend-builder /app/frontend/dist ./minecraft_dashboard/static

CMD ["uv", "run", "python", "-m", "minecraft_dashboard"]
