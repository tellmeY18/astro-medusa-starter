import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  adapter: cloudflare({ imageService: "compile" }),
  integrations: [react()],
  server: { port: 8000, host: true },
  vite: {
    resolve: { dedupe: ["react", "react-dom"] },
    plugins: [tailwindcss()],
  },
  image: {
    domains: ["placehold.co"],
  },
});
