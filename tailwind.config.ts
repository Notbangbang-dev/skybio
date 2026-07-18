import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        // The bio's live theme is driven by CSS variables the admin controls.
        bg: "var(--bg-color)",
        ink: "var(--text-color)",
        accent: "var(--accent)",
        accent2: "var(--accent-2)",
        // Admin console chrome (fixed dark theme, independent of the bio theme).
        panel: "hsl(240 10% 8%)",
        "panel-2": "hsl(240 10% 12%)",
        line: "hsl(240 8% 20%)",
        muted: "hsl(240 5% 64%)",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 6px)",
        sm: "calc(var(--radius) - 12px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
