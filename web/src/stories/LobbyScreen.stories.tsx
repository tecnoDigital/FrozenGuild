import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { within, userEvent } from "storybook/test";
import { LobbyScreen } from "../ui/screens/LobbyScreen.js";

const meta: Meta<typeof LobbyScreen> = {
  title: "Screens/LobbyScreen",
  component: LobbyScreen,
  args: {
    playerName: "Lord Penguin",
    avatarID: "penguin1",
    colorID: "ice",
    numPlayers: 4,
    selectedBotPlayerIDs: [],
    players: ["Lord Penguin"],
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
      },
      {
        matchID: "match-002",
        availableSeats: ["1", "2", "3"],
        occupiedSeats: ["0"],
        occupiedPlayers: [
          { seat: "0", name: "Lizz", isBot: false }
        ],
        totalPlayers: 4
      }
    ],
    selectedJoinMatchID: "",
    onRefreshMatches: fn(),
    onSelectJoinMatchID: fn(),
    onNumPlayersChange: fn(),
    onToggleBotPlayerID: fn(),
    onCreate: fn(),
    onJoin: fn(),
    onPlayerNameChange: fn(),
    onAvatarChange: fn(),
    onColorChange: fn()
  }
};

export default meta;
type Story = StoryObj<typeof LobbyScreen>;

export const Default: Story = {};

export const JoinMode: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const joinBtn = await canvas.findByRole("tab", { name: /Join/i });
    await userEvent.click(joinBtn);
  }
};

export const JoinModeWithSelection: Story = {
  args: {
    selectedJoinMatchID: "match-001"
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const joinBtn = await canvas.findByRole("tab", { name: /Join/i });
    await userEvent.click(joinBtn);
  }
};
