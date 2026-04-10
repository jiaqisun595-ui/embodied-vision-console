// useBrainLatest — polls the brain module's /api/brain/latest endpoint
// and returns a growing list of de-duplicated thought cards.
//
// Contract (agreed with teacher Yiqun):
//   GET  http://<brain-host>:<port>/api/brain/latest
//   Every THOUGHT_POLL_INTERVAL_MS (≈2.5s) this hook calls the endpoint and
//   expects a JSON body shaped exactly like ThoughtItem:
//     { role: "brain"|"world"|"act"|"done", label: string,
//       content: string, code?: string }
//
// Behaviour:
//   * Only appends a card when the returned payload differs from the last one
//     we saw (by role+label+content+code). This keeps the stream quiet between
//     real brain updates even though we poll on a fixed interval.
//   * If `endpoint` is an empty string, the hook stays idle so callers can
//     fall back to mock data (see ThoughtStream.tsx).
//   * Network / parse errors are swallowed — the display should never crash
//     mid-exhibition just because the brain service blips.

import { useEffect, useRef, useState } from "react";
import type { ThoughtItem, ThoughtRole } from "@/data/mockThoughts";

const VALID_ROLES: readonly ThoughtRole[] = ["brain", "world", "act", "done"];

const isThoughtItem = (x: unknown): x is ThoughtItem => {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.role === "string" &&
    (VALID_ROLES as readonly string[]).includes(o.role) &&
    typeof o.label === "string" &&
    typeof o.content === "string" &&
    (o.code === undefined || typeof o.code === "string")
  );
};

const fingerprint = (t: ThoughtItem) =>
  `${t.role}|${t.label}|${t.content}|${t.code ?? ""}`;

export interface UseBrainLatestResult {
  thoughts: ThoughtItem[];
  /** True once at least one successful fetch has returned a valid card. */
  connected: boolean;
}

export const useBrainLatest = (
  endpoint: string,
  intervalMs: number,
): UseBrainLatestResult => {
  const [thoughts, setThoughts] = useState<ThoughtItem[]>([]);
  const [connected, setConnected] = useState(false);
  const lastFpRef = useRef<string>("");

  useEffect(() => {
    if (!endpoint) return;

    let cancelled = false;
    const ac = new AbortController();

    const tick = async () => {
      try {
        const res = await fetch(endpoint, {
          signal: ac.signal,
          cache: "no-store",
        });
        if (!res.ok) return;
        const json: unknown = await res.json();
        if (!isThoughtItem(json)) return;
        if (cancelled) return;

        setConnected(true);
        const fp = fingerprint(json);
        if (fp === lastFpRef.current) return; // no new card yet
        lastFpRef.current = fp;
        setThoughts((prev) => [...prev, json]);
      } catch (err) {
        console.warn("[useBrainLatest] poll failed:", err);
      }
    };

    tick();
    const id = window.setInterval(tick, intervalMs);
    return () => {
      cancelled = true;
      ac.abort();
      window.clearInterval(id);
    };
  }, [endpoint, intervalMs]);

  return { thoughts, connected };
};
