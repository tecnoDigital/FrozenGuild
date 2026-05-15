import { useState } from "react";
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent } from "storybook/test";
import { LeftStatusRail } from "../ui/layout/LeftStatusRail.js";

function LiveTableEventsDemo(args: ComponentProps<typeof LeftStatusRail>) {
  const [deckCount, setDeckCount] = useState(args.deckCount);
  const [discardCount, setDiscardCount] = useState(args.discardCount);

  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 320 }}>
      <LeftStatusRail {...args} deckCount={deckCount} discardCount={discardCount} />
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" onClick={() => setDeckCount((count) => Math.max(0, count - 1))}>
          Robar del mazo
        </button>
        <button type="button" onClick={() => setDiscardCount((count) => count + 1)}>
          Descartar carta
        </button>
      </div>
    </div>
  );
}

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

export const LiveTableEvents: Story = {
  render: (args) => <LiveTableEventsDemo {...args} />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Robar del mazo" }));
    await expect(canvas.getByLabelText("MAZO: 33 cartas")).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "Descartar carta" }));
    await expect(canvas.getByLabelText("DESCARTE: 7 cartas")).toBeInTheDocument();
  }
};
