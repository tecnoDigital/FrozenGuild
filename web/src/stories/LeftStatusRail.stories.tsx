import type { Meta, StoryObj } from "@storybook/react-vite";
import { LeftStatusRail } from "../ui/layout/LeftStatusRail.js";

const meta: Meta<typeof LeftStatusRail> = {
  title: "Layout/LeftStatusRail",
  component: LeftStatusRail,
  args: {
    playerName: "Oz",
    turnLabel: "1",
    deckCount: 23,
    discardCount: 5,
    tableStatus: "activa"
  }
};

export default meta;
type Story = StoryObj<typeof LeftStatusRail>;

export const Default: Story = {};

export const Paused: Story = {
  args: {
    tableStatus: "pausada"
  }
};
