"use client";

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// 🌟 brought in new icons: Camera, Users, Sprout
import { MessageCircleHeart, ChevronLeft, ChevronRight, BookOpen, ScrollText, Coffee, FileText, Sparkles, Award, Shield, X, Grid, LockKeyhole, Camera, Users, Sprout } from 'lucide-react';
import { useRouter } from 'next/navigation';

// 🌟 import the custom distraction-free comment board and site config
import LabComments from '../../components/LabComments';
import { siteConfig } from '../../siteConfig';

// 🌟 import album and friend-link data for badge counts (make sure the paths are right; adjust the number of ../ if it errors)
import { albums } from '../../data/albums';
import { friendsData } from '../../data/friends';

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// ==========================================
// 🌟 0. Alchemy hex badge component (HexBadge), full-effect edition
// ==========================================
const HexBadge = ({ badge, locked = false }: any) => {
  // tier 1-10 materials and animation effects
  const tierStyles: Record<number, string> = {
    1: 'from-[#5d4037] to-[#8d6e63] border-[#4e342e] text-[#d7ccc8] shadow-[0_0_8px_#5d403744]',
    2: 'from-[#475569] to-[#94a3b8] border-[#334155] text-[#f1f5f9] shadow-[0_0_10px_#64748b66] bg-[length:200%_200%] animate-[hex-shine_6s_infinite_ease-in-out]',
    3: 'from-[#b45309] to-[#fbbf24] border-[#92400e] text-[#fef3c7] shadow-[0_0_12px_#fbbf2488] bg-[length:200%_200%] animate-[hex-shine_4s_infinite_ease-in-out]',
    4: 'from-[#047857] to-[#34d399] border-[#065f46] text-[#d1fae5] shadow-[0_0_15px_#34d399aa] bg-[length:200%_200%] animate-[hex-shine_3s_infinite_ease-in-out]',
    5: 'from-[#6d28d9] to-[#a78bfa] border-[#5b21b6] text-[#ede9fe] shadow-[0_0_20px_#a78bfaaa] bg-[length:200%_200%] animate-[hex-shine_2.5s_infinite_ease-in-out]',
    6: 'from-[#991b1b] to-[#f87171] border-[#7f1d1d] text-[#fee2e2] shadow-[0_0_25px_#f87171bb] bg-[length:200%_200%] animate-[hex-shine_2s_infinite_ease-in-out]',
    7: 'from-[#1e3a8a] to-[#60a5fa] border-[#1e40af] text-[#eff6ff] shadow-[0_0_30px_#60a5facc] bg-[length:200%_200%] animate-[hex-shine_1.5s_infinite_ease-in-out]',
    8: 'from-[#f1f5f9] to-[#e2e8f0] border-[#cbd5e1] text-[#0f172a] shadow-[0_0_35px_#ffffffdd] bg-[length:200%_200%] animate-[hex-shine_1s_infinite_ease-in-out]',
    9: 'from-[#020617] to-[#1e293b] border-[#000000] text-[#94a3b8] shadow-[0_0_40px_#000000ee] bg-[length:200%_200%] animate-[hex-shine_0.8s_infinite_ease-in-out]',
    10: 'bg-[linear-gradient(45deg,#ff0000,#ff7300,#fffb00,#48ff00,#00ffd5,#002bff,#7a00ff,#ff00c8,#ff0000)] bg-[length:400%] animate-[rainbow_3s_linear_infinite] border-[#ffffff] text-[#ffffff] shadow-[0_0_50px_#ff00c8]',
  };

  const bgStyle = tierStyles[badge.colorTier] || tierStyles[1];
  const Icon = badge.icon;

  return (
    <div className="relative group cursor-pointer flex justify-center z-10 hover:z-50">
      {/* Badge body: grey and sealed when not unlocked */}
      <div
        className={`w-[52px] h-[60px] flex items-center justify-center ${badge.colorTier !== 10 ? 'bg-gradient-to-br' : ''} ${bgStyle} border-2 transition-all duration-300 ${locked ? 'grayscale brightness-50 opacity-60' : 'group-hover:scale-110 group-hover:-translate-y-1 group-hover:brightness-110'}`}
        style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
      >
        <Icon size={20} className={`drop-shadow-md ${locked ? 'opacity-20' : 'opacity-100'}`} />
        {locked && <LockKeyhole size={16} className="absolute text-[#e8e4d9] opacity-80" />}
      </div>

      {/* Hover tooltip */}
      <div className="absolute top-[115%] left-1/2 -translate-x-1/2 px-4 py-2.5 bg-[#1a110b]/95 border border-[#8b6b4a]/60 rounded-xl text-[11px] font-bold text-[#e8e4d9] tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex flex-col items-center min-w-[120px]">
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1a110b] border-t border-l border-[#8b6b4a]/60 rotate-45" />
        <span className="text-[#8b6b4a] text-[10px] mb-1 uppercase border-b border-[#8b6b4a]/30 pb-1 w-full text-center">{badge.typeLabel}</span>
        <span className="text-sm font-black mt-1 mb-1">{badge.title} {locked ? '(Locked)' : ''}</span>
        <span className="text-[#10b981] font-mono text-[9px] mt-1 bg-[#10b981]/10 px-2 py-0.5 rounded-full border border-[#10b981]/20">Condition: {badge.condition}</span>
      </div>
    </div>
  );
};

// ==========================================
// 🌟 1. Magic info card component
// ==========================================
const MagicTooltip = ({ title, type, content, author, color }: any) => (
  <motion.div
    initial={{ opacity: 0, y: -10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5, scale: 0.9 }}
    className="absolute top-[120%] left-1/2 -translate-x-1/2 min-w-[200px] max-w-[280px] w-max z-[100] pointer-events-none"
  >
    <div className="relative p-4 bg-[#231a16]/95 backdrop-blur-md border border-[#8b6b4a]/60 shadow-[0_10px_30px_rgba(0,0,0,0.8)] rounded-md flex flex-col items-center">
      <div className="absolute bottom-0 w-3/4 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#231a16]/95 border-t border-l border-[#8b6b4a]/60 rotate-45" />

      {type === 'wish' ? (
        <>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2" style={{ color }}>— Guest note —</p>
          <p className="text-sm text-[#e8e4d9] font-serif italic text-center leading-relaxed">“{content}”</p>
          <p className="text-[10px] text-[#8b6b4a] mt-3 text-right w-full">— {author}</p>
        </>
      ) : type === 'moment' ? (
        <>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2" style={{ color }}>— 📗 Moments —</p>
          <p className="text-sm text-[#e8e4d9] font-serif italic text-center leading-relaxed line-clamp-4">
            “{content || title}”
          </p>
          <p className="text-[10px] text-[#8b6b4a] mt-2 font-mono tracking-widest">CLICK TO VIEW</p>
        </>
      ) : (
        <>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2" style={{ color }}>
            — {type === 'post' ? '📘 In-depth posts' : '📙 Musings'} —
          </p>
          <p className="text-sm font-bold text-[#e8e4d9] text-center" style={{ fontFamily: 'serif' }}>{title}</p>
          <p className="text-[10px] text-[#8b6b4a] mt-2 font-mono tracking-widest">CLICK TO READ</p>
        </>
      )}
    </div>
  </motion.div>
);

// ==========================================
// 🌟 2. Interactive glass potion flask
// ==========================================
const LiquidFlask = ({ item, router }: { item: any; router: any }) => {
  const [isHovered, setIsHovered] = useState(false);
  const colorMap: Record<string, string> = { post: '#3b82f6', chatter: '#f59e0b', moment: '#10b981' };
  const color = colorMap[item.type] || '#fff';
  const fillHeight = item.fillLevel;

  const handleFlaskClick = () => {
    if (item.type === 'post') router.push(`/posts/${item.slug || item.id}`);
    else if (item.type === 'chatter') router.push(`/chatter/${item.slug || item.id}`);
    else if (item.type === 'moment') router.push(`/moments`);
  };

  return (
    <motion.div
      onClick={handleFlaskClick}
      whileHover={{ y: -10, scale: 1.15 }}
      onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
      className={`relative cursor-pointer flex justify-center mb-1 ${isHovered ? 'z-[100]' : 'z-10'}`}
      style={{ width: '56px', height: '76px', marginLeft: `${item.marginLeft}px`, marginRight: `${item.marginRight}px`, filter: `drop-shadow(0 4px 6px ${color}44)` }}
    >
      <AnimatePresence>
        {isHovered && <MagicTooltip title={item.title} content={item.content || item.description} type={item.type} color={color} />}
      </AnimatePresence>
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.5 }} animate={{ opacity: 0.8, y: -30, scale: 1.5 }}
            exit={{ opacity: 0, y: -10, scale: 0.8, transition: { duration: 0.2 } }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
            className="absolute -top-4 w-4 h-4 rounded-full blur-md z-0 pointer-events-none" style={{ backgroundColor: color }}
          />
        )}
      </AnimatePresence>

      <motion.div animate={{ y: isHovered ? -14 : 0, x: isHovered ? 12 : 0, rotate: isHovered ? 45 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 15 }} className="absolute -top-1.5 w-4 h-3 bg-[#5d4037] rounded-t-sm z-30 border-b border-[#3e2723] shadow-md origin-bottom-left" />

      <div className="absolute inset-0 z-10 overflow-hidden backdrop-blur-[2px]" style={{ clipPath: 'polygon(38% 0%, 62% 0%, 62% 35%, 95% 90%, 85% 100%, 15% 100%, 5% 90%, 38% 35%)', background: 'rgba(255,255,255,0.05)', boxShadow: `inset 0 0 15px ${color}33` }}>
         <div className="absolute bottom-0 left-0 w-full transition-all duration-1000" style={{ height: `${fillHeight}%` }}>
            <svg className="absolute bottom-0 left-0 w-[200%] h-full pointer-events-none" viewBox="0 0 200 100" preserveAspectRatio="none">
               <path fill={color} opacity="0.6" className="animate-[potion-wave_3s_linear_infinite]" d="M 0 15 Q 25 5 50 15 T 100 15 T 150 15 T 200 15 L 200 100 L 0 100 Z" />
               <path fill={color} opacity="0.9" className="animate-[potion-wave_2s_linear_infinite_reverse]" d="M 0 20 Q 25 30 50 20 T 100 20 T 150 20 T 200 20 L 200 100 L 0 100 Z" />
            </svg>
            <div className="absolute bottom-2 left-[30%] w-1.5 h-1.5 bg-white/60 rounded-full animate-[bubble-rise_2s_infinite]" />
            <div className="absolute bottom-1 left-[60%] w-1 h-1 bg-white/40 rounded-full animate-[bubble-rise_1.5s_infinite_0.5s]" />
         </div>
         <div className="absolute top-[15%] left-[25%] w-1.5 h-8 bg-white/40 rounded-full rotate-[15deg] blur-[0.5px]" />
      </div>
      <div className="absolute inset-0 z-20 pointer-events-none" style={{ clipPath: 'polygon(38% 0%, 62% 0%, 62% 35%, 95% 90%, 85% 100%, 15% 100%, 5% 90%, 38% 35%)', border: '1.5px solid rgba(255,255,255,0.3)' }} />
    </motion.div>
  );
};

// ==========================================
// 🌟 3. Sticky notes
// ==========================================
const StickyNote = ({ note }: { note: any }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.2, zIndex: 110, rotate: 0 }}
      onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
      className={`absolute ${note.color} p-4 shadow-lg cursor-pointer flex flex-col items-center justify-center border border-black/5 z-30`}
      style={{ width: '110px', height: '110px', [note.side]: `${note.offsetOut}px`, top: `${note.offsetY}px`, rotate: `${note.rotation}deg`, boxShadow: '4px 6px 15px rgba(0,0,0,0.2)' }}
    >
      <AnimatePresence>{isHovered && <MagicTooltip content={note.content} author={note.author} type="wish" color="#ec4899" />}</AnimatePresence>
      <div className="absolute -top-3 w-12 h-5 bg-white/50 backdrop-blur-md shadow-sm rotate-3" style={{ clipPath: 'polygon(2% 10%, 98% 5%, 95% 90%, 5% 95%)' }} />
      <p className="text-xs font-bold text-slate-800 leading-snug line-clamp-3 text-center opacity-80" style={{ fontFamily: 'cursive, sans-serif' }}>{note.content}</p>
    </motion.div>
  );
};

// ==========================================
// 🌟 4. Core lab component (full version)
// ==========================================
export default function AlchemyLab({ posts = [], chatters = [], moments = [] }: any) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const [realWishes, setRealWishes] = useState<any[]>([]);

  // Toggles the catalog panel
  const [showCatalog, setShowCatalog] = useState(false);

  // =========================================================
  // 🌟 Ultimate RPG EXP settlement and full-catalog badge generator (photos and friend links included)
  // =========================================================
  const rpgStats = useMemo(() => {
    if (siteConfig?.enableLevelSystem !== true) return null;

    // Count photos and friend links (badges only, no EXP)
    const totalPhotos = (albums || []).reduce((acc: number, curr: any) => acc + (curr.photos?.length || 0), 0);
    const totalFriends = (friendsData || []).length;

    const parseDateStr = (dateVal: any) => {
      try {
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return null;
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      } catch (e) { return null; }
    };

    const todayString = parseDateStr(new Date());
    let tp = 0, tc = 0, tm = 0;
    const uniqueDays = new Set();

    const processItem = (item: any, type: string) => {
      if (item.date) {
        const ds = parseDateStr(item.date);
        if (ds) {
          uniqueDays.add(ds);
          if (ds === todayString) {
            if (type === 'p') tp++;
            if (type === 'c') tc++;
            if (type === 'm') tm++;
          }
        }
      }
    };

    posts.forEach((i: any) => processItem(i, 'p'));
    chatters.forEach((i: any) => processItem(i, 'c'));
    moments.forEach((i: any) => processItem(i, 'm'));

    const postsExp = posts.length * 50;
    const chattersExp = chatters.length * 20;
    const momentsExp = moments.length * 10;
    const contentExp = postsExp + chattersExp + momentsExp;
    const checkInDays = uniqueDays.size;
    const checkInExp = checkInDays * 100;
    const totalExp = contentExp + checkInExp;

    const isCheckedInToday = todayString ? uniqueDays.has(todayString) : false;
    const todayExp = (tp * 50) + (tc * 20) + (tm * 10) + (isCheckedInToday ? 100 : 0);

    const getExpNeededForLevel = (lvl: number) => {
      if (lvl <= 1) return 150;
      return 150 + Math.floor((2000 * (lvl - 1)) / ((lvl - 1) + 10));
    };

    let level = 1;
    let remainingExp = totalExp;
    let expNeededForNextLevel = getExpNeededForLevel(level);

    while (remainingExp >= expNeededForNextLevel) {
      remainingExp -= expNeededForNextLevel;
      level++;
      expNeededForNextLevel = getExpNeededForLevel(level);
    }
    const progressPercent = ((remainingExp / expNeededForNextLevel) * 100).toFixed(1);

    // ==========================================
    // 🛡️ Full catalog generator (explicit config, precise control)
    // ==========================================
    const allCatalogBadges: any[] = [];
    const ownedIds = new Set();

    // 1. Level badge config (max Lv.50, 10 stages)
    const levelConfig = [
      { num: 1, tier: 1, title: 'Apprentice Alchemist' }, { num: 2, tier: 2, title: 'Novice Inscriber' },
      { num: 3, tier: 3, title: 'Potion Mixer' }, { num: 5, tier: 4, title: 'Matrix Builder' },
      { num: 10, tier: 5, title: 'Intermediate Master' }, { num: 15, tier: 6, title: 'Starlight Mage' },
      { num: 20, tier: 7, title: 'Proof of the Sage' }, { num: 30, tier: 8, title: 'Deep Space Navigator' },
      { num: 40, tier: 9, title: 'Abyss Watcher' }, { num: 50, tier: 10, title: 'Creator of Truth' }
    ];
    levelConfig.forEach(conf => {
      const id = `lvl-${conf.num}`;
      allCatalogBadges.push({ id, title: conf.title, typeLabel: `Level badge Lv.${conf.num}`, condition: `Reach overall rank Lv.${conf.num}`, icon: Award, colorTier: conf.tier, group: 'level' });
      if (level >= conf.num) ownedIds.add(id);
    });

    // 2. In-depth posts & musings config (max 500, 10 stages)
    const postChatterConfig = [
      { num: 10, tier: 2, title: 'First Steps' }, { num: 50, tier: 3, title: 'Getting the Hang of It' },
      { num: 100, tier: 4, title: 'A Hundred Collected' }, { num: 150, tier: 5, title: 'Never Stop Writing' },
      { num: 200, tier: 6, title: 'Two Hundred Pieces' }, { num: 250, tier: 7, title: 'Words Like a Spring' },
      { num: 300, tier: 8, title: 'Three Hundred in View' }, { num: 400, tier: 9, title: 'Volumes as Tall as Me' },
      { num: 450, tier: 9, title: 'Words from the Heart' }, { num: 500, tier: 10, title: 'Volume of Truth' }
    ];
    postChatterConfig.forEach(conf => {
      const idPost = `post-${conf.num}`;
      allCatalogBadges.push({ id: idPost, title: conf.title, typeLabel: 'Post achievement', condition: `${conf.num} posts published`, icon: FileText, colorTier: conf.tier, group: 'post' });
      if (posts.length >= conf.num) ownedIds.add(idPost);

      const idChatter = `chatter-${conf.num}`;
      allCatalogBadges.push({ id: idChatter, title: conf.title, typeLabel: 'Musings achievement', condition: `${conf.num} musings published`, icon: ScrollText, colorTier: conf.tier, group: 'chatter' });
      if (chatters.length >= conf.num) ownedIds.add(idChatter);
    });

    // 3. Moments config (max 800, 10 stages)
    const momentConfig = [
      { num: 10, tier: 2, title: 'First Fragment' }, { num: 50, tier: 3, title: 'Active Mind' },
      { num: 100, tier: 4, title: 'A Hundred Thoughts Linked' }, { num: 200, tier: 5, title: 'Two Hundred Moments' },
      { num: 300, tier: 6, title: 'Three Hundred Glances' }, { num: 400, tier: 7, title: 'Four Hundred Heartwords' },
      { num: 500, tier: 8, title: 'Five Hundred Gleams' }, { num: 600, tier: 9, title: 'Six Hundred Stars' },
      { num: 700, tier: 9, title: 'Seven Hundred Dreams' }, { num: 800, tier: 10, title: 'Eight Hundred Truths' }
    ];
    momentConfig.forEach(conf => {
      const id = `moment-${conf.num}`;
      allCatalogBadges.push({ id, title: conf.title, typeLabel: 'Moments achievement', condition: `${conf.num} moments recorded`, icon: Coffee, colorTier: conf.tier, group: 'moment' });
      if (moments.length >= conf.num) ownedIds.add(id);
    });

    // 4. Photo wall config (max 100, 3 stages)
    const photoConfig = [
      { num: 10, tier: 3, title: 'First Light' },
      { num: 50, tier: 6, title: 'Time Catcher' },
      { num: 100, tier: 10, title: 'All of Creation' }
    ];
    photoConfig.forEach(conf => {
      const id = `photo-${conf.num}`;
      allCatalogBadges.push({ id, title: conf.title, typeLabel: 'Photo memory achievement', condition: `${conf.num} photos published`, icon: Camera, colorTier: conf.tier, group: 'photo' });
      if (totalPhotos >= conf.num) ownedIds.add(id);
    });

    // 5. Friend links config (max 50, 3 stages)
    const friendConfig = [
      { num: 10, tier: 3, title: 'First Bonds' },
      { num: 20, tier: 6, title: 'Many Friends' },
      { num: 50, tier: 10, title: 'Friends Everywhere' }
    ];
    friendConfig.forEach(conf => {
      const id = `friend-${conf.num}`;
      allCatalogBadges.push({ id, title: conf.title, typeLabel: 'Bond achievement', condition: `${conf.num} friend links made`, icon: Users, colorTier: conf.tier, group: 'friend' });
      if (totalFriends >= conf.num) ownedIds.add(id);
    });

    const ownedBadges = allCatalogBadges.filter(b => ownedIds.has(b.id));

    return {
      level, remainingExp, expNeededForNextLevel, progressPercent, totalExp,
      isCheckedInToday, todayExp, postsExp, chattersExp, momentsExp, checkInDays, checkInExp,
      todayPosts: tp, todayChatters: tc, todayMoments: tm,
      ownedBadges, allCatalogBadges, ownedIds, totalPhotos, totalFriends
    };
  }, [posts, chatters, moments]);

  const availableMonths = useMemo(() => {
    const allItems = [...posts, ...chatters, ...moments];
    const monthsSet = new Set(allItems.map(item => item.date?.substring(0, 7)).filter(Boolean));
    const sorted = Array.from(monthsSet).sort();
    return sorted.length > 0 ? sorted : [new Date().toISOString().substring(0, 7)];
  }, [posts, chatters, moments]);

  const [currentMonthIndex, setCurrentMonthIndex] = useState(availableMonths.length - 1);
  const currentMonthStr = mounted ? (availableMonths[currentMonthIndex] || new Date().toISOString().substring(0, 7)) : '2026-05';
  const handlePrevMonth = () => { if (currentMonthIndex > 0) setCurrentMonthIndex(currentMonthIndex - 1); };
  const handleNextMonth = () => { if (currentMonthIndex < availableMonths.length - 1) setCurrentMonthIndex(currentMonthIndex + 1); };

  const [year, month] = currentMonthStr.split('-');
  const cnMonths = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const formattedMonth = `${cnMonths[parseInt(month)] || month} ${year}`;

  useEffect(() => {
    if (!mounted) return;
    let isMounted = true;
    const fetchGitalkComments = async () => {
      try {
        const { owner, repo } = siteConfig.gitalkConfig;
        // Skip when no GitHub repo is configured; don't hit an address that doesn't exist
        if (!owner || !repo) return;
        const targetLabel = `workshop-${currentMonthStr}`;
        const issueRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?labels=${targetLabel}`);
        const issues = await issueRes.json();
        if (issues && issues.length > 0) {
          const commentsRes = await fetch(issues[0].comments_url);
          const comments = await commentsRes.json();
          if (isMounted && Array.isArray(comments)) {
            setRealWishes(comments.map((c: any) => ({ id: c.id.toString(), content: c.body, author: c.user.login, type: 'wish', date: currentMonthStr + '-01' })));
            return;
          }
        }
        if (isMounted) setRealWishes([]);
      } catch (err) { if (isMounted) setRealWishes([]); }
    };
    fetchGitalkComments();
    return () => { isMounted = false; };
  }, [currentMonthStr, mounted]);

  const { shelvesData, stickyNotes, stats } = useMemo(() => {
    if (!mounted) return { shelvesData: [], stickyNotes: [], stats: { post: 0, chatter: 0, moment: 0, wish: 0 } };

    const isCurrentMonth = (dateStr: string) => dateStr && dateStr.startsWith(currentMonthStr);
    const currentPosts = posts.filter((i: any) => isCurrentMonth(i.date));
    const currentChatters = chatters.filter((i: any) => isCurrentMonth(i.date));
    const currentMoments = moments.filter((i: any) => isCurrentMonth(i.date));
    const currentFlasks = [...currentPosts, ...currentChatters, ...currentMoments];

    const monthStats = { post: currentPosts.length, chatter: currentChatters.length, moment: currentMoments.length, wish: realWishes.length };

    const shuffled = currentFlasks
      .map((item, i) => {
        const seed = i + (item.title ? item.title.charCodeAt(0) : 0);
        return {
          ...item, sortKey: seededRandom(seed), fillLevel: 30 + (seededRandom(seed + 1) * 55),
          marginLeft: seededRandom(seed + 2) * 15, marginRight: seededRandom(seed + 3) * 15,
        };
      }).sort((a, b) => a.sortKey - b.sortKey);

    const itemsPerShelf = 8;
    const requiredShelves = Math.ceil(shuffled.length / itemsPerShelf);
    const totalShelves = Math.max(6, requiredShelves);

    const shelves = [];
    for (let i = 0; i < totalShelves; i++) shelves.push(shuffled.slice(i * itemsPerShelf, (i + 1) * itemsPerShelf));

    const colors = ['bg-yellow-200', 'bg-pink-200', 'bg-blue-200', 'bg-emerald-200'];
    const positionCounter: Record<string, number> = {};

    const computedNotes = realWishes.map((wish, i) => {
      const seed = i * 10 + parseInt(currentMonthStr.replace('-',''));
      const shelfIndex = Math.floor(seededRandom(seed) * totalShelves);
      const side = seededRandom(seed + 1) > 0.5 ? 'left' : 'right';
      const key = `${shelfIndex}-${side}`;
      if (positionCounter[key] === undefined) positionCounter[key] = 0;
      const localIndex = positionCounter[key]++;
      return {
        ...wish, shelfIndex, side, color: colors[Math.floor(seededRandom(seed + 2) * colors.length)],
        rotation: (seededRandom(seed + 3) * 40) - 20, offsetY: -40 + (localIndex * 50) + (seededRandom(seed + 4) * 10),
        offsetOut: -110 - (localIndex * 10) - (seededRandom(seed + 5) * 10)
      };
    });

    return { shelvesData: shelves, stickyNotes: computedNotes, stats: monthStats };
  }, [currentMonthStr, posts, chatters, moments, realWishes, mounted]);

  if (!mounted) return <div className="min-h-[80vh] flex items-center justify-center text-[#8b6b4a]">Connecting to the magic network...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }} className="w-full flex flex-col items-center relative"
    >
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes rainbow { 0% { background-position: 0% 50%; } 100% { background-position: 100% 50%; } }
        @keyframes hex-shine { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
      `}} />

      {/* ========================================== */}
      {/* 🌟 Magic rank board and wall of honor badges */}
      {/* ========================================== */}
      {rpgStats && (
        <div className="w-full max-w-5xl mb-8 px-4 z-40 flex flex-col gap-4 relative">

          {/* Top half: rank profile board */}
          <div className="bg-[#231a16]/90 backdrop-blur-md px-6 py-5 rounded-3xl border-2 border-[#8b6b4a]/60 shadow-[0_5px_25px_rgba(0,0,0,0.6)] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-visible group z-50">
            <div className="absolute -right-16 -top-16 text-[#8b6b4a]/10 opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none rotate-12">
              <Sparkles size={200} strokeWidth={0.5} />
            </div>

            {/* Left: level and title */}
            <div className="flex items-center gap-4 z-10 w-full md:w-auto">
              <div className="relative flex items-center justify-center w-14 h-14 bg-[#1a110b] rounded-full border-[3px] border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                <span className="text-[#d4af37] text-[10px] absolute top-1.5 font-black">Lv.</span>
                <span className="text-[#e8e4d9] text-2xl font-black font-serif mt-2 tracking-tighter">{rpgStats.level}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[#e8e4d9] font-serif font-black text-xl tracking-widest flex items-center gap-2">
                  Alchemist Profile <Award size={18} className="text-[#d4af37]" />
                </span>
                <span className="text-[#8b6b4a] text-xs font-mono tracking-widest mt-0.5">ALCHEMY RANK</span>
              </div>
            </div>

            {/* Middle: gilded EXP bar */}
            <div className="flex-1 w-full md:max-w-md flex flex-col z-10">
              <div className="flex justify-between items-end mb-2 px-1">
                <span className="text-[#d4af37] text-xs font-black tracking-widest uppercase">Experience</span>
                <span className="text-[#e8e4d9] text-xs font-mono font-bold tracking-wider">
                  {rpgStats.remainingExp} <span className="text-[#8b6b4a] font-normal">/ {rpgStats.expNeededForNextLevel}</span>
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#1a110b] rounded-full overflow-hidden border border-[#8b6b4a]/30 shadow-inner">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${rpgStats.progressPercent}%` }} transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-[#8b6b4a] via-[#d4af37] to-[#fde047] relative"
                >
                  <div className="absolute inset-0 bg-white/30 animate-[pulse_2s_ease-in-out_infinite]" />
                </motion.div>
              </div>
            </div>

            {/* Right: today's tally panel (details on hover) */}
            <div className="flex items-center gap-6 z-20 md:border-l border-[#8b6b4a]/30 md:pl-6 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 mt-2 md:mt-0 relative group/tooltip cursor-help">
              <div className="flex flex-col items-center flex-1 md:flex-none">
                <span className="text-[#8b6b4a] text-[10px] font-bold tracking-widest mb-1 border-b border-dashed border-[#8b6b4a]/50">Studied today</span>
                <span className="text-[#10b981] font-mono text-sm font-black">+{rpgStats.todayExp} EXP</span>
              </div>
              <div className="flex flex-col items-center flex-1 md:flex-none">
                <span className="text-[#8b6b4a] text-[10px] font-bold tracking-widest mb-1.5">Today's meditation (check-in)</span>
                {rpgStats.isCheckedInToday ? (
                  <span className="text-[#d4af37] text-[10px] font-black tracking-widest border border-[#d4af37]/50 px-2 py-0.5 rounded-md bg-[#d4af37]/10 shadow-[0_0_10px_rgba(212,175,55,0.2)]">Done</span>
                ) : (
                  <span className="text-slate-500 text-[10px] font-black tracking-widest border border-slate-500/50 px-2 py-0.5 rounded-md">Not done</span>
                )}
              </div>

              <div className="absolute top-full right-1/2 translate-x-1/2 md:-translate-x-0 md:right-0 mt-3 w-48 bg-[#1a110b]/95 backdrop-blur-md border border-[#8b6b4a]/50 rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-300 z-50 p-3 pointer-events-none">
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 md:-translate-x-0 md:left-auto md:right-10 w-3 h-3 bg-[#1a110b] border-t border-l border-[#8b6b4a]/50 rotate-45" />
                <h4 className="text-[#d4af37] text-[10px] font-black text-center mb-2 tracking-widest border-b border-[#8b6b4a]/30 pb-1">Earned today</h4>
                <div className="space-y-1.5 text-xs font-mono">
                  {rpgStats.todayPosts > 0 && <div className="flex justify-between text-[#e8e4d9]"><span>In-depth posts <span className="text-[10px] text-[#8b6b4a]">x{rpgStats.todayPosts}</span></span><span className="text-[#10b981]">+{rpgStats.todayPosts * 50}</span></div>}
                  {rpgStats.todayChatters > 0 && <div className="flex justify-between text-[#e8e4d9]"><span>Musings <span className="text-[10px] text-[#8b6b4a]">x{rpgStats.todayChatters}</span></span><span className="text-[#10b981]">+{rpgStats.todayChatters * 20}</span></div>}
                  {rpgStats.todayMoments > 0 && <div className="flex justify-between text-[#e8e4d9]"><span>Moments <span className="text-[10px] text-[#8b6b4a]">x{rpgStats.todayMoments}</span></span><span className="text-[#10b981]">+{rpgStats.todayMoments * 10}</span></div>}
                  {rpgStats.isCheckedInToday && <div className="flex justify-between text-[#e8e4d9]"><span>First post of the day</span><span className="text-[#10b981]">+100</span></div>}
                  {rpgStats.todayExp === 0 && <div className="text-center text-slate-500 italic text-[10px] py-1">No study activity today</div>}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom half: wall of honor badges (🌟 fixed stacking so tooltips sit above) */}
          <div className="bg-[#231a16]/80 backdrop-blur-md px-6 py-5 rounded-3xl border border-[#8b6b4a]/40 shadow-[0_5px_20px_rgba(0,0,0,0.5)] relative z-10">
            <div className="flex justify-between items-center mb-4 border-b border-[#8b6b4a]/30 pb-2">
              <h3 className="text-[#d4af37] font-black tracking-widest text-sm uppercase flex items-center gap-2">
                <Shield size={18} /> Hall of Honor
              </h3>
              <button onClick={() => setShowCatalog(true)} className="flex items-center gap-1.5 text-[10px] font-black text-[#e8e4d9] bg-[#d4af37]/20 hover:bg-[#d4af37]/40 px-3 py-1.5 rounded-lg border border-[#d4af37]/50 transition-colors">
                <Grid size={12} /> Open full catalog
              </button>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-6 justify-start py-2 min-h-[70px]">
              {rpgStats.ownedBadges.length > 0 ? (
                rpgStats.ownedBadges.map((badge, idx) => <HexBadge key={idx} badge={badge} />)
              ) : (
                <p className="text-[#8b6b4a] text-xs italic w-full text-center py-4">The badge wall is empty — go study some magic!</p>
              )}
            </div>
          </div>

          {/* ========================================== */}
          {/* 🌟 Full catalog modal (with photo and friend-link sections) */}
          {/* ========================================== */}
          <AnimatePresence>
            {showCatalog && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCatalog(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative w-full max-w-4xl max-h-[85vh] bg-[#1a110b] border-2 border-[#8b6b4a] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
                >
                  <div className="flex justify-between items-center px-6 py-4 border-b border-[#8b6b4a]/30 bg-[#231a16]">
                    <h2 className="text-[#d4af37] font-black tracking-widest flex items-center gap-2 text-lg"><Grid size={20} /> Alchemy Badge Catalog</h2>
                    <button onClick={() => setShowCatalog(false)} className="text-[#8b6b4a] hover:text-[#e8e4d9] transition-colors"><X size={24} /></button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 custom-scrollbar pb-32">

                    <div className="flex items-center gap-4 mb-8">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#8b6b4a]/50 to-transparent" />
                      <span className="text-[#8b6b4a] text-xs font-black tracking-widest uppercase flex items-center gap-2"><Award size={14} /> Rank badges (max Lv.50)</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#8b6b4a]/50 to-transparent" />
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-10 justify-center">
                      {rpgStats.allCatalogBadges.filter(b => b.group === 'level').map(b => (
                        <HexBadge key={b.id} badge={b} locked={!rpgStats.ownedIds.has(b.id)} />
                      ))}
                    </div>

                    <div className="flex items-center gap-4 mt-16 mb-8">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#8b6b4a]/50 to-transparent" />
                      <span className="text-[#8b6b4a] text-xs font-black tracking-widest uppercase flex items-center gap-2"><FileText size={14} /> Post badges (max 500 posts)</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#8b6b4a]/50 to-transparent" />
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-10 justify-center">
                      {rpgStats.allCatalogBadges.filter(b => b.group === 'post').map(b => (
                        <HexBadge key={b.id} badge={b} locked={!rpgStats.ownedIds.has(b.id)} />
                      ))}
                    </div>

                    <div className="flex items-center gap-4 mt-16 mb-8">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#8b6b4a]/50 to-transparent" />
                      <span className="text-[#8b6b4a] text-xs font-black tracking-widest uppercase flex items-center gap-2"><ScrollText size={14} /> Musings badges (max 500 posts)</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#8b6b4a]/50 to-transparent" />
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-10 justify-center">
                      {rpgStats.allCatalogBadges.filter(b => b.group === 'chatter').map(b => (
                        <HexBadge key={b.id} badge={b} locked={!rpgStats.ownedIds.has(b.id)} />
                      ))}
                    </div>

                    <div className="flex items-center gap-4 mt-16 mb-8">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#8b6b4a]/50 to-transparent" />
                      <span className="text-[#8b6b4a] text-xs font-black tracking-widest uppercase flex items-center gap-2"><Coffee size={14} /> Moment badges (max 800)</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#8b6b4a]/50 to-transparent" />
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-10 justify-center">
                      {rpgStats.allCatalogBadges.filter(b => b.group === 'moment').map(b => (
                        <HexBadge key={b.id} badge={b} locked={!rpgStats.ownedIds.has(b.id)} />
                      ))}
                    </div>

                    {/* 🌟 Added: photo memory badge section */}
                    <div className="flex items-center gap-4 mt-16 mb-8">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#8b6b4a]/50 to-transparent" />
                      <span className="text-[#8b6b4a] text-xs font-black tracking-widest uppercase flex items-center gap-2"><Camera size={14} /> Photo badges (max 100 photos)</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#8b6b4a]/50 to-transparent" />
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-10 justify-center">
                      {rpgStats.allCatalogBadges.filter(b => b.group === 'photo').map(b => (
                        <HexBadge key={b.id} badge={b} locked={!rpgStats.ownedIds.has(b.id)} />
                      ))}
                    </div>

                    {/* 🌟 Added: bond badge section */}
                    <div className="flex items-center gap-4 mt-16 mb-8">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#8b6b4a]/50 to-transparent" />
                      <span className="text-[#8b6b4a] text-xs font-black tracking-widest uppercase flex items-center gap-2"><Users size={14} /> Bond badges (max 50 friends)</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#8b6b4a]/50 to-transparent" />
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-10 justify-center">
                      {rpgStats.allCatalogBadges.filter(b => b.group === 'friend').map(b => (
                        <HexBadge key={b.id} badge={b} locked={!rpgStats.ownedIds.has(b.id)} />
                      ))}
                    </div>

                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Original stats dashboard and month switcher */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-center gap-6 mb-12 px-4">
        <div className="flex items-center bg-[#231a16]/90 backdrop-blur-md px-6 py-3 rounded-2xl border-2 border-[#8b6b4a] shadow-[0_5px_15px_rgba(0,0,0,0.5)] overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.div key={currentMonthStr} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.3 }} className="flex items-center gap-6 text-[#d4af37]">
              <div className="flex flex-col items-center justify-center w-12">
                <div className="flex items-center gap-1.5"><FileText size={14} className="text-[#3b82f6]"/><span className="text-xl font-bold text-[#e8e4d9] font-serif">{stats.post}</span></div>
                <span className="text-[10px] text-[#8b6b4a] tracking-widest mt-1">Posts</span>
              </div>
              <div className="w-px h-8 bg-[#8b6b4a]/40" />
              <div className="flex flex-col items-center justify-center w-12">
                <div className="flex items-center gap-1.5"><ScrollText size={14} className="text-[#f59e0b]"/><span className="text-xl font-bold text-[#e8e4d9] font-serif">{stats.chatter}</span></div>
                <span className="text-[10px] text-[#8b6b4a] tracking-widest mt-1">Musings</span>
              </div>
              <div className="w-px h-8 bg-[#8b6b4a]/40" />
              <div className="flex flex-col items-center justify-center w-12">
                <div className="flex items-center gap-1.5"><Coffee size={14} className="text-[#10b981]"/><span className="text-xl font-bold text-[#e8e4d9] font-serif">{stats.moment}</span></div>
                <span className="text-[10px] text-[#8b6b4a] tracking-widest mt-1">Moments</span>
              </div>
              <div className="w-px h-8 bg-[#8b6b4a]/40" />
              <div className="flex flex-col items-center justify-center w-12">
                <div className="flex items-center gap-1.5"><MessageCircleHeart size={14} className="text-[#ec4899]"/><span className="text-xl font-bold text-[#e8e4d9] font-serif">{stats.wish}</span></div>
                <span className="text-[10px] text-[#8b6b4a] tracking-widest mt-1">Wishes</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-4 bg-[#231a16]/90 backdrop-blur-md px-6 py-3 rounded-2xl border-2 border-[#8b6b4a] shadow-[0_5px_15px_rgba(0,0,0,0.5)] text-[#d4af37]">
          <button onClick={handlePrevMonth} disabled={currentMonthIndex === 0} className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-20 disabled:cursor-not-allowed"><ChevronLeft size={20} /></button>
          <div className="overflow-hidden h-6 flex items-center justify-center min-w-[160px]">
            <AnimatePresence mode="popLayout">
              <motion.div key={formattedMonth} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.3 }} className="flex items-center gap-2 font-black tracking-widest text-lg px-2 whitespace-nowrap" style={{ fontFamily: 'serif' }}>
                <BookOpen size={16} /> {formattedMonth}
              </motion.div>
            </AnimatePresence>
          </div>
          <button onClick={handleNextMonth} disabled={currentMonthIndex === availableMonths.length - 1} className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-20 disabled:cursor-not-allowed"><ChevronRight size={20} /></button>
        </div>
      </div>

      {/* Potion flask shelves */}
      <div className="w-full relative z-0">
        <AnimatePresence mode="wait">
          <motion.div key={currentMonthStr} initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, scale: 1.05, filter: 'blur(4px)' }} transition={{ duration: 0.4, ease: "easeInOut" }} className="w-full flex flex-col items-center pb-10">
            {shelvesData.map((shelfItems, idx) => (
              <div key={idx} className="relative w-full max-w-5xl h-[160px] flex items-end justify-center px-10" style={{ zIndex: 100 - idx }}>
                <div className="w-full max-w-4xl flex items-end justify-around relative z-10 pb-[10px]">
                  {shelfItems.map((item) => <LiquidFlask key={item.id} item={item} router={router} />)}
                </div>
                {stickyNotes.filter(n => n.shelfIndex === idx).map(note => <StickyNote key={note.id} note={note} />)}
                <div className="absolute bottom-0 left-[5%] right-[5%] h-[14px] bg-gradient-to-b from-[#4a3628] to-[#2c1e16] border-b-[6px] border-[#1a110b] rounded-sm shadow-[0_15px_30px_-5px_rgba(0,0,0,0.8)] z-0"><div className="absolute top-0 left-0 w-full h-[1px] bg-white/10" /></div>
                <div className="absolute -bottom-6 left-[15%] w-4 h-6 bg-[#2c1e16] rounded-b-lg shadow-xl border-x border-[#5d4037]/20" />
                <div className="absolute -bottom-6 right-[15%] w-4 h-6 bg-[#2c1e16] rounded-b-lg shadow-xl border-x border-[#5d4037]/20" />
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Guestbook */}
      <div className="w-full max-w-4xl mx-auto mt-10 mb-16 px-4">
         <h2 className="text-xl font-black text-[#8b6b4a] mb-2 font-serif text-center uppercase tracking-widest border-b border-[#8b6b4a]/30 pb-4">
            {formattedMonth} · Guestbook
         </h2>
         <LabComments key={`gitalk-${currentMonthStr}`} pageId={`workshop-${currentMonthStr}`} />
      </div>

    </motion.div>
  );
}
