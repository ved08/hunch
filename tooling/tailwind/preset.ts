import type { Config } from "tailwindcss";

const preset: Config = {
  content: [],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          950: "#082f49",
        },
        yes: {
          DEFAULT: "#22c55e",
          light: "#86efac",
          dark: "#15803d",
        },
        no: {
          DEFAULT: "#ef4444",
          light: "#fca5a5",
          dark: "#b91c1c",
        },
        surface: {
          DEFAULT: "#0f172a",
          secondary: "#1e293b",
          tertiary: "#334155",
        },
        text: {
          primary: "#f8fafc",
          secondary: "#94a3b8",
          muted: "#64748b",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        card: "16px",
      },
    },
  },
  plugins: [],
};

export default preset;
