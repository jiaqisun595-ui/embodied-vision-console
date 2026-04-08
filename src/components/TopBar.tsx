interface TopBarProps {
  mode: "thinking" | "perception";
  onToggle: () => void;
}

const chips = [
  { icon: "🎤", label: "语音", active: true },
  { icon: "💬", label: "文字", active: false },
  { icon: "🖼", label: "图片", active: false },
  { icon: "📍", label: "地图", active: false },
];

const TopBar = ({ mode, onToggle }: TopBarProps) => {
  return (
    <div className="flex items-center justify-between px-5 py-2.5 border-b border-border bg-card/80 backdrop-blur">
      {/* Left title */}
      <div className="font-mono font-bold text-sm tracking-widest text-glow-cyan text-cyan shrink-0">
        EMBODIED-AI · DEMO
      </div>

      {/* Center command bar */}
      <div className="flex-1 mx-6 flex items-center gap-3 bg-background/60 border border-border rounded px-4 py-1.5">
        {/* Chips */}
        <div className="flex gap-2 shrink-0">
          {chips.map((c) => (
            <span
              key={c.label}
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono ${
                c.active
                  ? "border border-cyan bg-cyan/10 text-cyan"
                  : "border border-dashed border-muted-foreground/30 text-muted-foreground/50"
              }`}
            >
              {c.icon} {c.label}
              {c.active && (
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-glow ml-1" />
              )}
            </span>
          ))}
        </div>

        {/* Command text */}
        <span className="font-mono text-sm text-foreground/90 truncate">
          "先走到最远的椅子，再走到出发前身后的桌子"
        </span>

        {/* Source tag */}
        <span className="font-mono text-[10px] text-muted-foreground/50 shrink-0 ml-auto">
          voice-service mock · GET /asr/latest
        </span>
      </div>

      {/* Mode badge */}
      <button
        onClick={onToggle}
        className="shrink-0 mx-3 px-4 py-1 rounded font-mono text-xs font-bold tracking-wider bg-secondary text-foreground border border-border hover:border-cyan/40 transition-colors animate-pulse-glow cursor-pointer"
      >
        {mode === "thinking" ? "THINKING" : "PERCEPTION"}
      </button>

      {/* Timer */}
      <div className="font-mono text-sm text-muted-foreground shrink-0">
        00:21
      </div>
    </div>
  );
};

export default TopBar;
