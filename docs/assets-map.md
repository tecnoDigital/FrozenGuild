# Frozen Guild Asset Map (Phase 1)

This map documents the new `web/public/assets` structure, what is already available, and what remains as future art production.

## Rules

- Public assets are referenced with absolute Vite-safe paths: `/assets/...`.
- Existing runtime imports under `web/src/assets` were preserved to avoid breaking current game behavior.
- New UI work should consume `web/src/ui/assets.ts` as the centralized contract.

## Section by section

| UI Section | Asset Group | Status | Notes |
|---|---|---|---|
| Global brand header/footer | `assets/brand/*` | Missing (future) | `logo-frozen-guild.png`, `logo-frozen-guild-small.png` are placeholders in contract only. |
| Game table background | `assets/backgrounds/game-board-bg.webp` | Existing (mapped) | Copied from `web/src/assets/game-ice-bg.webp`. |
| Lobby background | `assets/backgrounds/lobby-bg.png` | Existing (mapped) | Copied from `web/src/assets/Lobby-background.png`. |
| Board center decoration | `assets/backgrounds/ice-table-center.png` | Missing (future) | Reserved for premium center vignette. |
| Card backs | `assets/cards/backs/frozen-dreamcatcher-back.png` | Existing (mapped) | Copied from `web/src/assets/cards/Reverso.png`. |
| Card fronts | `assets/cards/fronts/{hearts,diamonds,clubs,spades}` | Partial | Existing gameplay card images copied to suit folder``s as temporary placements. Final suit-specific art still pending. |
| Card state overlays | `assets/cards/states/*` | Partial | `card-hidden.png` currently mapped from placeholder; selected/disabled/highlighted are future assets. |
| Lobby avatars | `assets/characters/avatars/*` | Missing (future) | Character portrait set pending. |
| Opponent portraits | `assets/characters/opponents/*` | Missing (future) | Opponent badges/portraits pending. |
| Panel frames | `assets/ui/frames/*` | Partial | `score-panel-frame.png` temporarily mapped from `Marco.png`; others pending. |
| Action icons | `assets/ui/icons/*` | Partial | Temporary PNG sources exist (`dice.png`, `fish.png`), but contract uses final SVG names pending design export. |
| UI state FX | `assets/ui/states/*` | Missing (future) | Glow and burst FX assets pending. |
| UI decorations | `assets/ui/decorations/*` | Missing (future) | Frozen corners/dividers/aurora overlays pending. |
| Lobby frame kit | `assets/lobby/*` | Missing (future) | Lobby panel and selector frame assets pending. |

## Existing source-to-public mappings applied now

| Previous source (`web/src/assets`) | New public path (`web/public/assets`) |
|---|---|
| `game-ice-bg.webp` | `backgrounds/game-board-bg.webp` |
| `Lobby-background.png` | `backgrounds/lobby-bg.png` |
| `cards/Reverso.png` | `cards/backs/frozen-dreamcatcher-back.png` |
| `placeholder.png` | `cards/states/card-hidden.png` |
| `cards/penguin-1.png` | `cards/fronts/spades/penguin-1.png` |
| `cards/penguin-2.png` | `cards/fronts/spades/penguin-2.png` |
| `cards/penguin-3.png` | `cards/fronts/spades/penguin-3.png` |
| `cards/walrus.png` | `cards/fronts/hearts/walrus.png` |
| `cards/petrel.png` | `cards/fronts/diamonds/petrel.png` |
| `cards/sea-elephant.png` | `cards/fronts/clubs/sea-elephant.png` |
| `cards/krill.png` | `cards/fronts/hearts/krill.png` |
| `cards/orca.png` | `cards/fronts/clubs/orca.png` |
| `cards/seal_bomb.png` | `cards/fronts/diamonds/seal-bomb.png` |
| `dice.png` | `ui/icons/dice.png` |
| `fish.png` | `ui/icons/fish.png` |
| `Icon-Pez.png` | `ui/icons/fish-alt.png` |
| `Icon-Pez negro.png` | `ui/icons/fish-dark.png` |
| `Marco.png` | `ui/frames/score-panel-frame.png` |

## Future migration note

Current game still reads card assets from `web/src/view-model/assetMap.ts` and `/src/assets/...` paths. That was intentionally kept untouched in this phase to avoid gameplay regressions. Later UI phases can migrate consumers to `assets.ts` incrementally.
