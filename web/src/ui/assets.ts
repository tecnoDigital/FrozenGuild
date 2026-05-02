const root = "/assets";

export const assets = {
  brand: {
    logoMain: `${root}/brand/logo-frozen-guild.png`,
    logoSmall: `${root}/brand/logo-frozen-guild-small.png`
  },
  backgrounds: {
    gameBoard: `${root}/backgrounds/game-board-bg.webp`,
    lobby: `${root}/backgrounds/lobby-bg.png`,
    iceTableCenter: `${root}/backgrounds/ice-table-center.png`
  },
  cards: {
    back: `${root}/cards/backs/frozen-dreamcatcher-back.png`,
    fronts: {
      penguin1: `${root}/cards/types/penguin-1.png`,
      penguin2: `${root}/cards/types/penguin-2.png`,
      penguin3: `${root}/cards/types/penguin-3.png`,
      walrus: `${root}/cards/types/walrus.png`,
      petrel: `${root}/cards/types/petrel.png`,
      seaElephant: `${root}/cards/types/sea-elephant.png`,
      krill: `${root}/cards/types/krill.png`,
      orca: `${root}/cards/types/orca.png`,
      sealBomb: `${root}/cards/types/seal-bomb.png`
    },
    states: {
      hidden: `${root}/cards/states/card-hidden.png`,
      selected: `${root}/cards/states/card-selected.png`,
      disabled: `${root}/cards/states/card-disabled.png`,
      highlighted: `${root}/cards/states/card-highlighted.png`,
      fallback: `${root}/cards/states/card-fallback.png`
    }
  },
  characters: {
    avatars: {
      donKrill: `${root}/characters/avatars/don-krill.png`,
      ladyMorsa: `${root}/characters/avatars/lady-morsa.png`,
      capitanPetrel: `${root}/characters/avatars/capitan-petrel.png`,
      srBomba: `${root}/characters/avatars/sr-bomba.png`,
      penguin1: `${root}/characters/avatars/penguin-1.png`,
      penguin2: `${root}/characters/avatars/penguin-2.png`,
      penguin3: `${root}/characters/avatars/penguin-3.png`,
      walrus: `${root}/characters/avatars/walrus.png`,
      petrel: `${root}/characters/avatars/petrel.png`,
      seaElephant: `${root}/characters/avatars/sea-elephant.png`,
      orca: `${root}/characters/avatars/orca.png`,
      sealBomb: `${root}/characters/avatars/seal-bomb.png`
    },
    opponents: {
      capo: `${root}/characters/opponents/capo.png`,
      bot: `${root}/characters/opponents/bot.png`,
      ladyG: `${root}/characters/opponents/lady-g.png`,
      mrZero: `${root}/characters/opponents/mr-zero.png`
    }
  },
  ui: {
    frames: {
      playerHand: `${root}/ui/frames/player-hand-frame.png`,
      opponentRow: `${root}/ui/frames/opponent-row-frame.png`,
      scorePanel: `${root}/ui/frames/score-panel-frame.png`,
      turnPanel: `${root}/ui/frames/turn-panel-frame.png`,
      dicePanel: `${root}/ui/frames/dice-panel-frame.png`,
      actionBar: `${root}/ui/frames/action-bar-frame.png`,
      deck: `${root}/ui/frames/deck-frame.png`,
      roundBadge: `${root}/ui/frames/round-badge-frame.png`
    },
    icons: {
      fish: `${root}/ui/icons/fish.png`,
      fishAlt: `${root}/ui/icons/fish-alt.png`,
      fishDark: `${root}/ui/icons/fish-dark.png`,
      dice: `${root}/ui/icons/dice.png`,
      orca: `${root}/ui/icons/orca.png`,
      spy: `${root}/ui/icons/spy.svg`,
      exchange: `${root}/ui/icons/exchange.svg`,
      godfather: `${root}/ui/icons/godfather.svg`,
      cancel: `${root}/ui/icons/cancel.svg`,
      trophy: `${root}/ui/icons/trophy.svg`,
      deck: `${root}/ui/icons/deck.svg`,
      snowflake: `${root}/ui/icons/snowflake.svg`,
      crown: `${root}/ui/icons/crown.svg`,
      turnArrow: `${root}/ui/icons/turn-arrow.svg`
    },
    states: {
      activePlayerGlow: `${root}/ui/states/active-player-glow.png`,
      selectedCardGlow: `${root}/ui/states/selected-card-glow.png`,
      disabledActionOverlay: `${root}/ui/states/disabled-action-overlay.png`,
      diceResultBurst: `${root}/ui/states/dice-result-burst.png`,
      scoreIncreaseSpark: `${root}/ui/states/score-increase-spark.png`,
      scoreDecreaseHit: `${root}/ui/states/score-decrease-hit.png`
    },
    decorations: {
      finalSuiteArt: `${root}/ui/decor/final-suite-art.png`,
      iceCornerTopLeft: `${root}/ui/decor/ice-corner-top-left.png`,
      iceCornerTopRight: `${root}/ui/decor/ice-corner-top-right.png`,
      iceCornerBottomLeft: `${root}/ui/decor/ice-corner-bottom-left.png`,
      iceCornerBottomRight: `${root}/ui/decor/ice-corner-bottom-right.png`,
      frostDividerHorizontal: `${root}/ui/decor/frost-divider-horizontal.png`,
      frostDividerVertical: `${root}/ui/decor/frost-divider-vertical.png`,
      crackedIceOverlay: `${root}/ui/decor/cracked-ice-overlay.png`,
      auroraLightStrip: `${root}/ui/decor/aurora-light-strip.png`
    }
  },
  lobby: {
    panelFrame: `${root}/lobby/lobby-panel-frame.png`,
    avatarSelectorFrame: `${root}/lobby/avatar-selector-frame.png`,
    colorSelectorFrame: `${root}/lobby/color-selector-frame.png`,
    playerPreviewFrame: `${root}/lobby/player-preview-frame.png`,
    startButtonFrame: `${root}/lobby/start-button-frame.png`
  }
} as const;
