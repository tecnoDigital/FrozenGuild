import { describe, expect, it } from "vitest";
import { LobbyForm } from "../../web/src/ui/lobby/LobbyForm";
import { LeftStatusRail } from "../../web/src/ui/layout/LeftStatusRail";
import { AvatarSelector } from "../../web/src/features/lobby/AvatarSelector";
import { ColorSelector } from "../../web/src/features/lobby/ColorSelector";
import { PlayerNameInput } from "../../web/src/features/lobby/PlayerNameInput";
import { PlayerPreviewCard } from "../../web/src/features/lobby/PlayerPreviewCard";
import {
  LOBBY_SESSION_STORAGE_KEY,
  createLobbyProfileStore,
  createSafeSessionStorage,
  defaultLobbyProfile,
  lobbyAvatarOptions,
  lobbyColorOptions,
  selectLobbyAvatar,
  selectLobbyColor,
  selectLobbyName
} from "../../web/src/features/lobby/lobbyStore";

type RenderNode = {
  type?: unknown;
  props?: Record<string, unknown>;
};

function collectElements(node: unknown, bucket: RenderNode[] = []): RenderNode[] {
  if (!node) return bucket;
  if (Array.isArray(node)) {
    for (const child of node) collectElements(child, bucket);
    return bucket;
  }

  if (typeof node === "object" && "props" in (node as Record<string, unknown>)) {
    const current = node as RenderNode;
    bucket.push(current);
    collectElements(current.props?.children, bucket);
  }

  return bucket;
}

describe("fg phase 5 lobby customization contract", () => {
  it("provides deterministic avatar and color options from centralized assets", () => {
    expect(lobbyAvatarOptions.length).toBeGreaterThanOrEqual(4);
    expect(lobbyColorOptions.length).toBeGreaterThanOrEqual(4);

    for (const avatar of lobbyAvatarOptions) {
      expect(avatar.src.startsWith("/assets/")).toBe(true);
      expect(avatar.id.length > 0).toBe(true);
    }
  });

  it("uses safe session storage fallback when sessionStorage is unavailable", () => {
    const storage = createSafeSessionStorage();
    storage.setItem(LOBBY_SESSION_STORAGE_KEY, JSON.stringify({ name: "Nora" }));
    expect(storage.getItem(LOBBY_SESSION_STORAGE_KEY)).toContain("Nora");
  });

  it("persists lobby profile updates into provided storage", () => {
    const memoryStorage = createSafeSessionStorage();
    const store = createLobbyProfileStore(memoryStorage);

    store.getState().setName("Ayla");
    store.getState().setAvatar(lobbyAvatarOptions[1].id);
    store.getState().setColor(lobbyColorOptions[2].id);

    const persistedRaw = memoryStorage.getItem(LOBBY_SESSION_STORAGE_KEY);
    expect(persistedRaw).not.toBeNull();
    const persisted = JSON.parse(persistedRaw ?? "{}");
    expect(persisted.name).toBe("Ayla");
    expect(persisted.avatar).toBe(lobbyAvatarOptions[1].id);
    expect(persisted.color).toBe(lobbyColorOptions[2].id);
  });

  it("exposes atomic selectors for name, avatar and color", () => {
    const state = {
      profile: {
        ...defaultLobbyProfile,
        name: "Mika",
        avatar: lobbyAvatarOptions[0].id,
        color: lobbyColorOptions[1].id
      },
      setName: () => undefined,
      setAvatar: () => undefined,
      setColor: () => undefined,
      reset: () => undefined
    };

    expect(selectLobbyName(state)).toBe("Mika");
    expect(selectLobbyAvatar(state)).toBe(lobbyAvatarOptions[0].id);
    expect(selectLobbyColor(state)).toBe(lobbyColorOptions[1].id);
  });

  it("renders lobby form with avatar, color and preview contract", () => {
    const tree = LobbyForm({
      playerName: "Iria",
      avatarID: lobbyAvatarOptions[0].id,
      colorID: lobbyColorOptions[0].id
    });
    const nodes = collectElements(tree);
    const nodeTypes = new Set(nodes.map((node) => node.type));

    expect(nodeTypes.has(AvatarSelector)).toBe(true);
    expect(nodeTypes.has(ColorSelector)).toBe(true);
    expect(nodeTypes.has(PlayerNameInput)).toBe(true);
    expect(nodeTypes.has(PlayerPreviewCard)).toBe(true);
  });

  it("displays selected lobby profile inside game shell status rail", () => {
    const tree = LeftStatusRail({
      players: [
        {
          id: "0",
          name: "Iria",
          avatarSrc: "/assets/characters/avatars/penguin-1.png",
          colorValue: "#63ece3",
          score: 0,
          isActiveTurn: true
        }
      ]
    });

    const nodes = collectElements(tree);
    const avatarNode = nodes.find((node) => node.props?.["data-testid"] === "score-row-0")?.props?.children?.props?.children?.[0];
    const colorNode = nodes.find((node) => node.props?.["title"] === "Color #63ece3");

    expect(avatarNode?.props?.src).toBe("/assets/characters/avatars/penguin-1.png");
    expect(colorNode?.props?.style).toMatchObject({ backgroundColor: "#63ece3" });
  });
});
