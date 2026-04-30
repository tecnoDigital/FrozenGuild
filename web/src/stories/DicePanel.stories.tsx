import type { Meta, StoryObj } from "@storybook/react-vite";
import { DicePanel } from "../ui/actions/DicePanel.js";

const meta: Meta<typeof DicePanel> = {
  title: "Actions/DicePanel",
  component: DicePanel,
  args: {
    value: null,
    rolled: false,
    disabled: false
  }
};

export default meta;
type Story = StoryObj<typeof DicePanel>;

export const NotRolled: Story = {};
export const RolledSix: Story = { args: { rolled: true, value: 6 } };
export const Disabled: Story = { args: { disabled: true } };
