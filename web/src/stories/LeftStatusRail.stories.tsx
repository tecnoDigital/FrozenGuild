import type { Meta, StoryObj } from "@storybook/react-vite";
import { LeftStatusRail } from "../ui/layout/LeftStatusRail.js";

const meta: Meta<typeof LeftStatusRail> = {
  title: "Layout/LeftStatusRail",
  component: LeftStatusRail,
  args: {
    deckCount: 34,
    discardCount: 6,
    cardBackSrc: "/assets/cards/backs/frozen-dreamcatcher-back.png"
  }
};

export default meta;
type Story = StoryObj<typeof LeftStatusRail>;

export const Default: Story = {};

export const FreshTable: Story = {
  args: {
    deckCount: 40,
    discardCount: 0
  }
};

export const LateGame: Story = {
  args: {
    deckCount: 7,
    discardCount: 29
  }
};

export const EmptyDeck: Story = {
  args: {
    deckCount: 0,
    discardCount: 36
  }
};
