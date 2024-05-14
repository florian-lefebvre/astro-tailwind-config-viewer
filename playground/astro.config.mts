import tailwind from "@astrojs/tailwind";
import { createResolver } from "astro-integration-kit";
import { hmrIntegration } from "astro-integration-kit/dev";
import { defineConfig } from "astro/config";

const { default: tailwindConfigViewer } = await import(
	"astro-tailwind-config-viewer"
);

// https://astro.build/config
export default defineConfig({
	integrations: [
		tailwind(),
		tailwindConfigViewer({
			overlayMode: "embed",
		}),
		hmrIntegration({
			directory: createResolver(import.meta.url).resolve("../package/dist"),
		}),
	],
});
