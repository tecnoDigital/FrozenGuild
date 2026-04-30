import type { Meta, StoryObj } from "@storybook/react-vite";
import { ActionBanner } from "../ui/actions/ActionBanner.js";

const meta: Meta<typeof ActionBanner> = {
  title: "Actions/ActionBanner",
  component: ActionBanner,
  args: {
    title: "Tu turno",
    detail: "Lanza el dado."
  }
};

export default meta;
type Story = StoryObj<typeof ActionBanner>;

export const Neutral: Story = {
  args: { title: "Sin partida", detail: "Crea o unete a una sala.", severity: "neutral", mode: "waiting" }
};

export const YourTurn: Story = {
  args: { title: "Tu turno", detail: "Lanza el dado.", severity: "your-turn", mode: "roll" }
};

export const Blocked: Story = {
  args: { title: "Esperando turno", detail: "Turno de jugador 1.", severity: "blocked", mode: "waiting" }
};

export const Danger: Story = {
  args: { title: "Orca pendiente", detail: "Debes destruir una carta propia para continuar.", severity: "danger", mode: "orca" }
};

export const Success: Story = {
  args: { title: "Accion completada", detail: "Termina tu turno para continuar.", severity: "success", mode: "done" }
};
