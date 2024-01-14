import type { AstroConfig } from "astro";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import serveStatic from "serve-static";
import loadConfig from "tailwindcss/loadConfig.js";
import { joinURL } from "ufo";
import type { ViteDevServer } from "vite";

export const setupViewer = async ({
  server,
  root,
  viewerPrefix,
  configFile,
  viewerDistPath,
}: {
  server: ViteDevServer;
  root: AstroConfig["root"];
  viewerPrefix: string;
  configFile: string;
  viewerDistPath: string;
}) => {
  const resolveConfig = (await import(
    // @ts-ignore
    "tailwind-config-viewer/lib/tailwindConfigUtils.js"
  ).then((r) => r.resolveConfig)) as (config: any) => any;

  const tailwindConfig = loadConfig(join(fileURLToPath(root), configFile));

  server.middlewares.use(joinURL(viewerPrefix, "config.json"), (_, res) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(resolveConfig(tailwindConfig)));
  });
  server.middlewares.use(
    viewerPrefix,
    serveStatic(viewerDistPath)
  );
};
