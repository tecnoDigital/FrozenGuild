# Frozen Guild Final UI Master Plan — Premium Version

## Project Context

**Goal:** move from the current functional repository to a final UI inspired by the Frozen Guild visual reference: a mafia penguin card game on ice, with a premium desktop-first game interface and enough creative freedom to improve the final result.

## Confirmed Stack

- Vite
- React
- TypeScript
- Zustand
- Framer Motion
- CSS Modules
- Storybook

> Strict rule: **no Tailwind**. All styling must use CSS Modules plus native CSS variables.

## Confirmed Decisions

- Work on a single branch.
- Build the visual layer first using mock data.
- Connect the UI to Zustand/game state after the static mock is approved.
- Do not implement drag and drop.
- Actions are triggered through the dice system.
- Desktop-first.
- Storybook is useful, but not mandatory for every component.
- The target visual includes any missing assets needed to reach the final quality.
- Cards and background assets already exist.
- The 3x3 board already exists in game logic.
- Lobby must integrate avatar, player name, and player color.
- Priority: balanced progress across visual quality, architecture, and playability.

---

# Final UI Goal

The final UI should include:

- Lobby with avatar, player name, and color selection.
- Desktop 16:9 game screen.
- Central 3x3 board.
- Left panel with current turn, score, and deck.
- Right panel with opponents, visible hands, and score.
- Bottom section with dice, result, actions, and local player hand.
- Organized assets.
- Frozen Guild visual language: ice, mafia, cards, penguins, cold glow, premium UI, `backdrop-filter`, and multi-layer shadows.
- First, a static/mock visual UI through a clear `types.ts` interface contract.
- Then, real Zustand connection using **atomic selectors**.

---

# Working Branch

Use one branch for the whole visual integration:

```bash
git switch main
git pull origin main
git switch -c ui/frozen-guild-final
```

If the branch already exists:

```bash
git switch ui/frozen-guild-final
```

Recommended checkpoint commits:

```bash
git add .
git commit -m "docs: audit current ui architecture"

git add .
git commit -m "chore: organize frozen guild assets"

git add .
git commit -m "feat: add frozen guild visual theme"

git add .
git commit -m "feat: build mock game ui shell"

git add .
git commit -m "feat: add lobby player customization"

git add .
git commit -m "feat: connect game ui to zustand state"

git add .
git commit -m "polish: improve frozen guild visual states"
```

---

# Phase 0 — Current Repository Audit

## Objective

Make sure Codex understands the existing project before touching the UI.

## Codex Instruction

```txt
Act as a Staff Frontend Engineer specialized in Game UI.

Audit the current FrozenGuild repository.

I need a technical summary of:

1. Current web/src structure.
2. Existing React components.
3. Existing Zustand stores.
4. Shared game types.
5. Where the 3x3 board logic lives.
6. Where player, turn, hand, dice, and action logic live.
7. What assets currently exist.
8. Which files should be touched to redesign the UI without breaking game logic.
9. Current styling approach.
10. Risk areas before changing the UI.

Do not modify code yet.

Only generate a technical markdown report at:

docs/ui-audit.md
```

## Checklist

- [ ] Identify current `web/src` structure.
- [ ] Identify existing React components.
- [ ] Identify Zustand stores.
- [ ] Identify shared game types.
- [ ] Identify 3x3 board logic.
- [ ] Identify players, turns, hand, dice, and actions.
- [ ] Identify existing assets.
- [ ] Identify styling system currently in use.
- [ ] Identify reusable files/components.
- [ ] Identify files that should not be touched yet.
- [ ] Identify technical risks.

## Acceptance Criteria

A file must exist:

```txt
docs/ui-audit.md
```

It must clearly answer:

```txt
What exists
What is missing
What can be reused
What should be refactored
What should not be touched yet
Technical risks
```

---

# Phase 1 — Asset System and Visual Structure

## Objective

Organize assets before building UI. This avoids visual chaos, broken imports, and hardcoded paths.

## Recommended Structure

```txt
web/public/assets/
  brand/
    logo-frozen-guild.png
    logo-frozen-guild-small.png

  backgrounds/
    game-board-bg.png
    lobby-bg.png
    ice-table-center.png

  cards/
    backs/
      frozen-dreamcatcher-back.png
    fronts/
      hearts/
      diamonds/
      clubs/
      spades/
    states/
      card-hidden.png
      card-selected.png
      card-disabled.png
      card-highlighted.png

  characters/
    avatars/
      don-krill.png
      lady-morsa.png
      capitan-petrel.png
      sr-bomba.png
    opponents/
      capo.png
      bot.png
      lady-g.png
      mr-zero.png

  ui/
    frames/
      player-hand-frame.png
      opponent-row-frame.png
      score-panel-frame.png
      turn-panel-frame.png
      dice-panel-frame.png
      action-bar-frame.png
      deck-frame.png
      round-badge-frame.png
    icons/
      fish.svg
      spy.svg
      exchange.svg
      godfather.svg
      cancel.svg
      trophy.svg
      dice.svg
      deck.svg
      snowflake.svg
      crown.svg
      turn-arrow.svg
    states/
      active-player-glow.png
      selected-card-glow.png
      disabled-action-overlay.png
      dice-result-burst.png
      score-increase-spark.png
      score-decrease-hit.png
    decorations/
      ice-corner-top-left.png
      ice-corner-top-right.png
      ice-corner-bottom-left.png
      ice-corner-bottom-right.png
      frost-divider-horizontal.png
      frost-divider-vertical.png
      cracked-ice-overlay.png
      aurora-light-strip.png

  lobby/
    lobby-panel-frame.png
    avatar-selector-frame.png
    color-selector-frame.png
    player-preview-frame.png
    start-button-frame.png
```

## Codex Instruction

```txt
Create an organized asset structure for FrozenGuild inside web/public/assets.

Do not modify game logic yet.

Add this file:

web/src/ui/assets.ts

It must export centralized asset paths for:

- brand
- backgrounds
- cards
- characters
- ui frames
- icons
- states
- decorations
- lobby assets

STRICT VITE RULE:
Because assets are inside public/assets, reference them with absolute root paths.

Correct:
const logo = '/assets/brand/logo-frozen-guild.png';

Incorrect:
const logo = '../public/assets/brand/logo-frozen-guild.png';

Never use relative paths to public assets because it can break the Vite build.

Also create:

docs/assets-map.md

The document must explain which asset is needed by each UI section.
```

## Checklist

- [ ] Create asset folders.
- [ ] Create `web/src/ui/assets.ts`.
- [ ] Use absolute Vite-safe public paths.
- [ ] Create `docs/assets-map.md`.
- [ ] Map existing assets.
- [ ] Mark missing assets.
- [ ] Do not move files without documenting it first.
- [ ] Do not break current imports.

## Acceptance Criteria

The UI should be able to import assets like this:

```ts
import { assets } from '@/ui/assets';
```

And use paths like:

```ts
assets.backgrounds.gameBoard
assets.cards.back
assets.ui.icons.fish
assets.characters.avatars.donKrill
```

---

# Phase 2 — Frozen Guild Visual Tokens and Theme

## Objective

Create a premium visual base using native CSS variables and CSS Modules.

No Tailwind.

## Codex Instruction

```txt
Create the base visual system for FrozenGuild without Tailwind.

I need:

1. web/src/ui/theme.css with global :root tokens:
   - ice colors
   - deep background colors
   - panel colors
   - glow shadows
   - border radius
   - z-index layers
   - typography scale
   - animation timings

2. Make sure future components use CSS Modules, for example:
   GamePanel.module.css
   PlayerHand.module.css

3. Import theme.css globally from the correct application entry point.

Premium game effects required:
- backdrop-filter: blur(...)
- multi-layer box-shadow
- icy borders
- cold cyan glow
- subtle inner shadows
- CSS variables for fast, normal, and slow transitions

Do not build components yet.
```

## Suggested Token Direction

```css
:root {
  --fg-bg-deep: #020812;
  --fg-bg-panel: rgba(5, 18, 32, 0.86);
  --fg-bg-panel-soft: rgba(10, 34, 54, 0.72);

  --fg-ice-blue: #7ddcff;
  --fg-cyan-glow: #16d9ff;
  --fg-frost-white: #eafaff;
  --fg-gold: #f5b84b;
  --fg-danger: #ff4b6a;
  --fg-purple: #9b5cff;
  --fg-green: #32e68a;
  --fg-orange: #ff8a1f;

  --fg-radius-sm: 8px;
  --fg-radius-md: 14px;
  --fg-radius-lg: 22px;
  --fg-radius-xl: 32px;

  --fg-shadow-panel:
    0 0 24px rgba(22, 217, 255, 0.22),
    inset 0 0 18px rgba(125, 220, 255, 0.12);

  --fg-shadow-card:
    0 0 18px rgba(125, 220, 255, 0.45);

  --fg-transition-fast: 120ms ease-out;
  --fg-transition-normal: 220ms ease-out;
  --fg-transition-slow: 420ms ease-out;
}
```

## Checklist

- [ ] Create `theme.css`.
- [ ] Import `theme.css` globally.
- [ ] Add CSS variables for colors.
- [ ] Add CSS variables for shadows.
- [ ] Add CSS variables for radius.
- [ ] Add CSS variables for animation timings.
- [ ] Add CSS variables for z-index layers.
- [ ] Confirm no Tailwind utilities are introduced.
- [ ] Keep global CSS minimal.
- [ ] Use CSS Modules for component styles.

## Acceptance Criteria

The project has a reusable visual foundation and future components do not need hardcoded colors/shadows everywhere.

---

# Phase 3 — Visual Contract and Isolated Components

## Objective

Define the UI interfaces first, then build small components iteratively without overloading the AI context window.

## Codex Instruction

```txt
We are going to create the base game UI components inside:

web/src/features/game/ui

Use local mock data for now. Do not connect Zustand yet.

Step 3.1 — Visual Contract:
Create this file first:

web/src/features/game/ui/types.ts

Define the exact prop interfaces for the UI components, including:

- CardVisualProps
- BoardCardSlotProps
- PlayerSummaryProps
- OpponentRowProps
- ScorePanelProps
- CurrentTurnPanelProps
- DeckPanelProps
- DicePanelProps
- ActionButtonProps
- ActionBarProps
- PlayerHandProps
- RoundBadgeProps
- GameShellProps

Step 3.2 — Component Iteration:
CRITICAL CONTEXT RULE:
Do not write all components in a single response.

List the components you plan to create and ask me which one to start with.

We will build them one by one to maximize quality and avoid truncated code.

Each component must use its own CSS Module.

The final composition should move toward a premium desktop 16:9 Frozen Guild layout.
```

## Recommended Components

```txt
web/src/features/game/ui/
  types.ts
  mockData.ts

  GameShell.tsx
  GameShell.module.css

  BoardGrid.tsx
  BoardGrid.module.css

  BoardCardSlot.tsx
  BoardCardSlot.module.css

  PlayerHand.tsx
  PlayerHand.module.css

  PlayerCard.tsx
  PlayerCard.module.css

  OpponentPanel.tsx
  OpponentPanel.module.css

  OpponentRow.tsx
  OpponentRow.module.css

  ScorePanel.tsx
  ScorePanel.module.css

  CurrentTurnPanel.tsx
  CurrentTurnPanel.module.css

  DeckPanel.tsx
  DeckPanel.module.css

  DicePanel.tsx
  DicePanel.module.css

  ActionBar.tsx
  ActionBar.module.css

  ActionButton.tsx
  ActionButton.module.css

  RoundBadge.tsx
  RoundBadge.module.css
```

## Checklist

- [ ] Create `types.ts`.
- [ ] Create `mockData.ts`.
- [ ] Build components one by one.
- [ ] Use CSS Modules.
- [ ] Use centralized assets.
- [ ] No Zustand connection yet.
- [ ] No drag and drop.
- [ ] No game logic changes.
- [ ] No large all-in-one response from Codex.
- [ ] Keep components visually focused and easy to replace with real state later.

## Acceptance Criteria

Components exist as isolated UI pieces with mock data and clear prop contracts.

---

# Phase 4 — Main Desktop 16:9 Layout

## Objective

Assemble the full static game screen using the mock components.

## Layout Direction

```txt
┌──────────────────────────────────────────────────────────────┐
│ LOGO                 ROUND BADGE                  OPPONENTS  │
│                                                              │
│ LEFT PANEL            BOARD 3x3                   OPPONENTS  │
│                                                              │
│ DECK          DICE + ACTIONS             PLAYER HAND         │
└──────────────────────────────────────────────────────────────┘
```

## Codex Instruction

```txt
Integrate the mock components into GameShell to create a desktop-first 16:9 composition.

Priorities:

1. Central 3x3 board should be dominant but not visually overloaded.
2. Local player hand should sit at the bottom-right with a special frame.
3. Dice and action controls should sit at the bottom-center.
4. Left panel should contain current turn, score, and deck information.
5. Right panel should contain opponents with visible hands.
6. Logo should sit top-left.
7. RoundBadge should sit top-center.

Use CSS Grid/Flex inside GameShell.module.css.

Avoid excessive absolute positioning.
Absolute positioning is allowed only for decorative layers.

The UI must scale between:
- 1366x768
- 1440x900
- 1536x864
- 1920x1080
```

## Checklist

- [ ] Logo top-left.
- [ ] Round badge top-center.
- [ ] Central 3x3 board.
- [ ] Left panel with turn, score, and deck.
- [ ] Right opponent panel.
- [ ] Bottom-center dice/action section.
- [ ] Bottom-right local player hand.
- [ ] Works at 1366x768.
- [ ] Works at 1920x1080.
- [ ] No overlapping panels.
- [ ] No horizontal overflow.
- [ ] Mock data only.

## Acceptance Criteria

A screenshot should look like a playable premium Frozen Guild screen, even if it is still powered by mock data.

---

# Phase 5 — Lobby: Avatar, Name, and Color

## Objective

Complete the missing lobby customization flow before connecting the final game UI.

## Required Features

- Select avatar.
- Enter player name.
- Select player color.
- Show player preview.
- Continue/start game.
- Persist selection during the session.
- Display avatar/name/color inside the game screen.

## Recommended Structure

```txt
web/src/features/lobby/
  LobbyScreen.tsx
  LobbyScreen.module.css

  AvatarSelector.tsx
  AvatarSelector.module.css

  ColorSelector.tsx
  ColorSelector.module.css

  PlayerNameInput.tsx
  PlayerNameInput.module.css

  PlayerPreviewCard.tsx
  PlayerPreviewCard.module.css

  lobbyStore.ts
```

## Codex Instruction

```txt
Implement the visual lobby flow for:

- avatar selection
- player name input
- player color selection
- player preview

Required components:

- LobbyScreen
- AvatarSelector
- ColorSelector
- PlayerNameInput
- PlayerPreviewCard

CRITICAL CONTEXT RULE:
Build this iteratively.

Do not write the whole lobby in a single response.

Tell me which component you want to start with and wait for confirmation.

The selection must be stored in the existing state if a lobby/player store already exists.

If no store exists, create a small isolated Zustand store.

Desktop-first.
No Tailwind.
Use CSS Modules.
Use centralized assets.
Do not break the current start-game flow.
```

## Checklist

- [ ] Avatar selector.
- [ ] Player name input.
- [ ] Color selector.
- [ ] Player preview card.
- [ ] Store existing selection.
- [ ] Persist during current session.
- [ ] Use selected avatar in the game UI.
- [ ] Use selected name in the game UI.
- [ ] Use selected color in the game UI.
- [ ] Preserve current game-start flow.
- [ ] Desktop-first.
- [ ] CSS Modules only.

## Acceptance Criteria

From the lobby, the user can select avatar, name, and color. Those choices appear in the game UI.

---

# Phase 6 — Connect Mock UI to Zustand/Game State

## Objective

Replace mock data with real game data without creating massive re-renders that can break Framer Motion animations.

## Recommended Connection Order

1. Round.
2. Players.
3. Current turn.
4. Scores.
5. Local player hand.
6. Opponent hands.
7. Deck/card count.
8. 3x3 board.
9. Dice result.
10. Available/current action.

## Codex Instruction

```txt
Connect the mock UI to the real game state using Zustand.

STRICT ZUSTAND RULE — Anti-rerenders:

Never extract the full store inside components.

Incorrect:
const state = useGameStore();

Correct:
const currentTurn = useGameStore((state) => state.currentTurn);

Atomic selectors are mandatory to avoid unnecessary re-renders and accidental Framer Motion animation resets.

CRITICAL CONTEXT RULE:
We will connect by layers.

Do not connect everything in one prompt.

Ask me which layer to connect first:
- Round
- Players
- Current turn
- Scores
- Local hand
- Opponent hands
- Deck count
- Board 3x3
- Dice result
- Available actions

Give the exact code update only for that layer.

Do not change game rules.
Do not add drag and drop.
```

## Checklist

- [x] Round connected.
- [x] Players connected.
- [x] Current turn connected.
- [x] Scores connected.
- [x] Local player hand connected.
- [x] Opponent hands connected.
- [x] Deck/card count connected.
- [x] 3x3 board connected.
- [x] Dice result connected.
- [x] Available actions connected.
- [x] No full-store selectors.
- [x] No game rule changes.
- [x] No drag and drop.

## Completion Notes

Phase 6 was reviewed and accepted as complete on 2026-05-02.

Evidence:

- Zustand-connected containers are present for round, players, current turn, scores, local hand, opponent hands, deck count, board slots, dice result, and available actions.
- `web/src/features/game/ui/mockData.ts` still exists as a Phase 3 artifact, but it is not imported by the active game screen path.
- No empty `useFrozenGuildStore()` full-store subscriptions were found in `web/src`.
- No drag-and-drop handlers or Tailwind usage were introduced for Phase 6.

Architectural caution before Phase 7:

- There are parallel UI trees under `web/src/features/game/ui` and `web/src/ui/screens`. Phase 7 should target the currently rendered canonical game screen path to avoid polishing the wrong surface.

## Acceptance Criteria

The screen no longer depends on mock data and reflects the real game state through atomic Zustand selectors.

---

# Phase 7 — Visual States and Framer Motion Interaction

## Objective

Make the UI clearly communicate what is happening.

## Important States

```txt
Selected card
Disabled card
Revealed card
Hidden card
Active turn
Current player
Available action
Disabled action
Dice result
Turn change
Score change
```

## Codex Instruction

```txt
Integrate Framer Motion into the current UI for visual state feedback:

- Highlight the active player.
- Animate revealed and selected cards.
- Animate dice result appearance.
- Animate score changes subtly.
- Show disabled actions with a clear inactive style.
- Show available action with a clear active style.
- Add a subtle turn-change transition.

Animations must be subtle and must not block the React flow.

Continue using atomic Zustand selectors so animations do not reset accidentally due to global renders.

No drag and drop.
No game rule changes.
```

## Checklist

- [x] Active player visible.
- [x] Available action visible.
- [x] Disabled action clear.
- [x] Dice result emphasized.
- [x] Selected card state clear.
- [x] Hidden/revealed card states clear.
- [x] Score change animation subtle.
- [x] Turn change transition subtle.
- [x] No motion overload.
- [x] No animation resets from global store reads.

## Completion Notes

Phase 7 was reviewed and accepted as complete on 2026-05-02.

Evidence:

- Active player, available action, disabled action, dice result, selected card, hidden/revealed card, score delta, and turn-change feedback were added to the active rendered UI path under `web/src/ui`.
- Motion is intentionally subtle and uses small transform/opacity transitions instead of heavy blur/backdrop animation.
- No empty `useFrozenGuildStore()` full-store subscriptions were found in the active UI path.
- Targeted verification passed: `npm run test -- tests/web/fg-ui-phase7-visual-feedback-contract.test.ts`.
- Vite public asset path violations found during review were corrected to absolute `/assets/...` paths.

## Acceptance Criteria

A new player can quickly understand:

```txt
Whose turn it is
What action is available
What changed after the dice roll
Which cards matter
Who is winning
What can be clicked
```

---

# Phase 8 — Premium Visual Polish

## Objective

Move the UI from “good mockup” to “game-ready premium interface.”

## Polish Targets

- Better ice panel depth.
- Better crystal/glass frame styling.
- Cold glow on active elements.
- Hover states.
- Smooth transitions.
- Improved visual hierarchy.
- Better background/UI integration.
- Player hand feels like the main personal area.
- Opponents feel like a poker table side rail.
- Less rectangular, more embedded in the frozen environment.

## Codex Instruction

```txt
Perform a premium visual polish pass over the current game UI.

Improve:

1. Panel depth.
2. Ice/crystal frames.
3. Subtle glows on active cards and buttons.
4. Hover states.
5. Visual hierarchy.
6. Background integration.
7. Local player hand presence.
8. Opponent rail presentation.
9. Text contrast and readability.
10. Overall Frozen Guild identity.

Use theme.css and CSS Modules.

Do not change the main layout.
Do not break game logic.
Do not add new dependencies unless strictly necessary.
No Tailwind.
```

## Checklist

- [x] Panels have depth.
- [x] Frames feel icy/premium.
- [x] Active elements glow.
- [x] Hover states are polished.
- [x] Text contrast improved.
- [x] Local hand is visually dominant.
- [x] Opponent panel feels integrated.
- [x] Board remains clean.
- [x] Background supports the UI instead of fighting it.
- [x] No unnecessary dependencies.

## Completion Notes

Phase 8 was reviewed and accepted as complete on 2026-05-02.

Evidence:

- Premium polish was applied to the active rendered UI path under `web/src/ui`.
- Panels, frames, hover states, active glows, player rails, board styling, and shared controls now use a more cohesive Frozen Guild ice/glass treatment.
- No unnecessary dependencies were added.
- No `/src/assets` references remain under `web/src/ui`; runtime asset references use Vite-safe `/assets/...` paths.
- Targeted verification passed: `npm run test -- tests/web/fg-ui-phase7-visual-feedback-contract.test.ts`.

## Acceptance Criteria

The screen should be strong enough for a visual demo.

---

# Phase 9 — Minimum Desktop Responsive Pass

## Objective

Do not build mobile yet, but prevent the UI from breaking on standard desktop screens.

## Required Viewports

```txt
1366x768
1440x900
1536x864
1920x1080
```

## Codex Instruction

```txt
Review and adjust the desktop-first UI so it works correctly on:

- 1366x768
- 1440x900
- 1536x864
- 1920x1080

Do not build mobile yet.

Adjust:

- card scale
- panel widths
- panel heights
- gaps
- font sizes
- overflow
- player hand height
- opponent panel width
- board size
- action button size

Use CSS variables, clamp(), min-height, max-height, and fluid sizing when appropriate.

No Tailwind.
```

## Checklist

- [ ] No horizontal overflow.
- [ ] No clipped player cards.
- [ ] No overlapping opponents.
- [ ] Buttons remain legible.
- [ ] Score remains legible.
- [ ] Full board remains visible.
- [ ] Dice remains visible.
- [ ] Player hand remains visible.
- [ ] 1366x768 is usable.
- [ ] 1920x1080 still feels premium, not empty.

## Acceptance Criteria

The UI works across common desktop sizes without requiring manual browser zoom.

---

# Phase 10 — Cleanup, Documentation, and Closeout

## Objective

Leave the repository ready for future iteration without visual or architectural debt.

## Codex Instruction

```txt
Perform final UI cleanup.

I need:

1. Remove unused mocks.
2. Remove orphan interfaces.
3. Remove dead imports.
4. Review component names.
5. Document the visual architecture in:

docs/ui-architecture.md

6. Document missing or future assets in:

docs/assets-todo.md

7. Ensure the build passes:

npm run build

8. Run lint if available:

npm run lint

9. Make sure Storybook still works if it is already configured:

npm run storybook
```

## Checklist

- [ ] Unused mocks removed.
- [ ] Orphan interfaces removed.
- [ ] Dead imports removed.
- [ ] Component names reviewed.
- [ ] `docs/ui-architecture.md` created.
- [ ] `docs/assets-todo.md` created.
- [ ] `npm run build` passes.
- [ ] `npm run lint` passes if available.
- [ ] Storybook still runs if configured.
- [ ] Lobby connected.
- [ ] Game UI connected.
- [ ] No Tailwind introduced.
- [ ] No drag and drop introduced.
- [ ] No game rules changed.

## Acceptance Criteria

Minimum commands:

```bash
npm install
npm run build
npm run dev
```

If available:

```bash
npm run lint
npm run storybook
```

The repo should be clean enough to continue development without guessing how the UI is structured.

---

# Global Non-Negotiables

These rules must stay active during the whole project.

1. **No Tailwind.** Use CSS Modules and native CSS variables only.
2. **Iterative code generation.** Do not generate multiple complex components at once.
3. **Vite public asset rule.** Reference `public/assets` exclusively with absolute root paths, for example `/assets/backgrounds/game-board-bg.png`.
4. **Zustand atomic selectors only.** Do not read the full store inside components.
5. Do not change game rules.
6. Do not add drag and drop.
7. Actions are triggered through the dice system.
8. Do not break the existing 3x3 board.
9. Do not make the project mobile-first.
10. Do not add dependencies unless they are clearly justified.
11. Do not mix visual mock logic with game rules.
12. Keep styling local through CSS Modules.
13. Keep global CSS limited to tokens, resets, and base variables.
14. Do not hardcode asset paths directly inside many components; use `assets.ts`.
15. Every phase must end with a small checklist and acceptance criteria.

---

# Master Prompt to Start the OpenCode/Codex Chat

```txt
Act as a Staff Frontend Engineer specialized in Game UI, React, CSS Modules, Zustand, and Framer Motion.

We are working on FrozenGuild.

Stack:
- Vite
- React
- TypeScript
- Zustand
- Framer Motion
- CSS Modules
- Storybook

Strict rule:
- No Tailwind.

Goal:
Move the current UI to a premium desktop-first game interface for a mafia penguin card game on ice.

The final UI needs:
- 3x3 board
- left status/score/deck panel
- right opponents panel with visible hands
- bottom-center dice/action area
- bottom-right local player hand
- lobby avatar/name/color selection
- premium frozen visual identity

Global Rules:
1. No Tailwind. CSS Modules only.
2. Use absolute root paths for Vite public assets.
3. Use atomic Zustand selectors only.
4. Work iteratively. Never output multiple complex components at once.
5. Do not implement drag and drop.
6. Do not change game rules.
7. Do not break the 3x3 board.
8. First build mock visual UI, then connect real game state.

First Task — Phase 0:
Audit the current repo and create:

docs/ui-audit.md

The audit must include:
1. Current web/src structure.
2. Existing React components.
3. Existing Zustand stores.
4. Shared game types.
5. Where 3x3 board logic lives.
6. Where players, turn, hand, dice, and action logic live.
7. Existing assets.
8. Which files should be reused.
9. Which files should not be touched yet.
10. Technical risks.

Do not modify code yet.
```

---

# Additional Items Worth Adding

After reviewing the updated plan, these additions are worth keeping in the final workflow:

## 1. Visual QA Screenshots

Add a small QA step after Phase 4 and Phase 9.

```txt
Capture screenshots at:
- 1366x768
- 1440x900
- 1536x864
- 1920x1080

Compare them against the target visual reference.

Document issues in:
docs/ui-qa-notes.md
```

## 2. Accessibility Minimums

Even for a stylized game UI, keep a small accessibility baseline.

```txt
- Buttons must have readable labels.
- Interactive elements must support keyboard focus.
- Disabled states must be visually clear.
- Text contrast must remain readable over the background.
- Motion should stay subtle.
```

## 3. Performance Guardrails

Because this UI uses blur, shadows, animations, and card rendering:

```txt
- Avoid huge PNGs where WebP is acceptable.
- Avoid animating heavy backdrop-filter containers.
- Prefer transform and opacity animations.
- Avoid global Zustand subscriptions.
- Avoid re-rendering the full GameShell on every small state change.
```

## 4. Storybook Scope

Storybook is not mandatory for every component, but it is useful for:

```txt
- PlayerCard
- ActionButton
- OpponentRow
- DicePanel
- PlayerHand
- BoardCardSlot
```

That is enough to validate visual states without over-documenting the whole project.

## 5. Asset Naming Convention

Recommended rule:

```txt
asset-name.variant.size.ext
```

Examples:

```txt
player-hand-frame.default.2x.webp
card-back.dreamcatcher.2x.webp
avatar-don-krill.default.512.webp
icon-fish.solid.svg
```

---

# Suggested Execution Order

```txt
1. Repository audit
2. Asset map
3. Theme tokens
4. Visual prop contract
5. Isolated mock components
6. Static GameShell composition
7. Lobby avatar/name/color
8. Connect Zustand by layers
9. Visual states and Framer Motion
10. Premium polish
11. Desktop responsive QA
12. Cleanup and documentation
```

---

# Critical Recommendation

The most dangerous part is not creating the art. The dangerous part is connecting a beautiful UI to real game state without turning the app into a rerender machine.

Keep this separation strict:

```txt
Mock visual first.
Zustand connection second.
Framer Motion states third.
Premium polish last.
```

That workflow gives Codex less room to damage the game logic and gives you better checkpoints for review.
