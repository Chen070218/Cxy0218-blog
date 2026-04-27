import { motion } from 'framer-motion';

export default function ProfileSection({ formData, handleUpdate, pushToQueue }: any) {

  // 🌟 终极防崩溃兜底
  const safeData = formData || {};
  const safeSocial = safeData.social || {};

  // 穿透更新嵌套的 social 对象
  const handleSocialUpdate = (platform: string, value: string) => {
    handleUpdate('social', {
      ...safeSocial,
      [platform]: value
    });
  };

  // 🌟🌟🌟 核心破局点：化繁为简！
  const handleSaveAll = () => {
    // 放弃连续调用 4 次的愚蠢做法（这会导致高并发的文件读写踩踏崩溃）
    // 直接不传具体的 key，触发 Navbar 的机制，将整个新鲜的 formData 一次性打包！
    // 这样右上角只会生成【1个】干净的任务，Python 也只会稳稳地改【1次】文件！
    pushToQueue('全量更新个人名片');
  };

  return (
    <motion.section initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/50 dark:border-slate-800/50 rounded-[40px] p-8 shadow-2xl">
      <div className="flex flex-col md:flex-row gap-12 items-start">
        <div className="relative group shrink-0 self-center md:self-start">
          <motion.div whileHover={{ rotate: 0, scale: 1.05 }} className="w-40 h-40 rounded-[32px] p-1.5 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-2xl rotate-6 transition-all duration-500">
            <img src={safeData.avatarUrl || ''} alt="Avatar" className="w-full h-full rounded-[26px] object-cover bg-white dark:bg-slate-900 border-2 border-white dark:border-slate-800" />
          </motion.div>
        </div>
        <div className="flex-1 w-full space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">头像 URL</label>
              <input type="text" value={safeData.avatarUrl || ''} onChange={e => handleUpdate('avatarUrl', e.target.value)} className="w-full bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm mt-1 outline-none" />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">作者名称</label>
              <input type="text" value={safeData.authorName || ''} onChange={e => handleUpdate('authorName', e.target.value)} className="w-full bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm mt-1 outline-none font-bold" />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">个人简介 (BIO)</label>
              <textarea rows={2} value={safeData.bio || ''} onChange={e => handleUpdate('bio', e.target.value)} className="w-full bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm mt-1 outline-none resize-none" />
            </div>

            {/* 社交媒体区域 */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">邮箱 Email</label>
              <input type="text" value={safeSocial.email || ''} onChange={e => handleSocialUpdate('email', e.target.value)} className="w-full bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm mt-1 outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Google 邮箱/链接</label>
              <input type="text" value={safeSocial.google || ''} onChange={e => handleSocialUpdate('google', e.target.value)} className="w-full bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm mt-1 outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">微信 ID</label>
              <input type="text" value={safeSocial.wechat || ''} onChange={e => handleSocialUpdate('wechat', e.target.value)} className="w-full bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm mt-1 outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">QQ 号码</label>
              <input type="text" value={safeSocial.qq || ''} onChange={e => handleSocialUpdate('qq', e.target.value)} className="w-full bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm mt-1 outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">GitHub 地址</label>
              <input type="text" value={safeSocial.github || ''} onChange={e => handleSocialUpdate('github', e.target.value)} className="w-full bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm mt-1 outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Gitee 地址</label>
              <input type="text" value={safeSocial.gitee || ''} onChange={e => handleSocialUpdate('gitee', e.target.value)} className="w-full bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm mt-1 outline-none" />
            </div>
          </div>

          <button onClick={handleSaveAll} className="px-10 py-3 bg-indigo-500 text-white rounded-2xl text-sm font-black shadow-xl hover:bg-indigo-600 transition-all active:scale-95">
            暂存修改至操作队列
          </button>
        </div>
      </div>
    </motion.section>
  );
}