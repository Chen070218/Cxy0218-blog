// sitePath.ts
// The site may be served from a subpath (for example a GitHub Pages project site at /Cxy0218-blog/).
// next/image adds the prefix automatically, but a hand-written <img src="/xxx">, url(/xxx) in CSS,
// and the <img src="/xxx"> that Markdown renders do not — so this file handles all of them in one place.

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** Add the deployment prefix to absolute in-site URLs; external URLs, data: and relative URLs are returned as-is */
export function withBasePath(url?: string | null): string {
  if (!url) return '';
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url)) return url;
  if (!url.startsWith('/')) return url;
  if (BASE_PATH && (url === BASE_PATH || url.startsWith(`${BASE_PATH}/`))) return url;
  return `${BASE_PATH}${url}`;
}

/** Add the prefix to every absolute in-site URL in an HTML fragment (used for rendered Markdown) */
export function prefixHtml(html: string): string {
  if (!BASE_PATH) return html;
  return html.replace(
    /(\s(?:src|href|poster)=")(\/[^"/][^"]*)/g,
    (_all, attr: string, url: string) => attr + withBasePath(url),
  );
}
