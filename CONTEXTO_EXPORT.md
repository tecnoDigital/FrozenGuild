# Frozen Guild - Contexto Exportable

## Estado actual

- Proyecto: `Frozen Guild` (MVP web 1-4 jugadores).
- Stack: Node.js + TypeScript + boardgame.io + React/Vite.
- Estado de avance: etapas 1 a 9 implementadas (base, cartas, setup, turno base, pesca, scoring, multiplayer base, playerView seguro).
- Regla clave de seguridad ya activa: el cliente **no** recibe IDs reales de cartas ocultas de `El Hielo`.

## Reglas de entorno

- Node recomendado: `20` o `22`.
- No usar Node `24` con `boardgame.io@0.50.x`.
- Archivo guía: `Frozen_Guild_MVP_Final.md`.

## Estructura clave

- `shared/game/` -> reglas autoritativas del juego.
- `server/src/index.ts` -> servidor boardgame.io.
- `web/src/` -> cliente React + lobby + vista de partida.
- `tests/` -> pruebas de reglas, scoring e integración.

## Módulos y funciones importantes

## `shared/game/cards.ts`

- `ALL_CARDS`: catálogo completo de cartas.
- `CARD_TYPE_COUNTS`: conteo por tipo.
- `getCardById(cardId)`: lookup de metadata de carta.

## `shared/game/card-distribution.ts`

- `PENGUIN_VALUE_DISTRIBUTION`: distribución de pingüinos por valor.
- `PENGUIN_ART_BY_VALUE`: arte independiente para pingüino 1/2/3.
- Regla actual: pingüino valor `3` aparece exactamente `3` veces.

## `shared/game/deck.ts`

- `createDeck()`: crea mazo como `CardId[]`.
- `shuffleDeck(cards, randomFn?)`: mezcla mazo.
- `drawCard(deck)`: roba carta superior.
- `discardCard(discardPile, cardId)`: agrega carta al descarte.

## `shared/game/setup.ts`

- `createInitialState(playerCount, randomFn?)`: setup inicial de partida.
- Constantes:
  - `MIN_PLAYERS = 1`
  - `MAX_PLAYERS = 4`
  - `ICE_GRID_SIZE = 9`
  - `INITIAL_HAND_SIZE = 3`
- Reglas de setup:
  - Crea `El Hielo` 3x3.
  - Reparte mano inicial.
  - **No** reparte rojas en mano inicial (`orca`, `seal_bomb`).

## `shared/game/moves.ts`

- `rollDice(...)`: 1 tirada por turno, solo jugador activo.
- `fishFromIce(..., slot)`: pesca para resultados 1-3, mueve carta a zona, repone desde mazo.
- `endTurn(...)`: bloquea si falta acción obligatoria (por ejemplo pesca 1-3 no resuelta).
- `resetTurnState(G)`: resetea estado de turno al comenzar turno.

## `shared/game/scoring.ts`

- `calculateFinalScores(players)` devuelve score final por jugador con breakdown.
- Criterios implementados:
  - Pingüino: suma de valores.
  - Morsa: bonus sobre pingüinos (máximo 1 morsa por pingüino).
  - Petrel: par suma, impar castiga.
  - Elefante Marino: `N^2`.
  - Krill: mayoría bono, no mayoría/cero castigo.

## `shared/game/playerView.ts`

- `buildPlayerView(G)` filtra estado sensible para cliente:
  - `deck` -> `"hidden"`.
  - `iceGrid` -> `{ hidden: true }` o `null`.

## `shared/game/FrozenGuild.ts`

- Configuración central de boardgame.io:
  - `setup` -> `createInitialState`.
  - `turn.onBegin` -> `resetTurnState`.
  - `moves` -> `rollDice`, `fishFromIce`, `endTurn`.
  - `playerView` -> `buildPlayerView`.

## Multiplayer (Etapa 8)

## Server

- `server/src/index.ts` levanta boardgame.io con `FrozenGuild`.
- Endpoint base de API: `/games/frozen-guild`.

## Cliente web

- `web/src/boardgame/client.ts` crea cliente SocketIO:
  - recibe `serverUrl`, `matchID`, `playerID`, `credentials`.
- `web/src/App.tsx`:
  - Crear partida (`/create`).
  - Listar partidas.
  - Join con `playerID` + `playerName`.
  - Usar `playerCredentials` para conexión real.
  - Mostrar tablero y zonas en tiempo real.

## Tipos de estado importantes

Archivo: `shared/game/types.ts`

- `FrozenGuildState` incluye:
  - `deck: CardId[]`
  - `discardPile: CardId[]`
  - `iceGrid: (CardId | null)[]` (filtrado en `playerView`)
  - `players: Record<PlayerID, PlayerState>`
  - `dice: { value: number | null; rolled: boolean }`
  - `turn: { actionCompleted: boolean }`

## Pruebas actuales

## Reglas

- `tests/rules/deck.test.ts`
- `tests/rules/setup.test.ts`
- `tests/rules/turn-basic.test.ts`
- `tests/rules/fishing.test.ts`
- `tests/rules/turn-integration.test.ts`
- `tests/rules/multiplayer-base.test.ts`
- `tests/rules/player-view.test.ts`

## Scoring

- `tests/scoring/scoring-base.test.ts`

Estado: todas en verde al momento de exportar este contexto.

## Comandos útiles

```bash
npm install
npm run dev
npm run test
npm run typecheck
npm run lint
npm run build
```

## Qué sigue en roadmap

- Etapa 10: Espionaje.
- Etapa 11: Intercambio.
- Etapa 12: El Padrino.
- Etapa 13: Orca.
- Etapa 14: Foca-Bomba.

## Notas de diseño

- Servidor autoritativo: reglas en `shared/game`, no en frontend.
- Cliente pide moves; validación fuerte en servidor.
- `CardId[]` en estado para facilitar seguridad, persistencia y ocultamiento.
