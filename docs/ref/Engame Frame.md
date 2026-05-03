# Frozen Guild — End Game / Results Flow

## Context

Implement the **End Game / Results** flow for Frozen Guild.

Important: the server does **not** generate `end_game` yet, so this task includes both:

1. Server-side final score calculation.
2. Frontend final results overlay.

This should be treated as a complete endgame flow, not only as a visual modal.

---

## Goal

When the match ends, the server must calculate the final score for every player and expose a `gameover` / `end_game` state to the UI.

The frontend must show a centered **RESULTADOS** overlay on top of the current game board.

The board should remain visible behind the overlay, but it must be visually inactive using:

- Dark overlay.
- Background dimming.
- Backdrop blur.

---

## Server Responsibility

The server must calculate final scores.

Do **not** calculate final scoring in the frontend.

The final payload should use the term:

```ts
fishes
```

Suggested shape:

```ts
type FinalResultPlayer = {
  playerID: string;
  nickname: string;
  avatarId: string;
  fishes: number;
  placement: number;
};

type FinalResults = {
  players: FinalResultPlayer[];
};
```

---

## Ranking Rules

Players are ranked by final `fishes`.

Rules:

- Highest `fishes` wins.
- If players tie, they share the same placement.
- Use **dense ranking**.

Example:

```txt
25 fishes -> 1°
25 fishes -> 1°
18 fishes -> 2°
12 fishes -> 3°
```

Do **not** use competitive ranking like this:

```txt
25 fishes -> 1°
25 fishes -> 1°
18 fishes -> 3°
```

---

## UI Responsibility

Create a final results overlay triggered when the game reaches `gameover` / `end_game`.

The overlay title must be:

```txt
RESULTADOS
```

Inside the panel, show all players in a horizontal row from left to right, ordered by final result.

Each player item must show:

- Placement badge: `1°`, `2°`, `3°`, etc.
- Selected lobby avatar.
- Nickname.
- `fishes` score.
- Small fish icon next to the score.

The same avatars selected in the lobby must be reused here.

Do **not** hardcode penguin images if the player already has an avatar selection state.

---

## Player Layout

Support **1–4 players**.

For 4 players, use one horizontal row:

```txt
[Player 1] [Player 2] [Player 3] [Player 4]
```

The order should follow the final ranking from left to right.

The first place should feel visually important, but the layout should remain clean and balanced.

---

## Button

Add one button at the bottom:

```txt
Volver al lobby
```

The button should return the user to the lobby screen.

---

## Visual Direction

The panel should feel like an icy Frozen Guild final results card.

The rest of the board must be darkened and blurred behind the modal so the results panel feels clearly above the game.

The overlay should block interaction with the board.

Visual requirements:

- Centered modal/panel.
- Frozen / icy border or frame.
- Dark blue interior.
- Clear title.
- Horizontal player result row.
- Fish score readable at a glance.
- Board behind remains visible but inactive.

---

## Suggested Component Names

Frontend components may be organized like this:

```txt
web/src/components/FinalResultsOverlay.tsx
web/src/components/FinalResultPlayerCard.tsx
web/src/screens/FinalScoreScreen.tsx
```

If the current project already has a different structure, adapt to the existing architecture instead of duplicating screens unnecessarily.

---

## Suggested Data Contract

```ts
type FinalResultPlayer = {
  playerID: string;
  nickname: string;
  avatarId: string;
  fishes: number;
  placement: number;
};

type FinalResults = {
  players: FinalResultPlayer[];
};
```

Example:

```ts
const finalResults: FinalResults = {
  players: [
    {
      playerID: "player-1",
      nickname: "Player 1",
      avatarId: "penguin-black",
      fishes: 25,
      placement: 1,
    },
    {
      playerID: "player-2",
      nickname: "Player 2",
      avatarId: "penguin-blue",
      fishes: 25,
      placement: 1,
    },
    {
      playerID: "player-3",
      nickname: "Player 3",
      avatarId: "penguin-purple",
      fishes: 18,
      placement: 2,
    },
    {
      playerID: "player-4",
      nickname: "Player 4",
      avatarId: "penguin-green",
      fishes: 12,
      placement: 3,
    },
  ],
};
```

---

## End Game Trigger

The UI should show the overlay only when the match is finished.

Possible trigger:

```ts
if (ctx.gameover || G.gameover || G.finalResults) {
  showFinalResultsOverlay();
}
```

Use the actual boardgame.io state shape already present in the project.

Do not invent a parallel frontend-only endgame state if the server can provide the result.

---

## Acceptance Criteria

- The server calculates final `fishes`.
- The server exposes final results when the game ends.
- The frontend does not duplicate scoring logic.
- The results screen appears only when the game is finished.
- The title says `RESULTADOS`.
- Players are shown in one horizontal row.
- Ranking supports ties using dense ranking: `1°, 1°, 2°`.
- Each player shows avatar, nickname, fishes score and fish icon.
- The same lobby avatar is reused in the results screen.
- The board behind is dimmed and blurred.
- The overlay blocks interaction with the board.
- There is a `Volver al lobby` button at the bottom.
- The UI supports 1–4 players.

---

## Final Instruction for the Agent

Implement this incrementally:

1. Add or confirm server-side final score calculation.
2. Add final results payload using `fishes`.
3. Add dense ranking calculation.
4. Add frontend overlay with mocked final data.
5. Connect overlay to real `gameover` / `end_game` state.
6. Reuse lobby avatars.
7. Add `Volver al lobby` behavior.
8. Polish the frozen visual style without adding unnecessary complexity.

Keep it simple, clean and MVP-focused.
