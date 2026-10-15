import Link from "next/link";

const links = [
  { href: '/', label: '首页' },
  { href: '/posts', label: '文章' },
  { href: '/photowall', label: '照片墙' },
  { href: '/about', label: '关于' },
];

export default function NotFound() {
  return (
    <main className="w-[92%] md:w-[90%] max-w-3xl mx-auto mt-28 md:mt-36 pb-24">
      <div className="card-enter rounded-3xl bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-2xl p-8 md:p-12 text-center">
        <p className="text-6xl md:text-7xl font-black text-indigo-500">404</p>
        <h1 className="mt-4 text-2xl md:text-3xl font-black text-slate-900 dark:text-white">这个页面不在了</h1>
        <p className="mt-3 text-sm md:text-base text-slate-700 dark:text-slate-300">
          可能是链接写错了，或者这个页面已经被移动。下面这些地方可以继续逛。
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-5 py-2.5 rounded-full text-sm font-bold bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-600 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}