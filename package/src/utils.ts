import { readdir, stat } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { AstroIntegration } from "astro";

type HookParameters<
	Hook extends keyof AstroIntegration["hooks"],
	Fn = AstroIntegration["hooks"][Hook],
> = Fn extends (...args: any) => any ? Parameters<Fn>[0] : never;

export const formatAddress = ({
	address,
	family,
	port,
}: HookParameters<"astro:server:start">["address"]): string => {
	if (family === "IPv6") {
		if (address === "::" || address === "::1") {
			return `http://localhost:${port}/`;
		}
		return `http://[${address}]:${port}/`;
	}
	return `http://${address}:${port}/`;
};

export const createHMRHandlers = ({ dir }: { dir: string }) => {
	const paths: Array<string> = [];

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

	return {
		"astro:config:setup": async ({
			command,
			updateConfig,
		}: {
			command: HookParameters<"astro:config:setup">["command"];
			updateConfig: HookParameters<"astro:config:setup">["updateConfig"];
		}) => {
			if (command !== "dev") {
				return;
			}
			paths.push(
				...(await getFilesRecursively(dir)).map((p) => resolve(dir, p)),
			);
			updateConfig({
				vite: {
					plugins: [
						{
							name: "rollup-plugin-astro-tailwind-config-viewer",
							buildStart() {
								for (const path of paths) {
									this.addWatchFile(path);
								}
							},
						},
					],
				},
			});
		},
		"astro:server:setup": async ({
			server,
		}: {
			server: HookParameters<"astro:server:setup">["server"];
		}) => {
			const handler = (path: string) => {
				if (paths.includes(path)) {
					server.restart();
				}
			};

			server.watcher.on("add", handler);
			server.watcher.on("unlink", handler);
			server.watcher.on("change", handler);
		},
	};
};

export const createResolver = (_base: string) => {
	let base = _base;
	if (base.startsWith("file://")) {
		base = dirname(fileURLToPath(base));
	}

	return {
		resolve: (...path: Array<string>) => resolve(base, ...path),
	};
};
