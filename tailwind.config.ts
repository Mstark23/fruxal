import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // App router (Next.js 14 — files live here)
    "./app/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}",
    "./hooks/**/*.{ts,tsx}",
    // src mirror (some files still here)
    "./src/**/*.{ts,tsx,js,jsx}",
    // pages dir if any
    "./pages/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:       { DEFAULT: "#FAFAF8", warm: "#F5F4F0", section: "#F0EFEB" },
        surface:  { DEFAULT: "#FFFFFF", hover: "#F8F7F5" },
        border:   { DEFAULT: "#E8E6E1", light: "#EEECE8", focus: "#C5C2BB" },
        ink:      { DEFAULT: "#1A1A18", secondary: "#56554F", muted: "#8E8C85", faint: "#B5B3AD" },
        brand:    { DEFAULT: "#1B3A2D", light: "#2A5A44", accent: "#3D7A5E", soft: "rgba(27,58,45,0.06)", softer: "rgba(27,58,45,0.03)" },
        positive: "#2D7A50",
        negative: "#B34040",
        caution:  "#A68B2B",
      },
      fontFamily: {
        serif: ["'Source Serif 4'", "Georgia", "serif"],
        sans:  ["'Instrument Sans'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
        sm:   "8px",
        xs:   "6px",
      },
      fontSize: {
        h1:    ["52px", { lineHeight: "1.1",  letterSpacing: "-0.025em" }],
        h2:    ["42px", { lineHeight: "1.15", letterSpacing: "-0.02em"  }],
        h3:    ["19px", { lineHeight: "1.3",  letterSpacing: "-0.01em"  }],
        body:  ["14px", { lineHeight: "1.6"  }],
        sm:    ["13.5px", { lineHeight: "1.5" }],
        xs:    ["12px", { lineHeight: "1.4"  }],
        label: ["11.5px", { lineHeight: "1.3", letterSpacing: "0.08em" }],
      },
    },
  },
  plugins: [],
};
export default config;
