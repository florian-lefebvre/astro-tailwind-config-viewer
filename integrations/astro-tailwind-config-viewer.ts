import type { AstroConfig, AstroIntegration } from "astro";
import { fileURLToPath } from "node:url";
import { joinURL } from "ufo";
import { setupViewer } from "./viewer";
import { virtualImportsPlugin } from "./virtual-imports";

export type Options = {
  endpoint: string;
};

export const astroTailwindConfigViewer = ({
  endpoint = "/_tailwind",
}: Partial<Options> = {}): AstroIntegration => {
  const options = { endpoint };

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
        addDevToolbarApp("./integrations/plugin.ts");

        config = _config;

        viewerPrefix = joinURL(config.base, options.endpoint);

        updateConfig({
          vite: {
            plugins: [virtualImportsPlugin({ viewerLink: viewerPrefix })],
          },
        });
      },
      "astro:server:setup": async ({ server }) => {
        await setupViewer({ server, root: config.root, viewerPrefix });
      },
    },
  };
};
