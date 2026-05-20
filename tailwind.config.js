import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./*.html", "./src/**/*.{js,ts}"],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-primary)",
        surface: "var(--bg-surface)",
        "surface-low": "var(--bg-surface-low)",
        "surface-raised": "var(--bg-surface-raised)",
        "surface-high": "var(--bg-surface-high)",
        "surface-container": "var(--bg-surface-container)",
        "surface-container-low": "var(--bg-surface-container-low)",
        "surface-container-lowest": "var(--bg-surface-container-lowest)",
        "surface-bright": "var(--bg-surface-high)",
        "surface-variant": "var(--bg-surface-high)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        "on-surface": "var(--text-primary)",
        "on-surface-variant": "var(--text-muted)",
        outline: "var(--text-muted)",
        "outline-variant": "var(--border-subtle)",
        gold: "var(--accent-gold)",
        "gold-deep": "var(--accent-gold-deep)",
        "on-primary": "#000000",
        primary: "var(--accent-gold)",
        "primary-container": "var(--accent-gold)",
        "hero-primary": "var(--text-primary)",
        "hero-secondary": "var(--text-muted)",
        line: "var(--border-subtle)"
      },
      fontFamily: {
        serif: ["Noto Serif", "Georgia", "serif"],
        sans: ["Manrope", "Inter", "system-ui", "sans-serif"],
        headline: ["Noto Serif", "Georgia", "serif"],
        body: ["Manrope", "Inter", "system-ui", "sans-serif"],
        label: ["Manrope", "Inter", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glow: "0 24px 80px var(--shadow-gold)",
        "deep-soft": "0 28px 100px rgba(0, 0, 0, 0.42)"
      },
      letterSpacing: {
        luxury: "0.18em",
        "luxury-wide": "0.32em"
      }
    }
  },
  plugins: [forms]
};
