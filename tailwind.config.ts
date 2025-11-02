import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "SF Mono",
          "Monaco",
          "Cascadia Code",
          "Roboto Mono",
          "Consolas",
          "Courier New",
          "monospace",
        ],
      },
      colors: {
        // Apple System Colors
        apple: {
          blue: "#007AFF",
          green: "#34C759",
          indigo: "#5856D6",
          orange: "#FF9500",
          pink: "#FF2D92",
          purple: "#AF52DE",
          red: "#FF3B30",
          teal: "#5AC8FA",
          yellow: "#FFCC00",
        },
        
        // Enhanced gray scale following Apple HIG
        gray: {
          50: "#F2F2F7",
          100: "#E5E5EA",
          200: "#D1D1D6",
          300: "#C7C7CC",
          400: "#AEAEB2",
          500: "#8E8E93",
          600: "#636366",
          700: "#48484A",
          800: "#3A3A3C",
          900: "#2C2C2E",
          950: "#1C1C1E",
        },
        
        // System background colors
        background: {
          primary: "var(--color-background)",
          secondary: "var(--color-background-secondary)",
          tertiary: "var(--color-background-tertiary)",
        },
        
        // Label colors
        label: {
          primary: "var(--color-label)",
          secondary: "var(--color-label-secondary)",
          tertiary: "var(--color-label-tertiary)",
          quaternary: "var(--color-label-quaternary)",
        },
        
        // Separator colors
        separator: {
          default: "var(--color-separator)",
          opaque: "var(--color-separator-opaque)",
        },
        
        // Legacy colors for compatibility
        white: "#ffffff",
        blue: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        "dark-bg": "#101214",
        "dark-secondary": "#1d1f21",
        "dark-tertiary": "#3b3d40",
        "blue-primary": "#007AFF",
        "stroke-dark": "#2d3135",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      
      spacing: {
        "apple-1": "var(--space-1)",
        "apple-2": "var(--space-2)",
        "apple-3": "var(--space-3)",
        "apple-4": "var(--space-4)",
        "apple-5": "var(--space-5)",
        "apple-6": "var(--space-6)",
        "apple-8": "var(--space-8)",
        "apple-10": "var(--space-10)",
        "apple-12": "var(--space-12)",
        "apple-16": "var(--space-16)",
        "apple-20": "var(--space-20)",
      },
      
      borderRadius: {
        "apple-sm": "var(--radius-sm)",
        "apple-md": "var(--radius-md)",
        "apple-lg": "var(--radius-lg)",
        "apple-xl": "var(--radius-xl)",
        "apple-2xl": "var(--radius-2xl)",
        "apple-3xl": "var(--radius-3xl)",
      },
      
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      },
      
      backdropBlur: {
        apple: "20px",
      },
      
      backdropSaturate: {
        apple: "180%",
      },
      
      transitionTimingFunction: {
        "apple-spring": "cubic-bezier(0.16, 1, 0.3, 1)",
        "apple-ease": "cubic-bezier(0.25, 0.1, 0.25, 1)",
      },
      
      transitionDuration: {
        "apple-fast": "150ms",
        "apple-normal": "250ms",
        "apple-slow": "350ms",
      },
      
      boxShadow: {
        "apple-sm": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "apple-md": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        "apple-lg": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        "apple-xl": "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      },
    },
  },
  plugins: [],
} satisfies Config;
