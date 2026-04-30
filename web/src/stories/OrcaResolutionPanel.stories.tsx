import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { OrcaResolutionPanel } from "../ui/actions/OrcaResolutionPanel.js";

const meta: Meta<typeof OrcaResolutionPanel> = {
  title: "Actions/OrcaResolutionPanel",
  component: OrcaResolutionPanel,
  args: {
    validTargetCardIDs: ["orca-001", "penguin-003", "walrus-001"],
    selectedCardID: null,
    onSelectCardID: fn(),
    onResolve: fn()
  }
};

export default meta;
type Story = StoryObj<typeof OrcaResolutionPanel>;

export const Pending: Story = {};
