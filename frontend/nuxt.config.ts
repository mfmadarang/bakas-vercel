// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",

  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxtjs/color-mode",
    "@pinia/nuxt",
    "@vueuse/nuxt",
  ],

  // Inter font — imported globally via CSS
  css: ["@fontsource/inter/400.css", "@fontsource/inter/500.css", "@fontsource/inter/600.css", "@fontsource/inter/700.css"],

  colorMode: {
    // Use class-based dark mode so Tailwind's `dark:` prefix works
    classSuffix: "",
    preference: "dark",
    fallback: "dark",
  },

  // Vercel deployment preset
  nitro: {
    preset: "vercel",
  },

  // Runtime config lets us read env vars without hardcoding them.
  // Default apiBase is empty so the deployed frontend gracefully shows
  // "backend offline" instead of trying to hit localhost.
  // For local dev, create a .env file with NUXT_PUBLIC_API_BASE=http://localhost:8000
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "",
    },
  },

  app: {
    head: {
      title: "bakas | Browser Fingerprint Analyzer",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: "See how websites silently track you without cookies. bakas reveals your browser fingerprint.",
        },
      ],
    },
  },

  devtools: { enabled: false },
});
