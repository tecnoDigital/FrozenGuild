# Frozen Guild

Base inicial del MVP de Frozen Guild.

## Stack

- Node.js + TypeScript
- boardgame.io
- React + Vite
- SQLite (WAL)

## Estructura

```txt
frozen-guild/
  web/
  server/
  shared/
    game/
```

## Requisitos

- Node.js 20 o 22 (Node 24 no es compatible con boardgame.io 0.50.x)

## Comandos

```bash
npm install
npm run dev
```

Esto levanta:

- Web: `http://localhost:5173`
- Server: `http://localhost:8000`

Build y chequeos:

```bash
npm run typecheck
npm run lint
npm run build
```

## Persistencia (Etapa 17)

- Base SQLite por defecto: `data/frozen-guild.db`
- Override por env: `SQLITE_PATH=/ruta/custom.db`
- Health endpoint: `GET /persistence/health`

## Produccion VPS (Etapa 18)

- PM2 config: `ecosystem.config.cjs`
- Nginx sample: `deploy/nginx/frozen-guild.conf`
- Nginx production: `deploy/nginx/frozen-guild.production.conf`
- Env ejemplo server: `server/.env.production.example`
- Env ejemplo web: `web/.env.production.example`
- Release script build+deploy: `scripts/release.sh`

Flujo rapido:

```bash
npm run build
pm2 start ecosystem.config.cjs
pm2 save
```

Release completo en VPS:

```bash
npm run release:prod
```

## Observabilidad minima (Etapa 19)

- Health: `GET /ops/health`
- Metrics: `GET /ops/metrics`
- Persistence health: `GET /persistence/health`
- Logs cada 30s con mesas activas/pausadas y memoria.
- Logs HTTP y logs de moves (`[move]` / `[move:error]`).

## Testing critico (Etapa 20)

- Full match flow: `tests/rules/full-match-critical.test.ts`
- SQLite persistence: `tests/server/storage-persistence.test.ts`
- Observability endpoints: `tests/server/observability.test.ts`
- Server env parsing: `tests/server/config.test.ts`

Comando rapido:

```bash
npm run test:critical
```

## Release candidate (Etapa 22)

- Guia RC: `RELEASE_CANDIDATE_STAGE_22.md`
- Backup SQLite: `npm run backup:sqlite`
- Restore SQLite: `npm run restore:sqlite -- "backups/<archivo>.db"`
- Retención backup: `BACKUP_RETENTION_DAYS` (default 7)
- Check completo pre-RC:

```bash
npm run release:check
```
