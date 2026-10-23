"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MoonFox, { PetState } from './MoonFox';
import { withBasePath } from '../sitePath';

type ChatMessage = { role: 'user' | 'assistant'; content: string };
type Provider = 'deepseek' | 'gemini';

// Desktop pet AI backend: DeepSeek by default, switchable in the bubble panel
const PROVIDERS: { id: Provider; label: string }[] = [
  { id: 'deepseek', label: 'DeepSeek' },
  { id: 'gemini', label: 'Gemini' },
];

// Quick questions: one tap sends them, no typing needed
const QUICK_ASKS = ['What should I do tonight?', 'Praise me', 'Tell me a story about the moon', 'Cheer me on'];

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

  // --- 💬 Speech ---
  const speak = (text: string, duration = 6000) => {
    setSpeech(text);
    if (chatTimeoutRef.current) clearTimeout(chatTimeoutRef.current);
    chatTimeoutRef.current = setTimeout(() => {
      setSpeech(null);
    }, duration);
  };

  // --- 🖱️ Interaction: pet the fox ---
  const handlePetCat = () => {
    if (petState === 'happy') return;
    setPetState('happy');
    speak('Mmm... you may pet me for a little while. ( ˘ ³˘)♥', 2200);
    setTimeout(() => setPetState('idle'), 2200);
  };

  // --- 🔌 Single chat entry point: chat, feeding and quick questions all go through here ---
  const sendMessage = async (message: string, thinkingText = 'The moonlight turns; give this fox a moment～') => {
    const text = message.trim();
    if (!text || isThinking) return;

    setIsThinking(true);
    setPetState('think');
    speak(thinkingText, 12000);

    try {
      const res = await fetch(withBasePath('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // carry the last few turns in history so Xinyuehu remembers what we were just talking about
        body: JSON.stringify({ message: text, history, provider }),
      });

      const data: any = await res.json().catch(() => ({}));

      if (!res.ok) {
        const detail = data?.error ? `Mmm... ${data.error}` : 'Mmm... this fox’s starlight was interrupted';
        speak(detail, 7000);
        return;
      }

      const reply: string = data?.reply || 'Hmph. This fox does not feel like talking today.';
      speak(reply, Math.min(15000, 4000 + reply.length * 150));
      setModelTag(data?.model ? `${data.provider} · ${data.model}` : null);
      setHistory((prev) => [...prev, { role: 'user' as const, content: text }, { role: 'assistant' as const, content: reply }].slice(-8));
      setPetState('happy');
      setTimeout(() => setPetState('idle'), 2600);
    } catch (error) {
      speak('The star track broke... your network is acting up, isn’t it?', 4200);
      setPetState('angry');
      setTimeout(() => setPetState('idle'), 2200);
    } finally {
      setIsThinking(false);
    }
  };

  // --- 🐟 Interaction: feed a dried fish ---
  const handleFeed = async (e: React.MouseEvent) => {
    e.stopPropagation(); // stop this from triggering petting or dragging
    if (isThinking) return;
    setShowInput(false); // close the input box while feeding
    await sendMessage('I present a dried fish to Xinyuehu. Please comment.', 'A dried fish... this fox shall accept it, reluctantly (๑•̀ㅂ•́)و✧');
  };

  // --- 💬 Interaction: send chat ---
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userMessage = inputValue.trim();
    if (!userMessage || isThinking) return;
    setInputValue('');
    setShowInput(false);
    await sendMessage(userMessage);
  };

  // --- ⚡ Interaction: quick question ---
  const handleQuickAsk = async (question: string) => {
    if (isThinking) return;
    setShowInput(false);
    setInputValue('');
    await sendMessage(question);
  };

  // --- 🐾 Idle behavior: with nobody interacting, move between idle / walk / curious / lie / sleep on its own ---
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

  // --- 📣 Other tools (Pomodoro timer etc.) can make the pet speak ---
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

  // --- 👋 Say hello on the first visit each day ---
  useEffect(() => {
    try {
      const key = "xh-pet-greeted";
      const today = new Date().toDateString();
      if (localStorage.getItem(key) !== today) {
        localStorage.setItem(key, today);
        setTimeout(() => speak("You’re here～ let’s do our best again today (๑•̀ㅂ•́)و✧", 7000), 1600);
      }
    } catch {}
  }, []);

  // --- 🕰️ Stand-up reminder: say something caring after a long stretch with no interaction ---
  useEffect(() => {
    const timer = setTimeout(() => {
      speak("You’ve been sitting for a long time. Stand up and stretch (｡•́︿•̀｡)", 7000);
    }, 12 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [speech]);
  // --- ⏳ Random idle lines ---
  useEffect(() => {
    const randomBarks = [
      "The moon looks good tonight. Shall we do something?",
      "If you’re sleepy, go to bed. This fox will keep watch. ( ˘ ³˘)♥",
      "Is the code done, human? If you can’t write another line, take a break～",
      "Dried fish. This fox wants dried fish (｡•́︿•̀｡)",
      "...Don’t get distracted. Look at this fox.",
      "Remember to get up and move after sitting a while, or your neck will hurt.",
      "Drink some water. This fox does not want you getting a headache.",
      "The way you focus... hmm, it’s tolerable (๑•̀ㅂ•́)و✧",
      "It’s a bit quiet. This fox is listening, take your time.",
      "I’ll admit it quietly: sometimes the night feels too long... but you’re here.",
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

      {/* 💬 Chat bubble */}
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

      {/* 🦊 The fox herself & the interaction buttons */}
      <div className="relative">

        {/* 🌟 Core change: dropped opacity-0 and group-hover so the buttons stay visible */}
        <div className="absolute -left-12 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">

            {/* 💬 Chat button */}
            <button
              onClick={(e) => {
                 e.stopPropagation();
                 setShowInput(!showInput);
              }}
              // A slightly translucent background so the always-on buttons look good on dark backgrounds too
              className="bg-white/90 dark:bg-slate-700/90 p-2.5 rounded-full shadow-md hover:scale-110 active:scale-95 transition-transform border border-gray-100 dark:border-slate-600 text-blue-500 hover:text-blue-600 flex items-center justify-center backdrop-blur-sm"
              title="Chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" />
              </svg>
            </button>

            {/* 🐟 Feeding button */}
            <button
              onClick={handleFeed}
              disabled={isThinking}
              className={`bg-white/90 dark:bg-slate-700/90 p-2.5 rounded-full shadow-md hover:scale-110 active:scale-95 transition-transform border border-gray-100 dark:border-slate-600 flex items-center justify-center backdrop-blur-sm ${isThinking ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Feed a dried fish"
            >
              <span className="text-xl leading-none">🐟</span>
            </button>
        </div>

        {/* The fox herself */}
        <div
          className="w-[120px] h-[120px] relative cursor-pointer"
          style={{ animation: petState === 'walk' ? 'pet-drift 16s ease-in-out infinite' : undefined }}
          onClick={handlePetCat}
        >
          <MoonFox state={showInput && petState === 'idle' ? 'interact' : petState} />
        </div>
      </div>

      {/* ⌨️ Interaction input box */}
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
                placeholder="Say something to Xinyuehu... (talk about your day?)"
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

            {/* ⚡ Quick questions */}
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

            {/* 🔌 Backend switch + clear memory */}
            <div className="flex items-center justify-between mt-2 px-1 pb-0.5">
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-400 dark:text-slate-500">Brain:</span>
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
                  speak('This fox has already forgotten what just happened～', 3000);
                }}
                className="text-[11px] text-slate-400 hover:text-rose-500 dark:text-slate-500"
                title="Clear the multi-turn conversation memory"
              >
                Clear memory{history.length > 0 ? ` (${history.length})` : ''}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
