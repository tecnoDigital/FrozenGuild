import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { LobbyScreen } from "../ui/screens/LobbyScreen.js";

const meta: Meta<typeof LobbyScreen> = {
  title: "Screens/LobbyScreen",
  component: LobbyScreen,
  args: {
    playerName: "Jugador",
    numPlayers: 4,
    selectedBotPlayerIDs: ["2"],
    players: ["Oz", "BOT 1"],
    availableMatches: [
      {
        matchID: "match-001",
        availableSeats: ["2", "3"],
        occupiedSeats: ["0", "1"],
        occupiedPlayers: [
          { seat: "0", name: "Oz", isBot: false },
          { seat: "1", name: "BOT 1", isBot: true }
        ],
        totalPlayers: 4
      }
    ],
    selectedJoinMatchID: "match-001",
    onRefreshMatches: fn(),
    onSelectJoinMatchID: fn(),
    onNumPlayersChange: fn(),
    onToggleBotPlayerID: fn(),
    onCreate: fn(),
    onJoin: fn()
  }
};

export default meta;
type Story = StoryObj<typeof LobbyScreen>;

export const Default: Story = {};
