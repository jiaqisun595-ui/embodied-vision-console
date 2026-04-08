import type { FrameData, Detection } from "@/data/timeline";

interface Props {
  frame: FrameData;
  elapsed: number;
}

const PerceptionMode = ({ frame, elapsed }: Props) => {
  const detections = frame.detections ?? [];
  const hud = frame.hud ?? [];
  const hudStatus = frame.hudStatus ?? "IDLE";

  // Stagger detection appearance
  const detectionInterval = detections.length > 1 ? 2.5 : 0;

  return (
    <div className="flex flex-col h-full p-3 gap-3">
      {/* Video slots */}
      <div className="flex-1 flex gap-3 min-h-0">
        {/* Slot A: RGB */}
        <div className="w-2/3 rounded bg-card border border-border relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/30 via-background to-muted/20" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Detection boxes */}
          {detections.map((det, i) => {
            const visible = elapsed >= i * detectionInterval;
            if (!visible) return null;
            return (
              <DetectionBox
                key={i}
                detection={det}
                index={i}
                total={detections.length}
              />
            );
          })}

          <div className="absolute top-2 left-3 font-mono text-[10px] text-muted-foreground/60">
            Slot A · RGB 彩色视频流 + 检测叠加层
          </div>
          <div className="absolute top-2 right-3 font-mono text-[10px] text-muted-foreground/40">
            src=mock · live: http://10.100.129.68:8001/rgb
          </div>
        </div>

        {/* Slot B: Depth */}
        <div className="w-1/3 rounded bg-card border border-border relative overflow-hidden">
          <div className="absolute inset-0 depth-gradient opacity-60" />
          <div className="absolute top-2 left-3 font-mono text-[10px] text-muted-foreground/60">
            Slot B · 深度图 Depth Stream
          </div>
          <div className="absolute top-2 right-3 font-mono text-[10px] text-muted-foreground/40">
            src=mock · live: http://10.100.129.68:8001/depth
          </div>
        </div>
      </div>

      {/* HUD bar */}
      <div className="shrink-0 rounded bg-card border border-border px-4 py-2.5 font-mono text-xs text-muted-foreground flex items-center justify-between">
        <div className="flex items-center gap-4 text-foreground/70">
          {hud.map((item, i) => (
            <span key={i} className="flex items-center gap-1">
              <HudValue text={item} />
              {i < hud.length - 1 && (
                <span className="text-muted-foreground/30 ml-3">|</span>
              )}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-success font-bold tracking-wider text-glow-act">
            {hudStatus}
          </span>
          <span className="text-muted-foreground/40">· FPS 30</span>
        </div>
      </div>
    </div>
  );
};

function HudValue({ text }: { text: string }) {
  // Highlight values in cyan: numbers, coordinates, targets
  const parts = text.split(/(\([^)]+\)|🎯|\d+[°ms]?(?:\.\d+)?(?:\/\d+[°]?)?|chair_\w+|table_\w+|~\d+s)/g);
  return (
    <>
      {parts.map((p, i) =>
        /^[\d(~]|chair_|table_|🎯/.test(p) ? (
          <span key={i} className="text-cyan">{p}</span>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

function DetectionBox({
  detection,
  index,
  total,
}: {
  detection: Detection;
  index: number;
  total: number;
}) {
  // Spread boxes across the frame
  const positions = total === 1
    ? [{ top: "25%", left: "35%", w: "30%", h: "45%" }]
    : total === 3
    ? [
        { top: "15%", left: "15%", w: "28%", h: "40%" },
        { top: "30%", left: "50%", w: "24%", h: "35%" },
        { top: "50%", left: "25%", w: "22%", h: "30%" },
      ]
    : [{ top: "20%", left: "30%", w: "30%", h: "45%" }];

  const pos = positions[index] ?? positions[0];

  return (
    <div
      className={`absolute animate-breathe rounded-sm animate-card-in`}
      style={{
        top: pos.top,
        left: pos.left,
        width: pos.w,
        height: pos.h,
      }}
    >
      <div className="absolute -top-5 left-0 font-mono text-[10px] text-cyan bg-cyan/10 px-1.5 py-0.5 rounded-sm border border-cyan/30 whitespace-nowrap">
        {detection.isTarget ? "TARGET · " : ""}
        {detection.label}
        {detection.confidence != null && ` · ${detection.confidence.toFixed(2)}`}
        {detection.distance && ` · ${detection.distance}`}
      </div>
    </div>
  );
}

export default PerceptionMode;
