/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./components/**/*.{vue,js,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./composables/**/*.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        // Custom colors from the design spec
        surface: {
          DEFAULT: "#ffffff",
          dark: "#111111",
          "dark-alt": "#1a1a1a",
        },
        accent: {
          DEFAULT: "#4f46e5",
          dark: "#6366f1",
        },
        safe: {
          DEFAULT: "#16a34a",
          dark: "#22c55e",
        },
        warning: {
          DEFAULT: "#d97706",
          dark: "#f59e0b",
        },
        danger: {
          DEFAULT: "#dc2626",
          dark: "#ef4444",
        },
      },
      // Background colors for light/dark modes
      backgroundColor: {
        page: {
          DEFAULT: "#f9f9fb",
          dark: "#0a0a0a",
        },
      },
    },
  },
  plugins: [],
};
