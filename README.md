# Frozen Guild

Base inicial del MVP de Frozen Guild.

## Stack

- Node.js + TypeScript
- boardgame.io
- React + Vite

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
