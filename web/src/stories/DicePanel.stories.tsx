import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { DicePanel } from "../ui/actions/DicePanel.js";

const meta: Meta<typeof DicePanel> = {
  title: "Actions/DicePanel",
  component: DicePanel,
  args: {
    value: null,
    rolled: false,
    disabled: false,
    onRoll: fn()
  }
};

export default meta;
type Story = StoryObj<typeof DicePanel>;

export const NotRolled: Story = {};

export const RolledFish: Story = { args: { rolled: true, value: 2 } };
export const RolledSpy: Story = { args: { rolled: true, value: 4 } };
export const RolledSwap: Story = { args: { rolled: true, value: 5 } };
export const RolledPadrino: Story = { args: { rolled: true, value: 6 } };

export const Disabled: Story = { args: { disabled: true } };
