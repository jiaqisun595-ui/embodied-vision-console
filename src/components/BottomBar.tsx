import { frames } from "@/data/timeline";

interface Props {
  frameIndex: number;
  globalTime: number;
}

const BottomBar = ({ frameIndex, globalTime }: Props) => {
  const frame = frames[frameIndex];

  return (
    <div className="flex items-center justify-between px-5 py-2 border-t border-border bg-card/80 backdrop-blur font-mono text-xs">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="flex gap-1">
          {frames.map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === frameIndex ? "bg-cyan" : i < frameIndex ? "bg-cyan/30" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </span>
        <span>
          Cycle {frame.cycle} · {frame.cycleLabel}
        </span>
        <span className="text-muted-foreground/30 ml-2">
          Frame {frame.id} · {Math.floor(globalTime)}s / 60s
        </span>
      </div>

      <div className="text-muted-foreground/50">
        ROS: MOCK · FPS 60 · [Space] 暂停 · [R] 重置 · [←→] 切帧
      </div>
    </div>
  );
};

export default BottomBar;
