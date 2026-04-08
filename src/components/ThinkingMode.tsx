import { useMemo } from "react";
import SpatialCanvas from "./SpatialCanvas";
import type { FrameData, CardRole } from "@/data/timeline";

interface Props {
  frame: FrameData;
  elapsed: number; // seconds since frame start
}

const roleConfig: Record<
  CardRole,
  {
    emoji: string;
    name: string;
    dotClass: string;
    cardClass: string;
    bgClass: string;
    textGlow: string;
    textColor: string;
  }
> = {
  brain: {
    emoji: "🧠",
    name: "BRAIN",
    dotClass: "bg-brain",
    cardClass: "card-glow-brain",
    bgClass: "bg-brain-bg",
    textGlow: "text-glow-brain",
    textColor: "text-brain",
  },
  world: {
    emoji: "🌐",
    name: "WORLD",
    dotClass: "bg-world",
    cardClass: "card-glow-world",
    bgClass: "bg-world-bg",
    textGlow: "text-glow-world",
    textColor: "text-world",
  },
  act: {
    emoji: "⚙",
    name: "ACT",
    dotClass: "bg-act",
    cardClass: "card-glow-act",
    bgClass: "bg-act-bg",
    textGlow: "text-glow-act",
    textColor: "text-act",
  },
  done: {
    emoji: "✅",
    name: "DONE",
    dotClass: "bg-success",
    cardClass: "card-glow-success",
    bgClass: "bg-act-bg",
    textGlow: "text-glow-act",
    textColor: "text-success",
  },
};

const ThinkingMode = ({ frame, elapsed }: Props) => {
  const cards = frame.cards ?? [];

  // Cards appear staggered: ~1s apart, waiting cards get replaced
  const cardInterval = Math.max(0.8, (frame.endTime - frame.startTime - 1) / Math.max(cards.length, 1));
  const visibleCount = useMemo(() => {
    return Math.min(cards.length, Math.floor(elapsed / cardInterval) + 1);
  }, [elapsed, cardInterval, cards.length]);

  return (
    <div className="flex h-full gap-3 p-3">
      {/* Left: Timeline */}
      <div className="w-[55%] flex flex-col overflow-hidden">
        {/* Cycle badge */}
        <div className="mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyan/40 bg-cyan/5 font-mono text-xs text-cyan">
            🔄 Cycle {frame.cycle} · {frame.cycleLabel}
          </span>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-0">
          {cards.slice(0, visibleCount).map((card, i) => {
            const rc = roleConfig[card.role];
            const isLatest = i === visibleCount - 1;
            return (
              <div
                key={`${frame.id}-${i}`}
                className="flex items-stretch gap-3 group animate-card-in"
                style={{
                  animationDelay: `${i * 60}ms`,
                }}
              >
                {/* Timestamp */}
                <div className="w-10 shrink-0 pt-3 text-right font-mono text-[11px] text-muted-foreground/60">
                  {card.time}
                </div>

                {/* Timeline line + dot */}
                <div className="flex flex-col items-center shrink-0 w-4">
                  <div
                    className={`w-2.5 h-2.5 rounded-full mt-3.5 shrink-0 ${rc.dotClass} ${
                      isLatest ? "animate-pulse-glow" : ""
                    }`}
                  />
                  {i < cards.length - 1 && (
                    <div className="w-px flex-1 bg-border/50 my-1" />
                  )}
                </div>

                {/* Card */}
                <div
                  className={`flex-1 rounded ${rc.cardClass} ${rc.bgClass} p-3 mb-2 ${
                    card.waiting ? "border border-dashed border-muted-foreground/30" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm">{rc.emoji}</span>
                    <span
                      className={`font-mono text-[10px] font-bold tracking-wider ${rc.textColor} ${rc.textGlow}`}
                    >
                      {rc.name}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground/60 bg-background/30 px-1.5 py-0.5 rounded">
                      {card.label}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-foreground/80 leading-relaxed">
                    {card.content}
                    {card.waiting && (
                      <span className="animate-blink text-cyan">▌</span>
                    )}
                  </div>
                  {card.code && (
                    <pre className="mt-2 p-2 rounded bg-background/40 font-mono text-[11px] text-cyan/80 overflow-x-auto">
                      {card.code}
                    </pre>
                  )}
                  {card.thumbnails && (
                    <div className="mt-2 flex gap-2">
                      <div className="w-16 h-10 rounded bg-background/40 border border-border/50 flex items-center justify-center">
                        <span className="font-mono text-[8px] text-muted-foreground/40">FOV snap</span>
                      </div>
                      <div className="w-16 h-10 rounded bg-background/40 border border-border/50 flex items-center justify-center">
                        <span className="font-mono text-[8px] text-muted-foreground/40">depth</span>
                      </div>
                    </div>
                  )}
                  {card.richTags && card.richTags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {card.richTags.map((tag, ti) => (
                        <div
                          key={ti}
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-background/40 font-mono text-[11px]"
                        >
                          <span className="text-muted-foreground">
                            {tag.label}
                          </span>
                          <span className="text-cyan font-bold">
                            {tag.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Spatial Canvas */}
      <div className="w-[45%] flex flex-col">
        <SpatialCanvas canvasId={frame.canvasId ?? "cycle2"} visibleCards={visibleCount} totalCards={cards.length} />
      </div>
    </div>
  );
};

export default ThinkingMode;
