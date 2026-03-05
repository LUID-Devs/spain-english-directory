import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        spain: {
          red: "#AA151B",
          yellow: "#F1BF00",
          redLight: "#C41E25",
          yellowLight: "#FFD700",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
