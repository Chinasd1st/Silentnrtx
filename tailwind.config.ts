import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Space Grotesk"', '"Noto Sans SC"', "sans-serif"],
        body: ['"DM Sans"', '"Noto Sans SC"', "sans-serif"],
      },
      borderRadius: { md3: "24px", "md3-sm": "12px", "md3-pill": "28px" },
      boxShadow: {
        md3: "0 2px 8px rgba(0,0,0,0.08)",
        "md3-hover": "0 8px 30px rgba(0,0,0,0.15)",
        "md3-dark": "0 2px 8px rgba(0,0,0,0.3)",
        "md3-dark-hover": "0 8px 30px rgba(0,0,0,0.5)",
      },
      transitionDuration: { md3: "300ms", "md3-press": "200ms" },
      transitionTimingFunction: { md3: "cubic-bezier(0.2, 0, 0, 1)" },
      backdropBlur: { md3: "20px" },
    },
  },
  plugins: [],
} satisfies Config;
