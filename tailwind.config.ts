import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        mist: "#f8fafc",
        pulse: "#ffffff",
        pulseSoft: "#f3f4f6",
        ocean: "#0f766e",
        stone: "#475569",
      },
      boxShadow: {
        panel: "0 16px 40px rgba(15, 23, 42, 0.08)",
      },
      backgroundImage: {
        grid: "linear-gradient(180deg, #111111 0%, #050505 55%, #000000 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
