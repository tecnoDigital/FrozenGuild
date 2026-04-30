import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { SealExplosionPanel } from "../ui/actions/SealExplosionPanel.js";

const meta: Meta<typeof SealExplosionPanel> = {
  title: "Actions/SealExplosionPanel",
  component: SealExplosionPanel,
  args: {
    validTargetCardIDs: ["penguin-001", "penguin-002", "krill-001"],
    selectedCardIDs: ["penguin-001"],
    requiredDiscardCount: 2,
    onToggleCardID: fn(),
    onResolve: fn()
  }
};

export default meta;
type Story = StoryObj<typeof SealExplosionPanel>;

export const Pending: Story = {};
