import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { AvailableMatchesPanel } from "../ui/lobby/AvailableMatchesPanel.js";

const meta: Meta<typeof AvailableMatchesPanel> = {
  title: "Lobby/AvailableMatchesPanel",
  component: AvailableMatchesPanel,
  args: {
    selectedMatchID: "match-001",
    rows: [
      {
        matchID: "match-001",
        availableSeats: ["1", "3"],
        occupiedSeats: ["0", "2"],
        totalPlayers: 4
      },
      {
        matchID: "match-002",
        availableSeats: ["0"],
        occupiedSeats: ["1"],
        totalPlayers: 2
      }
    ],
    onRefresh: fn(),
    onSelectMatchID: fn()
  }
};

export default meta;
type Story = StoryObj<typeof AvailableMatchesPanel>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    rows: []
  }
};
