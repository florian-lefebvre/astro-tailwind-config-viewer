import type { Plugin } from "vite";

function resolveVirtualModuleId<T extends string>(id: T): `\0${T}` {
  return `\0${id}`;
}

export const virtualImportsPlugin = ({
  viewerLink,
}: {
  viewerLink: string;
}): Plugin => {
  const modules: Record<string, string> = {
    "virtual:@astrojs/tailwind/dev-overlay": `export const viewerLink = ${JSON.stringify(
      viewerLink
    )};`,
  };

  /** Mapping names prefixed with `\0` to their original form. */
  const resolutionMap = Object.fromEntries(
    (Object.keys(modules) as (keyof typeof modules)[]).map((key) => [
      resolveVirtualModuleId(key),
      key,
    ])
  );

  return {
    name: "@astrojs/tailwind/virtual-dev-overlay",
    resolveId(id): string | void {
      if (id in modules) return resolveVirtualModuleId(id);
    },
    load(id): string | void {
      const resolution = resolutionMap[id];
      if (resolution) return modules[resolution];
    },
  };
};
