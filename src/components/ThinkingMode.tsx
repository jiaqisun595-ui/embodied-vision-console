import SpatialCanvas from "./SpatialCanvas";

interface TimelineCard {
  time: string;
  role: "brain" | "world" | "act";
  label: string;
  content: string;
  code?: string;
  waiting?: boolean;
  richTag?: { label: string; value: string };
}

const cards: TimelineCard[] = [
  {
    time: "00:19",
    role: "brain",
    label: "query",
    content: "已检测到 2 把椅子，要去最远的那把。",
    code: 'get_target(label="chair", constraint="max_distance", ref="current_pose")',
  },
  {
    time: "00:20",
    role: "world",
    label: "computing…",
    content: "computing distances from (0,0) ",
    waiting: true,
  },
  {
    time: "00:20",
    role: "world",
    label: "reply",
    content: "chair_A = 3.24m  chair_B = 1.49m → target = chair_A",
    richTag: { label: "target", value: "(3.2, 0.5)" },
  },
  {
    time: "00:21",
    role: "act",
    label: "→ /nav_aim",
    content: "navigate_to((3.2, 0.5))",
  },
];

const roleConfig = {
  brain: { emoji: "🧠", name: "BRAIN", dotClass: "bg-brain", cardClass: "card-glow-brain", bgClass: "bg-brain-bg", textGlow: "text-glow-brain", textColor: "text-brain" },
  world: { emoji: "🌐", name: "WORLD", dotClass: "bg-world", cardClass: "card-glow-world", bgClass: "bg-world-bg", textGlow: "text-glow-world", textColor: "text-world" },
  act: { emoji: "⚙", name: "ACT", dotClass: "bg-act", cardClass: "card-glow-act", bgClass: "bg-act-bg", textGlow: "text-glow-act", textColor: "text-act" },
};

const ThinkingMode = () => {
  return (
    <div className="flex h-full gap-3 p-3">
      {/* Left: Timeline */}
      <div className="w-[55%] flex flex-col overflow-hidden">
        {/* Cycle badge */}
        <div className="mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyan/40 bg-cyan/5 font-mono text-xs text-cyan">
            🔄 Cycle 2 / 3 · 选择最远椅子
          </span>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-0">
          {cards.map((card, i) => {
            const rc = roleConfig[card.role];
            return (
              <div key={i} className="flex items-stretch gap-3 group">
                {/* Timestamp */}
                <div className="w-10 shrink-0 pt-3 text-right font-mono text-[11px] text-muted-foreground/60">
                  {card.time}
                </div>

                {/* Timeline line + dot */}
                <div className="flex flex-col items-center shrink-0 w-4">
                  <div className={`w-2.5 h-2.5 rounded-full mt-3.5 shrink-0 ${rc.dotClass}`} />
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
                    <span className={`font-mono text-[10px] font-bold tracking-wider ${rc.textColor} ${rc.textGlow}`}>
                      {rc.name}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground/60 bg-background/30 px-1.5 py-0.5 rounded">
                      {card.label}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-foreground/80 leading-relaxed">
                    {card.content}
                    {card.waiting && <span className="animate-blink text-cyan">▌</span>}
                  </div>
                  {card.code && (
                    <pre className="mt-2 p-2 rounded bg-background/40 font-mono text-[11px] text-cyan/80 overflow-x-auto">
                      {card.code}
                    </pre>
                  )}
                  {card.richTag && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded bg-background/40 font-mono text-[11px]">
                      <span className="text-muted-foreground">{card.richTag.label}</span>
                      <span className="text-cyan font-bold">{card.richTag.value}</span>
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
        <SpatialCanvas />
      </div>
    </div>
  );
};

export default ThinkingMode;
