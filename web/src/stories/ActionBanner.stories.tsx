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

export const YourTurn: Story = {};
export const Blocked: Story = { args: { title: "Bloqueado", detail: "Esperando a otro jugador." } };
