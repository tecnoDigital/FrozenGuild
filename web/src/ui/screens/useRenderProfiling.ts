import { useCallback, useRef } from "react";
import type { ProfilerOnRenderCallback } from "react";

type RenderStat = {
  commits: number;
  totalMs: number;
  maxMs: number;
};

export function useRenderProfiling() {
  const statsRef = useRef<Record<string, RenderStat>>({});

  const onRender = useCallback<ProfilerOnRenderCallback>((id, phase, actualDuration) => {
    if (!import.meta.env.DEV) {
      return;
    }

    const current = statsRef.current[id] ?? { commits: 0, totalMs: 0, maxMs: 0 };
    current.commits += 1;
    current.totalMs += actualDuration;
    current.maxMs = Math.max(current.maxMs, actualDuration);
    statsRef.current[id] = current;

    if (phase === "update" && current.commits % 20 === 0) {
      const avg = Number((current.totalMs / current.commits).toFixed(2));
      const max = Number(current.maxMs.toFixed(2));
      console.info(`[render-metrics] ${id} commits=${current.commits} avg=${avg}ms max=${max}ms`);
    }
  }, []);

  return onRender;
}
