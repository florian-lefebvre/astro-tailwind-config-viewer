import type { AstroConfig, AstroIntegration } from "astro";
import { createResolver, watchIntegration } from "astro-integration-kit";
import { joinURL } from "ufo";
import type { Options } from "./types.js";
import { formatAddress } from "./utils.js";
import { setupViewer } from "./viewer.js";
import { virtualImportsPlugin } from "./virtual-imports.js";

export const integration = ({
	configFile = "tailwind.config.mjs",
	endpoint = "/_tailwind",
	overlayMode = "redirect",
}: Partial<Options> = {}): AstroIntegration => {
	const options = { configFile, endpoint, overlayMode };

	let config: AstroConfig;
	let viewerPrefix: string;

	const { resolve } = createResolver(import.meta.url);

	return {
		name: "astro-tailwind-config-viewer",
		hooks: {
			"astro:config:setup": async ({
				addWatchFile,
				config: _config,
				addDevToolbarApp,
				updateConfig,
				command,
			}) => {
				await watchIntegration({
					addWatchFile,
					command,
					dir: resolve(),
					updateConfig,
				});
				config = _config;

				viewerPrefix = joinURL(config.base, options.endpoint);

				addDevToolbarApp(resolve("./plugin.ts"));

				updateConfig({
					vite: {
						plugins: [
							virtualImportsPlugin({
								viewerLink: viewerPrefix,
								overlayMode: options.overlayMode,
							}),
						],
					},
				});
			},
			"astro:server:setup": async ({ server }) => {
				await setupViewer({
					server,
					root: config.root,
					viewerPrefix,
					configFile: options.configFile,
					viewerDistPath: resolve(
						"../node_modules/tailwind-config-viewer/dist",
					),
				});
			},
			"astro:server:start": ({ address, logger }) => {
				const url = joinURL(formatAddress(address), viewerPrefix);

				logger.info(`Tailwind config viewer is available at ${url}`);
			},
		},
	};
};
