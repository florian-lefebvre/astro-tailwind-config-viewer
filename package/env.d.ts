/// <reference types="astro/client" />

declare module "virtual:astro-tailwind-config-viewer/internal" {
	export const viewerLink: string;
	export const overlayMode: Exclude<
		import("./astro-tailwind-config-viewer.js").Options["viewer"],
		boolean
	>["overlayMode"];
}
