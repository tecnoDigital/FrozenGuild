import { create } from "zustand";
import { assets } from "../../ui/assets";
import {
  type PlayerColorID,
  playerColorOptions,
  defaultPlayerColorID,
  resolvePlayerColorValue
} from "../../../../shared/game/playerColors.js";

export const LOBBY_SESSION_STORAGE_KEY = "fg:lobby-profile:v1";

export type LobbyAvatarID =
  | "penguin1"
  | "penguin2"
  | "penguin3"
  | "walrus"
  | "petrel"
  | "seaElephant"
  | "orca"
  | "sealBomb"
  | "donKrill"
  | "ladyMorsa"
  | "capitanPetrel"
  | "srBomba";

export type LobbyColorID = PlayerColorID;

export const lobbyAvatarOptions: Array<{ id: LobbyAvatarID; label: string; src: string }> = [
  { id: "penguin1", label: "Penguin I", src: assets.characters.avatars.penguin1 },
  { id: "penguin2", label: "Penguin II", src: assets.characters.avatars.penguin2 },
  { id: "penguin3", label: "Penguin III", src: assets.characters.avatars.penguin3 },
  { id: "walrus", label: "Walrus", src: assets.characters.avatars.walrus },
  { id: "petrel", label: "Petrel", src: assets.characters.avatars.petrel },
  { id: "seaElephant", label: "Sea Elephant", src: assets.characters.avatars.seaElephant },
  { id: "orca", label: "Orca", src: assets.characters.avatars.orca },
  { id: "sealBomb", label: "Seal-Bomb", src: assets.characters.avatars.sealBomb },
  { id: "donKrill", label: "Don Krill", src: assets.characters.avatars.donKrill },
  { id: "ladyMorsa", label: "Lady Morsa", src: assets.characters.avatars.ladyMorsa },
  { id: "capitanPetrel", label: "Capitan Petrel", src: assets.characters.avatars.capitanPetrel },
  { id: "srBomba", label: "Sr Bomba", src: assets.characters.avatars.srBomba }
];

export const lobbyColorOptions = playerColorOptions;

export const defaultLobbyProfile = {
  name: "Jugador",
  avatar: "penguin1" as LobbyAvatarID,
  color: defaultPlayerColorID as LobbyColorID
};

type LobbyProfile = typeof defaultLobbyProfile;

type LobbyState = {
  profile: LobbyProfile;
  setName: (value: string) => void;
  setAvatar: (id: LobbyAvatarID) => void;
  setColor: (id: LobbyColorID) => void;
  reset: () => void;
};

type KVStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function createSafeSessionStorage(): KVStorage {
  if (typeof window !== "undefined" && window.sessionStorage) {
    return window.sessionStorage;
  }

  const memory = new Map<string, string>();
  return {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => {
      memory.set(key, value);
    },
    removeItem: (key) => {
      memory.delete(key);
    }
  };
}

function hydrateProfile(storage: KVStorage): LobbyProfile {
  const raw = storage.getItem(LOBBY_SESSION_STORAGE_KEY);
  if (!raw) {
    return defaultLobbyProfile;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<LobbyProfile>;
    const avatarAllowed = lobbyAvatarOptions.some((item) => item.id === parsed.avatar);
    const colorAllowed = lobbyColorOptions.some((item) => item.id === parsed.color);
    return {
      name: typeof parsed.name === "string" && parsed.name.trim() ? parsed.name : defaultLobbyProfile.name,
      avatar: avatarAllowed && parsed.avatar ? parsed.avatar : defaultLobbyProfile.avatar,
      color: colorAllowed && parsed.color ? parsed.color : defaultLobbyProfile.color
    };
  } catch {
    return defaultLobbyProfile;
  }
}

export function createLobbyProfileStore(storage = createSafeSessionStorage()) {
  const persist = (profile: LobbyProfile) => {
    storage.setItem(LOBBY_SESSION_STORAGE_KEY, JSON.stringify(profile));
  };

  return create<LobbyState>((set) => ({
    profile: hydrateProfile(storage),
    setName: (value) =>
      set((state) => {
        const next = { ...state.profile, name: value };
        persist(next);
        return { profile: next };
      }),
    setAvatar: (id) =>
      set((state) => {
        const next = { ...state.profile, avatar: id };
        persist(next);
        return { profile: next };
      }),
    setColor: (id) =>
      set((state) => {
        const next = { ...state.profile, color: id };
        persist(next);
        return { profile: next };
      }),
    reset: () => {
      persist(defaultLobbyProfile);
      set({ profile: defaultLobbyProfile });
    }
  }));
}

export const useLobbyProfileStore = createLobbyProfileStore();

type LobbyStoreSnapshot = {
  profile: LobbyProfile;
};

export const selectLobbyName = (state: LobbyStoreSnapshot) => state.profile.name;
export const selectLobbyAvatar = (state: LobbyStoreSnapshot) => state.profile.avatar;
export const selectLobbyColor = (state: LobbyStoreSnapshot) => state.profile.color;

export function resolveLobbyAvatarSrc(id: LobbyAvatarID): string {
  return lobbyAvatarOptions.find((item) => item.id === id)?.src ?? assets.characters.avatars.penguin1;
}

export function resolveLobbyColorValue(id: LobbyColorID): string {
  return resolvePlayerColorValue(id);
}
