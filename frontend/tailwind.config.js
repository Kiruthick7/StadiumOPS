/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        surface: {
          0: "#0f172a", // slate-900
          1: "#1e293b", // slate-800
          2: "#334155", // slate-700
          3: "#475569", // slate-600
          4: "#64748b", // slate-500
        },
        accent: {
          blue:   "#3b82f6",
          cyan:   "#06b6d4",
          green:  "#10b981", // More emerald/calm green
          amber:  "#f59e0b",
          red:    "#ef4444",
          violet: "#8b5cf6",
        },
        risk: {
          low:      "#10b981", // emerald-500
          medium:   "#f59e0b", // amber-500
          high:     "#f97316", // orange-500
          critical: "#ef4444", // red-500
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "fade-in":    "fadeIn 0.3s ease-out",
        "slide-in":   "slideIn 0.25s ease-out",
      },
      keyframes: {
        fadeIn:  { from: { opacity: "0" },                            to: { opacity: "1" } },
        slideIn: { from: { opacity: "0", transform: "translateY(-6px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};
