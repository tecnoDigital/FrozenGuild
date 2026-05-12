# Frozen Guild — Plan final de reconstrucción del tablero

## 1. Resumen ejecutivo

El tablero actual debe reemplazarse por una implementación nueva basada en `docs/ref/Grid2.jsx`. La referencia define el machete visual principal: superficie azul profunda, grilla 3x3 inclinada en 3D, cartas cuadradas como botones nativos, hover elevado y CSS responsive simple.

La regla arquitectónica central es clara: **el tablero visual no debe conocer boardgame.io, Zustand ni reglas de dominio**. El dominio se conserva en `shared/game/*`; la nueva UI del tablero vive como feature aislada y recibe datos/callbacks desde un contenedor.

Esta reconstrucción debe ser una **implementación limpia con código nuevo**. No se migra JSX/CSS del tablero anterior salvo contratos funcionales indispensables. La copia anterior queda fuera del flujo de implementación y sirve únicamente como respaldo histórico del usuario.

## 2. Entry points / start points del proyecto

| Punto | Archivo | Responsabilidad |
| --- | --- | --- |
| Cliente React | `web/src/main.tsx` | Monta `<App />` e importa estilos globales. |
| App shell | `web/src/App.tsx` | Controla lobby/sesión, crea cliente boardgame.io y renderiza lobby o juego. |
| Pantalla de juego | `web/src/ui/screens/GameScreen.tsx` | Compone rails, tablero central y dock de acciones. |
| Contenedores de pantalla | `web/src/ui/screens/GameScreenContainers.tsx` | Conecta store/selectores con componentes UI. Debe apuntar al nuevo tablero. |
| Servidor | `server/src/index.ts` | Levanta boardgame.io, SocketIO, persistencia SQLite y observabilidad. |

## 3. Endpoints e integración runtime

| Integración | Ubicación | Uso requerido |
| --- | --- | --- |
| boardgame.io server | `server/src/index.ts` | Expone el juego `frozen-guild` y sincroniza partidas por SocketIO. |
| Cliente boardgame.io | `web/src/boardgame/client.ts` | Crea el cliente con `SocketIO({ server })`. |
| Hook de cliente | `web/src/hooks/useFrozenGuildClient.ts` | Gestiona `start`, `stop`, `subscribe` y snapshots. |
| Store bridge | `web/src/store/bgioBridge.ts` | Normaliza estado boardgame.io hacia Zustand. |
| Zustand store | `web/src/store/frozenGuildStore.ts` | Fuente de verdad UI: selección, drafts y estado visible. |
| Lobby API bg.io | servidor boardgame.io | `GET /games/frozen-guild`, `POST /games/frozen-guild/create`, `POST /games/frozen-guild/:matchID/join`. |
| Debug persistence | servidor boardgame.io | `POST /persistence/debug/clear-matches` si está habilitado. |
| Env crítica | `.env` / runtime Vite | `VITE_SERVER_URL`; revisar `VITE_PREMIUM_GAME_UI` si sigue controlando ramas UI. |

## 4. Inventario del tablero actual

### Borrar o reemplazar

- `web/src/ui/board/IceGrid.tsx`
- `web/src/ui/board/IceSlot.tsx`
- `web/src/ui/board/Card.tsx`
- `web/src/ui/board/IceHitPlane.tsx`
- `web/src/ui/board/IceGrid.module.css`
- `web/src/ui/board/Card.module.css`
- `web/src/ui/layout/CenterBoardStage.tsx`
- `web/src/ui/layout/CenterBoardStage.module.css`
- `web/src/features/game/ui/BoardSlotsContainer.tsx`
- `web/src/features/game/ui/BoardCardSlot.tsx`
- `web/src/view-model/iceGridView.ts`

### Preservar

- `shared/game/*` — reglas, movimientos, setup, scoring y tipos.
- `server/src/*` — servidor, persistencia y configuración.
- `web/src/boardgame/client.ts`
- `web/src/hooks/useFrozenGuildClient.ts`
- `web/src/store/*` — puede extenderse, no reescribirse sin necesidad.
- `web/src/App.tsx` — solo ajustar imports/rama de render si hace falta.
- `web/src/ui/screens/GameScreen.tsx` — conservar como composición de pantalla.

## 5. Arquitectura propuesta

```text
shared/game/                 Dominio puro: reglas, tipos, movimientos
server/src/                  Runtime servidor boardgame.io
web/src/App.tsx              Application shell
web/src/ui/screens/          Composición de pantalla
web/src/features/board/      Nueva feature del tablero final
web/src/view-model/boardView.ts Adaptador de estado a vista
web/src/store/               Estado UI y puente con boardgame.io
```

### Nueva feature `features/board`

| Componente | Tipo | Responsabilidad |
| --- | --- | --- |
| `BoardContainer.tsx` | Container | Lee store/selectores, calcula slots clickeables/seleccionados y traduce clicks a acciones. |
| `BoardSurface.tsx` | Presentacional | Shell visual basado en `.board-surface` de `Grid2.jsx`. |
| `FrozenIceGrid.tsx` | Presentacional | Grilla 3x3 inclinada, recibe `cards`, `selectedSlots`, `clickableSlots`, `onSlotClick`. |
| `FrostCard.tsx` | Presentacional | Botón accesible por slot, basado en `.frost-card` y `.card-inner`. |
| `FrozenIceGrid.module.css` | Estilos | CSS extraído de `Grid2.jsx` y adaptado a CSS Modules. |

Reglas obligatorias:

1. Los componentes presentacionales no importan Zustand, boardgame.io ni `shared/game/FrozenGuild`.
2. El contenedor no define estética; solo adapta estado y eventos.
3. Los clicks deben ser botones nativos. Se elimina `IceHitPlane` salvo que los tests demuestren zonas muertas imposibles de resolver.
4. El diseño visual sale de `docs/ref/Grid2.jsx`, no del tablero anterior.
5. El código del tablero debe escribirse nuevo desde cero: nombres, estructura y CSS orientados a la arquitectura final, no a parchear la implementación previa.

## 6. Mapeo visual desde `Grid2.jsx`

- `.board-preview-shell` → layout/shell de pantalla o wrapper del stage.
- `.board-surface` → `BoardSurface`.
- `.ice-grid` → `FrozenIceGrid`.
- `.frost-card` → `FrostCard` como `<button>`.
- `.card-inner` → capa interna de la carta; puede recibir icono/imagen/estado sin romper el borde helado.

## 7. Checklist de implementación

1. Crear `web/src/features/board/ui/` con `BoardSurface`, `FrozenIceGrid`, `FrostCard` y CSS Module.
2. Crear `web/src/view-model/boardView.ts` reemplazando `iceGridView.ts`.
3. Crear `BoardContainer.tsx` para conectar store, selectors y callbacks del tablero.
4. Reemplazar referencias en `GameScreenContainers.tsx` / `GameScreen.tsx`.
5. Eliminar archivos legacy listados en la sección 4.
6. Actualizar tests de contrato en `tests/web/*` para los nuevos nombres/componentes.
7. Ejecutar verificación de tipos y tests cuando la implementación esté lista. **No ejecutar build**.

## 8. Riesgos y mitigaciones

- **Grid2 es visual, no funcional**: hay que agregar contenido de carta sin contaminar el componente visual. Mitigación: `FrostCard` recibe datos mínimos y renderiza una capa interna opcional.
- **Clicks en 3D**: `rotateX` puede afectar hit areas. Mitigación: botones nativos, `focus-visible`, `data-slot-index` y tests de boundary.
- **Modos especiales**: pesca, espionaje, orca e intercambio dependen de selección/drafts. Mitigación: migrar esa lógica al `BoardContainer`, no al presentacional.
- **Tests existentes acoplados a nombres viejos**: actualizar contratos hacia `FrozenIceGrid`/`FrostCard`, manteniendo comportamiento.
- **Deuda visual previa**: no mezclar estilos legacy con Grid2. Si se conserva algo, debe estar justificado por integración funcional, no por comodidad.

## 9. Resultado final esperado

Un tablero final, limpio y competitivo: 3x3, perspectiva helada, accesible, desacoplado del dominio, conectado al estado real del juego y preparado para producción sin arrastrar la implementación visual anterior.
