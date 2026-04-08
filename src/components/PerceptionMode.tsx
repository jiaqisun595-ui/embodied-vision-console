const PerceptionMode = () => {
  return (
    <div className="flex flex-col h-full p-3 gap-3">
      {/* Video slots */}
      <div className="flex-1 flex gap-3 min-h-0">
        {/* Slot A: RGB */}
        <div className="w-2/3 rounded bg-card border border-border relative overflow-hidden">
          {/* Simulated dark video feed */}
          <div className="absolute inset-0 bg-gradient-to-br from-muted/30 via-background to-muted/20" />

          {/* Noise texture simulation */}
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Detection bounding box */}
          <div className="absolute top-[25%] left-[35%] w-[30%] h-[45%] animate-breathe rounded-sm">
            <div className="absolute -top-5 left-0 font-mono text-[10px] text-cyan bg-cyan/10 px-1.5 py-0.5 rounded-sm border border-cyan/30">
              TARGET · chair_A · d≈1.6m
            </div>
          </div>

          {/* Labels */}
          <div className="absolute top-2 left-3 font-mono text-[10px] text-muted-foreground/60">
            Slot A · RGB 彩色视频流 + 检测叠加层
          </div>
          <div className="absolute top-2 right-3 font-mono text-[10px] text-muted-foreground/40">
            src=mock · live: http://10.100.129.68:8001/rgb
          </div>
        </div>

        {/* Slot B: Depth */}
        <div className="w-1/3 rounded bg-card border border-border relative overflow-hidden">
          {/* Jet colormap simulation */}
          <div className="absolute inset-0 depth-gradient opacity-60" />

          {/* Labels */}
          <div className="absolute top-2 left-3 font-mono text-[10px] text-muted-foreground/60">
            Slot B · 深度图 Depth Stream
          </div>
          <div className="absolute top-2 right-3 font-mono text-[10px] text-muted-foreground/40">
            src=mock · live: http://10.100.129.68:8001/depth
          </div>
        </div>
      </div>

      {/* HUD data bar */}
      <div className="shrink-0 rounded bg-card border border-border px-4 py-2.5 font-mono text-xs text-muted-foreground flex items-center justify-between">
        <div className="flex items-center gap-4 text-foreground/70">
          <span>pose <span className="text-cyan">(1.8, 0.3)</span> → <span className="text-cyan">(3.2, 0.5)</span></span>
          <span className="text-muted-foreground/30">|</span>
          <span>heading <span className="text-cyan">008°</span></span>
          <span className="text-muted-foreground/30">|</span>
          <span>target <span className="text-success">chair_A</span> 🎯</span>
          <span className="text-muted-foreground/30">|</span>
          <span>action <span className="text-cyan">navigate_to(3.2, 0.5)</span></span>
          <span className="text-muted-foreground/30">|</span>
          <span>ETA <span className="text-cyan">~2s</span></span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-success font-bold tracking-wider text-glow-act">NAVIGATING</span>
          <span className="text-muted-foreground/40">· FPS 30</span>
        </div>
      </div>
    </div>
  );
};

export default PerceptionMode;
