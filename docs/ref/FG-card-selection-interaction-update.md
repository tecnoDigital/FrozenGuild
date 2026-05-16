# Frozen Guild — Card Selection Interaction Update

## Goal

Implement a clean and reusable card interaction system for Frozen Guild.

The goal is to make card selection visually clear without duplicating logic across screens or components.

## Visual States

Each card must support these interaction states.

### 1. Idle / Resting Card

When the card is not part of the current interaction:

```txt
opacity: 1
scale: 1
```

No extra selection overlay should be shown.

This state means:

> This card is visible, but it is not currently selectable.

---

### 2. Selectable Card

When the card can be selected by the player:

```txt
opacity: 1
scale: 1
show selected asset / selection frame
```

Use the existing `selected` asset as a visual overlay or frame to indicate that the card is available to click.

This state means:

> You can choose this card.

Important: this does **not** mean the card has already been chosen.

---

### 3. Selected Card

When the player actually chooses the card:

```txt
opacity: 1
scale: 1.1
show selected asset / selection frame
```

This state means:

> This card is currently selected.

The scale increase should be subtle, clean, and animated with a short transition.

---

### 4. Disabled Card

When a card is visible but cannot be interacted with during the current action:

```txt
opacity: 0.45
scale: 1
pointer-events: none
```

This state means:

> This card exists, but it cannot be selected right now.

Use this only when it helps clarify the current action. Do not overuse disabled styling if the screen becomes visually noisy.

## Clean Code Requirement

Do not implement this behavior with repeated inline styles in every screen.

Create a single clean system inside the `Card` component.

Recommended props:

```ts
type CardInteractionState = 'idle' | 'selectable' | 'selected' | 'disabled';

type CardProps = {
  card?: CardView;
  hidden?: boolean;
  interactionState?: CardInteractionState;
  onClick?: () => void;
};
```

The `Card` component should internally map the interaction state to CSS classes.

Example:

```tsx
const interactionClass = {
  idle: styles.idle,
  selectable: styles.selectable,
  selected: styles.selected,
  disabled: styles.disabled,
}[interactionState ?? 'idle'];
```

Then apply it like this:

```tsx
<div className={`${styles.card} ${interactionClass}`} onClick={onClick}>
  {cardContent}

  {(interactionState === 'selectable' || interactionState === 'selected') && (
    <img
      className={styles.selectionOverlay}
      src={selectedAsset}
      alt=""
      aria-hidden="true"
    />
  )}
</div>
```

## CSS Behavior

```css
.card {
  position: relative;
  opacity: 1;
  transform: scale(1);
  transition:
    transform 160ms ease,
    opacity 160ms ease,
    filter 160ms ease;
}

.idle {
  opacity: 1;
  transform: scale(1);
}

.selectable {
  opacity: 1;
  transform: scale(1);
  cursor: pointer;
}

.selected {
  opacity: 1;
  transform: scale(1.1);
  cursor: pointer;
  z-index: 2;
}

.disabled {
  opacity: 0.45;
  transform: scale(1);
  pointer-events: none;
}

.selectionOverlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
```

## Naming Clarification

Even if the asset file is called `selected`, use it for both `selectable` and `selected` states.

In code, keep the concepts separated:

```ts
selectable = the card can be chosen
selected = the card has already been chosen
```

This avoids confusing “available to click” with “already selected.”

## Important Behavior

- Idle cards remain normal.
- Selectable cards show the `selected` asset but do not scale up.
- Selected cards show the `selected` asset and scale to `1.1`.
- Disabled cards reduce opacity and cannot be clicked.
- The frontend should only handle visual selection state.
- Game rule validation still belongs to the server.
- The visual selection system must be reusable across the whole game.

## Reusable Use Cases

This interaction system should work for:

- El Hielo slots
- Player zones
- Orca resolution
- Foca-Bomba resolution
- Intercambio
- Espionaje

## Implementation Direction

Prefer this structure:

```txt
Card.tsx
Card.module.css
assets/ui/selected.png
```

The screens should only decide the state:

```tsx
<Card
  card={card}
  interactionState={isSelected ? 'selected' : isSelectable ? 'selectable' : 'idle'}
  onClick={isSelectable ? handleSelectCard : undefined}
/>
```

The screens should not manually apply scale, opacity, overlay images, or selection CSS.

## Acceptance Criteria

- The `Card` component owns the visual interaction behavior.
- Screens do not duplicate card styling logic.
- A card at rest has opacity `1` and scale `1`.
- A selectable card shows the `selected` asset.
- A selectable card does not scale up yet.
- A selected card shows the `selected` asset.
- A selected card scales to `1.1`.
- Disabled cards have reduced opacity and cannot be clicked.
- The transition feels smooth but not exaggerated.
- The implementation remains simple, typed, and reusable.
