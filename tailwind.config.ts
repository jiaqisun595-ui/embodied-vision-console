import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // English glyphs render in Space Grotesk / Inter; CJK characters
        // automatically fall through to PingFang / Microsoft YaHei.
        sans: [
          "Space Grotesk",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      keyframes: {
        // ThoughtStream — main card slide-in. Starts off-screen left, skewed
        // and blurred, then snaps into place with a cyan glow pulse.
        "thought-in": {
          "0%": {
            opacity: "0",
            transform:
              "translateX(-40px) translateY(6px) skewX(-8deg) scale(0.96)",
            filter: "blur(6px)",
            boxShadow: "0 0 0 rgba(0,229,255,0)",
          },
          "55%": {
            opacity: "1",
            transform: "translateX(4px) translateY(0) skewX(1deg) scale(1.015)",
            filter: "blur(0)",
            boxShadow: "0 0 24px rgba(0,229,255,0.45)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0) translateY(0) skewX(0) scale(1)",
            filter: "blur(0)",
            boxShadow: "0 0 0 rgba(0,229,255,0)",
          },
        },
        // Horizontal scanline that sweeps across a card right after it lands.
        "thought-scan": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "15%": { opacity: "1" },
          "85%": { opacity: "1" },
          "100%": { transform: "translateX(100%)", opacity: "0" },
        },
        // Timeline dot ignition flash.
        "thought-dot": {
          "0%": {
            transform: "scale(0)",
            boxShadow: "0 0 0 0 rgba(0,229,255,0.9)",
          },
          "60%": {
            transform: "scale(1.6)",
            boxShadow: "0 0 0 10px rgba(0,229,255,0)",
          },
          "100%": {
            transform: "scale(1)",
            boxShadow: "0 0 0 0 rgba(0,229,255,0)",
          },
        },
      },
      animation: {
        "thought-in": "thought-in 0.65s cubic-bezier(0.22, 1.2, 0.36, 1) both",
        "thought-scan": "thought-scan 0.9s ease-out 0.2s both",
        "thought-dot": "thought-dot 0.7s ease-out both",
      },
    },
  },
  plugins: [],
} satisfies Config;
