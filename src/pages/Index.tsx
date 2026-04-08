import { useState, useEffect } from "react";
import TopBar from "@/components/TopBar";
import BottomBar from "@/components/BottomBar";
import ThinkingMode from "@/components/ThinkingMode";
import PerceptionMode from "@/components/PerceptionMode";

type Mode = "thinking" | "perception";

const Index = () => {
  const [mode, setMode] = useState<Mode>("thinking");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "t" || e.key === "T") setMode("thinking");
      if (e.key === "p" || e.key === "P") setMode("perception");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background bg-grid">
      <TopBar mode={mode} onToggle={() => setMode(m => m === "thinking" ? "perception" : "thinking")} />
      <div className="flex-1 min-h-0 relative">
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{ opacity: mode === "thinking" ? 1 : 0, pointerEvents: mode === "thinking" ? "auto" : "none" }}
        >
          <ThinkingMode />
        </div>
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{ opacity: mode === "perception" ? 1 : 0, pointerEvents: mode === "perception" ? "auto" : "none" }}
        >
          <PerceptionMode />
        </div>
      </div>
      <BottomBar />
    </div>
  );
};

export default Index;
