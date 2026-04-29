#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
RUN_DIR="$ROOT_DIR/.run"
LOG_DIR="$RUN_DIR/logs"
WEB_PORT="${WEB_PORT:-5173}"
NGROK_API="http://127.0.0.1:4040/api/tunnels"

mkdir -p "$LOG_DIR"

if ! command -v ngrok >/dev/null 2>&1; then
  echo "[error] ngrok no está instalado."
  exit 1
fi

if ! ngrok config check >/dev/null 2>&1; then
  echo "[error] ngrok no está configurado. Falta authtoken."
  echo "Corre: ngrok config add-authtoken TU_TOKEN"
  exit 1
fi

if [ ! -f "$RUN_DIR/server.pid" ] || [ ! -f "$RUN_DIR/web.pid" ]; then
  "$ROOT_DIR/scripts/start-local.sh"
fi

if [ -f "$RUN_DIR/ngrok.pid" ]; then
  echo "[error] Ya hay un túnel ngrok levantado. Usa npm run stop primero."
  exit 1
fi

setsid bash -lc "exec ngrok http ${WEB_PORT}" >"$LOG_DIR/ngrok.log" 2>&1 &
echo $! > "$RUN_DIR/ngrok.pid"

for _ in $(seq 1 30); do
  if curl -fsS "$NGROK_API" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! curl -fsS "$NGROK_API" >/dev/null 2>&1; then
  echo "[error] ngrok no expuso su API local. Revisa $LOG_DIR/ngrok.log"
  exit 1
fi

PUBLIC_URL="$(python3 - <<'PY'
import json, urllib.request
with urllib.request.urlopen('http://127.0.0.1:4040/api/tunnels') as r:
    data = json.load(r)
for tunnel in data.get('tunnels', []):
    url = tunnel.get('public_url', '')
    if url.startswith('https://'):
        print(url)
        break
PY
)"
PUBLIC_URL="$(printf '%s' "$PUBLIC_URL" | tr -d '\n')"

if [ -z "$PUBLIC_URL" ]; then
  echo "[error] No pude obtener la URL pública de ngrok."
  exit 1
fi

echo "$PUBLIC_URL" > "$RUN_DIR/public-url.txt"

echo ""
echo "FrozenGuild público listo"
echo "- URL pública: $PUBLIC_URL"
echo "- Frontend local: http://127.0.0.1:${WEB_PORT}"
echo "- Logs: $LOG_DIR"
echo ""
echo "Para apagar: npm run stop"
