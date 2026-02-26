#!/usr/bin/env bash
set -euo pipefail

CONFIG_FILE="${1:-nginx.conf}"

if [[ ! -f "$CONFIG_FILE" ]]; then
  echo "[check:nginx-routing] Missing config file: $CONFIG_FILE"
  exit 1
fi

line_of() {
  local pattern="$1"
  grep -n "$pattern" "$CONFIG_FILE" | head -n1 | cut -d: -f1
}

require_line() {
  local name="$1"
  local value="$2"
  if [[ -z "$value" ]]; then
    echo "[check:nginx-routing] Missing required route: $name"
    exit 1
  fi
}

callback_line="$(line_of 'location = /auth/callback {')"
callback_slash_line="$(line_of 'location = /auth/callback/ {')"
reset_line="$(line_of 'location = /auth/reset-password {')"
reset_slash_line="$(line_of 'location = /auth/reset-password/ {')"
register_line="$(line_of 'location ~ ^/auth/register/?$ {')"
auth_proxy_line="$(line_of 'location /auth/ {')"

require_line "/auth/callback" "$callback_line"
require_line "/auth/callback/" "$callback_slash_line"
require_line "/auth/reset-password" "$reset_line"
require_line "/auth/reset-password/" "$reset_slash_line"
require_line "/auth/register" "$register_line"
require_line "/auth/ (proxy)" "$auth_proxy_line"

if (( callback_line >= auth_proxy_line )); then
  echo "[check:nginx-routing] /auth/callback must be defined before /auth/ proxy."
  exit 1
fi

if (( callback_slash_line >= auth_proxy_line )); then
  echo "[check:nginx-routing] /auth/callback/ must be defined before /auth/ proxy."
  exit 1
fi

if (( reset_line >= auth_proxy_line )); then
  echo "[check:nginx-routing] /auth/reset-password must be defined before /auth/ proxy."
  exit 1
fi

if (( reset_slash_line >= auth_proxy_line )); then
  echo "[check:nginx-routing] /auth/reset-password/ must be defined before /auth/ proxy."
  exit 1
fi

if (( register_line >= auth_proxy_line )); then
  echo "[check:nginx-routing] /auth/register must be defined before /auth/ proxy."
  exit 1
fi

if ! grep -q '\${BACKEND_HOST}' "$CONFIG_FILE"; then
  echo "[check:nginx-routing] BACKEND_HOST placeholder missing; expected templated upstream."
  exit 1
fi

echo "[check:nginx-routing] OK"
