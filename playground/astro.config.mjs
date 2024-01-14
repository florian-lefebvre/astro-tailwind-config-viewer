import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import { astroTailwindConfigViewer } from "./integrations/astro-tailwind-config-viewer";

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    astroTailwindConfigViewer({
      viewer: true,
    }),
  ],
});
