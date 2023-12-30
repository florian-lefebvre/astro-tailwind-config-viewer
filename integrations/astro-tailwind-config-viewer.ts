import type { AstroConfig, AstroIntegration } from "astro";
import { fileURLToPath } from "node:url";
import { joinURL } from "ufo";
import { setupViewer } from "./viewer";
import { virtualImportsPlugin } from "./virtual-imports";

export type Options = {
  viewer:
    | {
        endpoint: string;
      }
    | boolean;
};

export const astroTailwindConfigViewer = ({
  viewer = false,
}: Partial<Options> = {}): AstroIntegration => {
  const options = { viewer };
  const viewerOptions: Exclude<Options["viewer"], true> = options.viewer
    ? options.viewer === true
      ? {
          endpoint: "/_tailwind",
        }
      : options.viewer
    : false;

  let config: AstroConfig;
  let viewerPrefix: string;

  return {
    name: "astro-tailwind-config-viewer",
    hooks: {
      "astro:config:setup": ({
        config: _config,
        addWatchFile,
        addDevToolbarApp,
        updateConfig,
      }) => {
        addWatchFile(fileURLToPath(import.meta.url));
        config = _config;

        if (viewerOptions) {
          addDevToolbarApp("./integrations/plugin.ts");
          viewerPrefix = joinURL(config.base, viewerOptions.endpoint);

          updateConfig({
            vite: {
              plugins: [virtualImportsPlugin({ viewerLink: viewerPrefix })],
            },
          });
        }
      },
      "astro:server:setup": async ({ server }) => {
        if (viewerOptions) {
          await setupViewer({ server, root: config.root, viewerPrefix });
        }
      },
    },
  };
};
