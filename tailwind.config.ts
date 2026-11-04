import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        phase1: {
          light: "#fff7ed",
          border: "#fb923c",
          DEFAULT: "#ea580c",
          dark: "#9a3412",
        },
        phase2: {
          light: "#eff6ff",
          border: "#60a5fa",
          DEFAULT: "#2563eb",
          dark: "#1e40af",
        },
        phase3: {
          light: "#f0fdf4",
          border: "#4ade80",
          DEFAULT: "#16a34a",
          dark: "#166534",
        },
        phase4: {
          light: "#fefce8",
          border: "#facc15",
          DEFAULT: "#ca8a04",
          dark: "#854d0e",
        },
        phase5: {
          light: "#faf5ff",
          border: "#c084fc",
          DEFAULT: "#9333ea",
          dark: "#6b21a8",
        },
      },
    },
  },
  plugins: [],
};
export default config;

