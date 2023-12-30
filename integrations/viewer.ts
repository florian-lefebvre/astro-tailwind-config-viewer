import type { AstroConfig } from "astro";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import serveStatic from "serve-static";
import loadConfig from "tailwindcss/loadConfig.js";
import { joinURL } from "ufo";
import type { ViteDevServer } from "vite";

export const setupViewer = async ({
  server,
  root,
  viewerPrefix,
}: {
  server: ViteDevServer;
  root: AstroConfig["root"];
  viewerPrefix: string;
}) => {
  const resolveConfig = (await import(
    // @ts-ignore
    "tailwind-config-viewer/lib/tailwindConfigUtils.js"
  ).then((r) => r.resolveConfig)) as (config: any) => any;

  const tailwindConfig = loadConfig(
    join(fileURLToPath(root), "tailwind.config.mjs")
  );

  server.middlewares.use(joinURL(viewerPrefix, "config.json"), (_, res) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(resolveConfig(tailwindConfig)));
  });
  server.middlewares.use(
    viewerPrefix,
    serveStatic(resolve("./node_modules/tailwind-config-viewer/dist"))
  );
};
