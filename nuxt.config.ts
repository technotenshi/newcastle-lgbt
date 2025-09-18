import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  ssr: true,
  compatibilityDate: "2025-09-18",
  nitro: {
    preset: "static",
  },
  devtools: { enabled: false },
});
