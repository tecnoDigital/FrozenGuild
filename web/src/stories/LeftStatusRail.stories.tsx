import type { Meta, StoryObj } from "@storybook/react-vite";
import { LeftStatusRail } from "../ui/layout/LeftStatusRail.js";

const meta: Meta<typeof LeftStatusRail> = {
  title: "Layout/LeftStatusRail",
  component: LeftStatusRail,
  args: {
    players: [
      {
        id: "player-0",
        name: "Don Krill",
        avatarSrc: "/assets/characters/avatars/penguin-1.png",
        colorValue: "#ffd700",
        score: 23,
        isActiveTurn: true
      },
      {
        id: "player-1",
        name: "Lady Morsa",
        avatarSrc: "/assets/characters/avatars/walrus.png",
        colorValue: "#9b59b6",
        score: 18,
        isActiveTurn: false
      },
      {
        id: "player-2",
        name: "Capitán Petrel",
        avatarSrc: "/assets/characters/avatars/petrel.png",
        colorValue: "#2ecc71",
        score: 12,
        isActiveTurn: false
      },
      {
        id: "player-3",
        name: "Sr. Bomba",
        avatarSrc: "/assets/characters/avatars/sealBomb.png",
        colorValue: "#ff3b30",
        score: -6,
        isActiveTurn: false
      }
    ]
  }
};

export default meta;
type Story = StoryObj<typeof LeftStatusRail>;

export const Default: Story = {};

export const SinglePlayer: Story = {
  args: {
    players: [
      {
        id: "player-0",
        name: "Oz",
        avatarSrc: "/assets/characters/avatars/penguin-1.png",
        colorValue: "#63ece3",
        score: 15,
        isActiveTurn: true
      }
    ]
  }
};

export const Empty: Story = {
  args: {
    players: []
  }
};

export const MissingData: Story = {
  args: {
    players: [
      {
        id: "",
        name: "",
        avatarSrc: "",
        colorValue: "",
        score: 0,
        isActiveTurn: false
      }
    ]
  }
};
