import type { Meta, StoryObj } from "@storybook/react-vite";
import { ExpeditionPreview } from "../ui/lobby/ExpeditionPreview.js";

const meta: Meta<typeof ExpeditionPreview> = {
  title: "Lobby/ExpeditionPreview",
  component: ExpeditionPreview,
  args: {
    cards: [
      { id: "penguin-001", label: "Pinguino", image: "/assets/cards/types/penguin-1.png" },
      { id: "orca-001", label: "Orca", image: "/assets/cards/types/orca.png" },
      { id: "walrus-001", label: "Morsa", image: "/assets/cards/types/walrus.png" }
    ]
  }
};

export default meta;
type Story = StoryObj<typeof ExpeditionPreview>;

export const Default: Story = {};
