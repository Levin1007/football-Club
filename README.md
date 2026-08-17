# Football Club Manager

Starter application for Module 324 — DevOps Processes Project.

## Overview

This project contains a small frontend and backend application. The functional scope is intentionally limited. The goal is to improve the DevOps process: local setup, Git workflow, CI pipeline, reports, artifacts, load testing, deployment and logs.

The application supports basic CRUD operations and two theme-specific actions: Extend contract, Raise salary.

## Services

| Service | Description | URL |
|---|---|---|
| frontend | Static web interface | http://localhost:8080 |
| backend through proxy | API through Nginx proxy | http://localhost:8080/api/health |
| backend direct access | FastAPI backend | http://localhost:8000 |
| backend docs | OpenAPI documentation | http://localhost:8000/docs |

## Requirements

- Docker or Docker Desktop
- Docker Compose
- Git
- A code editor

## Start the project

```bash
docker compose up -d --build
```

Check the running containers:

```bash
docker compose ps
```

Stop the project:

```bash
docker compose down
```

## Local configuration

Copy the example environment file if you need to customize ports or values:

```bash
cp .env.example .env
```

Do not commit real secrets.

## Useful backend commands

```bash
cd backend
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
pytest
ruff check .
```

## Main API endpoints

```text
GET    /health
GET    /items
POST   /items
PUT    /items/{item_id}
DELETE /items/{item_id}
POST   /items/{item_id}/actions/{action_id}
```

## Repository structure

```text
frontend/
backend/
docs/
evidence/
loadtest/
deployment/
Jenkinsfile
docker-compose.yml
README.md
```
