import type { Meta, StoryObj } from "@storybook/react-vite";
import { MobileGameShell } from "../ui/mobile/MobileGameShell.js";

const meta: Meta<typeof MobileGameShell> = {
  title: "Mobile/MobileGameShell",
  component: MobileGameShell,
  args: {
    board: <div>ActionBanner + Hielo 3x3 sticky</div>,
    summary: <div>Estado de mesa y turno</div>,
    actions: <div>Panel de acciones</div>,
    hand: <div>Mi mano</div>,
    rivals: <div>Rivales</div>,
    flow: {
      mode: "roll",
      helperText: "Tu turno: lanza el dado.",
      diceValue: null,
      isMyTurn: true,
      canRoll: true,
      canEndTurn: false,
      showPadrinoOptions: false
    }
  }
};

export default meta;
type Story = StoryObj<typeof MobileGameShell>;

export const MyTurn: Story = {};

export const Waiting: Story = {
  args: {
    flow: {
      mode: "waiting",
      helperText: "Esperando a jugador 1.",
      diceValue: 3,
      isMyTurn: false,
      canRoll: false,
      canEndTurn: false,
      showPadrinoOptions: false
    }
  }
};

export const BlockingOrca: Story = {
  args: {
    flow: {
      mode: "orca",
      helperText: "Orca pendiente.",
      diceValue: 6,
      isMyTurn: true,
      canRoll: false,
      canEndTurn: false,
      showPadrinoOptions: false
    }
  }
};
