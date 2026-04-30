import type { Meta, StoryObj } from "@storybook/react-vite";
import { RoomPlayersPanel } from "../ui/lobby/RoomPlayersPanel.js";

const meta: Meta<typeof RoomPlayersPanel> = {
  title: "Lobby/RoomPlayersPanel",
  component: RoomPlayersPanel,
  args: {
    players: ["Oz", "BOT 1"],
    numPlayers: 4,
    selectedMatch: {
      matchID: "match-001",
      totalPlayers: 4,
      availableSeats: ["2", "3"],
      occupiedPlayers: [
        { seat: "0", name: "Oz", isBot: false },
        { seat: "1", name: "BOT 1", isBot: true }
      ]
    }
  }
};

export default meta;
type Story = StoryObj<typeof RoomPlayersPanel>;

export const WithPlayers: Story = {};
export const Empty: Story = { args: { players: [] } };
