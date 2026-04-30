import type { Meta, StoryObj } from "@storybook/react-vite";
import { LobbyHero } from "../ui/lobby/LobbyHero.js";

const meta: Meta<typeof LobbyHero> = {
  title: "Lobby/LobbyHero",
  component: LobbyHero
};

export default meta;
type Story = StoryObj<typeof LobbyHero>;

export const Default: Story = {};
