import React, { useMemo, useState } from "react";

/**
 * Frozen Guild — PlayerHandFan.jsx
 *
 * Pieza limpia para llevar al proyecto real.
 *
 * Responsabilidades:
 * - Renderizar la zona inferior del jugador.
 * - Mantener abanico suave de cartas.
 * - Compactar cartas iguales en stacks visuales cuando hay 3+.
 * - No mutar el array real recibido desde el servidor.
 * - No resolver reglas, no seleccionar cartas, no llamar moves.
 *
 * En producción sugerida:
 * components/
 * ├─ Card.tsx
 * ├─ PlayerHandFan.tsx
 * └─ PlayerZone.tsx
 */

const CARD_ASSET_FALLBACK = "/assets/cards/card-basic.png";
const STACK_THRESHOLD = 3;
const CARD_WIDTH = 150;

const CARD_TYPE_LABEL = {
  penguin: "PUNTOS",
  walrus: "X2",
  petrel: "SET",
  krill: "BONO",
  orca: "EFECTO",
  seal_bomb: "RIESGO",
  sea_elephant: "N²",
  mountain: "HIELO",
};

const TYPE_BY_NAME = {
  Pingüino: "penguin",
  Morsa: "walrus",
  Petrel: "petrel",
  Krill: "krill",
  Orca: "orca",
  "Foca-Bomba": "seal_bomb",
  "Elefante Marino": "sea_elephant",
  Montaña: "mountain",
};

const MOCK_LIBRARY = [
  "Pingüino",
  "Morsa",
  "Petrel",
  "Krill",
  "Orca",
  "Foca-Bomba",
  "Elefante Marino",
  "Montaña",
];

const INITIAL_CARDS = [
  makeMockCard(1, "Pingüino", { value: 2 }),
  makeMockCard(2, "Morsa", { value: 3 }),
  makeMockCard(3, "Petrel", { value: 1 }),
  makeMockCard(4, "Krill", { value: 1 }),
  makeMockCard(5, "Orca", { value: null }),
];

/**
 * @typedef {Object} CardView
 * @property {string} id
 * @property {string} name
 * @property {string} type
 * @property {number|null|undefined} value
 * @property {string|undefined} image
 */

/**
 * @typedef {Object} VisualHandSlot
 * @property {string} id
 * @property {'single'|'stack'} kind
 * @property {CardView} displayCard
 * @property {CardView[]} cards
 * @property {number} count
 * @property {number} firstIndex
 */

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Define cuándo dos cartas son visualmente iguales.
 *
 * Importante:
 * - Incluimos value para evitar apilar Pingüinos de distinto valor.
 * - En producción puedes cambiar esta llave si tu modelo de cartas tiene rank, variant o subtype.
 */
function getStackKey(card) {
  return [card.type, card.name, card.value ?? "none"].join(":");
}

/**
 * Convierte la mano real en una vista visual compactada.
 *
 * No muta `cards`.
 * No elimina cartas.
 * Solo decide cómo representarlas visualmente.
 */
function buildVisualHandSlots(cards, { stackThreshold = STACK_THRESHOLD } = {}) {
  const groups = new Map();
  const orderedKeys = [];

  cards.forEach((card, index) => {
    const key = getStackKey(card);

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        firstIndex: index,
        cards: [],
      });
      orderedKeys.push(key);
    }

    groups.get(key).cards.push(card);
  });

  return orderedKeys.flatMap((key) => {
    const group = groups.get(key);
    const shouldStack = group.cards.length >= stackThreshold;

    if (shouldStack) {
      return [
        {
          id: `stack:${key}`,
          kind: "stack",
          displayCard: group.cards[group.cards.length - 1],
          cards: group.cards,
          count: group.cards.length,
          firstIndex: group.firstIndex,
        },
      ];
    }

    return group.cards.map((card, offset) => ({
      id: card.id,
      kind: "single",
      displayCard: card,
      cards: [card],
      count: 1,
      firstIndex: group.firstIndex + offset,
    }));
  });
}

/**
 * Calcula el abanico visual.
 * La cantidad que recibe ya es la cantidad de slots visibles, no necesariamente la cantidad real de cartas.
 */
function computeFanTransforms(slotCount, cardWidth = CARD_WIDTH) {
  if (slotCount <= 0) return [];

  const center = (slotCount - 1) / 2;
  const maxRotation = clamp(7 + slotCount * 0.65, 10, 17);
  const overlap = clamp(
    cardWidth * (0.34 + slotCount * 0.012),
    cardWidth * 0.34,
    cardWidth * 0.52
  );
  const step = cardWidth - overlap;
  const liftCurve = clamp(9 + slotCount * 1.1, 14, 24);

  return Array.from({ length: slotCount }, (_, index) => {
    const distance = index - center;
    const normalized = center === 0 ? 0 : distance / center;

    return {
      x: distance * step,
      y: Math.abs(normalized) * liftCurve,
      rotation: normalized * maxRotation,
      zIndex: index + 1,
    };
  });
}

function getTypeLabel(type) {
  return CARD_TYPE_LABEL[type] ?? "CARTA";
}

function cssVarsFromTransform(transform) {
  return {
    "--card-x": `${transform.x}px`,
    "--card-y": `${transform.y}px`,
    "--card-r": `${transform.rotation}deg`,
    "--card-z": transform.zIndex,
  };
}

function PlayerHandFan({
  cards,
  ownerName = "Zona del jugador",
  newestCardId = null,
  compactStacks = true,
  showCount = true,
}) {
  const visualSlots = useMemo(
    () =>
      compactStacks
        ? buildVisualHandSlots(cards)
        : cards.map((card, index) => ({
            id: card.id,
            kind: "single",
            displayCard: card,
            cards: [card],
            count: 1,
            firstIndex: index,
          })),
    [cards, compactStacks]
  );

  const fanTransforms = useMemo(
    () => computeFanTransforms(visualSlots.length),
    [visualSlots.length]
  );

  const stackCount = visualSlots.filter((slot) => slot.kind === "stack").length;

  return (
    <section className="fg-hand" aria-label={ownerName}>
      <header className="fg-hand__header">
        <span>{ownerName}</span>
        {showCount ? (
          <small>
            {cards.length} cartas{stackCount ? ` · ${stackCount} stack${stackCount > 1 ? "s" : ""}` : ""}
          </small>
        ) : null}
      </header>

      <div className="fg-hand__stage">
        <div className="fg-hand__soft-rail" aria-hidden="true" />

        <div className="fg-hand__fan">
          {visualSlots.map((slot, index) => (
            <HandCardSlot
              key={slot.id}
              slot={slot}
              isNew={slot.cards.some((card) => card.id === newestCardId)}
              style={cssVarsFromTransform(fanTransforms[index])}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function HandCardSlot({ slot, style, isNew = false }) {
  const isStack = slot.kind === "stack";
  const className = [
    "fg-hand-card",
    isStack ? "fg-hand-card--stack" : "",
    isNew ? "fg-hand-card--new" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article
      className={className}
      style={style}
      aria-label={isStack ? `${slot.displayCard.name}, ${slot.count} cartas` : slot.displayCard.name}
    >
      <div className="fg-hand-card__tilt">
        {isStack ? <StackGhostLayers count={slot.count} /> : null}
        <GameCard card={slot.displayCard} />
      </div>
    </article>
  );
}

function StackGhostLayers({ count }) {
  return (
    <>
      <div className="fg-stack-layer fg-stack-layer--back" aria-hidden="true" />
      <div className="fg-stack-layer fg-stack-layer--mid" aria-hidden="true" />
      <span className="fg-stack-count">×{count}</span>
    </>
  );
}

function GameCard({ card }) {
  return (
    <div className="fg-card">
      <img
        className="fg-card__asset"
        src={card.image || CARD_ASSET_FALLBACK}
        alt=""
        draggable="false"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />

      <div className="fg-card__fallback" aria-hidden="true">
        <div className="fg-card__snow">✦</div>
      </div>

      <div className="fg-card__topline">
        <span className="fg-card__value">{card.value ?? "—"}</span>
        <span className="fg-card__type">{getTypeLabel(card.type)}</span>
      </div>

      <div className="fg-card__body">
        <div className="fg-card__emblem">❄</div>
      </div>

      <footer className="fg-card__footer">
        <strong>{card.name}</strong>
      </footer>
    </div>
  );
}

function makeMockCard(index, name, overrides = {}) {
  return {
    id: `c-${String(index).padStart(3, "0")}`,
    name,
    type: TYPE_BY_NAME[name] ?? "penguin",
    value: name === "Orca" ? null : (index % 3) + 1,
    image: CARD_ASSET_FALLBACK,
    ...overrides,
  };
}

function makeNextMockCard(cards, forcedName = null) {
  const index = cards.length + 1;
  const name = forcedName ?? MOCK_LIBRARY[(index - 1) % MOCK_LIBRARY.length];

  return makeMockCard(index, name, forcedName === "Pingüino" ? { value: 2 } : {});
}

function makeStackDemoHand() {
  return [
    makeMockCard(1, "Pingüino", { value: 2 }),
    makeMockCard(2, "Pingüino", { value: 2 }),
    makeMockCard(3, "Pingüino", { value: 2 }),
    makeMockCard(4, "Pingüino", { value: 2 }),
    makeMockCard(5, "Morsa", { value: 3 }),
    makeMockCard(6, "Orca", { value: null }),
    makeMockCard(7, "Krill", { value: 1 }),
  ];
}

export default function FrozenGuildPlayerHandPreview() {
  const [cards, setCards] = useState(INITIAL_CARDS);
  const [newestCardId, setNewestCardId] = useState(null);
  const [compactStacks, setCompactStacks] = useState(true);

  function pushCard(forcedName = null) {
    setCards((currentCards) => {
      const nextCard = makeNextMockCard(currentCards, forcedName);
      setNewestCardId(nextCard.id);
      return [...currentCards, nextCard];
    });
  }

  function removeLastCard() {
    setNewestCardId(null);
    setCards((currentCards) => currentCards.slice(0, -1));
  }

  function loadStackExample() {
    const nextCards = makeStackDemoHand();
    setNewestCardId(nextCards[3].id);
    setCards(nextCards);
  }

  function resetHand() {
    setNewestCardId(null);
    setCards(INITIAL_CARDS);
  }

  return (
    <main className="fg-preview">
      <style>{styles}</style>

      <section className="fg-board-mock">
        <div className="fg-board-mock__header">
          <div>
            <p>Frozen Guild</p>
            <h1>Player Hand Fan</h1>
          </div>

          <div className="fg-controls" aria-label="Controles de prueba">
            <button type="button" onClick={removeLastCard} disabled={cards.length === 0}>
              Reducir
            </button>
            <button type="button" onClick={() => pushCard()}>
              Agregar carta
            </button>
            <button type="button" onClick={() => pushCard("Pingüino")}>
              + Pingüino
            </button>
            <button type="button" onClick={loadStackExample}>
              Caso ×4
            </button>
            <button type="button" onClick={() => setCompactStacks((value) => !value)}>
              {compactStacks ? "Ver sin stacks" : "Compactar stacks"}
            </button>
            <button type="button" onClick={resetHand}>
              Reset
            </button>
          </div>
        </div>

        <div className="fg-table-space">
          <div className="fg-ice-placeholder">
            <span>El Hielo 3×3</span>
          </div>
        </div>

        <PlayerHandFan
          cards={cards}
          newestCardId={newestCardId}
          compactStacks={compactStacks}
        />
      </section>
    </main>
  );
}

const styles = `
:root {
  --fg-card-w: 150px;
  --fg-card-h: 216px;
  --fg-bg: #06111f;
  --fg-ice: #98e7ff;
  --fg-line: rgba(174, 238, 255, 0.38);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
}

.fg-preview {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 28px;
  color: #ecfbff;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background:
    radial-gradient(circle at 50% 22%, rgba(93, 219, 255, 0.24), transparent 34%),
    radial-gradient(circle at 14% 88%, rgba(41, 166, 218, 0.22), transparent 34%),
    linear-gradient(145deg, #030812 0%, #07192a 46%, #0c2a40 100%);
}

.fg-board-mock {
  position: relative;
  width: min(1120px, 100%);
  min-height: 650px;
  overflow: hidden;
  border: 1px solid rgba(206, 246, 255, 0.22);
  border-radius: 34px;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)),
    radial-gradient(circle at center, rgba(145, 234, 255, 0.17), transparent 56%),
    rgba(8, 27, 44, 0.82);
  box-shadow:
    0 34px 90px rgba(0, 0, 0, 0.42),
    inset 0 1px 0 rgba(255,255,255,0.16);
}

.fg-board-mock::before {
  content: "";
  position: absolute;
  inset: 18px;
  border-radius: 26px;
  pointer-events: none;
  border: 1px solid rgba(177, 237, 255, 0.14);
}

.fg-board-mock__header {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 26px 30px 0;
}

.fg-board-mock__header p {
  margin: 0 0 4px;
  color: rgba(207, 244, 255, 0.7);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.fg-board-mock__header h1 {
  margin: 0;
  font-size: clamp(24px, 4vw, 42px);
  letter-spacing: -0.04em;
}

.fg-controls {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
}

.fg-controls button {
  border: 1px solid rgba(179, 239, 255, 0.28);
  border-radius: 999px;
  padding: 10px 14px;
  color: #e9fbff;
  font-weight: 800;
  background: rgba(15, 54, 78, 0.72);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.14);
}

.fg-controls button:disabled {
  opacity: 0.42;
}

.fg-table-space {
  position: absolute;
  inset: 104px 28px 214px;
  display: grid;
  place-items: center;
}

.fg-ice-placeholder {
  width: min(420px, 60vw);
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: 32px;
  color: rgba(225, 249, 255, 0.68);
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  background:
    repeating-linear-gradient(90deg, rgba(171,238,255,0.1) 0 1px, transparent 1px 33.333%),
    repeating-linear-gradient(0deg, rgba(171,238,255,0.1) 0 1px, transparent 1px 33.333%),
    rgba(98, 198, 231, 0.06);
  border: 1px solid rgba(186, 241, 255, 0.18);
}

.fg-hand {
  position: absolute;
  left: 50%;
  bottom: 18px;
  z-index: 5;
  width: min(980px, calc(100% - 40px));
  transform: translateX(-50%);
  padding: 8px 18px 4px;
  border-radius: 34px;
  background:
    radial-gradient(ellipse at 50% 100%, rgba(132, 232, 255, 0.22), transparent 66%),
    linear-gradient(180deg, rgba(181, 239, 255, 0.055), rgba(10, 38, 58, 0.18));
  box-shadow:
    0 26px 52px rgba(0, 0, 0, 0.24),
    inset 0 -1px 0 rgba(197, 245, 255, 0.08);
  backdrop-filter: blur(8px);
}

.fg-hand__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 8px;
  color: rgba(238, 252, 255, 0.72);
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.fg-hand__header small {
  color: rgba(204, 243, 255, 0.68);
  font-size: 11px;
  font-weight: 800;
}

.fg-hand__stage {
  position: relative;
  height: 272px;
  overflow: visible;
}

.fg-hand__soft-rail {
  position: absolute;
  left: 8%;
  right: 8%;
  bottom: 2px;
  height: 22px;
  border-radius: 999px;
  background:
    radial-gradient(ellipse at center, rgba(138, 232, 255, 0.26), transparent 66%),
    linear-gradient(90deg, transparent, rgba(205, 248, 255, 0.14), transparent);
  filter: blur(4px);
}

.fg-hand__fan {
  position: absolute;
  left: 50%;
  bottom: 10px;
  width: 0;
  height: 0;
  transform: translateX(-50%);
}

.fg-hand-card {
  position: absolute;
  left: calc(var(--fg-card-w) / -2);
  bottom: 0;
  width: var(--fg-card-w);
  height: var(--fg-card-h);
  z-index: var(--card-z);
  transform: translate3d(var(--card-x), var(--card-y), 0);
  transition:
    transform 420ms cubic-bezier(0.18, 0.92, 0.22, 1),
    opacity 220ms ease;
  will-change: transform;
}

.fg-hand-card__tilt {
  position: relative;
  width: 100%;
  height: 100%;
  transform: rotate(var(--card-r));
  transform-origin: 50% 108%;
  will-change: transform;
}

.fg-hand-card--new {
  animation: fg-card-align-in 520ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes fg-card-align-in {
  0% {
    opacity: 0;
    transform: translate3d(calc(var(--card-x) + 90px), calc(var(--card-y) + 74px), 0);
  }

  62% {
    opacity: 1;
    transform: translate3d(calc(var(--card-x) - 8px), calc(var(--card-y) - 5px), 0);
  }

  100% {
    opacity: 1;
    transform: translate3d(var(--card-x), var(--card-y), 0);
  }
}

.fg-stack-layer {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  border: 1px solid rgba(213, 250, 255, 0.46);
  background:
    linear-gradient(180deg, rgba(235, 252, 255, 0.9), rgba(105, 186, 215, 0.86));
  box-shadow: 0 14px 26px rgba(0, 0, 0, 0.22);
}

.fg-stack-layer--back {
  transform: translate3d(14px, -16px, 0) rotate(3.5deg);
  opacity: 0.54;
}

.fg-stack-layer--mid {
  transform: translate3d(8px, -8px, 0) rotate(1.8deg);
  opacity: 0.74;
}

.fg-stack-count {
  position: absolute;
  top: -24px;
  right: -18px;
  z-index: 8;
  min-width: 42px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  color: #062034;
  font-size: 15px;
  font-weight: 1000;
  letter-spacing: -0.04em;
  background:
    radial-gradient(circle at 35% 22%, #ffffff, #bdf7ff 34%, #5ed8f5 100%);
  border: 1px solid rgba(239, 253, 255, 0.84);
  box-shadow:
    0 8px 18px rgba(0, 0, 0, 0.28),
    0 0 22px rgba(97, 226, 255, 0.28);
}

.fg-card {
  position: relative;
  z-index: 4;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid rgba(213, 250, 255, 0.62);
  background:
    linear-gradient(180deg, rgba(251,253,255,0.94), rgba(191,225,236,0.96));
  box-shadow:
    0 16px 30px rgba(0, 0, 0, 0.32),
    inset 0 0 0 4px rgba(14, 85, 119, 0.20),
    inset 0 1px 0 rgba(255,255,255,0.92);
}

.fg-card::before {
  content: "";
  position: absolute;
  inset: 7px;
  z-index: 2;
  border-radius: 11px;
  border: 1px solid rgba(8, 81, 116, 0.35);
  pointer-events: none;
}

.fg-card__asset {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fg-card__fallback {
  position: absolute;
  inset: 8px 8px 44px;
  z-index: 0;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background:
    radial-gradient(circle at 50% 42%, rgba(236, 252, 255, 0.95), transparent 12%),
    radial-gradient(circle at 50% 50%, rgba(82, 200, 236, 0.38), transparent 50%),
    linear-gradient(145deg, #0b3a59, #0a2033 72%);
}

.fg-card__snow {
  color: rgba(228, 252, 255, 0.92);
  font-size: 52px;
  text-shadow: 0 0 22px rgba(96, 218, 255, 0.62);
}

.fg-card__topline {
  position: relative;
  z-index: 4;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 9px 10px 0;
}

.fg-card__value {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  color: #effcff;
  font-size: 16px;
  font-weight: 1000;
  background:
    radial-gradient(circle at 35% 20%, #eaffff, #4bd3ff 32%, #0d638a 70%);
  border: 1px solid rgba(231, 253, 255, 0.74);
  box-shadow: 0 4px 10px rgba(0,0,0,0.24);
}

.fg-card__type {
  max-width: 72px;
  padding: 4px 7px;
  border-radius: 999px;
  color: rgba(6, 39, 59, 0.82);
  font-size: 9px;
  font-weight: 1000;
  letter-spacing: 0.08em;
  text-align: right;
  background: rgba(232, 251, 255, 0.84);
}

.fg-card__body {
  position: absolute;
  inset: 42px 10px 46px;
  z-index: 3;
  display: grid;
  place-items: center;
  border-radius: 9px;
  background:
    linear-gradient(180deg, rgba(211, 247, 255, 0.14), rgba(5, 37, 59, 0.08));
  border: 1px solid rgba(229, 253, 255, 0.18);
}

.fg-card__emblem {
  color: rgba(240, 253, 255, 0.88);
  font-size: 32px;
  text-shadow: 0 0 20px rgba(74, 212, 255, 0.74);
}

.fg-card__footer {
  position: absolute;
  left: 9px;
  right: 9px;
  bottom: 9px;
  z-index: 4;
  min-height: 32px;
  display: grid;
  place-items: center;
  padding: 5px 7px;
  border-radius: 9px;
  color: #092338;
  text-align: center;
  line-height: 1.05;
  background: rgba(239, 249, 251, 0.92);
  border: 1px solid rgba(11, 78, 111, 0.16);
}

.fg-card__footer strong {
  display: block;
  font-size: 11px;
  font-weight: 1000;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

@media (max-width: 760px) {
  :root {
    --fg-card-w: 122px;
    --fg-card-h: 176px;
  }

  .fg-preview {
    padding: 14px;
  }

  .fg-board-mock {
    min-height: 620px;
    border-radius: 24px;
  }

  .fg-board-mock__header {
    align-items: flex-start;
    flex-direction: column;
    padding: 22px 22px 0;
  }

  .fg-controls {
    justify-content: flex-start;
  }

  .fg-hand {
    width: calc(100% - 18px);
    padding-inline: 10px;
    border-radius: 24px;
  }

  .fg-hand__stage {
    height: 206px;
  }
}
`;
