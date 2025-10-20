import { cpSync } from "node:fs";
import { defineConfig } from "tsup";
import { peerDependencies } from "./package.json";

export default defineConfig((options) => {
	const dev = !!options.watch;

	return {
		entry: ["src/**/*.(ts|js)"],
		format: ["esm"],
		target: "node18",
		bundle: true,
		dts: true,
		sourcemap: true,
		clean: true,
		splitting: false,
		minify: !dev,
		external: [...Object.keys(peerDependencies)],
		tsconfig: "tsconfig.json",
		async onSuccess() {
			const src = new URL(
				"./node_modules/tailwind-config-viewer/dist/",
				import.meta.url,
			);
			const dest = new URL("./dist/static-assets/", import.meta.url);

			cpSync(src, dest, { recursive: true });
		},
	};
});
