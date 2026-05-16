import type { Meta, StoryObj } from "@storybook/react-vite";
import { FrostCard } from "../features/board/ui/FrostCard.js";

const meta: Meta<typeof FrostCard> = {
  title: "Board/FrostCard",
  component: FrostCard,
  args: {
    index: 0,
    ariaLabel: "Pinguino 1",
    children: <img src="/assets/cards/types/penguin-1.png" alt="Pinguino 1" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
  }
};

export default meta;
type Story = StoryObj<typeof FrostCard>;

export const Idle: Story = {};

export const Hidden: Story = {
  args: {
    ariaLabel: "Hidden card",
    children: <img src="/assets/cards/backs/frozen-dreamcatcher-back.png" alt="Carta oculta" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
  }
};

export const Selectable: Story = {
  args: {
    selectable: true
  }
};

export const Selected: Story = {
  args: {
    selected: true
  }
};

export const Disabled: Story = {
  args: {
    disabled: true
  }
};
