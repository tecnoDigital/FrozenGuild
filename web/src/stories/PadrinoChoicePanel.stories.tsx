import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { PadrinoChoicePanel } from "../ui/actions/PadrinoChoicePanel.js";

const onChoose = fn();

const meta: Meta<typeof PadrinoChoicePanel> = {
  title: "Actions/PadrinoChoicePanel",
  component: PadrinoChoicePanel,
  args: {
    onChoose
  }
};

export default meta;
type Story = StoryObj<typeof PadrinoChoicePanel>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Pesca" }));
    await expect(onChoose).toHaveBeenCalled();
  }
};
