# `astro-tailwind-config-viewer`

This is an [Astro integration](https://docs.astro.build/en/guides/integrations-guide/) that injects a route and a Dev Toolbar App in development for [`tailwind-config-viewer`](https://github.com/rogden/tailwind-config-viewer).

## Usage

### Prerequisites

Although `@astrojs/tailwind` is not technically required, I don't see why you'd use this integration with it. Make sure that `astroTailwindConfigViewer` is called after `@astrojs/tailwind`:

```ts
export default defineConfig({
  integrations: [tailwind(), astroTailwindConfigViewer()],
});
```

This integration only works with Astro 4 and above, and requires at least `tailwindcss` 3.0.

### Installation

Install the integration **automatically** using the Astro CLI:

```bash
pnpm astro add astro-dev-plugin-reboot
```

```bash
npm astro add astro-dev-plugin-reboot
```

```bash
yarn astro add astro-dev-plugin-reboot
```

Or install it **manually**:

1. Install the required dependencies

```bash
pnpm add @astrojs/tailwind tailwindcss@^3.0.0
```

```bash
npm install @astrojs/tailwind tailwindcss@^3.0.0
```

```bash
yarn add @astrojs/tailwind tailwindcss@^3.0.0
```

2. Add the integration to your astro config

```diff
+import astroTailwindConfigViewer from "astro-tailwind-config-viewer";

export default defineConfig({
  integrations: [
    tailwind(),
+    astroTailwindConfigViewer(),
  ],
});
```

### Configuration

Here is the TypeScript type:

```ts
export type Options = {
  configFile: string;
  endpoint: string;
  overlayMode: "embed" | "redirect";
};
```

#### `configFile`

**This option is really important.** The value needs to be the same as `@astrojs/tailwind` [`configFile option`](https://docs.astro.build/en/guides/integrations-guide/tailwind/#configfile).

> **Why do I need to duplicate this option?**
>
> This is a current limitation of Astro. An integration cannot access options or data from another integration. However, there is a proposal for it on the Astro roadmap: upvote it! [Link to proposal](https://github.com/withastro/roadmap/discussions/814)

#### `endpoint`

By default, the config viewer is injected at `/_tailwind`. Setting this option will allow you to change it.

#### `overlayMode`

The Dev Toolbar App has 2 modes:

1. `redirect` (default): clicking on the app icon will open the viewer in a new tab
2. `embed`: clicking the app icon will show a panel with an embedded viewer. Note that the viewer is still accessible at the `endpoint`.

## Contributing

This package is structured as a monorepo:

- `playground` contains code for testing the package
- `package` contains the actual package

Install dependencies using pnpm: 

```bash
pnpm i --frozen-lockfile
```

Start the playground:

```bash
pnpm playground:dev
```

You can now edit files in `package`. Please note that making changes to those files may require restarting the playground dev server.

## Licensing

[MIT Licensed](https://github.com/florian-lefebvre/astro-tailwind-config-viewer/blob/main/LICENSE). Made with ❤️ by [Florian Lefebvre](https://github.com/florian-lefebvre).

## Acknowledgements

- [Tailwind config viewer](https://github.com/rogden/tailwind-config-viewer)
- [Nuxt Tailwind module](https://github.com/nuxt-modules/tailwindcss)
