import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { BottomSheet } from "../ui/mobile/BottomSheet.js";

const meta: Meta<typeof BottomSheet> = {
  title: "Mobile/BottomSheet",
  component: BottomSheet,
  args: {
    state: "collapsed",
    activeTab: "action",
    onStateChange: fn(),
    onTabChange: fn(),
    actionContent: <div>Acciones contextuales</div>,
    handContent: <div>Cartas de tu mano</div>,
    rivalsContent: <div>Rivales y puntajes</div>
  }
};

export default meta;
type Story = StoryObj<typeof BottomSheet>;

export const Collapsed: Story = {};

export const ActionTab: Story = {
  args: {
    state: "half",
    activeTab: "action"
  }
};

export const HandTab: Story = {
  args: {
    state: "expanded",
    activeTab: "hand"
  }
};

export const RivalsTab: Story = {
  args: {
    state: "expanded",
    activeTab: "rivals"
  }
};
