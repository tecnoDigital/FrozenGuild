import type { Meta, StoryObj } from "@storybook/react-vite";
import { IceGrid } from "../ui/board/IceGrid.js";
import { getCardBackAsset, getCardFallbackAsset } from "../view-model/assetMap.js";

const sampleCards = [
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

const meta: Meta<typeof IceGrid> = {
  title: "Board/IceGrid",
  component: IceGrid,
  args: {
    cards: sampleCards
  }
};

export default meta;
type Story = StoryObj<typeof IceGrid>;

export const Default: Story = {};
