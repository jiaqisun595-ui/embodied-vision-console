// ThoughtStream — left-column component for the exhibition display.
// Self-contained, always running. Pulls items from MOCK_THOUGHTS one by one
// on a fixed interval, auto-scrolls to the newest card, and loops forever.
//
// When the real brain-module endpoint is ready, swap the `MOCK_THOUGHTS`
// import for a hook / fetcher that returns `ThoughtItem[]`. The rendering
// logic here does not need to change.

import { useEffect, useRef, useState } from "react";
import { MOCK_THOUGHTS, type ThoughtItem, type ThoughtRole } from "@/data/mockThoughts";

// How often a new card appears (ms). Tunable — slower feels more "thinky".
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
  { name: string; dot: string; accent: string }
> = {
  brain: {
    name: "BRAIN",
    dot: "bg-fuchsia-400 shadow-[0_0_8px_rgba(244,114,182,0.8)]",
    accent: "text-fuchsia-300",
  },
  world: {
    name: "WORLD",
    dot: "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]",
    accent: "text-cyan-300",
  },
  act: {
    name: "ACT",
    dot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]",
    accent: "text-amber-300",
  },
  done: {
    name: "DONE",
    dot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]",
    accent: "text-emerald-300",
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

  // Push a new card every CARD_INTERVAL_MS. Loops through MOCK_THOUGHTS.
  useEffect(() => {
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
  }, []);

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
          LIVE · MOCK
        </span>
      </div>

      {/* Scrollable card column */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto pr-2 space-y-2 scroll-smooth
          [scrollbar-color:rgba(0,229,255,0.25)_transparent] [scrollbar-width:thin]
          [&::-webkit-scrollbar]:w-1.5
          [&::-webkit-scrollbar-track]:bg-[#0A0E1A]
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-[#00E5FF]/25
          [&::-webkit-scrollbar-thumb]:border
          [&::-webkit-scrollbar-thumb]:border-[#00E5FF]/10
          hover:[&::-webkit-scrollbar-thumb]:bg-[#00E5FF]/45"
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
              <div className="w-10 shrink-0 pt-2 text-right font-mono text-[10px] text-[#00E5FF]/40">
                {card.time}
              </div>

              {/* Timeline dot + line */}
              <div className="flex w-3 shrink-0 flex-col items-center">
                <div
                  className={`relative mt-3 h-2.5 w-2.5 shrink-0 rounded-full ${rs.dot} animate-thought-dot ${
                    isLatest ? "animate-pulse" : ""
                  }`}
                />
                <div className="my-1 w-px flex-1 bg-gradient-to-b from-[#00E5FF]/40 via-[#00E5FF]/15 to-transparent" />
              </div>

              {/* Card body */}
              <div className="relative flex-1 overflow-hidden rounded-md border border-[#00E5FF]/25 bg-gradient-to-br from-[#0F1524]/90 to-[#0A0E1A]/70 p-3 backdrop-blur-sm">
                {/* Left accent bar */}
                <div
                  className={`pointer-events-none absolute inset-y-0 left-0 w-[2px] ${rs.dot}`}
                />

                {/* HUD scanline sweep — only on the newest card */}
                {isLatest && (
                  <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-[#00E5FF]/25 to-transparent animate-thought-scan" />
                  </div>
                )}

                <div className="relative mb-1.5 flex items-center gap-2">
                  <span
                    className={`font-mono text-[10px] font-bold tracking-wider ${rs.accent} drop-shadow-[0_0_6px_currentColor]`}
                  >
                    {rs.name}
                  </span>
                  <span className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-[10px] text-[#00E5FF]/60">
                    {card.label}
                  </span>
                </div>
                <div className="relative font-mono text-xs leading-relaxed text-white/90">
                  {card.content}
                </div>
                {card.code && (
                  <pre
                    className="relative mt-2 overflow-x-auto rounded border border-[#00E5FF]/15 bg-black/50 p-2 font-mono text-[11px] text-cyan-300/80
                      [scrollbar-color:rgba(0,229,255,0.25)_transparent] [scrollbar-width:thin]
                      [&::-webkit-scrollbar]:h-1.5
                      [&::-webkit-scrollbar-track]:bg-black/60
                      [&::-webkit-scrollbar-thumb]:rounded-full
                      [&::-webkit-scrollbar-thumb]:bg-[#00E5FF]/25
                      [&::-webkit-scrollbar-thumb]:border
                      [&::-webkit-scrollbar-thumb]:border-[#00E5FF]/10
                      hover:[&::-webkit-scrollbar-thumb]:bg-[#00E5FF]/45"
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
