# UI Audit Stage 23

## Hallazgos

- `web/src/App.tsx` concentra lobby, partida, admin dual, debug y reglas visuales.
- `web/src/styles.css` mezcla estilos de muchas pantallas en un solo archivo global.
- `web/src/boardgame/client.ts` esta limpio y reusable.

## Riesgos

- Alto acoplamiento visual a estado global.
- Rerenders grandes por snapshots de boardgame.io.
- Iteracion de UI lenta y riesgosa.

## Accion tomada en semana 1

- Se instalo Storybook, Zustand y Framer Motion en `web`.
- Se creo base de carpetas nuevas (`ui`, `store`, `view-model`, `hooks`, `styles`, `stories`).
- Se creo bridge inicial Zustand (`frozenGuildStore`, `bgioBridge`, `selectors`).
- Se crearon componentes base y stories minimas.
- App legacy sigue intacta y funcional.
