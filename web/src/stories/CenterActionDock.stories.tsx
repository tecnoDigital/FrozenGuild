import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { CenterActionDock } from "../ui/layout/CenterActionDock.js";

const meta: Meta<typeof CenterActionDock> = {
  title: "Layout/CenterActionDock",
  component: CenterActionDock,
  args: {
    rolled: true,
    value: 6,
    disabled: false,
    onRoll: fn(),
    showPadrinoOptions: true,
    onChoosePadrinoAction: fn()
  }
};

export default meta;
type Story = StoryObj<typeof CenterActionDock>;

export const PadrinoVisible: Story = {};

export const Hidden: Story = {
  args: {
    value: 5,
    showPadrinoOptions: false
  }
};
