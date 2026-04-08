interface Props {
  elapsed: number; // seconds since frame start
}

const DoneScreen = ({ elapsed }: Props) => {
  const countdown = Math.max(0, Math.ceil(8 - elapsed));

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-6 animate-card-in">
        <div className="font-mono text-xs text-muted-foreground tracking-[0.3em]">
          ALL CYCLES COMPLETE
        </div>

        <div className="text-4xl font-mono font-bold text-success text-glow-act tracking-wider">
          ✅ MISSION COMPLETE
        </div>

        <div className="space-y-2 font-mono text-sm text-foreground/70">
          <div>🔄 Cycle 1 · 理解指令 + 旋转扫描环境 <span className="text-success">✓</span></div>
          <div>🔄 Cycle 2 · 选择最远椅子 + 导航到达 <span className="text-success">✓</span></div>
          <div>🔄 Cycle 3 · 回忆出发点 + 找到身后桌子 <span className="text-success">✓</span></div>
        </div>

        <div className="font-mono text-xs text-muted-foreground">
          3 cycles · 2 targets reached · 0 collisions
        </div>

        <div className="font-mono text-xs text-muted-foreground/50 animate-pulse-glow">
          {countdown}s 后自动 LOOP →
        </div>
      </div>
    </div>
  );
};

export default DoneScreen;
