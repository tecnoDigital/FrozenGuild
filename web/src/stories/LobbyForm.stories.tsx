import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { LobbyForm } from "../ui/lobby/LobbyForm.js";

const meta: Meta<typeof LobbyForm> = {
  title: "Lobby/LobbyForm",
  component: LobbyForm,
  args: {
    playerName: "Jugador",
    numPlayers: 4,
    botPlayerIDs: ["2"],
    onCreate: fn(),
    onNumPlayersChange: fn(),
    onToggleBotPlayerID: fn()
  }
};

export default meta;
type Story = StoryObj<typeof LobbyForm>;

export const Default: Story = {};

export const ClickCreate: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Crear partida" }));
    await expect(args.onCreate).toHaveBeenCalled();
  }
};
