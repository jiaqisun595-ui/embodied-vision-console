const SpatialCanvas = () => {
  // Coordinate system: viewBox maps to a ~6m x 4m space
  // Robot at (0,0) -> SVG (150, 200)
  // chair_A at (3.2, 0.5) -> SVG (470, 160)
  // chair_B at (1.5, -1.0) -> SVG (300, 280)
  // table_A at (1.0, -1.5) -> SVG (250, 320)

  const robot = { x: 150, y: 200 };
  const chairA = { x: 470, y: 150 };
  const chairB = { x: 300, y: 290 };
  const tableA = { x: 250, y: 340 };

  return (
    <div className="h-full rounded bg-card border border-border relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid" />

      {/* Labels */}
      <div className="absolute top-2 left-3 font-mono text-[10px] text-muted-foreground/60">
        SPATIAL CANVAS · 俯视世界地图
      </div>
      <div className="absolute top-2 right-3 font-mono text-[10px] text-muted-foreground/40">
        src=mock · live: SLAM 8006
      </div>

      {/* Scale bar */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
        <div className="w-12 h-px bg-muted-foreground/40" />
        <span className="font-mono text-[9px] text-muted-foreground/50">1.0 m</span>
      </div>

      <svg viewBox="0 0 600 420" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Grid lines */}
        {Array.from({ length: 16 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 40} y1={0} x2={i * 40} y2={420} stroke="hsl(187 100% 50% / 0.04)" strokeWidth={0.5} />
        ))}
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 40} x2={600} y2={i * 40} stroke="hsl(187 100% 50% / 0.04)" strokeWidth={0.5} />
        ))}

        {/* Distance line: robot -> chairB (gray dashed) */}
        <line
          x1={robot.x} y1={robot.y} x2={chairB.x} y2={chairB.y}
          stroke="hsl(215 15% 45% / 0.4)" strokeWidth={1} strokeDasharray="6 4"
        />
        <text x={(robot.x + chairB.x) / 2 - 15} y={(robot.y + chairB.y) / 2 - 6} fill="hsl(215 15% 55%)" fontSize={9} fontFamily="JetBrains Mono">
          1.49m
        </text>

        {/* Distance line: robot -> chairA (green solid) */}
        <line
          x1={robot.x} y1={robot.y} x2={chairA.x} y2={chairA.y}
          stroke="hsl(160 68% 52% / 0.6)" strokeWidth={1.5}
        />
        <text x={(robot.x + chairA.x) / 2 - 10} y={(robot.y + chairA.y) / 2 - 8} fill="hsl(160 68% 52%)" fontSize={9} fontFamily="JetBrains Mono" fontWeight="bold">
          d = 3.24m ← max
        </text>

        {/* Navigation path: blue dashed arc */}
        <path
          d={`M ${robot.x} ${robot.y} Q ${(robot.x + chairA.x) / 2} ${Math.min(robot.y, chairA.y) - 40} ${chairA.x} ${chairA.y}`}
          fill="none" stroke="hsl(220 80% 65% / 0.5)" strokeWidth={1.5} strokeDasharray="8 4"
          markerEnd="url(#arrowBlue)"
        />

        {/* Arrow marker */}
        <defs>
          <marker id="arrowBlue" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(220 80% 65% / 0.7)" />
          </marker>
        </defs>

        {/* Anchor line from left panel */}
        <line
          x1={0} y1={chairA.y + 20} x2={chairA.x} y2={chairA.y}
          stroke="hsl(160 68% 52% / 0.15)" strokeWidth={1} strokeDasharray="4 6"
        />

        {/* Robot icon */}
        <circle cx={robot.x} cy={robot.y} r={10} fill="none" stroke="hsl(0 0% 90%)" strokeWidth={1.5} />
        <circle cx={robot.x} cy={robot.y} r={3} fill="hsl(0 0% 90%)" />
        <text x={robot.x + 16} y={robot.y + 4} fill="hsl(0 0% 70%)" fontSize={9} fontFamily="JetBrains Mono">
          robot (0,0)
        </text>

        {/* chair_A (selected - green) */}
        <rect x={chairA.x - 6} y={chairA.y - 6} width={12} height={12} fill="hsl(160 68% 52%)" rx={2} />
        <text x={chairA.x + 14} y={chairA.y + 4} fill="hsl(160 68% 52%)" fontSize={10} fontFamily="JetBrains Mono" fontWeight="bold">
          chair_A ✓ 3.24m
        </text>

        {/* chair_B (unselected - gray) */}
        <rect x={chairB.x - 5} y={chairB.y - 5} width={10} height={10} fill="hsl(215 15% 45%)" rx={2} />
        <text x={chairB.x + 12} y={chairB.y + 4} fill="hsl(215 15% 50%)" fontSize={9} fontFamily="JetBrains Mono">
          chair_B · 1.49m
        </text>

        {/* table_A (orange) */}
        <rect x={tableA.x - 8} y={tableA.y - 5} width={16} height={10} fill="hsl(30 80% 55%)" rx={1} />
        <text x={tableA.x + 14} y={tableA.y + 4} fill="hsl(30 70% 55%)" fontSize={9} fontFamily="JetBrains Mono">
          table_A
        </text>
      </svg>
    </div>
  );
};

export default SpatialCanvas;
