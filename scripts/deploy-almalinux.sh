#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/boighor-commerce}"
BRANCH="${BRANCH:-main}"

if [ ! -d "$APP_DIR/.git" ]; then
  echo "Project git repo not found at $APP_DIR"
  echo "Clone it first, for example:"
  echo "git clone https://github.com/YOUR_USERNAME/boighor-commerce.git $APP_DIR"
  exit 1
fi

cd "$APP_DIR"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"
docker compose up --build -d
docker compose ps
