#!/usr/bin/env bash
set -euo pipefail

FRONTEND_CONTAINER="${FRONTEND_CONTAINER:-taskluid-frontend}"
BACKEND_DOCKER_NETWORK="${BACKEND_DOCKER_NETWORK:-task-luid-backend_app-network}"
BACKEND_HOSTNAME="${BACKEND_HOSTNAME:-task-luid-backend}"
BACKEND_CONTAINER="${BACKEND_CONTAINER:-task-luid-backend}"
BACKEND_PORT="${BACKEND_PORT:-8000}"
# Use localhost:3000 for internal smoke tests during CI/CD deployment
# The external URL (https://taskluid.com) may not be reachable from self-hosted runners
PUBLIC_BASE_URL="${PUBLIC_BASE_URL:-http://localhost:3000}"

echo "[check:runtime] Verifying frontend container exists..."
docker inspect "$FRONTEND_CONTAINER" >/dev/null

echo "[check:runtime] Verifying required docker network exists..."
docker network inspect "$BACKEND_DOCKER_NETWORK" >/dev/null

echo "[check:runtime] Verifying frontend is attached to backend network..."
network_json="$(docker inspect -f '{{json .NetworkSettings.Networks}}' "$FRONTEND_CONTAINER")"
if [[ "$network_json" != *"\"$BACKEND_DOCKER_NETWORK\""* ]]; then
  echo "[check:runtime] $FRONTEND_CONTAINER is not attached to $BACKEND_DOCKER_NETWORK"
  exit 1
fi

echo "[check:runtime] Verifying backend container exists..."
docker inspect "$BACKEND_CONTAINER" >/dev/null

echo "[check:runtime] Verifying backend is attached to backend network..."
backend_network_json="$(docker inspect -f '{{json .NetworkSettings.Networks}}' "$BACKEND_CONTAINER")"
if [[ "$backend_network_json" != *"\"$BACKEND_DOCKER_NETWORK\""* ]]; then
  echo "[check:runtime] $BACKEND_CONTAINER is not attached to $BACKEND_DOCKER_NETWORK"
  exit 1
fi

echo "[check:runtime] Verifying backend DNS resolution from frontend container..."
docker exec "$FRONTEND_CONTAINER" sh -lc "command -v getent >/dev/null && getent hosts $BACKEND_HOSTNAME >/dev/null" \
  || docker exec "$FRONTEND_CONTAINER" sh -lc "command -v nslookup >/dev/null && nslookup $BACKEND_HOSTNAME >/dev/null" \
  || docker exec "$FRONTEND_CONTAINER" sh -lc "command -v ping >/dev/null && ping -c 1 $BACKEND_HOSTNAME >/dev/null" \
  || docker exec "$FRONTEND_CONTAINER" sh -lc "command -v getent >/dev/null && getent hosts backend >/dev/null" \
  || docker exec "$FRONTEND_CONTAINER" sh -lc "command -v nslookup >/dev/null && nslookup backend >/dev/null" \
  || docker exec "$FRONTEND_CONTAINER" sh -lc "command -v ping >/dev/null && ping -c 1 backend >/dev/null"

echo "[check:runtime] Verifying backend auth endpoint from frontend container..."
docker exec "$FRONTEND_CONTAINER" sh -lc "curl -fsS http://$BACKEND_HOSTNAME:$BACKEND_PORT/auth/status >/dev/null"

echo "[check:runtime] Verifying nginx runtime config does not contain unresolved BACKEND_HOST placeholder..."
if docker exec "$FRONTEND_CONTAINER" sh -lc "grep -q '\\\${BACKEND_HOST}' /etc/nginx/nginx.conf"; then
  echo "[check:runtime] Unresolved \${BACKEND_HOST} found in /etc/nginx/nginx.conf"
  exit 1
fi

echo "[check:runtime] Verifying public /auth/status..."
status_http="$(curl -sS -o /tmp/taskluid-auth-status.json -w '%{http_code}' "$PUBLIC_BASE_URL/auth/status")"
if [[ "$status_http" != "200" ]]; then
  echo "[check:runtime] $PUBLIC_BASE_URL/auth/status returned HTTP $status_http"
  exit 1
fi

if ! grep -q '"isAuthenticated"' /tmp/taskluid-auth-status.json; then
  echo "[check:runtime] /auth/status response did not contain expected payload"
  exit 1
fi

echo "[check:runtime] Verifying public /auth/callback route..."
callback_http="$(curl -sS -o /tmp/taskluid-auth-callback.html -w '%{http_code}' "$PUBLIC_BASE_URL/auth/callback?code=synthetic&state=synthetic")"
if [[ "$callback_http" != "200" ]]; then
  echo "[check:runtime] $PUBLIC_BASE_URL/auth/callback returned HTTP $callback_http"
  exit 1
fi

if grep -q '"error":"Bad Gateway"' /tmp/taskluid-auth-callback.html; then
  echo "[check:runtime] /auth/callback returned backend gateway JSON instead of SPA"
  exit 1
fi

if ! grep -q '<div id="root"' /tmp/taskluid-auth-callback.html; then
  echo "[check:runtime] /auth/callback response did not look like SPA HTML"
  exit 1
fi

echo "[check:runtime] Verifying /robots.txt returns proper content (not SPA HTML)..."
robots_http="$(curl -sS -o /tmp/taskluid-robots.txt -w '%{http_code}' "$PUBLIC_BASE_URL/robots.txt")"
if [[ "$robots_http" != "200" ]]; then
  echo "[check:runtime] $PUBLIC_BASE_URL/robots.txt returned HTTP $robots_http"
  exit 1
fi

if grep -q '<div id="root"' /tmp/taskluid-robots.txt; then
  echo "[check:runtime] /robots.txt returned SPA HTML instead of text content"
  exit 1
fi

if ! grep -q '^User-agent:' /tmp/taskluid-robots.txt; then
  echo "[check:runtime] /robots.txt does not contain expected 'User-agent:' directive"
  exit 1
fi

echo "[check:runtime] Verifying /sitemap.xml returns proper content (not SPA HTML)..."
sitemap_http="$(curl -sS -o /tmp/taskluid-sitemap.xml -w '%{http_code}' "$PUBLIC_BASE_URL/sitemap.xml")"
if [[ "$sitemap_http" != "200" ]]; then
  echo "[check:runtime] $PUBLIC_BASE_URL/sitemap.xml returned HTTP $sitemap_http"
  exit 1
fi

if grep -q '<div id="root"' /tmp/taskluid-sitemap.xml; then
  echo "[check:runtime] /sitemap.xml returned SPA HTML instead of XML content"
  exit 1
fi

if ! grep -q '<urlset' /tmp/taskluid-sitemap.xml; then
  echo "[check:runtime] /sitemap.xml does not contain expected '<urlset>' element"
  exit 1
fi

echo "[check:runtime] OK"
