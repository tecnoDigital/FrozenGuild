import type { Meta, StoryObj } from "@storybook/react-vite";
import { PlayerLedgerRow } from "../ui/players/PlayerLedgerRow.js";

const meta: Meta<typeof PlayerLedgerRow> = {
  title: "Players/PlayerLedgerRow",
  component: PlayerLedgerRow,
  args: {
    id: "1",
    name: "Jugador 1",
    score: 5,
    cardCount: 5,
    cardIDs: ["penguin-001", "penguin-002", "orca-001", "krill-001", "walrus-001"]
  }
};

export default meta;
type Story = StoryObj<typeof PlayerLedgerRow>;

export const Normal: Story = {};

export const Active: Story = {
  args: {
    isActiveTurn: true
  }
};

export const LocalPlayer: Story = {
  args: {
    isLocalPlayer: true,
    name: "Tu jugador"
  }
};

export const Reconnecting: Story = {
  args: {
    status: "reconnecting",
    disconnectSeconds: 23
  }
};

export const Absent: Story = {
  args: {
    status: "absent"
  }
};
