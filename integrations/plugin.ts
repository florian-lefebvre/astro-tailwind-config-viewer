import type { DevToolbarApp } from "astro";
import { viewerLink, overlayMode } from "virtual:@astrojs/tailwind/dev-overlay";

export default {
  id: "tailwind",
  name: "Tailwind CSS",
  icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8c1.2-1.6 2.6-2.2 4.2-1.8c.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8c-1.2 1.6-2.6 2.2-4.2 1.8c-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8m-6 7.2c-3.2 0-5.2 1.6-6 4.8c1.2-1.6 2.6-2.2 4.2-1.8c.913.228 1.565.89 2.288 1.624c1.177 1.194 2.538 2.576 5.512 2.576c3.2 0 5.2-1.6 6-4.8c-1.2 1.6-2.6 2.2-4.2 1.8c-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12"/></svg>`,
  init(canvas, eventTarget) {
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
      eventTarget.addEventListener("app-toggled", (event) => {
        if ((event as CustomEvent).detail.state === true) {
          window.open(viewerLink, "_blank")?.focus();
          eventTarget.dispatchEvent(
            new CustomEvent("toggle-plugin", {
              detail: {
                state: false,
              },
            })
          );
        }
      });
    }
  },
} satisfies DevToolbarApp;
