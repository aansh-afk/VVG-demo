import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // VVG cooperative palette — deep petrol green + heritage gold.
        brand: {
          50: "#eef6f3",
          100: "#d3e8e0",
          200: "#a7d1c2",
          300: "#70b39c",
          400: "#3f9179",
          500: "#1f7359",
          600: "#155c47",
          700: "#0f4838",
          800: "#0b352a",
          900: "#07231c",
        },
        gold: {
          300: "#e5c877",
          400: "#d4af37",
          500: "#b8941f",
          600: "#96770f",
        },
        ink: "#0d1614",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(13,22,20,.06), 0 8px 24px -12px rgba(13,22,20,.18)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up .4s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
