import type { HookParameters } from "astro";

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
