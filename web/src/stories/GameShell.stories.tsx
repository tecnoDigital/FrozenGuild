import type { Meta, StoryObj } from "@storybook/react-vite";
import { GameShell } from "../ui/layout/GameShell.js";

const meta: Meta<typeof GameShell> = {
  title: "Layout/GameShell",
  component: GameShell,
  args: {
    left: <div>Left rail</div>,
    center: <div>Center board</div>,
    actions: <div>Action dock</div>,
    right: <div>Right ledger</div>
  }
};

export default meta;
type Story = StoryObj<typeof GameShell>;

export const Default: Story = {};
