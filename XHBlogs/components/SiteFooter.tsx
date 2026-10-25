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
    <footer className="relative z-10 mt-16 border-t border-white/10 bg-slate-950">
      <div className="mx-auto grid w-[94%] max-w-6xl gap-6 py-8 pb-24 md:grid-cols-[1fr_auto] md:items-end md:pb-10">
        <div>
          <p className="font-display text-2xl uppercase tracking-wide text-slate-100">{siteConfig.authorName}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-300">
            {siteConfig.handle} · Computer Science · 2025 intake
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-300">
          {footerLinks.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="transition-colors hover:text-indigo-200"
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
        <p className="font-mono text-[10px] leading-relaxed text-slate-400 md:col-span-2">
          © {new Date().getFullYear()} {siteConfig.authorName} · Built with Next.js and Tailwind · Static export on Cloudflare Pages and GitHub Pages
        </p>
      </div>
    </footer>
  );
}
