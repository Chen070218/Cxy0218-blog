// src/components/MobileBackButton.tsx
"use client";

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function MobileBackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      // Sit a little above the bottom-right corner so it does not cover the bottom nav
      className="fixed bottom-24 right-4 z-[90] w-11 h-11 flex items-center justify-center bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-xl rounded-full text-slate-700 dark:text-slate-200 active:scale-90 transition-all"
      title="Back to the previous page"
    >
      <ChevronLeft size={24} />
    </button>
  );
}