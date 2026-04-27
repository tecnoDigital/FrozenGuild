#!/usr/bin/env sh
set -eu

APP_ROOT="${APP_ROOT:-$(pwd)}"
SERVER_PORT="${SERVER_PORT:-8000}"
RUN_CHECKS="${RUN_CHECKS:-1}"
RUN_BACKUP="${RUN_BACKUP:-1}"
NGINX_CONF_SOURCE="${NGINX_CONF_SOURCE:-deploy/nginx/frozen-guild.production.conf}"
NGINX_SITE_PATH="${NGINX_SITE_PATH:-/etc/nginx/sites-available/frozen-guild}"

printf '%s\n' "[release] root: ${APP_ROOT}"
cd "${APP_ROOT}"

printf '%s\n' "[release] installing dependencies"
npm ci

if [ "${RUN_CHECKS}" = "1" ]; then
  printf '%s\n' "[release] running checks"
  npm run release:check
else
  printf '%s\n' "[release] checks skipped (RUN_CHECKS=${RUN_CHECKS})"
  npm run build
fi

if [ "${RUN_BACKUP}" = "1" ]; then
  if [ -f "./data/frozen-guild.db" ]; then
    printf '%s\n' "[release] creating sqlite backup"
    npm run backup:sqlite
  else
    printf '%s\n' "[release] sqlite file not found, backup skipped"
  fi
fi

printf '%s\n' "[release] reloading pm2 process"
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save

if [ -f "${NGINX_CONF_SOURCE}" ] && [ -d "$(dirname "${NGINX_SITE_PATH}")" ]; then
  printf '%s\n' "[release] installing nginx config"
  cp "${NGINX_CONF_SOURCE}" "${NGINX_SITE_PATH}"
  nginx -t
  if command -v systemctl >/dev/null 2>&1; then
    systemctl reload nginx
  else
    nginx -s reload
  fi
else
  printf '%s\n' "[release] nginx config install skipped"
fi

if command -v curl >/dev/null 2>&1; then
  printf '%s\n' "[release] checking health endpoint"
  curl -fsS "http://127.0.0.1:${SERVER_PORT}/ops/health"
  printf '\n'
fi

printf '%s\n' "[release] done"
