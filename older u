# Frozen Guild — UI Production Plan Premium · 5 Semanas

**Objetivo:** convertir la UI actual de Frozen Guild en una interfaz desktop-first 16:9, limpia, jugable, con cara de demo para inversionistas y lista para partidas MVP reales.

**Cambio principal respecto al plan anterior:**  se agrega Storybook para desarrollar UI aislada ( solo si es nesecaria ), Zustand como traductor/selectores de estado, micro-interacciones controladas con Framer Motion solo en cartas, y un patrón móvil real con tablero sticky + bottom sheet.

**Stack base respetado:** Node.js + TypeScript, boardgame.io, React + Vite, SQLite WAL, PM2/Nginx en producción.

**Nuevas dependencias autorizadas para UI Premium:**

- `zustand`: puente de estado y selectores granulares entre boardgame.io y React.
- `framer-motion`: autorizado exclusivamente para transiciones `layout` / `layoutId` en componentes de carta.
- `storybook`: entorno aislado para construir y probar componentes sin jugar turnos completos.

---

## 0. Decisiones cerradas por producto

- Desktop-first 16:9.
- Mobile no perfecto, pero arquitectónicamente viable.
- UI principal dividida en 4 zonas:
  1. Izquierda: estado del jugador / mesa / turno / mazo / sesión.
  2. Centro arriba: `ActionBanner` + tablero El Hielo 3x3 compacto.
  3. Centro abajo: dado + acciones contextuales.
  4. Derecha: manos visibles, puntaje, rivales y estado de conexión solo cuando haya inestabilidad.
- Cartas adquiridas por jugadores siempre visibles.
- Puntuaciones siempre visibles.
- Acción siguiente visible arriba del tablero, al centro.
- Acción 5 / Intercambio: flujo carta origen → carta destino → confirmar.
- Acción 6 / El Padrino: opciones 1-5 desplegadas solo cuando sale 6.
- Sin drag & drop.
- CSS Modules.
- UI limpia jugable, pero con presencia visual suficiente para demo.
- Estados de conexión de rivales ocultos cuando todo está normal; visibles solo si hay `reconnecting`, `absent` o contador activo.
- Micro-interacciones permitidas solo en cartas, sin coreografías ni animaciones complejas.

---

## 1. Lectura del estado actual del repo

El repo ya no está en etapa cero. Ya existe una base funcional:

- Monorepo con workspaces `web` y `server`.
- `web` usa React + Vite + boardgame.io client.
- `server` usa boardgame.io + SQLite.
- Hay persistencia, observabilidad mínima, PM2/Nginx, release scripts y checks.
- Hay guía UI de etapa 21.1 enfocada en conexión, mesa activa/pausada, reconexión, ausencia y bloqueo de acciones.
- Hay release candidate etapa 22 con criterios de 5 partidas completas, 0 bugs bloqueantes y backup/restore probado.

### Problema real actual

La UI ya existe, pero está demasiado concentrada en `web/src/App.tsx` y `web/src/styles.css`.

Eso sirve para validar reglas, pero no para una UI premium porque:

- Mezcla lobby, tablero, acciones, debug, admin dual, conexión y lógica visual en una sola pantalla.
- Dificulta iterar diseño sin romper reglas.
- Hace riesgoso meter assets nuevos.
- Inyecta demasiado estado global directamente en la UI.
- Todavía se siente más como panel técnico que como juego.

**Veredicto:** no rehacer reglas. No tocar motor salvo bug evidente con test. La UI debe extraerse por capas, componentes, Storybook y selectores.

---

## 2. Desglose visual de las 3 imágenes

## 2.1 Imagen 1 — Lobby / pantalla demo

### Función

Debe vender el juego antes de jugarlo.

No es solo formulario. Es la primera impresión del producto.

### Elementos que se conservan

- Logo Frozen Guild grande.
- Fondo polar/subacuático/ártico con profundidad.
- Bloque principal para nombre del jugador.
- Bloque de sala: crear sala / unirse a sala.
- Lista de jugadores en sala.
- Botón CTA grande: `Romper el hielo`.
- Preview de cartas a la derecha.
- Carta grande seleccionada como explicación rápida.

### Versión producción MVP

```txt
┌───────────────────────────────────────────────────────────────┐
│ LOGO / claim                                                  │
├───────────────────────────────┬───────────────────────────────┤
│ Panel lobby                   │ Preview de cartas              │
│ - nombre                      │ - carrusel estático            │
│ - sala                        │ - carta destacada              │
│ - iconos                      │ - texto corto de efecto        │
│ - crear/unirse                │ -         │
│ - jugadores                   │                               │
│ - romper el hielo             │                               │
└───────────────────────────────┴───────────────────────────────┘
```

### Componentes

- `LobbyScreen.tsx`
- `LobbyHero.tsx`
- `LobbyForm.tsx`
- `RoomPlayersPanel.tsx`
- `ExpeditionPreview.tsx`
- `FeaturedCardPreview.tsx`
- `LobbyBackground.tsx`

### Criterio de aceptación

Un inversionista debe entender en menos de 10 segundos:

- Cómo se llama el juego.
- Que es un juego de cartas.
- Que se crea o se une a una sala.
- Quién está dentro.
- Cuál es el botón para iniciar.

---

## 2.2 Imagen 2 — Tablero / partida centro-izquierda

### Función

Debe ser la pantalla jugable principal.

La prioridad es que el jugador sepa:

1. De quién es el turno.
2. Qué acción toca.
3. Qué puede seleccionar.
4. Qué falta para continuar.

### Layout desktop aprobado

```txt
┌───────────────┬──────────────────────────────┬──────────────────────┐
│ IZQUIERDA     │ CENTRO ARRIBA                │ DERECHA              │
│ Estado jugador│ Action Banner                │ Manos / puntaje      │
│ Mesa/turno    │ El Hielo 3x3                 │ Rivales              │
│ Mazo/sesión   │                              │ Estado conexión      │
├───────────────┼──────────────────────────────┤                      │
│               │ CENTRO ABAJO                 │                      │
│               │ Dado + acción contextual     │                      │
│               │ Confirmaciones               │                      │
└───────────────┴──────────────────────────────┴──────────────────────┘
```

### Centro arriba

- Tablero 3x3 compacto.
- Cartas boca abajo con reverso real.
- Encima del tablero: `ActionBanner`.
- El banner manda sobre todo:
  - `Tu turno: lanza el dado`.
  - `Pesca: elige una carta del Hielo`.
  - `Espionaje: elige hasta 3 cartas para mirar`.
  - `Intercambio: elige carta origen`.
  - `Intercambio: elige carta destino`.
  - `El Padrino: elige una acción`.
  - `Orca: destruye una carta propia`.
  - `Foca-Bomba: descarta cartas para resolver`.

### Centro abajo

- Dado.
- Resultado.
- Botón principal contextual.
- Opciones de acción solo cuando aplican.
- Confirmación de intercambio.
- Mensaje de bloqueo si no es tu turno o mesa pausada.

### No hacer

- No mostrar todas las acciones siempre.
- No meter drag & drop.
- No esconder la acción actual en un panel lateral.
- No usar animaciones fuera de cartas.

---

## 2.3 Imagen 3 — Panel derecho / manos y puntajes

### Función

Debe funcionar como “ledger de jugadores”. No es solo scoreboard.

Muestra:

- Nombre del jugador.
- Avatar pequeño.
- Mano/zona visible.
- Puntaje actual o estimado.
- Estado de turno si aplica.
- Estado online solo cuando hay problema.
- Contador de desconexión si está en `reconnecting`.

### Layout desktop

```txt
┌──────────────────────────────┐
│ TU BOTÍN / marcador rápido    │
├──────────────────────────────┤
│ Rival 1 · puntos              │
│ [carta][carta][carta][...]    │
├──────────────────────────────┤
│ Rival 2 · puntos              │
│ [carta][carta][carta][...]    │
├──────────────────────────────┤
│ Tú · puntos                   │
│ [carta][carta][carta][...]    │
└──────────────────────────────┘
```

### Comportamiento

- Siempre visible en desktop.
- Oculto en mobile y accesible desde bottom sheet.
- Cartas compactas, no miniaturas ilegibles.
- Si un jugador está normal, no mostrar “Conectado”; se asume conectado.
- Si hay problema:
  - `Reconectando · 23s`
  - `Ausente`
  - `Mesa pausada`

### Componentes

- `PlayerLedgerPanel.tsx`
- `PlayerLedgerRow.tsx`
- `CompactHand.tsx`
- `ScoreBadge.tsx`
- `ConnectionIssueBadge.tsx`
- `DisconnectCountdown.tsx`

---

# 3. Arquitectura UI Premium

## 3.1 Principio rector

La UI no decide reglas. La UI interpreta estado y guía al jugador.

**Server decide. UI explica. Zustand traduce. Storybook aísla.**

## 3.2 Nueva estructura sugerida

```txt
web/src/
├─ App.tsx
├─ main.tsx
├─ boardgame/
│  └─ client.ts
├─ assets/
│  ├─ cards/
│  ├─ icons/
│  ├─ avatars/
│  └─ backgrounds/
├─ ui/
│  ├─ screens/
│  │  ├─ LobbyScreen.tsx
│  │  ├─ GameScreen.tsx
│  │  └─ FinalScoreScreen.tsx
│  ├─ layout/
│  │  ├─ GameShell.tsx
│  │  ├─ GameShell.module.css
│  │  ├─ LeftStatusRail.tsx
│  │  ├─ CenterBoardStage.tsx
│  │  ├─ CenterActionDock.tsx
│  │  └─ RightLedgerRail.tsx
│  ├─ lobby/
│  │  ├─ LobbyHero.tsx
│  │  ├─ LobbyForm.tsx
│  │  ├─ RoomPlayersPanel.tsx
│  │  ├─ ExpeditionPreview.tsx
│  │  └─ Lobby.module.css
│  ├─ board/
│  │  ├─ Card.tsx
│  │  ├─ Card.module.css
│  │  ├─ IceGrid.tsx
│  │  ├─ IceSlot.tsx
│  │  └─ IceGrid.module.css
│  ├─ actions/
│  │  ├─ ActionBanner.tsx
│  │  ├─ ActionPanel.tsx
│  │  ├─ DicePanel.tsx
│  │  ├─ PadrinoChoicePanel.tsx
│  │  ├─ SwapConfirmPanel.tsx
│  │  ├─ OrcaResolutionPanel.tsx
│  │  ├─ SealExplosionPanel.tsx
│  │  └─ Actions.module.css
│  ├─ players/
│  │  ├─ PlayerLedgerPanel.tsx
│  │  ├─ PlayerLedgerRow.tsx
│  │  ├─ CompactHand.tsx
│  │  ├─ ScoreBadge.tsx
│  │  ├─ ConnectionIssueBadge.tsx
│  │  └─ Players.module.css
│  ├─ mobile/
│  │  ├─ MobileGameShell.tsx
│  │  ├─ BottomSheet.tsx
│  │  ├─ BottomSheet.module.css
│  │  └─ MobileTabs.tsx
│  ├─ dev/
│  │  ├─ DevDebugPanel.tsx
│  │  └─ SelfTestPanel.tsx
│  └─ shared/
│     ├─ Button.tsx
│     ├─ Panel.tsx
│     ├─ Badge.tsx
│     └─ EmptyState.tsx
├─ store/
│  ├─ frozenGuildStore.ts
│  ├─ bgioBridge.ts
│  └─ selectors.ts
├─ view-model/
│  ├─ gameView.ts
│  ├─ actionState.ts
│  ├─ selectionState.ts
│  ├─ scoreView.ts
│  ├─ connectionView.ts
│  └─ assetMap.ts
├─ hooks/
│  ├─ useFrozenGuildClient.ts
│  ├─ useLobbyApi.ts
│  ├─ useGameSelection.ts
│  └─ useSocketStatus.ts
├─ stories/
│  ├─ Card.stories.tsx
│  ├─ ActionBanner.stories.tsx
│  ├─ DicePanel.stories.tsx
│  ├─ PlayerLedgerRow.stories.tsx
│  ├─ BottomSheet.stories.tsx
│  ├─ OrcaResolutionPanel.stories.tsx
│  └─ SealExplosionPanel.stories.tsx
├─ styles/
│  ├─ tokens.css
│  ├─ globals.css
│  └─ reset.css
└─ types/
   └─ ui.ts
```

## 3.3 Qué pasa con `App.tsx`

No borrarlo de golpe.

Plan seguro:

1. Renombrar la UI actual como referencia temporal:
   - `App.legacy.tsx` o separar bloques poco a poco.
2. Crear `App.tsx` nuevo como compositor simple:
   - Si no hay sesión: `LobbyScreen`.
   - Si hay sesión: `GameScreen`.
   - Si gameover: `FinalScoreScreen`.
3. Conectar `bgioBridge.ts` con Zustand.
4. Migrar funciones útiles a hooks/view-models.
5. Borrar legacy solo cuando la nueva UI pase smoke test.

---

# 4. Zustand Translator Pattern

## 4.1 Problema

boardgame.io entrega snapshots grandes de `G`, `ctx` y `gameover`. Si esos objetos se inyectan directo desde el root a toda la pantalla, cada actualización puede provocar renders innecesarios.

Resultado probable si no se corrige:

- Parpadeo visual.
- Cartas que se recalculan sin necesidad.
- Componentes de avatar renderizando cuando cambió una acción que no les importa.
- Debug difícil porque todo parece depender de todo.

## 4.2 Solución

Crear un puente ligero con Zustand.

boardgame.io sigue siendo la fuente de verdad. Zustand no decide reglas. Zustand solo traduce el snapshot en vistas pequeñas consumibles por componentes.

```ts
// store/frozenGuildStore.ts
import { create } from 'zustand';

export type FrozenGuildSnapshot = {
  G: FrozenGuildState | null;
  ctx: { currentPlayer: string } | null;
  gameover?: unknown;
  localPlayerID: string | null;
};

export type FrozenGuildUiStore = FrozenGuildSnapshot & {
  setSnapshot: (snapshot: FrozenGuildSnapshot) => void;
};

export const useFrozenGuildStore = create<FrozenGuildUiStore>((set) => ({
  G: null,
  ctx: null,
  gameover: undefined,
  localPlayerID: null,
  setSnapshot: (snapshot) => set(snapshot)
}));
```

## 4.3 Selectores obligatorios

No usar `useFrozenGuildStore((s) => s.G)` dentro de componentes visuales salvo contenedores de alto nivel.

Crear selectores atómicos:

```ts
selectActionBannerView(state)
selectIceGridView(state)
selectDiceView(state)
selectPlayerLedgerRows(state)
selectPlayerRowById(playerID)
selectLocalPlayerHand(state)
selectConnectionIssueByPlayer(playerID)
selectIsMyTurn(state)
selectBlockingStage(state)
selectMobileBottomSheetDefaultTab(state)
```

## 4.4 Regla de render

Cada componente debe suscribirse solo a lo que necesita.

Ejemplo:

```ts
const row = useFrozenGuildStore(
  (state) => selectPlayerRowById(state, playerID),
  shallow
);
```

### Anti-patrón prohibido

```tsx
<GameShell G={G} ctx={ctx} />
```

Ese patrón vuelve a renderizar toda la pantalla por cambios que podrían ser locales.

### Patrón correcto

```tsx
<GameShell>
  <LeftStatusRail />
  <CenterBoardStage />
  <CenterActionDock />
  <RightLedgerRail />
</GameShell>
```

Cada bloque consume selectores propios.

---

# 5. Storybook obligatorio

## 5.1 Motivo

No se debe jugar una partida completa para probar si un botón, carta, dado o banner se ve bien.

Storybook permite probar estados visuales aislados:

- Carta visible.
- Carta oculta.
- Carta seleccionable.
- Carta seleccionada.
- Carta inválida.
- Dado sin lanzar.
- Dado 6 con Padrino.
- Orca pendiente.
- Foca-Bomba pendiente.
- Jugador reconectando con contador.
- Mobile bottom sheet abierto/cerrado.

## 5.2 Instalación sugerida

```bash
npm install -w web zustand framer-motion
npm install -D -w web storybook @storybook/react-vite @storybook/addon-essentials
```

Si el instalador oficial de Storybook detecta mejor configuración, usarlo y documentar los cambios:

```bash
cd web
npx storybook@latest init
```

## 5.3 Scripts esperados en `web/package.json`

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

## 5.4 Historias mínimas

- `Card.stories.tsx`
  - hidden
  - visible
  - selected
  - selectable
  - disabled
  - compact
  - board
  - preview
- `ActionBanner.stories.tsx`
  - neutral
  - your turn
  - blocked
  - danger
  - success
- `DicePanel.stories.tsx`
  - not rolled
  - rolled 1-3
  - rolled 4
  - rolled 5
  - rolled 6
  - disabled
- `PlayerLedgerRow.stories.tsx`
  - normal
  - active
  - local player
  - reconnecting
  - absent
- `BottomSheet.stories.tsx`
  - collapsed
  - action tab
  - hand tab
  - rivals tab
- `OrcaResolutionPanel.stories.tsx`
- `SealExplosionPanel.stories.tsx`

## 5.5 Regla de calidad

Todo componente visual nuevo debe tener al menos una story antes de conectarse al motor real.

---

# 6. Micro-interacciones controladas con Framer Motion

## 6.1 Cambio de decisión

El plan anterior decía “sin animaciones”. Eso se cambia por:

**No animaciones complejas. Sí micro-interacciones de cartas con Framer Motion `layout` / `layoutId`.**

## 6.2 Regla estricta

Framer Motion solo puede usarse en componentes de carta:

- `Card.tsx`
- `CompactHand.tsx` si renderiza cartas compactas
- `IceSlot.tsx` solo para envolver la carta, no para animar el slot completo

Permitido:

```tsx
<motion.div layout layoutId={`card-${card.id}`}>
  ...
</motion.div>
```

Prohibido:

- Animar todo el layout.
- Animar paneles completos con Framer Motion.
- Usar variantes complejas.
- Coreografías por turno.
- Animaciones que afecten reglas o timings.
- Hacer que la UI dependa de una animación para funcionar.

## 6.3 Qué aporta

- Cuando una carta pasa del Hielo a una mano, la transición se siente suave.
- Cuando una carta cambia de posición por intercambio, no “salta” tan seco.
- Cuando el ledger se actualiza, las cartas respiran visualmente sin meter lógica compleja.

## 6.4 Fallback

Si Framer Motion falla o complica el build, se puede desactivar sin romper la partida.

---

# 7. Arquitectura móvil definida

## 7.1 No basta decir “derecha colapsable”

Mobile debe tener un patrón claro, aunque no sea perfecto en MVP.

## 7.2 Patrón aprobado

En pantallas menores a `900px`:

```txt
┌──────────────────────────┐
│ Sticky ActionBanner       │
│ Sticky El Hielo 3x3       │
├──────────────────────────┤
│ Contenido scroll          │
│ Estado mesa / turno       │
│ Resumen compacto          │
└──────────────────────────┘
╔══════════════════════════╗
║ Bottom Sheet             ║
║ Tabs: Acción | Mi mano | Rivales ║
╚══════════════════════════╝
```

## 7.3 Sticky board

`ActionBanner` y El Hielo quedan arriba con `position: sticky`.

```css
.mobileBoardSticky {
  position: sticky;
  top: 0;
  z-index: 30;
  backdrop-filter: blur(14px);
}
```

## 7.4 Bottom sheet

El panel inferior contiene:

- Tab `Acción`: dado, botones contextuales, confirmaciones.
- Tab `Mi mano`: cartas del jugador local.
- Tab `Rivales`: ledger compacto con puntajes y manos.

El bottom sheet debe tener tres estados:

- `collapsed`: solo muestra handle + estado corto.
- `half`: muestra acción actual.
- `expanded`: permite inspeccionar mano/rivales.

## 7.5 Default tab inteligente

- Si es mi turno: abrir en `Acción`.
- Si hay Orca/Foca pendiente para mí: abrir en `Acción` y subir a `half`.
- Si no es mi turno: dejar `collapsed` o mostrar `Rivales` según último tab del usuario.

## 7.6 Regla MVP

Mobile no necesita ser la experiencia premium final, pero no debe estar roto ni imposibilitar jugar.

---

# 8. Contrato visual de estado

## 8.1 ActionBanner

`ActionBanner` es el jefe de la pantalla.

```ts
type ActionBannerView = {
  title: string;
  detail: string;
  severity: 'neutral' | 'your-turn' | 'blocked' | 'danger' | 'success';
  icon?: 'dice' | 'fish' | 'eye' | 'swap' | 'padrino' | 'orca' | 'bomb' | 'pause';
};
```

Ejemplos:

```ts
{
  title: 'Pesca',
  detail: 'Elige una carta del Hielo.',
  severity: 'your-turn',
  icon: 'fish'
}
```

```ts
{
  title: 'Orca pendiente',
  detail: 'Debes destruir una carta propia para continuar.',
  severity: 'danger',
  icon: 'orca'
}
```

## 8.2 ActionPanel

Nunca debe ser una botonera genérica permanente.

| Estado | UI visible |
|---|---|
| Antes de tirar dado | Botón `Lanzar dado` |
| Dado 1-3 | Instrucción de pesca + slots seleccionables |
| Dado 4 | Selector de 3 slots + opción regalar |
| Dado 5 | Flujo origen → destino → confirmar |
| Dado 6 | Panel `PadrinoChoicePanel` con acciones 1-5 |
| Orca pendiente | `OrcaResolutionPanel` bloqueante |
| Foca pendiente | `SealExplosionPanel` bloqueante |
| No es tu turno | Mensaje “Esperando a X” |
| Mesa pausada | Mensaje “Mesa pausada. No corren timers.” |

## 8.3 Selección de intercambio

No drag & drop.

Flujo:

1. Click en carta origen.
2. UI marca origen.
3. Click en carta destino.
4. UI marca destino.
5. Botón `Confirmar intercambio`.
6. Llama `moves.swapCards(payload)`.
7. Limpia selección.

```ts
type SwapSelectionView = {
  source: SwapLocation | null;
  target: SwapLocation | null;
  canConfirm: boolean;
  helperText: string;
};
```

---

# 9. Asset pipeline mínimo

## 9.1 Assets existentes esperados

```txt
assets/cards/penguin-1.png
assets/cards/penguin-2.png
assets/cards/penguin-3.png
assets/cards/walrus.png
assets/cards/petrel.png
assets/cards/sea-elephant.png
assets/cards/krill.png
assets/cards/orca.png
assets/cards/seal-bomb.png
```

También debe existir o solicitarse:

```txt
assets/cards/back.png
assets/cards/card-placeholder.png
assets/icons/fish.svg
assets/icons/dice.svg
assets/icons/eye.svg
assets/icons/swap.svg
assets/icons/padrino.svg
assets/icons/orca.svg
assets/icons/bomb.svg
assets/icons/pause.svg
assets/avatars/default-penguin.png
assets/backgrounds/lobby-bg.webp
assets/backgrounds/game-ice-bg.webp
```

## 9.2 Regla de assets

Si falta un PNG, la UI no debe romperse.

```ts
getCardImage(card) ?? '/assets/cards/card-placeholder.png'
```

## 9.3 Solicitudes pendientes de assets

El agente debe generar una lista clara:

```md
- Falta `web/src/assets/cards/back.png`
  - Uso: cartas ocultas del Hielo y mazo.
  - Tamaño: 512x768 PNG/WebP.
  - Estilo: reverso azul hielo con símbolo central.
```

---

# 10. Roadmap comprimido a 5 semanas

## Semana 1 — Sprint Fundacional Premium: auditoría + componentes base + Storybook + Zustand

### Objetivo

Fusionar la antigua Semana 1 y Semana 2 en un solo sprint de alto rendimiento. Preparar la arquitectura sin romper el MVP.

### Tareas

Ejecutar baseline:

```bash
npm install
npm run typecheck
npm run lint
npm run test
npm run test:critical
npm run build
```

Crear rama:

```bash
git checkout -b ui/premium-5w
```

Instalar herramientas UI:

```bash
npm install -w web zustand framer-motion
npm install -D -w web storybook @storybook/react-vite @storybook/addon-essentials
```

Auditar:

- `web/src/App.tsx`
- `web/src/styles.css`
- `web/src/boardgame/client.ts`
- `shared/game/types.ts`
- `shared/game/card-distribution.ts`

Crear carpetas:

- `web/src/ui`
- `web/src/store`
- `web/src/view-model`
- `web/src/hooks`
- `web/src/styles`
- `web/src/stories`

Crear tokens:

- `tokens.css`
- `globals.css`
- `reset.css`

Crear store/translator:

- `frozenGuildStore.ts`
- `bgioBridge.ts`
- `selectors.ts`

Crear componentes base:

- `Card.tsx`
- `IceGrid.tsx`
- `IceSlot.tsx`
- `Panel.tsx`
- `Button.tsx`
- `Badge.tsx`
- `ActionBanner.tsx`
- `DicePanel.tsx`

Crear CSS Modules:

- `Card.module.css`
- `IceGrid.module.css`
- `Actions.module.css`
- `GameShell.module.css`

Crear stories mínimas:

- `Card.stories.tsx`
- `ActionBanner.stories.tsx`
- `DicePanel.stories.tsx`

### Entregable

- Storybook corriendo.
- Componentes base renderizados con mocks.
- Zustand bridge listo, aunque todavía no alimente toda la UI.
- App legacy sigue funcionando.
- Documento corto `UI_AUDIT_STAGE_23.md`.

### Criterios de aceptación

- `npm run build` pasa.
- `npm run test:critical` pasa.
- `npm run storybook` abre componentes base.
- `Card` usa CSS Modules.
- `Card` acepta `motion.div layout` pero no introduce animación compleja.
- No se cambió lógica core.

---

## Semana 2 — Lobby premium/inversionistas + asset pipeline

### Objetivo

Construir una primera pantalla vendible sin sacrificar funcionalidad.

### Tareas

Crear:

- `LobbyScreen.tsx`
- `LobbyHero.tsx`
- `LobbyForm.tsx`
- `RoomPlayersPanel.tsx`
- `ExpeditionPreview.tsx`
- `FeaturedCardPreview.tsx`
- `LobbyBackground.tsx`

Extraer lógica actual:

- `useLobbyApi.ts`
- `useSocketStatus.ts`

Mostrar:

- Nombre.
- Crear sala.
- Unirse a sala.
- Match ID.
- Player ID.
- Jugadores en sala.
- CTA `Romper el hielo`.
- Preview de cartas a la derecha.

Completar Storybook:

- `LobbyHero.stories.tsx`
- `LobbyForm.stories.tsx`
- `ExpeditionPreview.stories.tsx`
- `FeaturedCardPreview.stories.tsx`

Completar asset pipeline:

- `assetMap.ts`
- fallback de cartas.
- checklist de assets faltantes.

### Entregable

- Lobby funcional y presentable para demo.
- Lista de assets faltantes con ubicación/tamaño/uso.
- Debug/admin oculto fuera de modo dev.

### Criterios de aceptación

- Crear sala funciona.
- Unirse funciona.
- MatchID/playerID visibles.
- Socket status claro si falla.
- No parece dashboard técnico.
- Storybook permite revisar lobby sin correr una partida.

---

## Semana 3 — GameShell desktop 16:9 + integración boardgame.io mediante Zustand

### Objetivo

Crear la pantalla principal de partida con cuatro zonas y conectar el estado real sin re-render masivo.

### Tareas

Crear:

- `GameScreen.tsx`
- `GameShell.tsx`
- `LeftStatusRail.tsx`
- `CenterBoardStage.tsx`
- `CenterActionDock.tsx`
- `RightLedgerRail.tsx`

Layout desktop:

```css
.gameShell {
  display: grid;
  grid-template-columns: 260px minmax(580px, 1fr) 360px;
  grid-template-rows: minmax(0, 1fr) auto;
  grid-template-areas:
    "left center right"
    "left actions right";
  min-height: 100vh;
}
```

Conexión:

- `useFrozenGuildClient.ts` recibe snapshot boardgame.io.
- `bgioBridge.ts` manda snapshot al store.
- Componentes consumen selectores, no `G` completo.

Crear view-models:

- `gameView.ts`
- `actionState.ts`
- `connectionView.ts`

Renderizar:

- `ActionBanner` arriba del tablero.
- El Hielo 3x3 compacto.
- Deck count.
- Discard count.
- Turno.
- Mesa activa/pausada.

Completar stories:

- `GameShell.stories.tsx`
- `IceGrid.stories.tsx`
- `LeftStatusRail.stories.tsx`

### Entregable

- Partida renderizada en layout definitivo.
- Estado real conectado vía Zustand.
- UI sin parpadeos obvios por snapshots grandes.

### Criterios de aceptación

- El tablero es protagonista, pero compacto.
- El mensaje de acción está arriba del tablero.
- Derecha siempre visible en desktop.
- No se pasan `G` y `ctx` completos a todos los hijos.
- Cambiar un dato de un jugador no rerenderiza visualmente toda la pantalla.
- Métricas dev activas con `React.Profiler` por rail (`Left`, `Center`, `Actions`, `Right`).
- Selectores memoizados para `players` e `iceCards` sin crear arrays nuevos cuando la referencia de origen no cambia.
- Criterio de “sin parpadeo”: durante cambios de turno/acción, no hay flash de panel vacío y el tablero mantiene continuidad visual.

---

## Semana 4 — Acciones contextuales + ledger derecho + stages bloqueantes + micro-interacciones

### Objetivo

Cerrar la jugabilidad principal y darle “juice” controlado al demo.

### Tareas

Crear/terminar acciones:

- `ActionPanel.tsx`
- `PadrinoChoicePanel.tsx`
- `SwapConfirmPanel.tsx`
- `OrcaResolutionPanel.tsx`
- `SealExplosionPanel.tsx`

Implementar:

- Pesca.
- Espionaje.
- Intercambio origen → destino → confirmar.
- El Padrino desplegable solo cuando dado = 6.
- Debajo de `CenterActionDock`, mostrar solo en ese caso 3 botones: `Pesca`, `Spy`, `Snap`. En cualquier otro resultado del dado, oculto.
- Orca bloqueante.
- Foca-Bomba bloqueante.
- Botones disabled con razón visible.

Crear ledger:

- `PlayerLedgerPanel.tsx`
- `PlayerLedgerRow.tsx`
- `CompactHand.tsx`
- `ScoreBadge.tsx`
- `ConnectionIssueBadge.tsx`
- `DisconnectCountdown.tsx`
- `scoreView.ts`

Micro-interacciones:

- Agregar `motion.div layout layoutId` solo a cartas.
- Probar movimientos de carta entre Hielo/mano/ledger.
- No animar paneles completos.
- No usar drag & drop.

Completar stories:

- `PlayerLedgerRow.stories.tsx`
- `ActionPanel.stories.tsx`
- `PadrinoChoicePanel.stories.tsx`
- `OrcaResolutionPanel.stories.tsx`
- `SealExplosionPanel.stories.tsx`

### Entregable

- Flujo de turno jugable desde la UI nueva.
- Panel derecho funcional.
- Orca/Foca resueltas desde UI nueva.
- Cartas con transición suave de layout.

### Criterios de aceptación

- Si toca Pesca, se entiende qué carta seleccionar.
- Si toca Intercambio, se entiende origen/destino/confirmar.
- Si toca Padrino, aparecen opciones solo entonces.
- Si hay Orca/Foca, la UI bloquea y explica.
- Se ven cartas y puntos de todos.
- Framer Motion solo aparece en componentes de carta.
- No hay fuga de carta oculta del Hielo.

---

## Semana 5 — Mobile pattern + QA concurrente + polish + release candidate UI

### Objetivo

Fusionar la antigua Semana 7 y 8: QA y pulido corren en paralelo con los últimos ajustes.

### Tareas

Mobile real:

- Crear `MobileGameShell.tsx`.
- Crear `BottomSheet.tsx`.
- Crear `MobileTabs.tsx`.
- Tablero sticky arriba.
- Bottom sheet con tabs:
  - Acción.
  - Mi mano.
  - Rivales.
- Right ledger oculto en mobile y accesible desde bottom sheet.

QA visual:

- Revisar Storybook de estados críticos.
- Revisar contraste.
- Revisar tamaños de carta.
- Revisar legibilidad del ActionBanner.
- Revisar estados vacíos.
- Revisar errores de asset faltante.

QA funcional:

```bash
npm run typecheck
npm run lint
npm run test
npm run test:critical
npm run build
npm run build-storybook
```

Smoke test:

- 2 navegadores.
- 4 jugadores si es posible.
- 5 partidas completas.
- Desconexión/reconexión.
- Orca.
- Foca-Bomba.
- Intercambio.
- Padrino.

Crear documento:

- `UI_RELEASE_CANDIDATE_STAGE_30.md`

### Entregable

- UI MVP premium lista para demo.
- Storybook usable.
- Mobile no roto.
- Lista final de bugs/assets pendientes.
- Registro de 5 partidas completas.

### Criterios de aceptación

- 5 partidas completas sin intervención técnica.
- 0 bugs bloqueantes de UI.
- El jugador entiende acción siguiente sin explicación verbal.
- Lobby presentable para inversionistas.
- Tablero se siente como juego, no panel admin.
- Mobile permite jugar con sticky board + bottom sheet.
- Storybook build pasa.

---

# 11. Prompt operativo para OpenCode / Caveman

## 11.1 Skills sugeridas

```bash
npx playbooks add skill ccalebcarter/purria-skills --skill react-game-ui
npx playbooks add skill ccalebcarter/purria-skills --skill game-assets-team
npx playbooks add skill ccalebcarter/purria-skills --skill testing-team
```

Para Caveman/compression, si ya está instalada, usarla solo para mantener reportes cortos y contexto limpio.

## 11.2 Prompt principal

```md
Actúa como Front-End Builder de Frozen Guild.

Usa skills:
- react-game-ui
- game-assets-team
- testing-team
- Caveman solo para comprimir reportes y mantener contexto corto, no para escribir UI críptica.

Objetivo:
Refactorizar la UI actual hacia una interfaz desktop-first 16:9 limpia, jugable, premium y presentable para demo/inversionistas.

Restricciones nuevas obligatorias:
- Comprime el roadmap a 5 semanas.
- Integra Storybook para UI aislada.
- Utiliza Zustand como puente/traductor para selectores de estado granulares.
- Autoriza Framer Motion exclusivamente para transiciones layout/layoutId de cartas.
- Mantén el resto libre de animaciones complejas.
- CSS Modules obligatorio.
- No Tailwind.
- No drag & drop.
- No duplicar lógica del servidor en frontend.
- No tocar reglas core salvo bug evidente con test.

Contexto:
Repo actual ya tiene React/Vite/TypeScript, boardgame.io client, server boardgame.io, SQLite WAL, observabilidad, PM2/Nginx y tests críticos.

Layout objetivo partida:
- Izquierda: estado jugador/mesa/turno/sesión/mazo.
- Centro arriba: ActionBanner + El Hielo 3x3 compacto.
- Centro abajo: dado + acciones contextuales.
- Derecha: manos visibles, puntaje, rivales, conexión inestable solo si aplica.

Patrón mobile obligatorio:
- Tablero El Hielo 3x3 sticky en la parte superior.
- ActionBanner sticky arriba del tablero.
- Acciones, mano local y rivales dentro de Bottom Sheet inferior con tabs.
- Right ledger oculto en mobile y accesible desde Bottom Sheet.

Reglas UX:
- ActionBanner arriba del tablero siempre dice el siguiente paso.
- Acción 5: origen → destino → confirmar.
- Acción 6: desplegar opciones 1-5 solo cuando dado = 6.
- Cartas adquiridas por jugadores siempre visibles.
- Puntuaciones siempre visibles.
- Estados reconnecting/absent visibles solo cuando aplican.

Primera tarea:
No reescribas todo.
1. Audita web/src/App.tsx y web/src/styles.css.
2. Instala/configura Storybook, Zustand y Framer Motion.
3. Crea estructura web/src/ui, web/src/store, web/src/view-model, web/src/hooks, web/src/styles, web/src/stories.
4. Crea tokens.css y primeros componentes base.
5. Implementa Card con soporte opcional de motion layout/layoutId.
6. Mantén App funcional.
7. Entrega resumen corto con archivos tocados, riesgos y siguiente paso.

Criterio de seguridad:
Después de cada cambio grande ejecuta:
npm run typecheck
npm run lint
npm run test:critical
npm run build
npm run build-storybook

Formato respuesta:
- Qué cambió
- Archivos tocados
- Cómo probar
- Riesgos
- Siguiente tarea
```

---

# 12. Riesgos reales y mitigación

## Riesgo 1 — Meter Zustand y duplicar estado

Mitigación:

- boardgame.io sigue siendo fuente de verdad.
- Zustand solo traduce snapshots a vistas pequeñas.
- No guardar lógica de reglas en Zustand.
- No mutar `G` desde Zustand.

## Riesgo 2 — Storybook se vuelve trabajo extra

Mitigación:

- Solo stories para componentes críticos.
- Mocks simples de view-models.
- No intentar documentar todo el juego en Storybook.

## Riesgo 3 — Framer Motion se sale de control

Mitigación:

- Solo `layout` / `layoutId` en cartas.
- No variantes.
- No animar paneles.
- No animaciones para reglas.

## Riesgo 4 — Rehacer UI y romper partida

Mitigación:

- Migración por capas.
- Mantener legacy hasta que nueva UI juegue una partida.
- No tocar `shared/game` sin test.

## Riesgo 5 — Diseño bonito pero poco claro

Mitigación:

- ActionBanner manda.
- Panel de acciones contextual.
- Botones con razón de bloqueo.

## Riesgo 6 — Mobile ambiguo

Mitigación:

- Sticky board.
- Bottom sheet definido.
- Tabs claras: Acción / Mi mano / Rivales.

---

# 13. Definition of Done final

La UI Premium MVP queda aceptada cuando:

- Lobby crea/unir sala sin explicación.
- Partida renderiza 1-4 jugadores.
- El Hielo 3x3 se ve compacto y protagonista.
- ActionBanner siempre muestra el siguiente paso.
- Panel de acciones solo muestra lo que toca.
- Intercambio funciona origen → destino → confirmar.
- El Padrino despliega opciones solo cuando sale 6.
- Orca bloquea hasta resolver.
- Foca-Bomba bloquea hasta resolver.
- Panel derecho muestra manos y puntajes siempre en desktop.
- Estado online problemático se muestra solo si hay problema.
- Mobile permite jugar con sticky board + bottom sheet.
- Storybook muestra estados críticos sin necesidad de jugar turnos completos.
- Zustand evita pasar `G`/`ctx` completo a toda la UI.
- Framer Motion solo se usa para layout de cartas.
- `npm run build-storybook` pasa.
- `npm run release:check` pasa.
- 5 partidas completas sin intervención técnica.

---

# 14. Mandato final para el agente

No persigas una UI infinita.

Persigue esta secuencia:

1. Separar sin romper.
2. Aislar componentes en Storybook.
3. Traducir estado con Zustand.
4. Hacer jugable.
5. Dar micro-juice a cartas.
6. Cerrar mobile con sticky board + bottom sheet.
7. Pulir para demo.

Frozen Guild no necesita más humo.
Necesita que el jugador mire la pantalla, entienda qué hacer y sienta que está ante un producto real.
