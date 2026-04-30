# UI Release Candidate — Stage 30

Fecha: 2026-04-30

## Estado general

- Semana 4: completada.
- Semana 5: implementada a nivel tecnico. Pendiente cierre manual.

## QA automatizado ejecutado

- `npm run typecheck` ✅
- `npm run lint` ✅
- `npm run test` ✅
- `npm run test:critical` ✅
- `npm run build` ✅
- `npm run -w web build-storybook` ✅

## Mobile pattern implementado

- `MobileGameShell` agregado.
- `BottomSheet` agregado con tabs: `Accion`, `Mi mano`, `Rivales`.
- Board sticky arriba en mobile.
- Right rail desktop oculto en mobile por shell dedicado.
- Default tab inteligente:
  - Si es mi turno: `Accion`.
  - Si hay Orca/Foca pendiente: `Accion` y estado `half`.

## Entregables UI cerrados

- Acciones contextuales completas (Pesca, Spy, Swap, Padrino, Orca, Foca-Bomba).
- Ledger derecho con estados `Turno` y `Tu`.
- Stories críticas de Semana 4 y 5 disponibles.
- Lobby premium actualizado:
  - selector BOT por asiento.
  - panel de partidas con asientos disponibles.
  - atajo para unirse por asiento libre.
  - refresh automatico de matches en lobby.
  - `Lobby-background.png` integrado via import de assets.

## Gate release

- `npm run release:check` ✅

## Pendiente manual (smoke test)

- 2 navegadores conectados al mismo match.
- 4 jugadores si es posible.
- Ejecutar 5 partidas completas.
- Verificar reconexión/ausencia en ledger.
- Verificar Orca/Foca-Bomba end-to-end.
- Verificar lobby:
  - creacion con BOT seats.
  - lista de partidas con asientos libres.
  - join rapido por asiento.
- Verificar mobile real en viewport <900px:
  - sticky board estable.
  - bottom sheet en `collapsed/half/expanded`.
  - tabs funcionales.

## Riesgos abiertos

- Warning de chunk grande en build Storybook (no bloqueante).
- Falta evidencia documentada de 5 partidas manuales completas.
