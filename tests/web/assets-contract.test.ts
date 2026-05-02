import { describe, expect, it } from "vitest";
import { assets } from "../../web/src/ui/assets";

function assertAbsolutePublicPath(path: string): void {
  expect(path.startsWith("/assets/")).toBe(true);
}

describe("ui assets contract", () => {
  it("exports Vite-safe absolute root paths", () => {
    assertAbsolutePublicPath(assets.brand.logoMain);
    assertAbsolutePublicPath(assets.backgrounds.gameBoard);
    assertAbsolutePublicPath(assets.cards.back);
    assertAbsolutePublicPath(assets.cards.fronts.orca);
    assertAbsolutePublicPath(assets.cards.fronts.sealBomb);
    assertAbsolutePublicPath(assets.cards.states.selected);
    assertAbsolutePublicPath(assets.cards.states.fallback);
    assertAbsolutePublicPath(assets.characters.avatars.donKrill);
    assertAbsolutePublicPath(assets.ui.frames.playerHand);
    assertAbsolutePublicPath(assets.ui.icons.fish);
    assertAbsolutePublicPath(assets.ui.icons.orca);
    assertAbsolutePublicPath(assets.ui.icons.fishAlt);
    assertAbsolutePublicPath(assets.ui.states.activePlayerGlow);
    assertAbsolutePublicPath(assets.ui.decorations.finalSuiteArt);
    assertAbsolutePublicPath(assets.ui.decorations.auroraLightStrip);
    assertAbsolutePublicPath(assets.lobby.panelFrame);
  });

  it("never references public folder or relative paths", () => {
    const sampledPaths = [
      assets.brand.logoSmall,
      assets.backgrounds.lobby,
      assets.cards.states.hidden,
      assets.characters.opponents.mrZero,
      assets.ui.frames.turnPanel,
      assets.ui.icons.turnArrow,
      assets.ui.decorations.crackedIceOverlay,
      assets.lobby.startButtonFrame
    ];

    for (const path of sampledPaths) {
      expect(path.includes("../public")).toBe(false);
      expect(path.includes("/src/assets")).toBe(false);
      expect(path.startsWith("../")).toBe(false);
    }
  });

  it("does not expose traditional poker suit card buckets", () => {
    expect("hearts" in assets.cards.fronts).toBe(false);
    expect("spades" in assets.cards.fronts).toBe(false);
    expect("diamonds" in assets.cards.fronts).toBe(false);
    expect("clubs" in assets.cards.fronts).toBe(false);
  });

  it("does not expose a mountain card in current contract", () => {
    expect("mountain" in assets.cards.fronts).toBe(false);
  });
});
