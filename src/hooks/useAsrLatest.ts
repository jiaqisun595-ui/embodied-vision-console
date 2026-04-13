// useAsrLatest — polls the ASR service's /api/asr/latest endpoint
// and returns the most recent command text.
//
// Contract (agreed with Zebei):
//   GET  http://<asr-host>/api/asr/latest
//   Returns JSON: { text: string }
//
// Behaviour:
//   * Returns the latest text, deduped against the previous value.
//   * If `endpoint` is empty the hook stays idle (caller shows placeholder).
//   * Network / parse errors are swallowed to keep the display stable.

import { useEffect, useRef, useState } from "react";

export const useAsrLatest = (
  endpoint: string,
  intervalMs: number,
): string | null => {
  const [text, setText] = useState<string | null>(null);
  const lastRef = useRef<string>("");

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
        if (
          !json ||
          typeof json !== "object" ||
          typeof (json as Record<string, unknown>).text !== "string"
        )
          return;
        if (cancelled) return;

        const incoming = (json as { text: string }).text;
        if (incoming === lastRef.current) return;
        lastRef.current = incoming;
        setText(incoming);
      } catch (err) {
        console.warn("[useAsrLatest] poll failed:", err);
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

  return text;
};
