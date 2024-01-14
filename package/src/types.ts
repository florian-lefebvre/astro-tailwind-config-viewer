export type Options = {
  /**
   * Has to be the same as `@astrojs/tailwind`
   * [`configFile option`](https://docs.astro.build/en/guides/integrations-guide/tailwind/#configfile).
   */
  configFile: string;
  /**
   * By default, the config viewer is injected at `/_tailwind`.
   * Setting this option will allow you to change it.
   */
  endpoint: string;
  /**
   * The Dev Toolbar App has 2 modes:
   * 1. `redirect` (default): clicking on the app icon will open the viewer in a new tab
   * 2. `embed`: clicking the app icon will show a panel with an embedded viewer. Note that the viewer is still accessible at the `endpoint`.
   */
  overlayMode: "embed" | "redirect";
};
