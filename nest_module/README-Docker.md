# NestJS Integration API - Docker Setup

This document provides instructions for running the NestJS Integration API in Docker containers.

## Quick Start

### Using Docker Compose (Recommended)

1. **Production Mode:**
   ```bash
   npm run compose:up
   ```
   Access the API at: http://localhost:3001

2. **Development Mode:**
   ```bash
   npm run compose:up:dev
   ```
   Includes hot-reload with volume mounting.

3. **Stop Services:**
   ```bash
   npm run compose:down
   ```

### Using Docker Commands

1. **Build the Image:**
   ```bash
   npm run docker:build
   ```

2. **Run the Container:**
   ```bash
   npm run docker:run
   ```

3. **Stop and Clean:**
   ```bash
   npm run docker:stop
   npm run docker:clean
   ```

## Available Endpoints

Once running, the API provides:

- **Health Check:** `GET http://localhost:3001/health`
- **Integration Reports:** `GET http://localhost:3001/integration/reports/summary`
- **Webhook Handler:** `POST http://localhost:3001/integration/webhook`
- **Customer Analytics:** `GET http://localhost:3001/integration/customers/analytics`
- **Invoice Metrics:** `GET http://localhost:3001/integration/invoices/metrics`
- **Data Transform:** `POST http://localhost:3001/integration/data/transform`

## Environment Configuration

Copy `.env.example` to `.env` and configure as needed:

```bash
cp .env.example .env
```

## Docker Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run docker:build` | Build production image |
| `npm run docker:build:dev` | Build development image |
| `npm run docker:run` | Run production container |
| `npm run docker:run:dev` | Run development container with volumes |
| `npm run docker:stop` | Stop and remove production container |
| `npm run docker:stop:dev` | Stop and remove development container |
| `npm run docker:clean` | Remove containers and images |
| `npm run compose:up` | Start with docker-compose (production) |
| `npm run compose:up:dev` | Start with docker-compose (development) |
| `npm run compose:down` | Stop docker-compose services |
| `npm run compose:logs` | View container logs |
| `npm run compose:build` | Build images with docker-compose |

## Container Features

- **Multi-stage build** for optimized production images
- **Non-root user** for enhanced security
- **Health checks** for container monitoring
- **Alpine Linux** base for minimal image size
- **Development mode** with hot-reload support
- **Production optimizations** with npm ci and cache cleaning

## Network Configuration

The containers use a custom bridge network `idurar-network` which allows:
- Isolation from other Docker networks
- Inter-container communication
- Custom DNS resolution between services

## Monitoring

Health check endpoint is available at `/health` and provides:
- Service status
- Current timestamp
- Process uptime

The Docker health check automatically monitors this endpoint every 30 seconds.