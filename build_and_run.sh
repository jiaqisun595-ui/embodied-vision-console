#!/usr/bin/env bash

set -euo pipefail

IMAGE_NAME="${IMAGE_NAME:-vision-console}"
CONTAINER_NAME="${CONTAINER_NAME:-vision-console}"
HOST_PORT="${HOST_PORT:-8080}"
CONTAINER_PORT="${CONTAINER_PORT:-8080}"

# STREAM_HOST="${STREAM_HOST:-10.110.12.58}"
STREAM_HOST="${STREAM_HOST:-192.168.197.200}"
STREAM_PORT="${STREAM_PORT:-8001}"
THOUGHT_PORT="${THOUGHT_PORT:-8080}"
RGB_URL="${RGB_URL:-http://${STREAM_HOST}:${STREAM_PORT}/rgb}"
DEPTH_URL="${DEPTH_URL:-http://${STREAM_HOST}:${STREAM_PORT}/depth}"
THOUGHT_URL="${THOUGHT_URL:-http://${STREAM_HOST}:${THOUGHT_PORT}}"
# THOUGHT_URL="${THOUGHT_URL:-http://10.110.12.58:8080}"
RECON_MODE="${RECON_MODE:-REAL}"
RECON_MAX_FRAMES="${RECON_MAX_FRAMES:-5}"
RECON_FRAME_INTERVAL="${RECON_FRAME_INTERVAL:-0.5}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if command -v docker >/dev/null 2>&1; then
  DOCKER_BIN="docker"
elif [ -x "/Applications/OrbStack.app/Contents/MacOS/xbin/docker" ]; then
  DOCKER_BIN="/Applications/OrbStack.app/Contents/MacOS/xbin/docker"
else
  echo "docker CLI not found. Install Docker CLI or make OrbStack's docker available in PATH."
  exit 1
fi

cd "$SCRIPT_DIR"

echo "Building image: $IMAGE_NAME"
"$DOCKER_BIN" build -t "$IMAGE_NAME" .

if "$DOCKER_BIN" ps -a --format '{{.Names}}' | grep -Fxq "$CONTAINER_NAME"; then
  echo "Removing existing container: $CONTAINER_NAME"
  "$DOCKER_BIN" rm -f "$CONTAINER_NAME"
fi

echo "Starting container: $CONTAINER_NAME"
"$DOCKER_BIN" run -d \
  --name "$CONTAINER_NAME" \
  -p "${HOST_PORT}:${CONTAINER_PORT}" \
  -e "RGB_URL=${RGB_URL}" \
  -e "DEPTH_URL=${DEPTH_URL}" \
  -e "THOUGHT_URL=${THOUGHT_URL}" \
  -e "RECON_MODE=${RECON_MODE}" \
  -e "RECON_MAX_FRAMES=${RECON_MAX_FRAMES}" \
  -e "RECON_FRAME_INTERVAL=${RECON_FRAME_INTERVAL}" \
  "$IMAGE_NAME"

echo "Container started."
echo "UI: http://localhost:${HOST_PORT}/embodied-vision-console/"
echo "Logs: ${DOCKER_BIN} logs -f ${CONTAINER_NAME}"
