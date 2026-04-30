import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card } from "../ui/board/Card.js";

const meta: Meta<typeof Card> = {
  title: "Board/Card",
  component: Card,
  args: {
    id: "penguin-001",
    label: "Pinguino 1",
    image: "/src/assets/cards/penguin-1.png"
  }
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Visible: Story = {};
export const Hidden: Story = {
  args: {
    hidden: false,
    image: "/src/assets/cards/Reverso.png"
  }
};
export const Selected: Story = { args: { selected: true } };
