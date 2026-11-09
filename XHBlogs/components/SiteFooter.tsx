import Link from "next/link";
import { siteConfig } from "../siteConfig";

const footerLinks = [
  { href: "/about/", label: "About" },
  { href: "/posts/", label: "Posts" },
  { href: "/build-log/", label: "Build Log" },
  { href: "/rss.xml", label: "RSS", external: true },
  { href: "https://github.com/Chen070218", label: "GitHub", external: true },
];

export default function SiteFooter() {
  return (
    <footer className="relative z-10 mt-16 border-t border-black/10 bg-[#f6f6fa] dark:border-white/10 dark:bg-[#0b0b10]">
      <div className="mx-auto grid w-[94%] max-w-6xl gap-6 py-8 pb-24 md:grid-cols-[1fr_auto] md:items-end md:pb-10">
        <div>
          <p className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-[#f4f4f7]">{siteConfig.authorName.split(" ")[0]}<span className="text-indigo-600 dark:text-indigo-400">.Desk</span></p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500 dark:text-white/40">
            {siteConfig.handle} · Computer Science · 2025 intake
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-slate-500 dark:text-white/50">
          {footerLinks.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-300"
              >
                {link.label}
              </a>
            ) : (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-indigo-200">
                {link.label}
              </Link>
            ),
          )}
        </nav>
        <p className="text-[11px] leading-relaxed text-slate-500 dark:text-white/35 md:col-span-2">
          © {new Date().getFullYear()} {siteConfig.authorName} · Built with Next.js and Tailwind · Static export on Cloudflare Pages and GitHub Pages
        </p>
      </div>
    </footer>
  );
}
