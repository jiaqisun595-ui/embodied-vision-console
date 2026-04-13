// ThoughtStream — left-column component for the exhibition display.
// Self-contained, always running. Two data sources:
//
//   1. LIVE mode (default when ENDPOINTS.thoughtStream is set):
//      useBrainLatest polls GET <thoughtStream>/api/brain/latest every
//      THOUGHT_POLL_INTERVAL_MS and appends each new card as it arrives.
//
//   2. MOCK mode (when ENDPOINTS.thoughtStream is empty):
//      Cycles through MOCK_THOUGHTS on a fixed interval so the exhibit still
//      plays when the brain service isn't up yet.
//
// The rendering logic is identical in both modes — only the source of
// ThoughtItem[] differs.

import { useEffect, useRef, useState } from "react";
import { MOCK_THOUGHTS } from "@/data/mockThoughts";
import type { ThoughtItem, ThoughtRole } from "@/types/thought";
import { ENDPOINTS, THOUGHT_POLL_INTERVAL_MS, CARD_INTERVAL_MS, MAX_VISIBLE_CARDS } from "@/config";
import { useBrainLatest } from "@/hooks/useBrainLatest";
import { useReportConnection } from "@/contexts/ConnectionStatus";

interface DisplayedThought extends ThoughtItem {
  // Unique per render, so React keys stay stable across the infinite loop.
  uid: number;
  // Pseudo-timestamp used as the card's left gutter label.
  time: string;
}

const roleStyle: Record<
  ThoughtRole,
  { name: string; dot: string; accent: string; glow: string }
> = {
  brain: {
    name: "BRAIN",
    dot: "bg-fuchsia-400 shadow-[0_0_8px_rgba(244,114,182,0.8)]",
    accent: "text-fuchsia-300",
    glow: "rgba(244,114,182,0.5)",
  },
  world: {
    name: "WORLD",
    dot: "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]",
    accent: "text-cyan-300",
    glow: "rgba(34,211,238,0.5)",
  },
  act: {
    name: "ACT",
    dot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]",
    accent: "text-amber-300",
    glow: "rgba(251,191,36,0.5)",
  },
  done: {
    name: "DONE",
    dot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]",
    accent: "text-emerald-300",
    glow: "rgba(52,211,153,0.5)",
  },
};

// Fake monotonic clock so the timestamps look plausible as new cards stream in.
const formatClock = (seconds: number) => {
  const m = Math.floor(seconds / 60) % 60;
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const ThoughtStream = () => {
  const [displayed, setDisplayed] = useState<DisplayedThought[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef(0);
  const uidRef = useRef(0);
  const clockRef = useRef(0);

  // LIVE source. When ENDPOINTS.thoughtStream is empty this stays idle
  // (thoughts === []) and we fall back to the mock loop below.
  // Cast widens the `as const` literal "" so downstream string ops typecheck
  // even while the endpoint is still empty at authoring time.
  const rawThoughtBase = ENDPOINTS.thoughtStream as string;
  const liveEndpoint = rawThoughtBase
    ? `${rawThoughtBase.replace(/\/$/, "")}/api/brain/latest`
    : "";
  const { thoughts: liveThoughts, connected: liveConnected } = useBrainLatest(
    liveEndpoint,
    THOUGHT_POLL_INTERVAL_MS,
  );

  const report = useReportConnection();
  useEffect(() => {
    report("BRAIN", liveEndpoint ? (liveConnected ? "live" : "connecting") : "mock");
  }, [liveEndpoint, liveConnected, report]);

  // Append new LIVE cards as they arrive from the brain endpoint.
  const liveSeenRef = useRef(0);
  useEffect(() => {
    if (!liveEndpoint) return;
    if (liveThoughts.length <= liveSeenRef.current) return;

    const fresh = liveThoughts.slice(liveSeenRef.current);
    liveSeenRef.current = liveThoughts.length;

    setDisplayed((prev) => {
      const next = [...prev];
      for (const item of fresh) {
        clockRef.current += THOUGHT_POLL_INTERVAL_MS / 1000;
        next.push({
          ...item,
          uid: uidRef.current++,
          time: formatClock(clockRef.current),
        });
      }
      return next.length > MAX_VISIBLE_CARDS
        ? next.slice(next.length - MAX_VISIBLE_CARDS)
        : next;
    });
  }, [liveThoughts, liveEndpoint]);

  // MOCK loop. Runs only when there is no live endpoint configured.
  useEffect(() => {
    if (liveEndpoint) return;
    if (MOCK_THOUGHTS.length === 0) return;

    const tick = () => {
      const source = MOCK_THOUGHTS[cursorRef.current % MOCK_THOUGHTS.length];
      cursorRef.current += 1;
      clockRef.current += CARD_INTERVAL_MS / 1000;

      const next: DisplayedThought = {
        ...source,
        uid: uidRef.current++,
        time: formatClock(clockRef.current),
      };

      setDisplayed((prev) => {
        const appended = [...prev, next];
        return appended.length > MAX_VISIBLE_CARDS
          ? appended.slice(appended.length - MAX_VISIBLE_CARDS)
          : appended;
      });
    };

    // Seed one card immediately so the panel isn't empty on first paint.
    tick();
    const id = window.setInterval(tick, CARD_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [liveEndpoint]);

  // Auto-scroll to the bottom whenever a new card is added.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [displayed]);

  return (
    <div className="flex h-full w-full flex-col p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs tracking-[0.3em] text-accent/80">
          THOUGHT STREAM
        </span>
        <span className="text-[10px] tracking-widest text-accent/40">
          {liveEndpoint ? (liveConnected ? "LIVE" : "LIVE · WAITING") : "MOCK"}
        </span>
      </div>

      {/* Scrollable card column */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto pr-2 space-y-2 scroll-smooth scrollbar-cyan"
      >
        {displayed.map((card, i) => {
          const rs = roleStyle[card.role];
          const isLatest = i === displayed.length - 1;
          return (
            <div
              key={card.uid}
              className="group flex items-stretch gap-3 animate-thought-in"
              style={{
                opacity: isLatest ? 1 : 0.82,
                willChange: "transform, opacity, filter",
              }}
            >
              {/* Timestamp gutter */}
              <div className="w-10 shrink-0 pt-2 text-right font-mono text-[10px] text-accent/40">
                {card.time}
              </div>

              {/* Timeline dot + line */}
              <div className="flex w-3 shrink-0 flex-col items-center">
                <div
                  className={`relative mt-3 h-2.5 w-2.5 shrink-0 rounded-full ${rs.dot} animate-thought-dot ${
                    isLatest ? "animate-pulse" : ""
                  }`}
                />
                <div className="my-1 w-px flex-1 bg-gradient-to-b from-accent/40 via-accent/15 to-transparent" />
              </div>

              {/* Card body */}
              <div
                className="relative flex-1 overflow-hidden rounded-md border border-accent/25 bg-gradient-to-br from-surface/90 to-base/70 p-3 backdrop-blur-sm"
                style={{
                  boxShadow: `inset 16px 0 24px -12px ${rs.glow}`,
                }}
              >
                {/* Soft sweep highlight on new cards */}
                {isLatest && (
                  <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 w-2/5 animate-thought-scan"
                      style={{
                        background: `linear-gradient(to right, transparent, ${rs.glow.replace('0.5)', '0.12)')}, transparent)`,
                      }}
                    />
                  </div>
                )}

                <div className="relative mb-1.5 flex items-center gap-2">
                  <span
                    className={`font-mono text-[10px] font-bold tracking-wider ${rs.accent} drop-shadow-[0_0_6px_currentColor]`}
                  >
                    {rs.name}
                  </span>
                  <span className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-[10px] text-accent/60">
                    {card.label}
                  </span>
                </div>
                <div className="relative font-mono text-xs leading-relaxed text-white/90">
                  {card.content}
                </div>
                {card.code && (
                  <pre
                    className="relative mt-2 overflow-x-auto rounded border border-accent/15 bg-black/50 p-2 font-mono text-[11px] text-cyan-300/80 scrollbar-cyan"
                  >
                    {card.code}
                  </pre>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ThoughtStream;
