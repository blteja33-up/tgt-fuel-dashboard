import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tgt: {
          dark: "#1a1a2e",
          navy: "#16213e",
          blue: "#0f3460",
          accent: "#e94560",
          "accent-dark": "#c62a47",
        },
      },
      fontFamily: {
        sans: ["Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
