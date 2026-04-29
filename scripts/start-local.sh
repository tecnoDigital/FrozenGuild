#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
RUN_DIR="$ROOT_DIR/.run"
LOG_DIR="$RUN_DIR/logs"
SERVER_PORT="${SERVER_PORT:-8000}"
WEB_PORT="${WEB_PORT:-5173}"

mkdir -p "$LOG_DIR"

if [ -f "$RUN_DIR/server.pid" ] || [ -f "$RUN_DIR/web.pid" ]; then
  echo "[error] Ya hay un entorno local levantado. Usa npm run stop primero."
  exit 1
fi

stop_if_running() {
  local pid_file="$1"
  if [ -f "$pid_file" ]; then
    local pid
    pid="$(cat "$pid_file")"
    if [ -n "$pid" ] && kill -0 "$pid" >/dev/null 2>&1; then
      kill -- -"$pid" >/dev/null 2>&1 || kill "$pid" >/dev/null 2>&1 || true
      sleep 1
      kill -9 -- -"$pid" >/dev/null 2>&1 || kill -9 "$pid" >/dev/null 2>&1 || true
    fi
    rm -f "$pid_file"
  fi
}

cleanup_on_error() {
  stop_if_running "$RUN_DIR/web.pid"
  stop_if_running "$RUN_DIR/server.pid"
}
trap cleanup_on_error ERR

cd "$ROOT_DIR"

setsid bash -lc 'cd "$0" && exec npm run dev -w server' "$ROOT_DIR" >"$LOG_DIR/server.log" 2>&1 &
echo $! > "$RUN_DIR/server.pid"

for _ in $(seq 1 30); do
  if ss -lnt | grep -q ":${SERVER_PORT} "; then
    break
  fi
  sleep 1
done

if ! ss -lnt | grep -q ":${SERVER_PORT} "; then
  echo "[error] El server no levantó. Revisa $LOG_DIR/server.log"
  exit 1
fi

setsid bash -lc 'cd "$0" && exec npm run dev -w web' "$ROOT_DIR" >"$LOG_DIR/web.log" 2>&1 &
echo $! > "$RUN_DIR/web.pid"

for _ in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:${WEB_PORT}" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! curl -fsS "http://127.0.0.1:${WEB_PORT}" >/dev/null 2>&1; then
  echo "[error] El frontend no levantó. Revisa $LOG_DIR/web.log"
  exit 1
fi

echo ""
echo "FrozenGuild local listo"
echo "- Frontend: http://127.0.0.1:${WEB_PORT}"
echo "- Server:   http://127.0.0.1:${SERVER_PORT}"
echo "- Logs:     $LOG_DIR"
echo ""
echo "Para apagar: npm run stop"
