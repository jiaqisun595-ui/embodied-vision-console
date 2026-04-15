// useBrainLatest — consumes the logging service's NDJSON stream and returns a
// growing list of log cards.
//
// Contract:
//   GET /api/logging/logging_show_stream
//   Response body is NDJSON: one JSON object per line.
//
// Behaviour:
//   * Each non-empty line becomes one ThoughtItem card.
//   * If the line already matches the ThoughtItem shape, keep it as-is.
//   * Otherwise stringify the JSON object and render it as plain text.
//   * On disconnect, wait `intervalMs` and reconnect.

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

const findNestedString = (
  value: unknown,
  key: "text" | "message",
): string | null => {
  if (!value || typeof value !== "object") return null;

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findNestedString(item, key);
      if (found) return found;
    }
    return null;
  }

  const record = value as Record<string, unknown>;
  if (typeof record[key] === "string" && record[key].trim()) {
    return record[key].trim();
  }

  for (const nested of Object.values(record)) {
    const found = findNestedString(nested, key);
    if (found) return found;
  }

  return null;
};

const decodeUTF8Escapes = (str: string): string => {
  try {
    // 替换 \xXX 为实际字节，然后用 UTF-8 解码
    return str.replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) => 
      String.fromCharCode(parseInt(hex, 16))
    );
  } catch {
    return str;
  }
};

export const lineToThoughtItem = (line: string): ThoughtItem | null => {
  const trimmed = line.trim();
  if (!trimmed) return null;

  try {
    const json: unknown = JSON.parse(trimmed);
    if (isThoughtItem(json)) return json;

    const text = findNestedString(json, "text");
    if (text) {
      return {
        role: "brain",
        label: "thinking",
        content: decodeUTF8Escapes(text),
      };
    }

    const message = findNestedString(json, "message");
    if (message) {
      return {
        role: "brain",
        label: "thinking",
        content: decodeUTF8Escapes(message),
      };
    }
  } catch {
    // Non-JSON lines are still shown as raw text below.
  }

  return {
    role: "brain",
    label: "thinking",
    content: decodeUTF8Escapes(trimmed),
  };
};

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

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => window.setTimeout(resolve, ms));

    const run = async () => {
      while (!cancelled) {
        try {
          const res = await fetch(endpoint, {
            signal: ac.signal,
            cache: "no-store",
          });
          if (!res.ok || !res.body) {
            setConnected(false);
            await sleep(intervalMs);
            continue;
          }

          setConnected(true);
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          while (!cancelled) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split(/\r?\n/);
            buffer = lines.pop() ?? "";

            const parsed = lines
              .map((line) => lineToThoughtItem(line))
              .filter((item): item is ThoughtItem => item !== null);

            if (parsed.length === 0) continue;

            setThoughts((prev) => {
              const next = [...prev];
              for (const item of parsed) {
                const fp = fingerprint(item);
                if (fp === lastFpRef.current) continue;
                lastFpRef.current = fp;
                next.push(item);
              }
              return next;
            });
          }
        } catch (err) {
          if (!cancelled) {
            setConnected(false);
            console.warn("[useBrainLatest] stream failed:", err);
          }
        }

        if (!cancelled) {
          await sleep(intervalMs);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
      setConnected(false);
      ac.abort();
    };
  }, [endpoint, intervalMs]);

  return { thoughts, connected };
};
