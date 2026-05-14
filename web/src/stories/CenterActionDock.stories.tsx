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
    onChoosePadrinoAction: fn(),
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
      canConfirm: false,
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

export const PadrinoVisible: Story = {};

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
