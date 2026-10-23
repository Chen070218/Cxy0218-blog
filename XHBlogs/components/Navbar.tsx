"use client";

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { siteConfig } from '../siteConfig';

type NavChild = { label: string; href: string; hint: string };
type NavItem = { label: string; href?: string; children?: NavChild[] };

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Projects",
    children: [
      { label: "Projects", href: "/projects", hint: "Things I have built" },
      { label: "Creative Workshop", href: "/tree", hint: "Small 3D experiments" },
    ],
  },
  {
    label: "Writing",
    children: [
      { label: "Posts", href: "/posts", hint: "Longer write-ups" },
      { label: "Musings", href: "/chatter", hint: "Shorter, looser notes" },
      { label: "Timeline", href: "/timeline", hint: "Everything, by date" },
      { label: "Local Drafts", href: "/local-posts", hint: "Saved in this browser" },
    ],
  },
  {
    label: "Study",
    children: [
      { label: "Courses", href: "/courses", hint: "This semester's timetable" },
      { label: "Resources", href: "/resources", hint: "Links I keep coming back to" },
    ],
  },
  {
    label: "Life",
    children: [
      { label: "Photo Wall", href: "/photowall", hint: "Screenshots and photos" },
      { label: "Moments", href: "/moments", hint: "Short diary entries" },
      { label: "Music", href: "/music", hint: "What I listen to while coding" },
      { label: "Check-in", href: "/checkin", hint: "Where the hours went" },
    ],
  },
  {
    label: "About",
    children: [
      { label: "About Me", href: "/about", hint: "Who I am" },
      { label: "Build Log", href: "/build-log", hint: "How this site was made" },
      { label: "Friends", href: "/friends", hint: "Sites I read" },
    ],
  },
];

function normalize(path: string) {
  const clean = path.split("?")[0].split("#")[0].replace(/\/+$/, "");
  return clean === "" ? "/" : clean;
}

function isActive(pathname: string, href: string) {
  const current = normalize(pathname);
  const target = normalize(href);
  if (target === "/") return current === "/";
  return current === target || current.startsWith(target + "/");
}

function itemIsActive(pathname: string, item: NavItem) {
  if (item.href) return isActive(pathname, item.href);
  return (item.children ?? []).some((child) => isActive(pathname, child.href));
}

export default function Navbar() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const desktopNavRef = useRef<HTMLElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<number | null>(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  // Opening a menu cancels any pending close, so moving the pointer between
  // items feels immediate instead of fighting a timeout.
  const openDropdown = (label: string) => {
    clearCloseTimer();
    setOpenMenu(label);
  };

  // Small grace period when leaving: enough to cross the gap into the panel,
  // short enough that the menu does not linger.
  const scheduleClose = (label: string) => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setOpenMenu((current) => (current === label ? null : current));
    }, 140);
  };

  useEffect(() => () => clearCloseTimer(), []);

  // Any navigation closes both menus.
  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [pathname]);

  // Desktop dropdowns: close on outside click and on Escape.
  useEffect(() => {
    if (!openMenu) return;
    const onPointerDown = (event: PointerEvent) => {
      if (desktopNavRef.current && !desktopNavRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenMenu(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openMenu]);

  // Mobile drawer: lock scrolling, trap focus, close on Escape, restore focus.
  useEffect(() => {
    if (!mobileOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 40);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
      ).filter((element) => element.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      if (previouslyFocused && typeof previouslyFocused.focus === "function") {
        previouslyFocused.focus();
      }
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/20 bg-white/60 backdrop-blur-xl shadow-sm dark:border-white/5 dark:bg-slate-900/60">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[80] focus:rounded-full focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
        >
          Skip to content
        </a>

        <div className="mx-auto flex h-16 w-[94%] max-w-6xl items-center justify-between gap-4">
          <Link href="/" className="group flex flex-col leading-none">
            <span className="text-lg font-black tracking-tight text-slate-800 transition-colors duration-300 group-hover:text-indigo-600 sm:text-xl dark:text-white dark:group-hover:text-indigo-400">
              {siteConfig.authorName}
            </span>
            <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 sm:text-[10px]">
              {siteConfig.handle} · CS 2025
            </span>
          </Link>

          <nav ref={desktopNavRef} aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const active = itemIsActive(pathname, item);
                if (!item.children) {
                  return (
                    <li key={item.label}>
                      <Link
                        href={item.href as string}
                        aria-current={active ? "page" : undefined}
                        className={`rounded-full px-3 py-2 text-sm font-bold transition-colors ${
                          active
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-slate-700 hover:text-indigo-600 dark:text-slate-200 dark:hover:text-indigo-400"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                }

                const expanded = openMenu === item.label;
                const panelId = `nav-panel-${item.label.toLowerCase().replace(/[^a-z]+/g, "-")}`;
                return (
                  <li
                    key={item.label}
                    className="relative"
                    onPointerEnter={(event) => {
                      // Open on hover for mice and pens; touch devices have no hover, they tap.
                      if (event.pointerType !== "touch") openDropdown(item.label);
                    }}
                    onMouseLeave={() => {
                      const containsFocus =
                        desktopNavRef.current && desktopNavRef.current.contains(document.activeElement);
                      if (!containsFocus) scheduleClose(item.label);
                    }}
                    onBlur={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                        setOpenMenu(null);
                      }
                    }}
                  >
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-haspopup="true"
                      aria-controls={panelId}
                      // A click opens the menu instead of toggling it: with hover already
                      // opening it, a toggle would slam it shut just as the user clicks.
                      onClick={() => openDropdown(item.label)}
                      className={`flex items-center gap-1 rounded-full px-3 py-2 text-sm font-bold transition-colors ${
                        active || expanded
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-slate-700 hover:text-indigo-600 dark:text-slate-200 dark:hover:text-indigo-400"
                      }`}
                    >
                      {item.label}
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={`h-3 w-3 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                      >
                        <path d="M5 7l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>

                    {/* Invisible bridge over the gap so the pointer can travel from the
                        label to the panel without the menu closing on the way. */}
                    <span aria-hidden="true" className="absolute inset-x-0 top-full h-2" />

                    <div
                      id={panelId}
                      hidden={!expanded}
                      className="absolute left-0 top-full mt-2 w-64 rounded-2xl border border-white/60 bg-white/95 p-2 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95"
                    >
                      <ul>
                        {(item.children ?? []).map((child) => {
                          const childActive = isActive(pathname, child.href);
                          return (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                aria-current={childActive ? "page" : undefined}
                                className={`block rounded-xl px-3 py-2 transition-colors ${
                                  childActive
                                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                                    : "text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-white/5"
                                }`}
                              >
                                <span className="block text-sm font-bold">{child.label}</span>
                                <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                                  {child.hint}
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ul>
          </nav>

          <button
            ref={mobileTriggerRef}
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/50 bg-white/70 text-slate-800 shadow-md transition-colors hover:bg-white md:hidden dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100"
          >
            <span className="sr-only">Open navigation menu</span>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-[70] md:hidden">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-navigation"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col overflow-y-auto bg-white p-6 shadow-2xl dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <span className="flex flex-col leading-none">
                <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                  {siteConfig.authorName}
                </span>
                <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  {siteConfig.handle} · CS 2025
                </span>
              </span>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <span className="sr-only">Close navigation menu</span>
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <nav aria-label="Mobile" className="mt-6">
              <ul className="space-y-6">
                {NAV_ITEMS.map((item) => {
                  if (!item.children) {
                    const active = isActive(pathname, item.href as string);
                    return (
                      <li key={item.label}>
                        <Link
                          href={item.href as string}
                          aria-current={active ? "page" : undefined}
                          onClick={() => setMobileOpen(false)}
                          className={`block rounded-xl px-3 py-2 text-base font-bold ${
                            active
                              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                              : "text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-white/5"
                          }`}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  }
                  return (
                    <li key={item.label}>
                      <p className="px-3 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                        {item.label}
                      </p>
                      <ul className="mt-1 space-y-0.5">
                        {(item.children ?? []).map((child) => {
                          const active = isActive(pathname, child.href);
                          return (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                aria-current={active ? "page" : undefined}
                                onClick={() => setMobileOpen(false)}
                                className={`block rounded-xl px-3 py-2 text-base font-semibold ${
                                  active
                                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                                    : "text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-white/5"
                                }`}
                              >
                                {child.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
