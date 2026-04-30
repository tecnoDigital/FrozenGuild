import type { Meta, StoryObj } from "@storybook/react-vite";
import { LobbyBackground } from "../ui/lobby/LobbyBackground.js";

const meta: Meta<typeof LobbyBackground> = {
  title: "Lobby/LobbyBackground",
  component: LobbyBackground
};

export default meta;
type Story = StoryObj<typeof LobbyBackground>;

export const Default: Story = {};
