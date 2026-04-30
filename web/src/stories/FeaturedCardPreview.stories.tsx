import type { Meta, StoryObj } from "@storybook/react-vite";
import { FeaturedCardPreview } from "../ui/lobby/FeaturedCardPreview.js";

const meta: Meta<typeof FeaturedCardPreview> = {
  title: "Lobby/FeaturedCardPreview",
  component: FeaturedCardPreview,
  args: {
    id: "orca-001",
    label: "Orca",
    image: "/src/assets/cards/orca.png",
    detail: "Destruye una carta propia para continuar."
  }
};

export default meta;
type Story = StoryObj<typeof FeaturedCardPreview>;

export const Default: Story = {};
