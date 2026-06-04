#!/usr/bin/env bash
# Start local stack: MySQL (Docker) + peak-backend + peak frontend.
# Usage (from anywhere): bash scripts/dev.sh
# Stop app servers: Ctrl+C. Stop DB: bash scripts/dev-down.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

ENV_FILE="$ROOT/.env"
COMPOSE_FILE="$ROOT/peak-backend/docker-compose.yml"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE — copy .env.example to .env and fill in values."
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed or not on PATH."
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker daemon is not running. Start Docker Desktop and try again."
  exit 1
fi

for dir in peak-backend peak; do
  if [[ ! -d "$ROOT/$dir/node_modules" ]]; then
    echo "Missing node_modules in $dir — run: npm install --prefix $dir"
    exit 1
  fi
done

echo "Starting MySQL (Docker)..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --wait db

cleanup() {
  echo ""
  echo "Stopping backend and frontend..."
  local pid
  for pid in $(jobs -p); do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
}

trap cleanup EXIT INT TERM

echo "Starting backend (http://localhost:3001) and frontend (http://localhost:3000)..."
echo "Press Ctrl+C to stop backend and frontend (MySQL keeps running)."
echo ""

(cd "$ROOT/peak-backend" && npm run dev) &
(cd "$ROOT/peak" && npm run dev) &

wait
