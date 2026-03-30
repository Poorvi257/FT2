import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Geist Sans", "system-ui", "sans-serif"],
        display: ["Inter", "Geist Sans", "system-ui", "sans-serif"],
        mono: ["SFMono-Regular", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "monospace"]
      },
      colors: {
        "bg-deep": "#020203",
        "bg-base": "#050506",
        "bg-elevated": "#0a0a0c",
        surface: "rgba(255,255,255,0.05)",
        "surface-hover": "rgba(255,255,255,0.08)",
        fg: "#EDEDEF",
        "fg-muted": "#8A8F98",
        "fg-subtle": "rgba(255,255,255,0.60)",
        accent: "#5E6AD2",
        "accent-bright": "#6872D9",
        "accent-glow": "rgba(94,106,210,0.3)",
        "border-default": "rgba(255,255,255,0.06)",
        "border-hover": "rgba(255,255,255,0.10)",
        "border-accent": "rgba(94,106,210,0.30)"
      },
      boxShadow: {
        panel: "0 0 0 1px rgba(255,255,255,0.06), 0 2px 20px rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.2)",
        "panel-hover": "0 0 0 1px rgba(255,255,255,0.10), 0 8px 40px rgba(0,0,0,0.5), 0 0 80px rgba(94,106,210,0.1)",
        accent: "0 0 0 1px rgba(94,106,210,0.5), 0 4px 12px rgba(94,106,210,0.3), inset 0 1px 0 0 rgba(255,255,255,0.2)",
        soft: "inset 0 1px 0 0 rgba(255,255,255,0.08)"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-20px) rotate(1deg)" }
        }
      },
      animation: {
        float: "float 10s ease-in-out infinite"
      }
    }
  },
  plugins: [forms]
};
