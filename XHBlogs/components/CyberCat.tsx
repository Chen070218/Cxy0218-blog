"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MoonFox, { PetState } from './MoonFox';

type ChatMessage = { role: 'user' | 'assistant'; content: string };
type Provider = 'deepseek' | 'gemini';

// 桌宠的 AI 后端：默认 DeepSeek，可在气泡面板里切换
const PROVIDERS: { id: Provider; label: string }[] = [
  { id: 'deepseek', label: 'DeepSeek' },
  { id: 'gemini', label: 'Gemini' },
];

// 快捷提问：点一下就发，不用自己打字
const QUICK_ASKS = ['今晚该做什么？', '夸夸我', '讲个关于月亮的故事', '帮我打打气'];

export default function CyberCat() {
  const [petState, setPetState] = useState<PetState>('idle');
  const [speech, setSpeech] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [provider, setProvider] = useState<Provider>('deepseek');
  const [modelTag, setModelTag] = useState<string | null>(null);

  const chatTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- 💬 说话功能 ---
  const speak = (text: string, duration = 6000) => {
    setSpeech(text);
    if (chatTimeoutRef.current) clearTimeout(chatTimeoutRef.current);
    chatTimeoutRef.current = setTimeout(() => {
      setSpeech(null);
    }, duration);
  };

  // --- 🖱️ 交互事件：摸猫猫 ---
  const handlePetCat = () => {
    if (petState === 'happy') return;
    setPetState('happy');
    speak('唔……准你摸一小会儿。( ˘ ³˘)♥', 2200);
    setTimeout(() => setPetState('idle'), 2200);
  };

  // --- 🔌 统一的对话入口：聊天、喂食、快捷提问都走这里 ---
  const sendMessage = async (message: string, thinkingText = '月色流转，且等本座一算～') => {
    const text = message.trim();
    if (!text || isThinking) return;

    setIsThinking(true);
    setPetState('think');
    speak(thinkingText, 12000);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // history 带上前面几轮，心月狐才记得住刚才聊了什么
        body: JSON.stringify({ message: text, history, provider }),
      });

      const data: any = await res.json().catch(() => ({}));

      if (!res.ok) {
        const detail = data?.error ? `唔……${data.error}` : '唔……本座的星辉被打断了';
        speak(detail, 7000);
        return;
      }

      const reply: string = data?.reply || '哼，本座今日不想说话。';
      speak(reply, Math.min(15000, 4000 + reply.length * 150));
      setModelTag(data?.model ? `${data.provider} · ${data.model}` : null);
      setHistory((prev) => [...prev, { role: 'user', content: text }, { role: 'assistant', content: reply }].slice(-8));
      setPetState('happy');
      setTimeout(() => setPetState('idle'), 2600);
    } catch (error) {
      speak('星轨断了……你的网络出问题了吧？', 4200);
      setPetState('angry');
      setTimeout(() => setPetState('idle'), 2200);
    } finally {
      setIsThinking(false);
    }
  };

  // --- 🐟 交互事件：喂小鱼干 ---
  const handleFeed = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止触发摸猫或拖拽
    if (isThinking) return;
    setShowInput(false); // 喂食时关掉输入框
    await sendMessage('我给心月狐呈上一条小鱼干，请发表感想。', '小鱼干……本座就勉为其难地收下了 (๑•̀ㅂ•́)و✧');
  };

  // --- 💬 交互事件：发送聊天 ---
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userMessage = inputValue.trim();
    if (!userMessage || isThinking) return;
    setInputValue('');
    setShowInput(false);
    await sendMessage(userMessage);
  };

  // --- ⚡ 交互事件：快捷提问 ---
  const handleQuickAsk = async (question: string) => {
    if (isThinking) return;
    setShowInput(false);
    setInputValue('');
    await sendMessage(question);
  };

  // --- 🐾 自主行为：没人互动时自己在 待机 / 走动 / 好奇 / 趴着 / 睡觉 之间切换 ---
  useEffect(() => {
    if (isThinking || showInput || speech) return;
    const timer = setTimeout(() => {
      const pool: PetState[] = ['walk', 'curious', 'lie', 'idle', 'idle', 'sleep'];
      const next = pool[Math.floor(Math.random() * pool.length)];
      setPetState(next);
      setTimeout(() => setPetState('idle'), next === 'sleep' ? 6000 : 4200);
    }, 9000 + Math.random() * 6000);
    return () => clearTimeout(timer);
  }, [petState, isThinking, showInput, speech]);

  // --- 📣 其它工具（番茄钟等）可以让桌宠说话 ---
  useEffect(() => {
    const onSay = (event: Event) => {
      const detail = (event as CustomEvent).detail || {};
      if (typeof detail.text === "string") {
        speak(detail.text, detail.ms || 6000);
        if (detail.state) {
          setPetState(detail.state as PetState);
          setTimeout(() => setPetState("idle"), detail.ms || 6000);
        }
      }
    };
    window.addEventListener("pet-say", onSay);
    return () => window.removeEventListener("pet-say", onSay);
  }, []);

  // --- 👋 每天第一次打开时打个招呼 ---
  useEffect(() => {
    try {
      const key = "xh-pet-greeted";
      const today = new Date().toDateString();
      if (localStorage.getItem(key) !== today) {
        localStorage.setItem(key, today);
        setTimeout(() => speak("你来啦～今天也一起加油吧 (๑•̀ㅂ•́)و✧", 7000), 1600);
      }
    } catch {}
  }, []);

  // --- 🕰️ 久坐提醒：长时间没人互动就关心一句 ---
  useEffect(() => {
    const timer = setTimeout(() => {
      speak("已经坐很久啦，站起来舒展一下吧 (｡•́︿•̀｡)", 7000);
    }, 12 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [speech]);
  // --- ⏳ 随机挂机语录 ---
  useEffect(() => {
    const randomBarks = [
      "今夜月色不错，不做点什么吗？",
      "困了就去睡，本座守着。( ˘ ³˘)♥",
      "代码写完了吗，人类。写不动就歇会儿～",
      "小鱼干，本座要小鱼干 (｡•́︿•̀｡)",
      "……别走神，看着本座。",
      "坐久了记得起来动动，不然脖子会疼哦。",
      "喝口水吧，本座可不希望你头疼。",
      "你专注的样子……唔，还算顺眼 (๑•̀ㅂ•́)و✧",
      "有点安静呢。本座在听，你慢慢说。",
      "偷偷讲，偶尔也觉得夜里太长了……不过有你在。",
    ];
    const randomTalkInterval = setInterval(() => {
      if (!speech && !showInput && !isThinking && Math.random() > 0.8) {
        const randomMsg = randomBarks[Math.floor(Math.random() * randomBarks.length)];
        speak(randomMsg, 4000);
      }
    }, 20000);

    return () => clearInterval(randomTalkInterval);
  }, [speech, showInput, isThinking]);

  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.1}
      whileDrag={{ scale: 1.1, cursor: "grabbing" }}
      className="fixed bottom-20 right-20 z-[9999] flex flex-col items-center group cursor-grab active:cursor-grabbing"
    >
      <style dangerouslySetInnerHTML={{ __html: `@keyframes pet-drift { 0%,100% { transform: translateX(0); } 50% { transform: translateX(-150px); } }` }} />

      {/* 💬 聊天气泡 */}
      <div className="relative w-full flex justify-center mb-6">
        <AnimatePresence>
          {speech && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="absolute bottom-0 bg-white dark:bg-slate-800 text-slate-700 dark:text-gray-200 px-4 py-3 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 text-sm max-w-[240px] break-words text-center leading-relaxed"
              style={{ pointerEvents: 'none', transformOrigin: 'bottom center' }}
            >
              {speech}
              {modelTag && (
                <span className="block mt-1 text-[10px] text-slate-400 dark:text-slate-500">{modelTag}</span>
              )}
              <div className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-slate-800 border-b border-r border-gray-100 dark:border-slate-700 transform rotate-45"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 🦊 心月狐本体 & 交互按钮区 */}
      <div className="relative">

        {/* 🌟 核心修改区：去掉了 opacity-0 和 group-hover，让按钮常驻显示 */}
        <div className="absolute -left-12 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">

            {/* 💬 聊天按钮 */}
            <button
              onClick={(e) => {
                 e.stopPropagation();
                 setShowInput(!showInput);
              }}
              // 稍微加了一点半透明背景，让常驻按钮在深色背景下也好看
              className="bg-white/90 dark:bg-slate-700/90 p-2.5 rounded-full shadow-md hover:scale-110 active:scale-95 transition-transform border border-gray-100 dark:border-slate-600 text-blue-500 hover:text-blue-600 flex items-center justify-center backdrop-blur-sm"
              title="聊天"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" />
              </svg>
            </button>

            {/* 🐟 喂食按钮 */}
            <button
              onClick={handleFeed}
              disabled={isThinking}
              className={`bg-white/90 dark:bg-slate-700/90 p-2.5 rounded-full shadow-md hover:scale-110 active:scale-95 transition-transform border border-gray-100 dark:border-slate-600 flex items-center justify-center backdrop-blur-sm ${isThinking ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="喂小鱼干"
            >
              <span className="text-xl leading-none">🐟</span>
            </button>
        </div>

        {/* 心月狐本体 */}
        <div
          className="w-[120px] h-[120px] relative cursor-pointer"
          style={{ animation: petState === 'walk' ? 'pet-drift 16s ease-in-out infinite' : undefined }}
          onClick={handlePetCat}
        >
          <MoonFox state={showInput && petState === 'idle' ? 'interact' : petState} />
        </div>
      </div>

      {/* ⌨️ 互动输入框 */}
      <AnimatePresence>
        {showInput && (
          <motion.form
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            onSubmit={handleChatSubmit}
            className="absolute -bottom-32 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 w-64 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="和心月狐说点什么…（聊聊今天？）"
                className="bg-transparent border-none outline-none text-sm px-3 py-1 w-full dark:text-white placeholder-gray-400"
                disabled={isThinking}
                autoFocus
              />
              <button
                type="submit"
                disabled={isThinking || !inputValue.trim()}
                className={`rounded-full p-1.5 ml-1 flex items-center justify-center transition-colors ${
                  isThinking || !inputValue.trim() ? 'bg-gray-300 text-gray-500' : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                </svg>
              </button>
            </div>

            {/* ⚡ 快捷提问 */}
            <div className="flex flex-wrap gap-1 mt-2 px-1">
              {QUICK_ASKS.map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={isThinking}
                  onClick={() => handleQuickAsk(q)}
                  className={`text-[11px] px-2 py-1 rounded-full border transition-colors ${
                    isThinking
                      ? 'border-gray-200 text-gray-400 dark:border-slate-700 dark:text-slate-500'
                      : 'border-gray-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* 🔌 后端切换 + 清空记忆 */}
            <div className="flex items-center justify-between mt-2 px-1 pb-0.5">
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-400 dark:text-slate-500">脑子：</span>
                {PROVIDERS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProvider(p.id)}
                    className={`text-[11px] px-2 py-0.5 rounded-full transition-colors ${
                      provider === p.id
                        ? 'bg-blue-500 text-white'
                        : 'text-slate-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setHistory([]);
                  setModelTag(null);
                  speak('刚才的事，本座已经忘了～', 3000);
                }}
                className="text-[11px] text-slate-400 hover:text-rose-500 dark:text-slate-500"
                title="清空多轮对话记忆"
              >
                清空记忆{history.length > 0 ? `（${history.length}）` : ''}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}