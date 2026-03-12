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
        "glass": "0 8px 32px rgba(0, 0, 0, 0.06)",
        "glass-lg": "0 16px 48px rgba(0, 0, 0, 0.08)",
        "premium": "0 20px 60px -12px rgba(0, 0, 0, 0.12)",
        "premium-lg": "0 32px 80px -16px rgba(0, 0, 0, 0.15)",
        "inner-glow": "inset 0 1px 2px rgba(255, 255, 255, 0.5)",
      },
      borderRadius: {
        card: "18px",
        "4xl": "2rem",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;
