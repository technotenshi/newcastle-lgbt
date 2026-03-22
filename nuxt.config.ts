import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  site: {
    url: "https://newcastle.lgbt",
    name: "Newcastle LGBTQ Voice",
  },
  ssr: true,
  compatibilityDate: "2025-09-18",
  nitro: {
    preset: "static",
    prerender: {
      crawlLinks: true,
      routes: ["/"],
    },
  },
  modules: [
    "@nuxt/content",
    "@nuxt/image",
    "@nuxtjs/sitemap",
    "@nuxtjs/robots",
    "nuxt-og-image",
    "nuxt-schema-org",
    "nuxt-link-checker",
    "nuxt-seo-utils",
  ],
  ogImage: {
    // Disabled until a Satori renderer is configured (nuxt-og-image prompts
    // interactively when no renderer is installed, which breaks non-TTY Docker).
    // OG images are currently set via useSeoMeta({ ogImage }) using IPX URLs.
    enabled: false,
  },
  robots: {
    disallow: [],
  },
  sitemap: {
    zeroRuntime: true,
  },
  image: {
    dir: "assets",
    format: ["webp"],
    quality: 80,
  },
  css: [
    "~/assets/web/assets/mobirise-icons2/mobirise2.css",
    "~/assets/bootstrap/css/bootstrap.min.css",
    "~/assets/bootstrap/css/bootstrap-grid.min.css",
    "~/assets/bootstrap/css/bootstrap-reboot.min.css",
    "~/assets/dropdown/css/style.css",
    "~/assets/socicon/css/styles.css",
    "~/assets/theme/css/style.css",
    "~/assets/mobirise/css/mbr-additional.css",
  ],
  plugins: ["~/plugins/bootstrap.client"],
  app: {
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1, minimum-scale=1",
      meta: [
        {
          name: "description",
          content:
            "Newcastle LGBT amplifies local LGBTQ+ voices, events, and community resources across Newcastle, Washington.",
        },
      ],
      link: [
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "preload",
          as: "style",
          href: "https://fonts.googleapis.com/css?family=Jost:100,200,300,400,500,600,700,800,900,100i,200i,300i,400i,500i,600i,700i,800i,900i&display=swap",
          onload: "this.onload=null;this.rel='stylesheet'",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css?family=Jost:100,200,300,400,500,600,700,800,900,100i,200i,300i,400i,500i,600i,700i,800i,900i&display=swap",
          media: "print",
          onload: "this.media='all'",
        },
      ],
      script: [
        {
          src: "https://scripts.simpleanalyticscdn.com/latest.js",
          async: true,
          defer: true,
          tagPosition: "bodyClose",
        },
      ],
      noscript: [
        {
          innerHTML:
            '<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Jost:100,200,300,400,500,600,700,800,900,100i,200i,300i,400i,500i,600i,700i,800i,900i&display=swap" />',
        },
        {
          innerHTML:
            '<img src="https://queue.simpleanalyticscdn.com/noscript.gif" alt="" referrerpolicy="no-referrer-when-downgrade" />',
          tagPosition: "bodyClose",
        },
      ],
    },
  },
  vite: {
    optimizeDeps: {
      include: ["@unhead/schema-org/vue"],
    },
  },
  devtools: { enabled: false },
});
