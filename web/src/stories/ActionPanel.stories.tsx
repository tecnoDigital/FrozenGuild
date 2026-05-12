import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ActionPanel } from "../ui/actions/ActionPanel.js";

const meta: Meta<typeof ActionPanel> = {
  title: "Actions/ActionPanel",
  component: ActionPanel,
  args: {
    flow: {
      mode: "swap",
      helperText: "Intercambio: elige carta origen y luego destino.",
      diceValue: 5,
      isMyTurn: true,
      canRoll: false,
      canEndTurn: false,
      showPadrinoOptions: false
    },
    onChoosePadrinoAction: fn(),
    onEndTurn: fn(),
    swap: {
      source: { area: "ice_grid", slot: 0 },
      target: { area: "player_zone", playerID: "0", index: 0 },
      canConfirm: true,
      helperText: "Listo para confirmar intercambio.",
      sourceKey: "ice:0",
      targetKey: "player:0:0",
      sourceOptions: [
        { key: "ice:0", label: "Hielo 1", location: { area: "ice_grid", slot: 0 } }
      ],
      targetOptions: [
        { key: "player:0:0", label: "Jugador 0 · penguin-001", location: { area: "player_zone", playerID: "0", index: 0 } }
      ],
      onSourceKeyChange: fn(),
      onTargetKeyChange: fn(),
      onConfirm: fn(),
      onClearSelection: fn()
    },
    orca: null,
    seal: null,
    spy: null
  }
};

export default meta;
type Story = StoryObj<typeof ActionPanel>;

export const Swap: Story = {};

export const Padrino: Story = {
  args: {
    flow: {
      mode: "padrino",
      helperText: "El Padrino: elige una accion 1-5.",
      diceValue: 6,
      isMyTurn: true,
      canRoll: false,
      canEndTurn: false,
      showPadrinoOptions: true
    }
  }
};

export const Spy: Story = {
  args: {
    flow: {
      mode: "spy",
      helperText: "Espionaje: selecciona slots y confirma.",
      diceValue: 4,
      isMyTurn: true,
      canRoll: false,
      canEndTurn: false,
      showPadrinoOptions: false
    },
    spy: {
      active: false,
      selectedSlots: [0, 3],
      availableSlots: [0, 1, 2, 3, 4, 5],
      revealedSlots: [],
      selectedGiftSlot: null,
      targetPlayerID: "1",
      targetPlayerIDs: ["1", "2"],
      onToggleSlot: fn(),
      onSelectGiftSlot: fn(),
      onTargetPlayerChange: fn(),
      onConfirmSpy: fn(),
      onGiveCard: fn(),
      onCompleteSpy: fn()
    }
  }
};

export const Orca: Story = {
  args: {
    flow: {
      mode: "orca",
      helperText: "Orca pendiente: destruye una carta propia para continuar.",
      diceValue: 3,
      isMyTurn: true,
      canRoll: false,
      canEndTurn: false,
      showPadrinoOptions: false
    },
    orca: {
      validTargetCardIDs: ["penguin-001", "walrus-001"],
      selectedCardID: "penguin-001",
      onSelectCardID: fn(),
      onResolve: fn()
    }
  }
};

export const SealBomb: Story = {
  args: {
    flow: {
      mode: "seal",
      helperText: "Foca-Bomba pendiente: descarta cartas para resolver.",
      diceValue: 2,
      isMyTurn: true,
      canRoll: false,
      canEndTurn: false,
      showPadrinoOptions: false
    },
    seal: {
      validTargetCardIDs: ["penguin-001", "penguin-002", "krill-001"],
      selectedCardIDs: ["penguin-001"],
      requiredDiscardCount: 2,
      onToggleCardID: fn(),
      onResolve: fn()
    }
  }
};
