import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { LobbyScreen } from "../ui/screens/LobbyScreen.js";

const meta: Meta<typeof LobbyScreen> = {
  title: "Screens/LobbyScreen",
  component: LobbyScreen,
  args: {
    playerName: "Jugador",
    matchID: "match-001",
    playerID: "0",
    players: ["Oz", "BOT 1"],
    onCreate: fn(),
    onJoin: fn()
  }
};

export default meta;
type Story = StoryObj<typeof LobbyScreen>;

export const Default: Story = {};
