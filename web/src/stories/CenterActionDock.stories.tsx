import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { CenterActionDock } from "../ui/layout/CenterActionDock.js";

const onChoosePadrinoAction = fn();

const meta: Meta<typeof CenterActionDock> = {
  title: "Layout/CenterActionDock",
  component: CenterActionDock,
  args: {
    rolled: true,
    value: 6,
    disabled: false,
    onRoll: fn(),
    onChoosePadrinoAction,
    padrinoSelectedAction: null,
    onEndTurn: fn(),
    flow: {
      mode: "padrino",
      helperText: "El Padrino: elige una accion 1-5.",
      diceValue: 6,
      isMyTurn: true,
      canRoll: false,
      canEndTurn: false,
      showPadrinoOptions: true
    },
    swap: {
      source: null,
      target: null,
      canConfirm: false,
      helperText: "",
      sourceKey: "",
      targetKey: "",
      onConfirm: fn(),
      onClearSelection: fn()
    },
    orca: null,
    seal: null,
    spy: null
  }
};

export default meta;
type Story = StoryObj<typeof CenterActionDock>;

export const PadrinoSelecting: Story = {};

export const PadrinoConfirm: Story = {
  args: {
    padrinoSelectedAction: 4
  },
  play: async ({ canvas }) => {
    const confirmButton = canvas.getByRole("button", { name: /Confirmar ESPIONAJE/i });
    await userEvent.click(confirmButton);
    await expect(onChoosePadrinoAction).toHaveBeenCalledWith(4);
  }
};

export const Hidden: Story = {
  args: {
    value: 5,
    flow: {
      mode: "swap",
      helperText: "Intercambio: elige carta origen y luego destino.",
      diceValue: 5,
      isMyTurn: true,
      canRoll: false,
      canEndTurn: false,
      showPadrinoOptions: false
    }
  }
};
