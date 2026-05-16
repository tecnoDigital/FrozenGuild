import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { PadrinoChoicePanel } from "../ui/actions/PadrinoChoicePanel.js";

const onSelect = fn();

const meta: Meta<typeof PadrinoChoicePanel> = {
  title: "Actions/PadrinoChoicePanel",
  component: PadrinoChoicePanel,
  args: {
    selectedAction: null,
    onSelect
  }
};

export default meta;
type Story = StoryObj<typeof PadrinoChoicePanel>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const fishButton = canvas.getByRole("button", { name: /PESCA:/i });
    await userEvent.click(fishButton);
    await expect(onSelect).toHaveBeenCalledWith(1);
  }
};

export const SelectSpy: Story = {
  args: {
    selectedAction: 4
  },
  play: async ({ canvas }) => {
    const spyButton = canvas.getByRole("button", { name: /ESPIONAJE:/i });
    await expect(spyButton).toHaveAttribute("aria-pressed", "true");
  }
};

export const SelectSwap: Story = {
  args: {
    selectedAction: 5
  },
  play: async ({ canvas }) => {
    const swapButton = canvas.getByRole("button", { name: /INTERCAMBIO:/i });
    await expect(swapButton).toHaveAttribute("aria-pressed", "true");
  }
};
