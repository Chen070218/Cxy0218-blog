import 'katex/dist/katex.min.css';
import type { Metadata } from "next";
// Self-hosted fonts (from the geist npm package), served locally instead of Google Fonts — no network needed at build time
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import BackgroundEffects from "../components/BackgroundEffects";
import { MusicProvider } from "../components/MusicProvider";
import FloatingPlayer from "../components/FloatingPlayer";
import { siteConfig } from "../siteConfig";
import ClickEffect from "../components/ClickEffect";
import SiteBackground from "../components/SiteBackground";
import GlobalToolbox from "../components/GlobalToolbox";
import SplashScreen from "../components/SplashScreen";
import CyberCat from '../components/CyberCat';
import DanmakuBackground from '../components/DanmakuBackground';

import MobileBackButton from '../components/MobileBackButton';



export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.bio,
  icons: {
    icon: siteConfig.faviconUrl,
    apple: siteConfig.faviconUrl,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`} suppressHydrationWarning>
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
              } catch (e) {}
            `
          }}
        />
      </head>

      <body className="w-screen overflow-x-hidden min-h-full flex flex-col relative transition-colors duration-1000 bg-slate-50 dark:bg-slate-950 font-sans">
        <ThemeProvider>

          <SplashScreen />

          <MusicProvider>
            <div id="app-mount-root" className="flex-1 flex flex-col transition-opacity duration-1000">
              <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
                <SiteBackground />
                {/* Full-screen backdrop-blur removed: it sat on top of the moving background, which re-blurred the whole screen every frame. Using a translucent veil plus the background image's own blur instead */}
                <div className="absolute inset-0 z-[-9] bg-white/72 dark:bg-slate-950/58 transition-colors duration-1000"></div>

                <div
                  className="absolute -inset-[20%] z-[-8] opacity-60 dark:opacity-20 mix-blend-color transition-opacity duration-1000 will-change-transform"
                  style={{
                    background: `linear-gradient(-45deg, ${siteConfig.themeColors.join(', ')})`,
                    backgroundSize: '100% 100%',
                    animation: 'gradientMove 15s ease infinite' // 🌟 keep the gradient flowing at every breakpoint
                  }}
                ></div>

                {/* 👇 🌟 Optimization: mix-blend-overlay removed on mobile, but the blurred glow stays so the look does not suffer */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/40 dark:bg-indigo-900/20 blur-[100px] rounded-full z-[-7] md:mix-blend-overlay"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/30 dark:bg-purple-900/30 blur-[100px] rounded-full z-[-7] md:mix-blend-overlay"></div>

                {/* Hide the heavy particle effect on mobile */}
                <div className="hidden md:block absolute inset-0 w-full h-full">
                  <BackgroundEffects />
                </div>
              </div>

              {/* Hide danmaku on mobile */}
              <div className="hidden md:block">
                <DanmakuBackground />
              </div>

              <div className="relative z-10 flex-1 flex flex-col">
                {children}
              </div>

              <div className="hidden md:block">
                <FloatingPlayer />
              </div>

              <div className="hidden md:block">
                <GlobalToolbox />
              </div>

              <div className="md:hidden block">
                <MobileBackButton />
              </div>

              {/* Hide click particles on mobile */}
              <div className="hidden md:block">
                <ClickEffect />
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

          <div className="hidden md:block">
            <CyberCat />
          </div>

        </ThemeProvider>
      </body>
    </html>
  );
}