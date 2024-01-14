declare module "virtual:@astrojs/tailwind/dev-overlay" {
  export const viewerLink: string;
  export const overlayMode: Exclude<
    import("./astro-tailwind-config-viewer").Options["viewer"],
    boolean
  >["overlayMode"];
}
