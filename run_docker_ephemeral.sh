#!/usr/bin/env bash
# Build-and-run helper that cleans up everything created by this build when you exit.
# - Builds an image tagged with a unique temporary tag
# - Runs the container in the foreground (Ctrl+C to stop)
# - On exit, removes the running container (if any), the built image,
#   and any other images created by this build.
#
# Usage:
#   ./run_docker_ephemeral.sh                       # serves on http://localhost:8080
#   PORT=3000 ./run_docker_ephemeral.sh             # serves on http://localhost:3000
#   PRUNE_BUILD_CACHE=0 ./run_docker_ephemeral.sh   # skip pruning BuildKit/buildx caches
set -euo pipefail

if ! command -v docker >/dev/null 2>&1; then
  echo "Error: Docker is not installed or not on PATH." >&2
  exit 1
fi

PORT="${PORT:-8080}"
PRUNE_BUILD_CACHE="${PRUNE_BUILD_CACHE:-1}"
IMAGE_BASE="terminal-portfolio"
SESSION_TAG="tmp-$(date +%s)-$$"
IMAGE_TAG="${IMAGE_BASE}:${SESSION_TAG}"
CONTAINER_NAME="${IMAGE_BASE}-run-${SESSION_TAG}"

# Track images before the build so we can identify new ones
TMP_BEFORE="$(mktemp)"; TMP_AFTER="$(mktemp)"
docker images -q | sort -u >"$TMP_BEFORE"

cleanup() {
  # Stop and remove the container (in case --rm didn't due to interruption)
  docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true

  # Remove the specifically built image
  docker rmi -f "$IMAGE_TAG" >/dev/null 2>&1 || true

  # Remove any other images that were created during this build session
  if [[ -s "$TMP_AFTER" && -s "$TMP_BEFORE" ]]; then
    # images present after build minus those present before build
    NEW_IMAGES=$(comm -13 "$TMP_BEFORE" "$TMP_AFTER" | tr '\n' ' ')
    if [[ -n "${NEW_IMAGES// }" ]]; then
      echo "Cleaning up new images created by this build…"
      # shellcheck disable=SC2086
      docker rmi -f $NEW_IMAGES >/dev/null 2>&1 || true
    fi
  fi

  # Optionally clean dangling images left by this build
  docker image prune -f >/dev/null 2>&1 || true

  # Optionally prune BuildKit/buildx caches to clear Docker Desktop "Builds" entries and free disk
  if [[ "$PRUNE_BUILD_CACHE" == "1" ]]; then
    echo "Pruning BuildKit/buildx caches (this may remove cache shared with other builds)…"
    # buildx cache prune (modern BuildKit)
    docker buildx prune -af >/dev/null 2>&1 || true
    # classic builder cache prune (legacy / compatibility)
    docker builder prune -af >/dev/null 2>&1 || true
  fi

  rm -f "$TMP_BEFORE" "$TMP_AFTER" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

# Build with a unique tag so we can remove it precisely later
echo "Building image: $IMAGE_TAG"
docker build -t "$IMAGE_TAG" .

# Snapshot images after build
docker images -q | sort -u >"$TMP_AFTER"

# Run in foreground; --rm removes the container on normal exit
# If interrupted, our trap will still ensure cleanup
echo "Running container: $CONTAINER_NAME (http://localhost:$PORT)"
docker run --rm -it \
  --name "$CONTAINER_NAME" \
  -p "$PORT:80" \
  "$IMAGE_TAG"

# When the container stops, trap will run cleanup
