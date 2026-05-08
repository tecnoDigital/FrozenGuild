import type { Meta, StoryObj } from "@storybook/react-vite";
import { GameShell } from "../ui/layout/GameShell.js";
import { CenterBoardStage } from "../ui/layout/CenterBoardStage.js";
import { getCardBackAsset, getCardFallbackAsset } from "../view-model/assetMap.js";

const boardCards = [
  { id: "hidden-0", label: "Slot 0", image: getCardBackAsset(), hidden: true, empty: false },
  { id: "penguin-001", label: "penguin 1", image: "/assets/cards/types/penguin-1.png", hidden: false, empty: false },
  { id: "empty-2", label: "Slot 2", image: getCardFallbackAsset(), hidden: false, empty: true },
  { id: "hidden-3", label: "Slot 3", image: getCardBackAsset(), hidden: true, empty: false },
  { id: "walrus-001", label: "walrus", image: "/assets/cards/types/walrus.png", hidden: false, empty: false },
  { id: "hidden-5", label: "Slot 5", image: getCardBackAsset(), hidden: true, empty: false },
  { id: "hidden-6", label: "Slot 6", image: getCardBackAsset(), hidden: true, empty: false },
  { id: "hidden-7", label: "Slot 7", image: getCardBackAsset(), hidden: true, empty: false },
  { id: "hidden-8", label: "Slot 8", image: getCardBackAsset(), hidden: true, empty: false }
];

const meta: Meta<typeof GameShell> = {
  title: "Layout/GameShell",
  component: GameShell,
  args: {
    left: <div>Left rail</div>,
    center: <div>Center board</div>,
    actions: <div>Action dock</div>,
    hand: <div>Hand area</div>,
    right: <div>Right ledger</div>
  }
};

export default meta;
type Story = StoryObj<typeof GameShell>;

export const Default: Story = {};

export const FullBoard: Story = {
  args: {
    left: (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ height: 40, background: "rgba(125,220,255,0.12)", borderRadius: 8 }} />
        <div style={{ height: 40, background: "rgba(125,220,255,0.12)", borderRadius: 8 }} />
        <div style={{ height: 40, background: "rgba(125,220,255,0.12)", borderRadius: 8 }} />
      </div>
    ),
    center: (
      <CenterBoardStage
        title="Tu turno"
        detail="Lanza el dado para continuar."
        severity="your-turn"
        mode="roll"
        cards={boardCards}
        clickableSlots={[]}
        selectedSlots={[]}
      />
    ),
    actions: <div style={{ height: 60, background: "rgba(125,220,255,0.12)", borderRadius: 8 }} />,
    hand: <div style={{ height: 100, background: "rgba(125,220,255,0.12)", borderRadius: 8 }} />,
    right: <div style={{ height: 120, background: "rgba(125,220,255,0.12)", borderRadius: 8 }} />
  }
};

export const IPhoneSE: Story = {
  ...FullBoard,
  parameters: {
    viewport: { defaultViewport: "iphoneSe" }
  }
};

export const IPhone14: Story = {
  ...FullBoard,
  parameters: {
    viewport: { defaultViewport: "iphone14" }
  }
};

export const IPadMini: Story = {
  ...FullBoard,
  parameters: {
    viewport: { defaultViewport: "ipadMini" }
  }
};

export const Laptop1366: Story = {
  ...FullBoard,
  parameters: {
    viewport: { defaultViewport: "laptop" }
  }
};

export const DesktopFHD: Story = {
  ...FullBoard,
  parameters: {
    viewport: { defaultViewport: "fhd" }
  }
};
