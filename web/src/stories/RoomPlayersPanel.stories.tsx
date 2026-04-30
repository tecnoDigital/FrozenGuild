import type { Meta, StoryObj } from "@storybook/react-vite";
import { RoomPlayersPanel } from "../ui/lobby/RoomPlayersPanel.js";

const meta: Meta<typeof RoomPlayersPanel> = {
  title: "Lobby/RoomPlayersPanel",
  component: RoomPlayersPanel,
  args: {
    players: ["Oz", "BOT 1"]
  }
};

export default meta;
type Story = StoryObj<typeof RoomPlayersPanel>;

export const WithPlayers: Story = {};
export const Empty: Story = { args: { players: [] } };
