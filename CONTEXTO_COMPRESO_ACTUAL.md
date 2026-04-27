# Frozen Guild - Contexto Compreso Actual

## Estado general

- Proyecto: `Frozen Guild` (MVP web 1-4 jugadores).
- Stack: Node.js + TypeScript + boardgame.io + React/Vite.
- Arquitectura: servidor autoritativo (`shared/game`), cliente React solo solicita moves.
- Seguridad activa: `playerView` oculta IDs reales de cartas en `El Hielo` y mazo.

## Etapas implementadas (resumen)

- Etapas previas ya completas: 1 a 9.
- Etapa 10 (Espionaje): completa.
  - `spyOnIce` (1-3 slots únicos), `completeSpy`, `spyGiveCard`.
  - Revelado secreto por jugador en `playerView`.
- Etapa 11 (Intercambio): completa y ajustada.
  - `swapCards` restringido a intercambio **entre jugadores**.
  - No permite intercambio con `ice_grid`.
- Etapa 12 (El Padrino): completa.
  - Dado `6` obliga `choosePadrinoAction(1..5)`.
  - Reusa validaciones de Pesca/Espionaje/Intercambio.
- Etapa 13 (Orca): completa.
  - Resolución obligatoria `resolveOrcaDestroy`.
  - Bloquea turno mientras haya Orca pendiente.
  - Si no hay otra carta destruible: Orca se descarta sola.
- Etapa 14 (Foca-Bomba): en implementación funcional.
  - Stage obligatorio `sealBombResolution`.
  - Move `resolveSealBombExplosion`.
  - Si inicia y termina turno con Foca-Bomba, explota y exige descarte.

## Reglas/moves activos principales

- `rollDice`
- `fishFromIce`
- `spyOnIce`, `completeSpy`, `spyGiveCard`
- `swapCards` (solo jugador ↔ jugador)
- `choosePadrinoAction`
- `resolveOrcaDestroy`
- `resolveSealBombExplosion`
- `endTurn`

## Modelo de estado actual (alto nivel)

`FrozenGuildState` incluye:

- `deck`, `discardPile`, `iceGrid`
- `players[playerID].zone`, `hasBombAtStart`
- `dice: { value, rolled }`
- `turn: { actionCompleted, padrinoAction }`
- `spy`
- `orcaResolution`
- `sealBombResolution`

## Seguridad de `playerView`

- `deck` -> `"hidden"`
- `iceGrid` -> `{ hidden: true }` o `null`, salvo slots revelados por espionaje del jugador activo.
- `spy`, `orcaResolution`, `sealBombResolution` solo visibles para el jugador afectado.

## UI actual (App)

- Lobby + creación/unión de partidas.
- Panel admin con control dual (jugador 0 y 1) para self-testing rápido.
- Flujo visual para:
  - Pesca
  - Espionaje (selección y revelado en el tablero)
  - Intercambio entre jugadores
  - El Padrino
  - Resoluciones obligatorias de Orca y Foca-Bomba

## Archivos clave tocados recientemente

- `shared/game/types.ts`
- `shared/game/setup.ts`
- `shared/game/moves.ts`
- `shared/game/FrozenGuild.ts`
- `shared/game/playerView.ts`
- `web/src/App.tsx`
- `server/src/index.ts`
- `tests/rules/spy.test.ts`
- `tests/rules/swap.test.ts`
- `tests/rules/padrino.test.ts`
- `tests/rules/orca.test.ts`
- `tests/rules/seal-bomb.test.ts`

## Validación actual

- Tests: verdes (`npm run test`).
- Typecheck: verde (`npm run typecheck`).

## Pendiente inmediato solicitado por usuario

- Mejorar feedback visual de intercambio:
  - al elegir primera carta, iluminar solo cartas válidas del otro jugador;
  - ocultar/neutralizar clics inválidos de forma más evidente.
- Mejorar herramienta de debug/self-testing para recorridos completos y diagnósticos más rápidos.
