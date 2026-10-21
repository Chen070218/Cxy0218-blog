import type { Metadata } from "next";
import Navbar from "../../components/Navbar";
import PageTransition from "../../components/PageTransition";
import CheckinBoard from "./CheckinBoard";
import { siteConfig } from "../../siteConfig";

export const metadata: Metadata = {
  title: "Check-in | " + siteConfig.title,
  description: "Time-block check-in and monthly log: category timers, record nodes, star ratings and a heat-mapped calendar.",
};

export default function CheckinPage() {
  return (
    <div className="min-h-screen relative pb-20">
      <Navbar />
      <PageTransition>
        <main id="main-content" className="w-[92%] md:w-[90%] max-w-6xl mx-auto mt-24 md:mt-28">
          <header className="mb-8 md:mb-10">
            <p className="text-xs font-black tracking-[0.3em] text-indigo-600 dark:text-indigo-300">Time tracking</p>
            <h1 className="mt-2 text-3xl md:text-5xl font-black text-slate-900 dark:text-white">Time-block check-in</h1>
            <p className="mt-3 text-sm md:text-base text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
              Check in a block of time under a category, note what you did and how it went, and jot down nodes as you go. The calendar shades each day by how much time went into it.
            </p>
          </header>
          <CheckinBoard />
        </main>
      </PageTransition>
    </div>
  );
}
