// Single-screen layout for the exhibition hall display (1920x1080).
// No mode switching, no timeline-driven visibility — every zone runs at once.

import ThoughtStream from "@/components/ThoughtStream";
import RGBVideo from "@/components/RGBVideo";
import DepthVideo from "@/components/DepthVideo";
import WorldModel3D from "@/components/WorldModel3D";

const Index = () => {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#0A0E1A] text-[#00E5FF] font-mono">
      {/* ---------- TopBar ---------- */}
      <header className="h-16 shrink-0 border-b border-[#00E5FF]/30 flex items-center justify-between px-8">
        <div className="text-xl tracking-widest">
          EMBODIED VISION CONSOLE
        </div>
        <div className="text-sm opacity-80">
          CMD: &gt; walk to the farthest chair, then return to the table behind the start point
        </div>
      </header>

      {/* ---------- Main grid ---------- */}
      <main className="flex-1 min-h-0 grid grid-cols-12 gap-3 p-3">
        {/* Left column · ThoughtStream (≈1/3) */}
        <section className="col-span-4 min-h-0 overflow-hidden rounded-md border border-[#00E5FF]/40 bg-[#0F1524]">
          <ThoughtStream />
        </section>

        {/* Right column (≈2/3) */}
        <section className="col-span-8 min-h-0 grid grid-rows-5 gap-3">
          {/* RGB video — top, larger */}
          <div className="row-span-3 min-h-0">
            <RGBVideo />
          </div>

          {/* Depth + World Model — bottom, side by side */}
          <div className="row-span-2 grid grid-cols-2 gap-3 min-h-0">
            <DepthVideo />
            <WorldModel3D />
          </div>
        </section>
      </main>

      {/* ---------- BottomBar (optional status strip) ---------- */}
      <footer className="h-8 shrink-0 border-t border-[#00E5FF]/30 flex items-center justify-between px-8 text-xs opacity-70">
        <span>STATUS: MOCK MODE</span>
        <span>1920 × 1080 · EXHIBITION DISPLAY</span>
      </footer>
    </div>
  );
};

export default Index;
