"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// [Your standalone tool modules are imported here]
import CalculatorTool from './toolbox/CalculatorTool';
import TomatoClock from './toolbox/TomatoClock';

// [Core architecture: plugin registry]
// To add a tool later, just push another object into this array — fully decoupled!
const TOOL_REGISTRY = [
  { id: 'calc', name: 'Calculator', icon: '🧮', component: <CalculatorTool /> },
  { id: 'tomato', name: 'Pomodoro', icon: '🍅', component: <TomatoClock /> },
  // { id: 'tomato', name: 'Pomodoro', icon: '🍅', component: <TomatoClock /> },
];

export default function GlobalToolbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeToolId, setActiveToolId] = useState<string | null>(null);

  // The currently active tool object
  const activeTool = TOOL_REGISTRY.find(t => t.id === activeToolId);

  return (
    <div className="fixed bottom-6 left-6 z-[9999] flex flex-col items-start gap-3">

      {/* Expanded panel area */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: "bottom left" }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
            className="mb-2 bg-white/70 dark:bg-slate-800/80 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-2xl rounded-3xl p-5 w-80 max-w-[calc(100vw-48px)] max-h-[calc(100dvh-110px)] overflow-y-auto flex flex-col gap-4 overflow-hidden"
          >
            {/* Dynamically rendered: toolbox nav bar */}
            <div className="flex flex-wrap gap-2 border-b border-slate-300/50 dark:border-slate-700/50 pb-3">
              {TOOL_REGISTRY.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => setActiveToolId(activeToolId === tool.id ? null : tool.id)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${activeToolId === tool.id ? 'bg-indigo-300 text-slate-950 shadow-md' : 'bg-white/50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                >
                  {tool.icon} {tool.name}
                </button>
              ))}
            </div>

            {/* Dynamically rendered: the active tool component */}
            <AnimatePresence mode="wait">
              {activeTool ? (
                // Render the standalone component bound in the registry directly
                <div key={activeTool.id}>
                  {activeTool.component}
                </div>
              ) : (
                // Empty-state hint
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="h-48 flex flex-col items-center justify-center text-slate-400 text-xs font-serif text-center px-4"
                >
                  <svg className="w-8 h-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 00-1-1H4a1 1 0 01-1-1V4a1 1 0 011-1h3a1 1 0 001-1v-1z" /></svg>
                  Tap a module above<br/>to activate a tool
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating main toggle button */}
      <button aria-label={isOpen ? "Collapse calculator" : "Open calculator"} aria-expanded={isOpen}
        onClick={() => { setIsOpen(!isOpen); if (!isOpen && !activeToolId) setActiveToolId(TOOL_REGISTRY[0].id); }}
        className={`px-4 h-12 gap-2 rounded-full flex items-center justify-center shadow-xl backdrop-blur-xl border border-white/40 dark:border-white/10 transition-all duration-500 hover:scale-110 active:scale-95 z-50
          ${isOpen ? 'bg-indigo-300 text-slate-950' : 'bg-white/70 dark:bg-slate-800/80 text-slate-700 dark:text-white'}
        `}
      >
        <span aria-hidden="true">{isOpen ? '✕' : '🧮'}</span><span>{isOpen ? 'Close' : 'Calculator'}</span>
      </button>

    </div>
  );
}