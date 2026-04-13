// useWorldLatest — polls the world-model endpoint for the latest GLB URL.
//
// Structurally mirrors useBrainLatest: when the endpoint is empty, returns the
// local mock path immediately; otherwise polls every WORLD_POLL_INTERVAL_MS and
// updates the URL whenever the server-side timestamp changes.

import { useEffect, useRef, useState } from "react";
import { ENDPOINTS, WORLD_POLL_INTERVAL_MS } from "@/config";

const MOCK_PATH = `${import.meta.env.BASE_URL}mock/world.glb`;

interface WorldLatestPayload {
  url: string;
  timestamp: number;
}

const isPayload = (x: unknown): x is WorldLatestPayload => {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return typeof o.url === "string" && typeof o.timestamp === "number";
};

export interface UseWorldLatestResult {
  modelUrl: string;
  connected: boolean;
}

export const useWorldLatest = (): UseWorldLatestResult => {
  const endpoint = ENDPOINTS.worldModel;
  const isMock = !endpoint;

  const [modelUrl, setModelUrl] = useState<string>(isMock ? MOCK_PATH : "");
  const [connected, setConnected] = useState(false);
  const lastTsRef = useRef<number>(0);

  useEffect(() => {
    if (isMock) return;

    const ac = new AbortController();

    const tick = async () => {
      try {
        const res = await fetch(endpoint, {
          signal: ac.signal,
          cache: "no-store",
        });
        if (!res.ok) return;
        const json: unknown = await res.json();
        if (!isPayload(json)) return;
        if (ac.signal.aborted) return;

        setConnected(true);
        if (json.timestamp === lastTsRef.current) return;
        lastTsRef.current = json.timestamp;
        setModelUrl(json.url);
      } catch (err) {
        console.warn("[useWorldLatest] poll failed:", err);
      }
    };

    tick();
    const id = window.setInterval(tick, WORLD_POLL_INTERVAL_MS);
    return () => {
      ac.abort();
      window.clearInterval(id);
    };
  }, [endpoint, isMock]);

  return { modelUrl, connected };
};
