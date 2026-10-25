import type { Metadata } from "next";
// Self-hosted variable fonts (fontsource packages), no Google Fonts at runtime.
import '@fontsource-variable/manrope/wght.css';
import '@fontsource-variable/space-grotesk/wght.css';
import '@fontsource-variable/jetbrains-mono/wght.css';
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import { MotionConfig } from 'framer-motion';
import EffectsGate from '../components/EffectsGate';
import SiteFooter from '../components/SiteFooter';
import PerfGuard from '../components/PerfGuard';
import DesktopOnly from '../components/DesktopOnly';
import BackgroundEffects from "../components/BackgroundEffects";
import { MusicProvider } from "../components/MusicProvider";
import FloatingPlayer from "../components/FloatingPlayer";
import { siteConfig } from "../siteConfig";
import { withBasePath } from "../sitePath";
import ClickEffect from "../components/ClickEffect";
import SiteBackground from "../components/SiteBackground";
import GlobalToolbox from "../components/GlobalToolbox";
import SplashScreen from "../components/SplashScreen";
import CyberCat from '../components/CyberCat';
import DanmakuBackground from '../components/DanmakuBackground';

import MobileBackButton from '../components/MobileBackButton';



const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cxy0218-blog.pages.dev').replace(/\/$/, '');

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: siteConfig.title,
    template: `%s`,
  },
  description: siteConfig.bio,
  applicationName: siteConfig.authorName,
  authors: [{ name: siteConfig.authorName, url: SITE_URL }],
  creator: siteConfig.authorName,
  publisher: siteConfig.authorName,
  keywords: [
    'Chen Xiangyang',
    'cxy0218',
    'Computer Science',
    'Hainan Bielefeld University of Applied Sciences',
    'student portfolio',
    'web development',
    'Next.js',
  ],
  alternates: {
    types: { 'application/rss+xml': '/rss.xml' },
  },
  icons: {
    icon: [
      { url: siteConfig.faviconUrl, type: 'image/webp' },
      { url: withBasePath('/icons/icon-192.png'), sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: withBasePath('/icons/apple-touch-icon.png'), sizes: '180x180', type: 'image/png' }],
    shortcut: siteConfig.faviconUrl,
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: `${siteConfig.authorName} — Personal Site`,
    title: siteConfig.authorName,
    description: siteConfig.bio,
    images: [
      {
        url: '/og-cover.jpg',
        width: 1200,
        height: 630,
        alt: 'Chen Xiangyang — personal site and study workspace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.authorName,
    description: siteConfig.bio,
    images: ['/og-cover.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: siteConfig.authorName,
  alternateName: siteConfig.handle,
  url: SITE_URL,
  image: `${SITE_URL}/avatar/me.webp`,
  jobTitle: 'Computer Science student',
  affiliation: {
    '@type': 'CollegeOrUniversity',
    name: 'Hainan Bielefeld University of Applied Sciences',
  },
  sameAs: [siteConfig.social.github].filter(Boolean),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <style
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              /* This used to hide the whole page until JS was active and the splash screen had finished:
                 on a slow network the phone sat on a blank screen for a long time (or forever if JS failed).
                 Now the content is always visible and the splash screen is just an overlay. */
              html.splash-seen #app-mount-root { opacity: 1; visibility: visible; pointer-events: auto; }
            `
          }}
        />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (sessionStorage.getItem('hasSeenSplash') === 'true') {
                  document.documentElement.classList.add('splash-seen');
                }
                if (sessionStorage.getItem('perfLite') === '1') {
                  document.documentElement.classList.add('perf-lite');
                }
              } catch (e) {}
            `
          }}
        />
        {/* Apply the saved theme before the first paint: the content no longer waits for
            hydration, so without this the page would flash light before the dark theme loads. */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('blog-theme') === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `
          }}
        />
        <meta name="theme-color" content="#0f172a" />
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>

      <body className="w-screen overflow-x-hidden min-h-full flex flex-col relative transition-colors duration-1000 bg-slate-50 dark:bg-slate-950 font-sans">
        <ThemeProvider>
          <PerfGuard />
          <MotionConfig reducedMotion="user">

          <SplashScreen />

          <MusicProvider>
            <div id="app-mount-root" className="flex-1 flex flex-col transition-opacity duration-1000">
              <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
                <EffectsGate><SiteBackground /></EffectsGate>
                {/* Full-screen backdrop-blur removed: it sat on top of the moving background, which re-blurred the whole screen every frame. Using a translucent veil plus the background image's own blur instead */}
                <div className="absolute inset-0 z-[-9] bg-white/80 dark:bg-slate-950/66 transition-colors duration-1000"></div>

                <div
                  className="absolute -inset-[20%] z-[-8] opacity-60 dark:opacity-20 mix-blend-color transition-opacity duration-1000 will-change-transform"
                  style={{
                    background: `linear-gradient(-45deg, ${siteConfig.themeColors.join(', ')})`,
                    backgroundSize: '100% 100%',
                  }}
                ></div>

                {/* 👇 🌟 Optimization: mix-blend-overlay removed on mobile, but the blurred glow stays so the look does not suffer */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/40 dark:bg-indigo-900/20 blur-[100px] rounded-full z-[-7] md:mix-blend-overlay"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/30 dark:bg-purple-900/30 blur-[100px] rounded-full z-[-7] md:mix-blend-overlay"></div>

                {/* Hide the heavy particle effect on mobile */}
                <div className="hidden md:block absolute inset-0 w-full h-full" data-ambient="true">
                  <DesktopOnly><EffectsGate><BackgroundEffects /></EffectsGate></DesktopOnly>
                </div>
              </div>

              {/* Hide danmaku on mobile */}
              <div className="hidden md:block" data-ambient="true">
                <DesktopOnly><EffectsGate><DanmakuBackground /></EffectsGate></DesktopOnly>
              </div>

              <div className="relative z-10 flex-1 flex flex-col">
                {children}
                <SiteFooter />
              </div>

              <div className="hidden md:block">
                <DesktopOnly><FloatingPlayer /></DesktopOnly>
              </div>

              <div className="hidden md:block">
                <DesktopOnly><GlobalToolbox /></DesktopOnly>
              </div>

              <div className="md:hidden block">
                <MobileBackButton />
              </div>

              {/* Hide click particles on mobile */}
              <div className="hidden md:block" data-ambient="true">
                <DesktopOnly><EffectsGate><ClickEffect /></EffectsGate></DesktopOnly>
              </div>
            </div>

            <style suppressHydrationWarning dangerouslySetInnerHTML={{ __html: `
              @keyframes gradientMove { 
                0% { transform: translate3d(-6%, -4%, 0) scale(1.12); } 
                50% { transform: translate3d(6%, 4%, 0) scale(1.12); } 
                100% { transform: translate3d(-6%, -4%, 0) scale(1.12); } 
              }
            `}} />
          </MusicProvider>

          <div className="hidden md:block" data-ambient="true">
            <DesktopOnly><CyberCat /></DesktopOnly>
          </div>

          </MotionConfig>
        </ThemeProvider>
      </body>
    </html>
  );
}