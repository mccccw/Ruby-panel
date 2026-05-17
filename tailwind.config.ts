import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ruby: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          900: "#881337"
        },
        surface: {
          0: "#080809",
          1: "#0d0d0f",
          2: "#111114",
          3: "#18181c",
          4: "#1e1e23",
          5: "#26262e"
        }
      },
      fontFamily: {
        sans: ["var(--font-geist)", "Geist", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-geist-mono)", "JetBrains Mono", "ui-monospace", "monospace"]
      },
      boxShadow: {
        ruby: "0 0 36px rgba(225,29,72,0.35)",
        glass: "0 0 0 1px rgba(225,29,72,0.05), 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)"
      },
      keyframes: {
        "ruby-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(225,29,72,0.36)" },
          "50%": { boxShadow: "0 0 0 8px rgba(225,29,72,0)" }
        },
        "float-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        "ruby-pulse": "ruby-pulse 1.8s ease-in-out infinite",
        "float-up": "float-up 0.35s ease-out both"
      }
    }
  },
  plugins: []
};

export default config;
