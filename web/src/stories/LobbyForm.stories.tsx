import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { LobbyForm } from "../ui/lobby/LobbyForm.js";

const meta: Meta<typeof LobbyForm> = {
  title: "Lobby/LobbyForm",
  component: LobbyForm,
  args: {
    playerName: "Jugador",
    matchID: "match-001",
    playerID: "0",
    onCreate: fn(),
    onJoin: fn()
  }
};

export default meta;
type Story = StoryObj<typeof LobbyForm>;

export const Default: Story = {};

export const ClickJoin: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Romper el hielo" }));
    await expect(args.onJoin).toHaveBeenCalled();
  }
};
