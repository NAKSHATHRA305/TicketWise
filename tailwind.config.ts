import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#161A1D",
        paper: "#F7F6F3",
        line: "#E4E2DC",
        accent: "#2F5D50",
        urgent: "#B3432B",
        warn: "#C08A2E",
        calm: "#3B6E8F",
      },
      fontFamily: {
        display: ["'Newsreader'", "serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
