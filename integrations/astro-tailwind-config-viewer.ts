import type { AstroConfig, AstroIntegration } from "astro";
import loadConfig from "tailwindcss/loadConfig.js";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { joinURL, withoutTrailingSlash } from "ufo";

export const astroTailwindConfigViewer = ({
  endpoint = "/_tailwind",
}: {
  endpoint?: string;
} = {}): AstroIntegration => {
  const opts = { endpoint };
  let config: AstroConfig;

  return {
    name: "astro-tailwind-config-viewer",
    hooks: {
      "astro:config:setup": ({ addWatchFile }) => {
        addWatchFile(fileURLToPath(import.meta.url));
      },
      "astro:config:done": ({ config: _config }) => {
        config = _config;
      },
      "astro:server:setup": async ({ server }) => {
        const createServer = (await import(
          // @ts-ignore
          "tailwind-config-viewer/server/index.js"
        ).then((r) => r.default || r)) as any;

        const tailwindConfigPath = join(
          fileURLToPath(config.root),
          "tailwind.config.mjs"
        );
        const tailwindConfig = loadConfig(tailwindConfigPath);

        const route = joinURL(config.base, opts.endpoint);

        const viewerMiddleware = createServer({
          tailwindConfigProvider: () => tailwindConfig,
          routerPrefix: route,
        }).asMiddleware();
        server.middlewares.use((req, res, next) => {
          if (!req.url?.startsWith(route)) {
            return next();
          }
          return viewerMiddleware(req, res);
        });
      },
    },
  };
};
