import { useMemo } from "react";

type SocketView = {
  unstable: boolean;
  label: string;
};

export function useSocketStatus(status: "connected" | "reconnecting" | "absent" = "connected"): SocketView {
  return useMemo(() => {
    if (status === "reconnecting") {
      return { unstable: true, label: "Reconectando" };
    }
    if (status === "absent") {
      return { unstable: true, label: "Ausente" };
    }
    return { unstable: false, label: "OK" };
  }, [status]);
}
