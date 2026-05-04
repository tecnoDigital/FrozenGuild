import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card } from "../ui/board/Card.js";

const meta: Meta<typeof Card> = {
  title: "Board/Card",
  component: Card,
  args: {
    id: "penguin-001",
    label: "Pinguino 1",
    image: "/assets/cards/types/penguin-1.png",
    interactionState: "idle",
  }
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Idle: Story = {};

export const Hidden: Story = {
  args: {
    hidden: true,
    image: "/assets/cards/backs/frozen-dreamcatcher-back.png"
  }
};

export const Selectable: Story = {
  args: {
    interactionState: "selectable",
  }
};

export const Selected: Story = {
  args: {
    interactionState: "selected",
  }
};

export const Disabled: Story = {
  args: {
    interactionState: "disabled",
  }
};
