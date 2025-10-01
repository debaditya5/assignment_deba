import type { Config } from "tailwindcss";

const config: Config = {
  // darkMode removed
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        alpha: {
          500: "#2563eb",
          600: "#1d4ed8",
        },
        beta: {
          500: "#16a34a",
          600: "#15803d",
        },
        gamma: {
          500: "#f59e0b",
          600: "#d97706",
        },
      },
    },
  },
  plugins: [],
};

export default config;


