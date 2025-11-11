
# Minecraft Dashboard

A modern web dashboard for monitoring Minecraft server status with automatic type-safe API client generation.

## Features

- Real-time Minecraft server status monitoring
- Automatic OpenAPI client generation
- Type-safe API integration with TypeScript
- No backend server required for client generation

## Quick Start

### Backend

```bash
# Install dependencies
uv sync

# Run the server
uv run python -m minecraft_dashboard
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Generate API client
npm run generate:client

# Start development server
npm run dev

# Build for production
npm run build
```
