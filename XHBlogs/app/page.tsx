import SmartImage from '../components/SmartImage';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';

import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';
import SearchBar from '../components/SearchBar';
import { siteConfig } from '../siteConfig';
import CloudPlayer from '../components/CloudPlayer';
import ThemeToggleBlock from '../components/ThemeToggleBlock';
import ProfileCard from '../components/ProfileCard';
import SiteDashboard from '../components/SiteDashboard';
import { albums } from '../data/albums';
import LyricBar from '../components/LyricBar';
import { ToastProvider } from '../components/ToastProvider';

import LatestPostsCarousel from '../components/LatestPostsCarousel';

import DanmakuBackground from '../components/DanmakuBackground';
import { formatDate } from '../components/formatDate';

function formatUpdateTime(dateString: string) {
  if (!dateString || dateString === '1970-01-01') return 'Just updated';
  return formatDate(dateString, true);
}

export default function Home() {
  const postsDirectory = path.join(process.cwd(), 'posts');
  let allPosts: any[] = [];
  try {
    if (fs.existsSync(postsDirectory)) {
      const fileNames = fs.readdirSync(postsDirectory).filter(f => f.endsWith('.md'));
      allPosts = fileNames.map(fileName => {
        const fullPath = path.join(postsDirectory, fileName);
        const { data, content } = matter(fs.readFileSync(fullPath, 'utf8'));
        const rawDate = data.date || '1970-01-01';
        return {
          slug: fileName.replace(/\.md$/, ''),
          ...data,
          title: data.title || '',
          description: data.description || '',
          content: content || '',
          date: rawDate,
          formattedDate: formatUpdateTime(rawDate)
        };
      }).sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateB !== dateA) return dateB - dateA;
        return b.slug.localeCompare(a.slug);
      });
    }
  } catch (e) {}
  const top5Posts = allPosts.length > 0 ? allPosts.slice(0, 5) : [{ slug: 'none', title: 'No posts yet', description: 'Go write the first one!', cover: siteConfig.defaultPostCover, date: '', formattedDate: '' }];

  const momentsDirectory = path.join(process.cwd(), 'moments');
  const momentCount = fs.existsSync(momentsDirectory) ? fs.readdirSync(momentsDirectory).filter(f => f.endsWith('.md')).length : 0;
  const realPhotoCount = albums.reduce((total, album) => total + album.photos.length, 0);
  const latestAlbum = albums.length > 0 ? albums[0] : { id: '', title: 'Photo Wall', description: 'Browse the photo wall', cover: siteConfig.photoWallImage, date: '' };

  return (
    <ToastProvider>
      <div className="min-h-screen relative pb-10">
        <Navbar />
        <PageTransition>
          {/* 🌟 Adjust the container padding for smaller phone screens */}
          <div className="w-full max-w-6xl mx-auto mt-24 sm:mt-28 px-4 sm:px-6 lg:px-10 relative z-10">
            <main id="main-content" className="flex flex-col gap-6 w-full mt-6">

              {/* Row one: profile + player */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
                {/* One column on phones, seven columns on desktop */}
                <div className="col-span-1 lg:col-span-7 flex flex-col">
                    <ProfileCard postCount={allPosts.length} momentCount={momentCount} photoCount={realPhotoCount}/>
                </div>
                {/* One column on phones, five columns on desktop */}
                <div className="col-span-1 lg:col-span-5 flex flex-col">
                    <CloudPlayer/>
                </div>
              </div>

              {/* Lyric bar */}
              <div className="w-full mt-[-10px]"><LyricBar/></div>

              <SearchBar posts={allPosts} />

              {/* Row two: latest posts carousel + photo wall + moments + theme toggle */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">

                {/* Left: posts carousel (4 columns on desktop, first on phones) */}
                <div className="col-span-1 lg:col-span-4 flex flex-col min-h-[300px]">
                  <LatestPostsCarousel posts={top5Posts} />
                </div>

                {/* Right: combined panel (8 columns on desktop) */}
                <div className="col-span-1 lg:col-span-8 flex flex-col gap-6">

                  {/* Big photo wall poster */}
                  <Link href="/photowall" className="w-full rounded-3xl bg-white/40 dark:bg-slate-800/50 border border-white/40 dark:border-white/10 shadow-xl overflow-hidden transition-all duration-700 hover:scale-[1.02] relative group min-h-[200px] sm:min-h-[220px] flex-shrink-0">
                    <SmartImage fill sizes="(max-width: 768px) 100vw, 800px" src={latestAlbum.cover} alt={latestAlbum.title} className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-90" />
                    <div className="absolute inset-0 bg-black/30 dark:bg-black/50 group-hover:bg-black/10 transition-colors duration-500"></div>
                    <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 right-6">
                      <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 underline decoration-pink-400">{latestAlbum.title}</h3>
                      <p className="text-white/90 text-sm sm:text-lg line-clamp-1">{latestAlbum.description}</p>
                    </div>
                  </Link>

                  {/* Bottom grid: moments carousel + theme switcher */}
                  {/* Single column on phones, three-column ratio on tablets */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full flex-1">
                    <div className="sm:col-span-2 flex flex-col min-h-[200px]">
                      <Link href="/resources" className="relative overflow-hidden flex flex-col justify-end flex-1 min-h-[200px] rounded-3xl border border-white/40 shadow-xl p-6 text-white group">
                        <SmartImage fill sizes="(max-width: 640px) 100vw, 640px" src="/covers/notes.webp" alt="" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 to-slate-900/15" />
                        <div className="relative"><p className="text-xs tracking-widest mb-2">Resources</p><h3 className="text-2xl font-bold">Lecture notes and useful sites ↗</h3><p className="text-sm mt-2 text-white/85">Course notes, reference sites, handy tools</p></div>
                      </Link>
                    </div>
                    <div className="sm:col-span-1 flex flex-col min-h-[120px]">
                      <ThemeToggleBlock />
                    </div>
                  </div>

                </div>
              </div>

              {/* Bottom data panel */}
              <div className="w-full mt-4"><SiteDashboard/></div>
            </main>
          </div>
        </PageTransition>
      </div>
    </ToastProvider>
  );
}
