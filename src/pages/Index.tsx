// Single-screen layout for the exhibition hall display (1920x1080).
// No mode switching, no timeline-driven visibility — every zone runs at once.

import ThoughtStream from "@/components/ThoughtStream";
import RGBVideo from "@/components/RGBVideo";
import DepthVideo from "@/components/DepthVideo";
import WorldModel3D from "@/components/WorldModel3D";
import Starfield from "@/components/Starfield";

const Index = () => {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden text-[#00E5FF] font-sans">
      <Starfield />
      {/* ---------- TopBar ---------- */}
      <header className="h-16 shrink-0 border-b border-[#00E5FF]/30 flex items-center px-8">
        <div className="text-xl tracking-widest">
          EMBODIED VISION CONSOLE
        </div>
      </header>

      {/* ---------- Main grid ---------- */}
      <main className="flex-1 min-h-0 grid grid-cols-12 gap-3 p-3">
        {/* Left column · ThoughtStream (≈5/12) */}
        <section className="col-span-5 min-h-0 overflow-hidden rounded-md border border-[#00E5FF]/40 bg-[#0F1524]">
          <ThoughtStream />
        </section>

        {/* Right column (≈7/12) */}
        <section className="col-span-7 min-h-0 grid grid-rows-5 gap-3">
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


    </div>
  );
};

export default Index;
