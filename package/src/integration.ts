import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { AstroConfig, HookParameters } from "astro";
import {
	addVirtualImports,
	createResolver,
	defineIntegration,
} from "astro-integration-kit";
import { z } from "astro/zod";
import serveStatic from "serve-static";
import loadConfig from "tailwindcss/loadConfig.js";
import { joinURL } from "ufo";

const formatAddress = ({
	address,
	family,
	port,
}: HookParameters<"astro:server:start">["address"]): string => {
	if (family === "IPv6") {
		if (address === "::" || address === "::1") {
			return `http://localhost:${port}/`;
		}
		return `http://[${address}]:${port}/`;
	}
	return `http://${address}:${port}/`;
};

export const integration = defineIntegration({
	name: "astro-tailwind-config-viewer",
	optionsSchema: z
		.object({
			/**
			 * Has to be the same as `@astrojs/tailwind`
			 * [`configFile option`](https://docs.astro.build/en/guides/integrations-guide/tailwind/#configfile).
			 */
			configFile: z.string().default("tailwind.config.mjs"),
			/**
			 * By default, the config viewer is injected at `/_tailwind`.
			 * Setting this option will allow you to change it.
			 */
			endpoint: z.string().default("/_tailwind"),
			/**
			 * The Dev Toolbar App has 2 modes:
			 * 1. `redirect` (default): clicking on the app icon will open the viewer in a new tab
			 * 2. `embed`: clicking the app icon will show a panel with an embedded viewer. Note that the viewer is still accessible at the `endpoint`.
			 */
			overlayMode: z.enum(["embed", "redirect"]).default("redirect"),
		})
		.default({}),
	setup({ options, name }) {
		let config: AstroConfig;
		let viewerPrefix: string;

		const { resolve } = createResolver(import.meta.url);

		return {
			hooks: {
				"astro:config:setup": async (params) => {
					config = params.config;
					viewerPrefix = joinURL(config.base, options.endpoint);

					if (params.command === "dev") {
						params.addDevToolbarApp({
							id: "tailwind",
							name: "Tailwind CSS",
							icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8c1.2-1.6 2.6-2.2 4.2-1.8c.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8c-1.2 1.6-2.6 2.2-4.2 1.8c-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8m-6 7.2c-3.2 0-5.2 1.6-6 4.8c1.2-1.6 2.6-2.2 4.2-1.8c.913.228 1.565.89 2.288 1.624c1.177 1.194 2.538 2.576 5.512 2.576c3.2 0 5.2-1.6 6-4.8c-1.2 1.6-2.6 2.2-4.2 1.8c-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12"/></svg>`,
							entrypoint: resolve("../assets/plugin"),
						});

						addVirtualImports(params, {
							name,
							imports: {
								"virtual:astro-tailwind-config-viewer/internal": `
    			export const viewerLink = ${JSON.stringify(viewerPrefix)};
    			export const overlayMode = ${JSON.stringify(options.overlayMode)};
    		  `,
							},
						});
					}
				},
				"astro:server:setup": async (params) => {
					const resolveConfig = (await import(
						// @ts-ignore
						"tailwind-config-viewer/lib/tailwindConfigUtils.js"
					).then((r) => r.resolveConfig)) as (config: any) => any;

					const tailwindConfig = loadConfig(
						join(fileURLToPath(config.root), options.configFile),
					);

					params.server.middlewares.use(
						joinURL(viewerPrefix, "config.json"),
						(_, res) => {
							res.setHeader("Content-Type", "application/json");
							res.end(JSON.stringify(resolveConfig(tailwindConfig)));
						},
					);
					params.server.middlewares.use(
						viewerPrefix,
						serveStatic(resolve("../node_modules/tailwind-config-viewer/dist")),
					);
				},
				"astro:server:start": ({ address, logger }) => {
					const url = joinURL(formatAddress(address), viewerPrefix);

					logger.info(`Tailwind config viewer is available at ${url}`);
				},
			},
		};
	},
});
