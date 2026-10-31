#!/usr/bin/env bash
# Builds and (re)starts the practitioner portal on the VPS.
# Usage: bash /root/deploy-portal.sh
set -euo pipefail
REPO_DIR=/root/AnywhereHealing-Portal      # clone of the portal repo
BRANCH=${PORTAL_BRANCH:-main2}

git -C "$REPO_DIR" fetch origin
git -C "$REPO_DIR" checkout "$BRANCH"
git -C "$REPO_DIR" pull --ff-only origin "$BRANCH"
echo "Deploying portal $(git -C "$REPO_DIR" log -1 --oneline)"

cd "$REPO_DIR/deploy"
docker compose -f docker-compose.portal.yml up -d --build
sleep 5
docker compose -f docker-compose.portal.yml ps
