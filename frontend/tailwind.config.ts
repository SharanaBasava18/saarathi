import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#f7f5ef",
        ink: "#1d2a38",
        accent: "#007c6d",
        coral: "#ea6f4c",
      },
      boxShadow: {
        card: "0 12px 40px -22px rgba(18, 38, 63, 0.35)",
      },
      borderRadius: {
        card: "18px",
      },
    },
  },
  plugins: [],
};

export default config;
