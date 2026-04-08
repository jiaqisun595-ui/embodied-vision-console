interface Props {
  canvasId: string;
  visibleCards: number;
  totalCards: number;
}

const SpatialCanvas = ({ canvasId, visibleCards, totalCards }: Props) => {
  const progress = totalCards > 0 ? visibleCards / totalCards : 1;

  return (
    <div className="h-full rounded bg-card border border-border relative overflow-hidden">
      <div className="absolute inset-0 bg-grid" />

      <div className="absolute top-2 left-3 font-mono text-[10px] text-muted-foreground/60">
        SPATIAL CANVAS · 俯视世界地图
      </div>
      <div className="absolute top-2 right-3 font-mono text-[10px] text-muted-foreground/40">
        src=mock · live: SLAM 8006
      </div>
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
        <div className="w-12 h-px bg-muted-foreground/40" />
        <span className="font-mono text-[9px] text-muted-foreground/50">1.0 m</span>
      </div>

      <svg viewBox="0 0 600 420" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Grid */}
        {Array.from({ length: 16 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 40} y1={0} x2={i * 40} y2={420} stroke="hsl(187 100% 50% / 0.04)" strokeWidth={0.5} />
        ))}
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 40} x2={600} y2={i * 40} stroke="hsl(187 100% 50% / 0.04)" strokeWidth={0.5} />
        ))}

        {canvasId === "cycle1" && <Cycle1Canvas progress={progress} />}
        {canvasId === "cycle2" && <Cycle2Canvas />}
        {canvasId === "cycle3" && <Cycle3Canvas />}
      </svg>
    </div>
  );
};

// Cycle 1: robot scanning, objects appear at card 4
function Cycle1Canvas({ progress }: { progress: number }) {
  const robot = { x: 300, y: 210 };
  const showObjects = progress >= 0.9; // card 4 visible
  const showFov = progress >= 0.5;

  return (
    <>
      {/* FOV sweep */}
      {showFov && (
        <path
          d={`M ${robot.x} ${robot.y} L ${robot.x + 120} ${robot.y - 80} A 140 140 0 0 1 ${robot.x + 120} ${robot.y + 80} Z`}
          fill="hsl(187 100% 50% / 0.05)"
          stroke="hsl(187 100% 50% / 0.15)"
          strokeWidth={0.5}
          className="animate-pulse-glow"
        />
      )}

      {/* Robot */}
      <circle cx={robot.x} cy={robot.y} r={10} fill="none" stroke="hsl(0 0% 90%)" strokeWidth={1.5} />
      <circle cx={robot.x} cy={robot.y} r={3} fill="hsl(0 0% 90%)" />
      <text x={robot.x + 16} y={robot.y + 4} fill="hsl(0 0% 70%)" fontSize={9} fontFamily="JetBrains Mono">robot (0,0)</text>

      {/* Objects appear with card 4 */}
      {showObjects && (
        <g className="animate-card-in">
          {/* chair_A */}
          <rect x={464} y={144} width={12} height={12} fill="hsl(263 90% 66%)" rx={2} />
          <text x={484} y={154} fill="hsl(263 90% 66%)" fontSize={9} fontFamily="JetBrains Mono">chair_A (3.2, 0.5)</text>

          {/* chair_B */}
          <rect x={345} y={284} width={10} height={10} fill="hsl(263 90% 66% / 0.6)" rx={2} />
          <text x={362} y={293} fill="hsl(263 90% 66% / 0.6)" fontSize={9} fontFamily="JetBrains Mono">chair_B (1.1, −1.0)</text>

          {/* table_A */}
          <rect x={292} y={355} width={16} height={10} fill="hsl(30 80% 55%)" rx={1} />
          <text x={314} y={364} fill="hsl(30 70% 55%)" fontSize={9} fontFamily="JetBrains Mono">table_A (0.0, −2.3)</text>

          {/* Anchor lines from left */}
          <line x1={0} y1={350} x2={300} y2={360} stroke="hsl(187 100% 50% / 0.1)" strokeWidth={1} strokeDasharray="4 6" />
        </g>
      )}
    </>
  );
}

// Cycle 2: distance measurement (original design)
function Cycle2Canvas() {
  const robot = { x: 150, y: 200 };
  const chairA = { x: 470, y: 150 };
  const chairB = { x: 300, y: 290 };
  const tableA = { x: 250, y: 340 };

  return (
    <>
      <defs>
        <marker id="arrowBlue" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(220 80% 65% / 0.7)" />
        </marker>
      </defs>

      {/* Distance: robot -> chairB (gray) */}
      <line x1={robot.x} y1={robot.y} x2={chairB.x} y2={chairB.y} stroke="hsl(215 15% 45% / 0.4)" strokeWidth={1} strokeDasharray="6 4" />
      <text x={(robot.x + chairB.x) / 2 - 15} y={(robot.y + chairB.y) / 2 - 6} fill="hsl(215 15% 55%)" fontSize={9} fontFamily="JetBrains Mono">1.49m</text>

      {/* Distance: robot -> chairA (green) */}
      <line x1={robot.x} y1={robot.y} x2={chairA.x} y2={chairA.y} stroke="hsl(160 68% 52% / 0.6)" strokeWidth={1.5} />
      <text x={(robot.x + chairA.x) / 2 - 10} y={(robot.y + chairA.y) / 2 - 8} fill="hsl(160 68% 52%)" fontSize={9} fontFamily="JetBrains Mono" fontWeight="bold">d = 3.24m ← max</text>

      {/* Nav path */}
      <path d={`M ${robot.x} ${robot.y} Q ${(robot.x + chairA.x) / 2} ${Math.min(robot.y, chairA.y) - 40} ${chairA.x} ${chairA.y}`} fill="none" stroke="hsl(220 80% 65% / 0.5)" strokeWidth={1.5} strokeDasharray="8 4" markerEnd="url(#arrowBlue)" />

      {/* Anchor line */}
      <line x1={0} y1={chairA.y + 20} x2={chairA.x} y2={chairA.y} stroke="hsl(160 68% 52% / 0.15)" strokeWidth={1} strokeDasharray="4 6" />

      {/* Robot */}
      <circle cx={robot.x} cy={robot.y} r={10} fill="none" stroke="hsl(0 0% 90%)" strokeWidth={1.5} />
      <circle cx={robot.x} cy={robot.y} r={3} fill="hsl(0 0% 90%)" />
      <text x={robot.x + 16} y={robot.y + 4} fill="hsl(0 0% 70%)" fontSize={9} fontFamily="JetBrains Mono">robot (0,0)</text>

      {/* chair_A (selected) */}
      <rect x={chairA.x - 6} y={chairA.y - 6} width={12} height={12} fill="hsl(160 68% 52%)" rx={2} />
      <text x={chairA.x + 14} y={chairA.y + 4} fill="hsl(160 68% 52%)" fontSize={10} fontFamily="JetBrains Mono" fontWeight="bold">chair_A ✓ 3.24m</text>

      {/* chair_B */}
      <rect x={chairB.x - 5} y={chairB.y - 5} width={10} height={10} fill="hsl(215 15% 45%)" rx={2} />
      <text x={chairB.x + 12} y={chairB.y + 4} fill="hsl(215 15% 50%)" fontSize={9} fontFamily="JetBrains Mono">chair_B · 1.49m</text>

      {/* table_A */}
      <rect x={tableA.x - 8} y={tableA.y - 5} width={16} height={10} fill="hsl(30 80% 55%)" rx={1} />
      <text x={tableA.x + 14} y={tableA.y + 4} fill="hsl(30 70% 55%)" fontSize={9} fontFamily="JetBrains Mono">table_A</text>
    </>
  );
}

// Cycle 3: history recall, pose_0, navigate to table_A
function Cycle3Canvas() {
  const pose0 = { x: 150, y: 200 }; // historic
  const robotNow = { x: 470, y: 150 }; // at chair_A
  const chairA = { x: 480, y: 165 };
  const tableA = { x: 150, y: 365 };

  return (
    <>
      <defs>
        <marker id="arrowOrange" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(30 90% 55%)" />
        </marker>
        <marker id="arrowBlue3" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(220 80% 65% / 0.7)" />
        </marker>
      </defs>

      {/* Traveled path: pose_0 -> robotNow (gray dashed) */}
      <line x1={pose0.x} y1={pose0.y} x2={robotNow.x} y2={robotNow.y} stroke="hsl(0 0% 50% / 0.25)" strokeWidth={1} strokeDasharray="4 4" />
      <text x={(pose0.x + robotNow.x) / 2} y={(pose0.y + robotNow.y) / 2 - 8} fill="hsl(0 0% 45%)" fontSize={8} fontFamily="JetBrains Mono">traveled path</text>

      {/* Semantic arrow: pose_0 -> table_A (orange bold) */}
      <line x1={pose0.x} y1={pose0.y + 15} x2={tableA.x} y2={tableA.y - 10} stroke="hsl(30 90% 55% / 0.7)" strokeWidth={2.5} markerEnd="url(#arrowOrange)" />
      <text x={pose0.x - 30} y={(pose0.y + tableA.y) / 2} fill="hsl(30 80% 55%)" fontSize={8} fontFamily="JetBrains Mono" transform={`rotate(-80, ${pose0.x - 30}, ${(pose0.y + tableA.y) / 2})`}>
        relative_behind(pose_0)
      </text>

      {/* Nav path: robotNow -> table_A (blue dashed arc) */}
      <path d={`M ${robotNow.x} ${robotNow.y} Q ${robotNow.x + 40} ${(robotNow.y + tableA.y) / 2} ${tableA.x} ${tableA.y}`} fill="none" stroke="hsl(220 80% 65% / 0.5)" strokeWidth={1.5} strokeDasharray="8 4" markerEnd="url(#arrowBlue3)" />

      {/* pose_0 (historic - dashed circle) */}
      <circle cx={pose0.x} cy={pose0.y} r={10} fill="none" stroke="hsl(0 0% 60% / 0.4)" strokeWidth={1.5} strokeDasharray="3 3" />
      <circle cx={pose0.x} cy={pose0.y} r={3} fill="hsl(0 0% 60% / 0.4)" />
      <text x={pose0.x + 16} y={pose0.y + 4} fill="hsl(0 0% 55%)" fontSize={9} fontFamily="JetBrains Mono">pose_0 (0,0)</text>
      <text x={pose0.x + 16} y={pose0.y + 16} fill="hsl(0 0% 40%)" fontSize={8} fontFamily="JetBrains Mono">recall</text>

      {/* Robot now (solid) */}
      <circle cx={robotNow.x} cy={robotNow.y} r={10} fill="none" stroke="hsl(0 0% 90%)" strokeWidth={1.5} />
      <circle cx={robotNow.x} cy={robotNow.y} r={3} fill="hsl(0 0% 90%)" />
      <text x={robotNow.x - 80} y={robotNow.y - 16} fill="hsl(0 0% 70%)" fontSize={9} fontFamily="JetBrains Mono">robot now</text>

      {/* chair_A done */}
      <rect x={chairA.x - 6} y={chairA.y - 6} width={12} height={12} fill="none" stroke="hsl(160 68% 52% / 0.5)" strokeWidth={1} strokeDasharray="3 2" rx={2} />
      <text x={chairA.x + 14} y={chairA.y + 4} fill="hsl(160 68% 52% / 0.5)" fontSize={9} fontFamily="JetBrains Mono">✓ done</text>

      {/* table_A (target - yellow highlight) */}
      <rect x={tableA.x - 10} y={tableA.y - 7} width={20} height={14} fill="hsl(45 90% 55% / 0.8)" rx={2} />
      <rect x={tableA.x - 13} y={tableA.y - 10} width={26} height={20} fill="none" stroke="hsl(45 90% 55% / 0.4)" strokeWidth={1} rx={3} className="animate-pulse-glow" />
      <text x={tableA.x + 18} y={tableA.y + 4} fill="hsl(45 90% 55%)" fontSize={10} fontFamily="JetBrains Mono" fontWeight="bold">table_A · TARGET</text>
    </>
  );
}

export default SpatialCanvas;
