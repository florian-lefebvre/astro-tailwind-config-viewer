import type { AstroConfig, AstroIntegration } from "astro";
import { joinURL } from "ufo";
import { setupViewer } from "./viewer";
import { virtualImportsPlugin } from "./virtual-imports";
import type { Options } from "./types";
import { createResolver, devHMR, formatAddress } from "./utils";

export const astroTailwindConfigViewer = ({
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
        config: _config,
        addWatchFile,
        addDevToolbarApp,
        updateConfig,
        command,
      }) => {
        // TODO: check why not working
        // await devHMR({ dir: resolve(), addWatchFile, command });
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
            "../node_modules/tailwind-config-viewer/dist"
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
