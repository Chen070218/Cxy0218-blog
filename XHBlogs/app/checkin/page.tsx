import type { Metadata } from "next";
import Navbar from "../../components/Navbar";
import PageTransition from "../../components/PageTransition";
import CheckinBoard from "./CheckinBoard";
import { siteConfig } from "../../siteConfig";

export const metadata: Metadata = {
  title: "打卡记录 | " + siteConfig.title,
  description: "时间段打卡与月度记录：分类计时、记录节点、星级评分与月历热力。",
};

export default function CheckinPage() {
  return (
    <div className="min-h-screen relative pb-20">
      <Navbar />
      <PageTransition>
        <main className="w-[92%] md:w-[90%] max-w-6xl mx-auto mt-24 md:mt-28">
          <header className="mb-8 md:mb-10">
            <p className="text-xs font-black tracking-[0.3em] text-indigo-600 dark:text-indigo-300 uppercase">Time Tracking</p>
            <h1 className="mt-2 text-3xl md:text-5xl font-black text-slate-900 dark:text-white">时间段打卡</h1>
            <p className="mt-3 text-sm md:text-base text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
              按分类给一段时间打卡，记下做了什么、打几分；打卡过程中还能随手记节点。月历会用颜色深浅显示每天投入了多久。
            </p>
          </header>
          <CheckinBoard />
        </main>
      </PageTransition>
    </div>
  );
}