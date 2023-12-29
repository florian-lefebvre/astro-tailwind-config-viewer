import type { AstroConfig, AstroIntegration } from "astro";
import loadConfig from "tailwindcss/loadConfig.js";
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";
import { joinURL } from "ufo";
import serveStatic from "serve-static";

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
      "astro:config:setup": ({ addWatchFile, addDevToolbarApp }) => {
        addWatchFile(fileURLToPath(import.meta.url));
      },
      "astro:config:done": ({ config: _config }) => {
        config = _config;
      },
      "astro:server:setup": async ({ server }) => {
        const resolveConfig = (await import(
          // @ts-ignore
          "tailwind-config-viewer/lib/tailwindConfigUtils.js"
        ).then((r) => r.resolveConfig)) as (config: any) => any;

        const tailwindConfig = loadConfig(
          join(fileURLToPath(config.root), "tailwind.config.mjs")
        );
        const route = joinURL(config.base, opts.endpoint);

        server.middlewares.use(joinURL(route, "config.json"), (_, res) => {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(resolveConfig(tailwindConfig)));
        });
        server.middlewares.use(
          route,
          serveStatic(resolve("./node_modules/tailwind-config-viewer/dist"))
        );
      },
    },
  };
};
