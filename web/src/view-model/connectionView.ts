import type { FrozenGuildUiStore } from "../store/frozenGuildStore.js";

export type ConnectionView = {
  unstablePlayers: Array<{ id: string; name: string; status: "reconnecting" | "absent" }>;
};

export function makeConnectionView(state: FrozenGuildUiStore): ConnectionView {
  if (!state.G) {
    return { unstablePlayers: [] };
  }

  const unstablePlayers: ConnectionView["unstablePlayers"] = Object.entries(state.G.players)
    .filter(([, player]) => player.connectionStatus === "reconnecting" || player.connectionStatus === "absent")
    .map(([id, player]) => ({
      id,
      name: player.name,
      status: player.connectionStatus === "reconnecting" ? "reconnecting" : "absent"
    }));

  return { unstablePlayers };
}
