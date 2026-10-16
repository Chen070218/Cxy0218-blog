// sitePath.ts
// 站点可能挂在子路径上（例如 GitHub Pages 的项目站点 /Cxy0218-blog/）。
// next/image 会自动加前缀，但自己写的 <img src="/xxx">、CSS 里的 url(/xxx)、
// 以及 Markdown 渲染出的 <img src="/xxx"> 都不会，这里统一处理。

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** 给站内绝对地址加上部署前缀；外部地址、data:、相对地址原样返回 */
export function withBasePath(url?: string | null): string {
  if (!url) return '';
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url)) return url;
  if (!url.startsWith('/')) return url;
  if (BASE_PATH && (url === BASE_PATH || url.startsWith(`${BASE_PATH}/`))) return url;
  return `${BASE_PATH}${url}`;
}

/** 把一段 HTML 里所有站内绝对地址加上前缀（Markdown 渲染结果用） */
export function prefixHtml(html: string): string {
  if (!BASE_PATH) return html;
  return html.replace(
    /(\s(?:src|href|poster)=")(\/[^"/][^"]*)/g,
    (_all, attr: string, url: string) => attr + withBasePath(url),
  );
}
