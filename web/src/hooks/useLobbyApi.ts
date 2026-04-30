import { useMemo } from "react";

type UseLobbyApiOptions = {
  serverUrl: string;
};

export function useLobbyApi({ serverUrl }: UseLobbyApiOptions) {
  return useMemo(
    () => ({
      async listMatches() {
        const response = await fetch(`${serverUrl}/games/frozen-guild`);
        return response.json();
      }
    }),
    [serverUrl]
  );
}
