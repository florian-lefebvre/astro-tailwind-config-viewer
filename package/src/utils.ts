import type { AstroIntegration } from "astro";
import { readdir, stat } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const getFilesRecursively = async (dir: string, baseDir = dir) => {
  const files = await readdir(dir);
  let filepaths: Array<string> = [];

  for (const file of files) {
    const filepath = join(dir, file);
    const _stat = await stat(filepath);

    if (_stat.isDirectory()) {
      // Recursively get files from subdirectories
      const subDirectoryFiles = await getFilesRecursively(filepath, baseDir);
      filepaths = filepaths.concat(subDirectoryFiles);
    } else {
      // Calculate relative path and add it to the array
      const relativePath = relative(baseDir, filepath);
      filepaths.push(relativePath);
    }
  }

  return filepaths;
};

type HookParameters<
  Hook extends keyof AstroIntegration["hooks"],
  Fn = AstroIntegration["hooks"][Hook]
> = Fn extends (...args: any) => any ? Parameters<Fn>[0] : never;

export const formatAddress = ({
  address,
  family,
  port,
}: HookParameters<"astro:server:start">["address"]): string => {
  if (family === "IPv6") {
    if (address === "::" || address === "::1") {
      return `http://localhost:${port}/`;
    } else {
      return `http://[${address}]:${port}/`;
    }
  } else {
    return `http://${address}:${port}/`;
  }
};

export const devHMR = async ({
  dir,
  addWatchFile,
  command,
}: {
  dir: string;
  addWatchFile: HookParameters<"astro:config:setup">["addWatchFile"];
  command: HookParameters<"astro:config:setup">["command"];
}) => {
  if (command !== "dev") {
    return;
  }
  const paths = await getFilesRecursively(dir);
  for (const path of paths) {
    addWatchFile(resolve(dir, path));
  }
};

export const createResolver = (base: string) => {
  if (base.startsWith("file://")) {
    base = dirname(fileURLToPath(base));
  }

  return {
    resolve: (...path: Array<string>) => resolve(base, ...path),
  };
};
