import type { AstroConfig, AstroIntegration } from "astro";
import loadConfig from "tailwindcss/loadConfig.js";
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";
import { joinURL } from "ufo";
import serveStatic from "serve-static";
import type { Plugin as VitePlugin } from "vite";

export type Opts = {
  endpoint: string;
};

export type Extra = { route: string };

function resolveVirtualModuleId<T extends string>(id: T): `\0${T}` {
  return `\0${id}`;
}

const virtualConfig = (opts: Opts, extra: Extra): VitePlugin => {
  const modules: Record<string, string> = {
    "astro:tailwind": `
        export const opts = ${JSON.stringify(opts)};
        export const extra = ${JSON.stringify(extra)};
    `,
  };

  /** Mapping names prefixed with `\0` to their original form. */
  const resolutionMap = Object.fromEntries(
    (Object.keys(modules) as (keyof typeof modules)[]).map((key) => [
      resolveVirtualModuleId(key),
      key,
    ])
  );

  return {
    name: "astro-tailwind-virtual",
    resolveId(id): string | void {
      if (id in modules) return resolveVirtualModuleId(id);
    },
    load(id): string | void {
      const resolution = resolutionMap[id];
      if (resolution) return modules[resolution];
    },
  };
};

export const astroTailwindConfigViewer = ({
  endpoint = "/_tailwind",
}: Partial<Opts> = {}): AstroIntegration => {
  const opts = { endpoint };

  let config: AstroConfig;
  const extra: Extra = {
    route: "",
  };

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

        extra.route = joinURL(config.base, opts.endpoint);

        updateConfig({
          vite: {
            plugins: [virtualConfig(opts, extra)],
          },
        });
      },
      "astro:server:setup": async ({ server }) => {
        const resolveConfig = (await import(
          // @ts-ignore
          "tailwind-config-viewer/lib/tailwindConfigUtils.js"
        ).then((r) => r.resolveConfig)) as (config: any) => any;

        const tailwindConfig = loadConfig(
          join(fileURLToPath(config.root), "tailwind.config.mjs")
        );

        server.middlewares.use(
          joinURL(extra.route, "config.json"),
          (_, res) => {
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(resolveConfig(tailwindConfig)));
          }
        );
        server.middlewares.use(
          extra.route,
          serveStatic(resolve("./node_modules/tailwind-config-viewer/dist"))
        );
      },
    },
  };
};
