# FrozenGuild UI Audit (Phase 0)

## Scope

Audit executed for `frozenguild` before UI redesign work. No gameplay logic or application behavior was modified.

---

## 1) Current `web/src` structure

```txt
web/src
├── App.tsx
├── main.tsx
├── boardgame/
├── hooks/
├── store/
│   ├── frozenGuildStore.ts
│   ├── selectors.ts
│   └── bgioBridge.ts
├── ui/
│   ├── actions/
│   ├── board/
│   ├── layout/
│   ├── lobby/
│   ├── mobile/
│   ├── players/
│   ├── screens/
│   └── shared/
├── view-model/
├── styles/
│   ├── reset.css
│   ├── tokens.css
│   └── globals.css
├── styles.css
├── assets/
└── stories/
```

---

## 2) Existing React components

### App / Screen level
- `App.tsx`
- `ui/screens/LobbyScreen.tsx`
- `ui/screens/GameScreen.tsx`
- `ui/screens/GameScreenContainers.tsx`

### Layout
- `ui/layout/GameShell.tsx`
- `ui/layout/LeftStatusRail.tsx`
- `ui/layout/CenterBoardStage.tsx`
- `ui/layout/CenterActionDock.tsx`
- `ui/layout/RightLedgerRail.tsx`

### Board
- `ui/board/IceGrid.tsx`
- `ui/board/IceSlot.tsx`
- `ui/board/Card.tsx`

### Actions
- `ui/actions/ActionBanner.tsx`
- `ui/actions/DicePanel.tsx`
- `ui/actions/ActionPanel.tsx`
- `ui/actions/PadrinoChoicePanel.tsx`
- `ui/actions/SwapConfirmPanel.tsx`
- `ui/actions/SpyActionPanel.tsx`
- `ui/actions/OrcaResolutionPanel.tsx`
- `ui/actions/SealExplosionPanel.tsx`

### Players
- `ui/players/PlayerLedgerPanel.tsx`
- `ui/players/PlayerLedgerRow.tsx`
- `ui/players/CompactHand.tsx`
- `ui/players/ScoreBadge.tsx`
- `ui/players/ConnectionIssueBadge.tsx`
- `ui/players/DisconnectCountdown.tsx`

### Lobby
- `ui/lobby/LobbyBackground.tsx`
- `ui/lobby/LobbyHero.tsx`
- `ui/lobby/LobbyForm.tsx`
- `ui/lobby/AvailableMatchesPanel.tsx`
- `ui/lobby/RoomPlayersPanel.tsx`
- `ui/lobby/FeaturedCardPreview.tsx`
- `ui/lobby/ExpeditionPreview.tsx`

### Mobile
- `ui/mobile/MobileGameShell.tsx`
- `ui/mobile/MobileTabs.tsx`
- `ui/mobile/BottomSheet.tsx`

### Shared UI primitives
- `ui/shared/Badge.tsx`
- `ui/shared/Button.tsx`
- `ui/shared/Panel.tsx`

---

## 3) Existing Zustand stores

### Store
- `web/src/store/frozenGuildStore.ts`
  - Holds snapshot (`G`, `ctx`, `gameover`, `localPlayerID`)
  - Holds UI draft state (spy draft + swap draft)

### Derived selectors
- `web/src/store/selectors.ts`
  - Turn/state selectors (`selectIsMyTurn`, `selectActionFlowView`, `selectActionBannerView`)
  - Dice/board selectors (`selectDiceView`, `selectIceGrid`)
  - Resolution selectors (`selectSpyResolutionView`, `selectOrcaResolutionView`, `selectSealBombResolutionView`)
  - Player ledger selectors (`selectPlayersLedger`, `selectUnstablePlayers`)

### Bridge
- `web/src/store/bgioBridge.ts`
  - Pushes Boardgame.io snapshot into Zustand via `setSnapshot`

---

## 4) Shared game types

- `shared/game/types.ts`
  - Core domain types: `FrozenGuildState`, `Card`, `CardType`, `IceGridSlot`, `PlayerState`, `DiceState`, `TurnState`, `SpyState`, `SwapLocation`, and resolution states.

This file is the primary type contract between game logic (`shared/game/*`) and web UI (`web/src/*`).

---

## 5) Where the 3x3 board logic lives

### Domain/game rules (source of truth)
- `shared/game/setup.ts`
  - `ICE_GRID_SIZE = 9` (3x3)
  - Initializes `iceGrid`
- `shared/game/moves.ts`
  - Validates and mutates grid interactions (fish/spy/swap)
- `shared/game/FrozenGuild.ts`
  - Registers moves and turn flow in Boardgame.io game config

### UI projection
- `web/src/view-model/iceGridView.ts`
  - Converts `iceGrid` state into renderable card view model
- `web/src/ui/board/IceGrid.tsx` + `IceSlot.tsx`
  - Renders 3-column grid

---

## 6) Where player, turn, hand, dice, and action logic live

### Player + hand
- Domain: `shared/game/types.ts` (`players[playerID].zone`)
- Move effects: `shared/game/moves.ts`
- UI selectors/views: `web/src/store/selectors.ts`, `web/src/ui/players/*`

### Turn
- Domain turn state: `shared/game/types.ts` (`turn`)
- Turn lifecycle/reset/end: `shared/game/moves.ts` + `shared/game/FrozenGuild.ts`
- UI mapping: `selectActionFlowView`, `selectActionBannerView`

### Dice
- Domain dice state: `shared/game/types.ts` (`dice`)
- Rolling and action gating: `shared/game/moves.ts` (`rollDice`, action checks)
- UI panel: `ui/actions/DicePanel.tsx` via selector-derived props

### Actions (fish, spy, swap, padrino, resolutions)
- Domain move handlers: `shared/game/moves.ts`
- Move registration: `shared/game/FrozenGuild.ts`
- App-level wiring to client moves: `web/src/App.tsx`
- UI action containers/components: `ui/screens/GameScreenContainers.tsx`, `ui/actions/*`, `ui/layout/CenterActionDock.tsx`

---

## 7) Existing assets

### Existing local assets (`web/src/assets`)
- Root: `dice.png`, `fish.png`, `game-ice-bg.webp`, `Icon-Pez negro.png`, `Icon-Pez.png`, `Lobby-background.png`, `Marco.png`, `orca.png`, `placeholder.png`
- Cards: `cards/krill.png`, `cards/orca.png`, `cards/penguin-1.png`, `cards/penguin-2.png`, `cards/penguin-3.png`, `cards/petrel.png`, `cards/Reverso.png`, `cards/sea-elephant.png`, `cards/seal_bomb.png`, `cards/walrus.png`

### Mapping file
- `web/src/view-model/assetMap.ts` currently maps card type → image paths under `/src/assets/...`

### Missing target structure
- `web/public/assets` does not exist yet (required by FG-ui plan phases).

---

## 8) Files to touch/reuse for redesign (without breaking game logic)

### Primary files to touch
- `web/src/ui/**` (visual components/layout)
- `web/src/styles/**` and component `*.module.css`
- `web/src/view-model/assetMap.ts` (or future `ui/assets.ts` per next phases)
- `web/src/main.tsx` (global style imports only)

### Reuse strongly
- `web/src/store/selectors.ts` (already centralizes UI derivation)
- `web/src/view-model/iceGridView.ts`
- `web/src/ui/layout/GameShell.tsx` (good shell split)
- `web/src/ui/screens/GameScreenContainers.tsx` (composition boundary)

### Do not touch yet (Phase 0/visual-first safety)
- `shared/game/moves.ts`
- `shared/game/FrozenGuild.ts`
- `shared/game/setup.ts`
- `shared/game/scoring.ts`
- `shared/game/types.ts` (except future type-extension by explicit requirement)

---

## 9) Current styling approach

Current approach is mixed:

1. **Global CSS files**
   - `styles/reset.css`, `styles/tokens.css`, `styles/globals.css`, and large legacy `styles.css`.
2. **CSS Modules present**
   - Used in several feature components (`Actions.module.css`, `GameShell.module.css`, `IceGrid.module.css`, etc.).
3. **Inline styles still present**
   - Some components use inline `style={...}` (e.g., `CenterBoardStage.tsx`, lobby/game container areas).

Conclusion: styling is partially modularized but not fully aligned yet with a strict “tokens + CSS Modules only” target.

---

## 10) Audit verdict

## What exists
- Functional game + UI split with Boardgame.io domain in `shared/game/*`.
- Zustand UI state bridge and many atomic selectors.
- Existing component architecture for lobby/game/mobile.
- Existing card and base background assets.

## What is missing
- `web/public/assets` structured asset system from master plan.
- Centralized phase-style asset contract (`web/src/ui/assets.ts` not present).
- Fully consistent CSS Modules usage (legacy global/inline styles still significant).
- Dedicated premium visual token set described in FG-ui Phase 2.

## What can be reused
- Most `ui/layout/*`, `ui/board/*`, `ui/actions/*`, and selectors/view-model layers.
- Existing shared types and move contracts.
- Existing Storybook stories as regression/visual references.

## What should be refactored
- Reduce `App.tsx` orchestration complexity over time (currently very large and mixes concerns).
- Move remaining inline styles into CSS Modules.
- Gradually migrate legacy `styles.css` responsibilities into scoped modules + base tokens.
- Replace `/src/assets/...` usage with Vite-safe `/assets/...` once `public/assets` is introduced.

## What should not be touched yet
- Core game rules and board mechanics in `shared/game/*`.
- Move semantics and turn resolution behavior.
- Any logic that changes 3x3 board rules or action rules.

## Technical risks
- **High**: Visual refactor accidentally altering gameplay wiring in `App.tsx`/containers.
- **Medium**: Asset path migration (`/src/assets` → `/assets`) may break images if done piecemeal.
- **Medium**: Mixed global + module styles can cause cascade collisions/regressions.
- **Medium**: Non-atomic selector usage can creep in during redesign if store access discipline is not preserved.
- **Low**: Storybook drift if component APIs are changed without updating stories.

---

## Phase 0 recommendation

Proceed to Phase 1 with a strict boundary:
- UI/assets/styles refactor only.
- Preserve `shared/game/*` and move contracts untouched.
- Keep Zustand selector usage atomic at container level.
