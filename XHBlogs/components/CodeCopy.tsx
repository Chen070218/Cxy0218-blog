"use client";

import { useEffect } from "react";

/**
 * Adds a "Copy" button to every code block inside an article.
 * The Markdown HTML is rendered on the server, so this only enhances it on the
 * client: the article still reads and copies fine without JavaScript.
 */
export default function CodeCopy({ rootId = "article-content" }: { rootId?: string }) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;

    const cleanups: Array<() => void> = [];
    const blocks = Array.from(root.querySelectorAll<HTMLPreElement>("pre"));

    for (const pre of blocks) {
      if (pre.dataset.copyReady === "true") continue;
      pre.dataset.copyReady = "true";

      const wrapper = document.createElement("div");
      wrapper.className = "code-block-wrap";
      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      const button = document.createElement("button");
      button.type = "button";
      button.className = "code-copy";
      button.textContent = "Copy";
      button.setAttribute("aria-label", "Copy code block");

      let resetTimer: number | undefined;
      const onClick = async () => {
        const text = pre.innerText;
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          // Clipboard API can be unavailable on insecure origins: fall back to a textarea.
          const area = document.createElement("textarea");
          area.value = text;
          area.style.position = "fixed";
          area.style.opacity = "0";
          document.body.appendChild(area);
          area.select();
          document.execCommand("copy");
          area.remove();
        }
        button.textContent = "Copied";
        window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(() => {
          button.textContent = "Copy";
        }, 1600);
      };

      button.addEventListener("click", onClick);
      wrapper.appendChild(button);
      cleanups.push(() => {
        window.clearTimeout(resetTimer);
        button.removeEventListener("click", onClick);
      });
    }

    return () => cleanups.forEach((fn) => fn());
  }, [rootId]);

  return null;
}
