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
import { MOCK_THOUGHT_LINES, type ThoughtItem, type ThoughtRole } from "@/data/mockThoughts";
import { ENDPOINTS, THOUGHT_POLL_INTERVAL_MS } from "@/config";
import { lineToThoughtItem, useBrainLatest } from "@/hooks/useBrainLatest";

// How often a MOCK card appears (ms). Only used when no live endpoint is set.
const CARD_INTERVAL_MS = 1800;
// How many cards to keep on screen before dropping the oldest. Prevents
// unbounded DOM growth during long demo loops.
const MAX_VISIBLE_CARDS = 40;

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

// Format timestamp to Beijing time (UTC+8) HH:MM:SS
const formatBeijingTime = (timestamp?: number) => {
  const date = timestamp ? new Date(timestamp * 1000) : new Date();
  // 转换为北京时间 (UTC+8)
  const beijingTime = new Date(date.getTime() + (8 * 60 * 60 * 1000));
  const h = beijingTime.getUTCHours();
  const m = beijingTime.getUTCMinutes();
  const s = beijingTime.getUTCSeconds();
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const ThoughtStream = () => {
  const [displayed, setDisplayed] = useState<DisplayedThought[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef(0);
  const uidRef = useRef(0);

  // LIVE source. When ENDPOINTS.thoughtStream is empty this stays idle
  // (thoughts === []) and we fall back to the mock loop below.
  const liveEndpoint = ENDPOINTS.thoughtStream as string;
  const { thoughts: liveThoughts, connected: liveConnected } = useBrainLatest(
    liveEndpoint,
    THOUGHT_POLL_INTERVAL_MS,
  );

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
        next.push({
          ...item,
          uid: uidRef.current++,
          time: formatBeijingTime(),
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
    if (MOCK_THOUGHT_LINES.length === 0) return;

    const tick = () => {
      const line = MOCK_THOUGHT_LINES[cursorRef.current % MOCK_THOUGHT_LINES.length];
      cursorRef.current += 1;
      const source = lineToThoughtItem(line);
      if (!source) return;

      const next: DisplayedThought = {
        ...source,
        uid: uidRef.current++,
        time: formatBeijingTime(),
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
        <span className="text-xs tracking-[0.3em] text-[#00E5FF]/80">
          THOUGHT STREAM
        </span>
        <span className="text-[10px] tracking-widest text-[#00E5FF]/40">
          {liveEndpoint ? (liveConnected ? "LIVE" : "LIVE · WAITING") : "MOCK"}
        </span>
      </div>

      {/* Scrollable card column */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto pr-2 space-y-3 scroll-smooth scrollbar-cyan"
      >
        {displayed.map((card, i) => {
          const rs = roleStyle[card.role];
          const isLatest = i === displayed.length - 1;
          return (
            <div
              key={card.uid}
              className="group animate-thought-in"
              style={{
                opacity: isLatest ? 1 : 0.82,
                willChange: "transform, opacity, filter",
              }}
            >
              {/* Card body */}
              <div
                className="relative overflow-hidden rounded-md border border-[#00E5FF]/25 bg-gradient-to-br from-[#0F1524]/90 to-[#0A0E1A]/70 p-4 backdrop-blur-sm"
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

                {/* Header with role/label and timestamp */}
                <div className="relative mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${rs.dot} ${
                        isLatest ? "animate-pulse" : ""
                      }`}
                    />
                    <span
                      className={`font-mono text-xs font-bold tracking-wider ${rs.accent} drop-shadow-[0_0_6px_currentColor]`}
                    >
                      {rs.name}
                    </span>
                    <span className="rounded bg-black/40 px-2 py-0.5 font-mono text-[11px] text-[#00E5FF]/60">
                      {card.label}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-[#00E5FF]/50">
                    {card.time}
                  </span>
                </div>

                {/* Message content */}
                <div className="relative font-mono text-sm leading-relaxed text-white/95">
                  {card.content}
                </div>
                {card.code && (
                  <pre
                    className="relative mt-3 overflow-x-auto rounded border border-[#00E5FF]/15 bg-black/50 p-3 font-mono text-xs text-cyan-300/80 scrollbar-cyan"
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
