import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
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
        display: [
          "Space Grotesk",
          "Inter",
          "-apple-system",
          "PingFang SC",
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
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        brain: {
          DEFAULT: "hsl(var(--brain))",
          bg: "hsl(var(--brain-bg))",
        },
        world: {
          DEFAULT: "hsl(var(--world))",
          bg: "hsl(var(--world-bg))",
        },
        act: {
          DEFAULT: "hsl(var(--act))",
          bg: "hsl(var(--act-bg))",
        },
        success: "hsl(var(--success))",
        cyan: "hsl(var(--neon-cyan))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // ThoughtStream — main card slide-in.
        // Starts off-screen left, skewed and blurred, then snaps into place
        // with a cyan glow pulse. Uses a custom cubic-bezier for a "whip"
        // feeling (overshoot + settle).
        "thought-in": {
          "0%": {
            opacity: "0",
            transform: "translateX(-40px) translateY(6px) skewX(-8deg) scale(0.96)",
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
        // ThoughtStream — horizontal scanline that sweeps across the card
        // immediately after it lands, like a HUD is "reading" it.
        "thought-scan": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "15%": { opacity: "1" },
          "85%": { opacity: "1" },
          "100%": { transform: "translateX(100%)", opacity: "0" },
        },
        // ThoughtStream — timeline dot ignition flash.
        "thought-dot": {
          "0%": { transform: "scale(0)", boxShadow: "0 0 0 0 rgba(0,229,255,0.9)" },
          "60%": { transform: "scale(1.6)", boxShadow: "0 0 0 10px rgba(0,229,255,0)" },
          "100%": { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(0,229,255,0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "thought-in": "thought-in 0.65s cubic-bezier(0.22, 1.2, 0.36, 1) both",
        "thought-scan": "thought-scan 0.9s ease-out 0.2s both",
        "thought-dot": "thought-dot 0.7s ease-out both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
