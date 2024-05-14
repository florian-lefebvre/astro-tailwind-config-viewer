import {
	overlayMode,
	viewerLink,
} from "virtual:astro-tailwind-config-viewer/internal";
import { defineToolbarApp } from "astro/toolbar";

export default defineToolbarApp({
	init(canvas, app) {
		if (overlayMode === "embed") {
			const appWindow = document.createElement("astro-dev-toolbar-window");
			appWindow.style.width = "95%";
			appWindow.style.height = "80vh";

			const link = document.createElement("a");
			link.href = viewerLink;
			link.target = "_blank";
			link.innerText = "Open as page";
			Object.assign(link.style, {
				display: "inline-block",
				marginRight: "auto",
				color: "rgba(224, 204, 250, 1)",
				marginBottom: "16px",
			} satisfies Partial<typeof link.style>);
			appWindow.appendChild(link);

			const viewerIframe = document.createElement("iframe");
			viewerIframe.src = viewerLink;
			Object.assign(viewerIframe.style, {
				height: "100%",
				border: "1px solid rgba(27, 30, 36, 1)",
			} satisfies Partial<typeof viewerIframe.style>);
			appWindow.appendChild(viewerIframe);

			canvas.appendChild(appWindow);
		} else if (overlayMode === "redirect") {
			app.onToggled((options) => {
				if (!options.state) {
					return;
				}

				window.open(viewerLink, "_blank")?.focus();
				app.toggleState({ state: false });
			});
		}
	},
});
