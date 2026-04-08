const BottomBar = () => {
  return (
    <div className="flex items-center justify-between px-5 py-2 border-t border-border bg-card/80 backdrop-blur font-mono text-xs">
      {/* Left: progress */}
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-cyan" />
          <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
          <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
        </span>
        <span>Cycle 2 / 3 · 选择最远椅子</span>
      </div>

      {/* Right: system info */}
      <div className="text-muted-foreground/50">
        ROS: MOCK · FPS 60
      </div>
    </div>
  );
};

export default BottomBar;
