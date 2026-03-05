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
        primary: {
          DEFAULT: "#c41e3a",
          dark: "#a01830",
          light: "#d4354f",
        },
        secondary: {
          DEFAULT: "#ffc72c",
          dark: "#e6b328",
          light: "#ffd04d",
        },
        accent: {
          DEFAULT: "#aa151b",
          dark: "#8a1116",
        },
        muted: {
          DEFAULT: "#f5f5f5",
          foreground: "#737373",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
