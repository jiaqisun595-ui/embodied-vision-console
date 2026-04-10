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
            transform: "translateX(-12px) translateY(4px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0) translateY(0)",
          },
        },
        // Horizontal scanline that sweeps across a card right after it lands.
        "thought-scan": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "20%": { opacity: "1" },
          "80%": { opacity: "0.6" },
          "100%": { transform: "translateX(300%)", opacity: "0" },
        },
        // Timeline dot ignition flash.
        "thought-dot": {
          "0%": {
            transform: "scale(0)",
            opacity: "0",
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1",
          },
        },
      },
      animation: {
        "thought-in": "thought-in 0.4s ease-out both",
        "thought-scan": "thought-scan 1.2s ease-in-out 0.15s both",
        "thought-dot": "thought-dot 0.35s ease-out both",
      },
    },
  },
  plugins: [],
} satisfies Config;
