"use client";

import React from 'react';

export type PetState = 'idle' | 'petted' | 'thinking';

/**
 * 桌宠形象：Q 版银白狐灵「心月狐」（原创 SVG，不依赖任何外部图片）
 * - idle     ：轻轻飘浮，尾巴左右摆，偶尔抖耳朵
 * - petted   ：眯眼笑，腮红变浓，星辉闪得更快
 * - thinking ：半睁眼，头顶浮现旋转的月环
 * 支持 prefers-reduced-motion：系统开启「减少动态效果」时保持静止。
 */
export default function MoonFox({ state = 'idle' }: { state?: PetState }) {
  return (
    <svg viewBox="0 0 120 120" className={`moonfox moonfox--${state} w-full h-full overflow-visible`} role="img" aria-label="Q 版心月狐">
      <defs>
        <radialGradient id="mf-glow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#c7d2fe" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="mf-fur" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#eaefff" />
          <stop offset="100%" stopColor="#c6d2f6" />
        </linearGradient>
        <linearGradient id="mf-tail" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f1f4ff" />
          <stop offset="65%" stopColor="#bfcaf5" />
          <stop offset="100%" stopColor="#93a6ea" />
        </linearGradient>
        <linearGradient id="mf-moon" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f0abfc" />
        </linearGradient>
      </defs>

      <circle cx="60" cy="60" r="48" fill="url(#mf-glow)" opacity={state === 'thinking' ? 0.95 : 0.65} />

      <g className="mf-body">
        {/* 大尾巴（Q 版：粗、卷） */}
        <g className="mf-tail">
          <path
            d="M80 90c19 4 31-6 29-21-2-13-14-18-24-13 11 3 17 11 15 19-2 9-11 14-20 15z"
            fill="url(#mf-tail)"
          />
          <path d="M88 56c9 2 14 10 12 18 5-10-1-17-12-18z" fill="#ffffff" opacity="0.85" />
        </g>

        {/* 小身体 */}
        <ellipse cx="60" cy="90" rx="21" ry="17" fill="url(#mf-fur)" />
        <ellipse cx="60" cy="95" rx="12" ry="10" fill="#ffffff" opacity="0.9" />

        {/* 短爪 */}
        <ellipse cx="48" cy="106" rx="7.5" ry="4.4" fill="#e3e9ff" />
        <ellipse cx="72" cy="106" rx="7.5" ry="4.4" fill="#e3e9ff" />

        {/* 大耳朵 */}
        <g className="mf-ear mf-ear-l">
          <path d="M38 32 30 6l28 16z" fill="url(#mf-fur)" stroke="#e9edff" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M39 29 35 13l17 8z" fill="#f9c9dd" />
        </g>
        <g className="mf-ear mf-ear-r">
          <path d="M82 32 90 6 62 22z" fill="url(#mf-fur)" stroke="#e9edff" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M81 29 85 13l-17 8z" fill="#f9c9dd" />
        </g>

        {/* 大头（Q 版比例：头几乎和身体一样大） */}
        <circle cx="60" cy="52" r="31" fill="url(#mf-fur)" />

        {/* 额上月纹 */}
        <path className="mf-mark" d="M60 24a8.5 8.5 0 1 0 0 17 6.4 6.4 0 1 1 0-17z" fill="url(#mf-moon)" />

        {/* 眼睛 */}
        {state === 'petted' ? (
          <g stroke="#333a63" strokeWidth="2.6" strokeLinecap="round" fill="none">
            <path d="M43 53q5-6 10 0" />
            <path d="M67 53q5-6 10 0" />
          </g>
        ) : (
          <g>
            <ellipse cx="48" cy="53" rx="5.2" ry={state === 'thinking' ? 3 : 6.4} fill="#333a63" />
            <ellipse cx="72" cy="53" rx="5.2" ry={state === 'thinking' ? 3 : 6.4} fill="#333a63" />
            <circle cx="46.2" cy="50.6" r="2.2" fill="#ffffff" />
            <circle cx="70.2" cy="50.6" r="2.2" fill="#ffffff" />
            <circle cx="49.6" cy="55.6" r="1.1" fill="#ffffff" opacity="0.9" />
            <circle cx="73.6" cy="55.6" r="1.1" fill="#ffffff" opacity="0.9" />
            {state === 'thinking' && (
              <g stroke="#333a63" strokeWidth="1.3" fill="none" opacity="0.7">
                <path d="M42 59h11" />
                <path d="M67 59h11" />
              </g>
            )}
          </g>
        )}

        {/* 腮红 */}
        <g fill="#f9a8d4" opacity={state === 'petted' ? 0.75 : 0.45}>
          <ellipse cx="39" cy="62" rx="6.4" ry="3.8" />
          <ellipse cx="81" cy="62" rx="6.4" ry="3.8" />
        </g>

        {/* 口鼻 */}
        <ellipse cx="60" cy="68" rx="9.5" ry="6.4" fill="#ffffff" opacity="0.95" />
        <path d="M60 64.4l3.2 2.8h-6.4z" fill="#333a63" />
        <path d="M60 69q-2.6 2.4-4.6 0" stroke="#333a63" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        <path d="M60 69q2.6 2.4 4.6 0" stroke="#333a63" strokeWidth="1.3" fill="none" strokeLinecap="round" />

        {/* 胡须 */}
        <g stroke="#cfd8f7" strokeWidth="1.1" strokeLinecap="round" opacity="0.9">
          <path d="M33 64h-9" />
          <path d="M35 70l-9 2" />
          <path d="M87 64h9" />
          <path d="M85 70l9 2" />
        </g>

        {/* 星辉 */}
        <g className="mf-sparkle mf-sparkle-1" fill="url(#mf-moon)">
          <path d="M24 42l2 4.6L30.6 48 26 50.6 24 55.4l-2-4.8L17.4 48 22 46.6z" />
        </g>
        <g className="mf-sparkle mf-sparkle-2" fill="#a5b4fc">
          <path d="M97 34l1.6 3.6L102 39l-3.6 1.4L97 44l-1.6-3.6L92 39l3.4-1.4z" />
        </g>
        <g className="mf-sparkle mf-sparkle-3" fill="#f9a8d4">
          <path d="M28 82l1.4 3.2L32.6 86l-3.2 1.4L28 90.6l-1.4-3.2L23.4 86l3.2-1.4z" />
        </g>

        {/* 思考时的月环 */}
        <g className="mf-halo">
          <circle cx="60" cy="52" r="39" fill="none" stroke="#a5b4fc" strokeWidth="1.8" strokeDasharray="7 9" opacity="0.9" />
        </g>
      </g>

      <style>{`
        .moonfox { transform-origin: 50% 60%; }
        .moonfox .mf-body { animation: mf-float 3.8s ease-in-out infinite; }
        .moonfox .mf-tail { transform-origin: 80px 90px; animation: mf-tail 2.8s ease-in-out infinite; }
        .moonfox .mf-ear { animation: mf-ear 5s ease-in-out infinite; }
        .moonfox .mf-ear-l { transform-origin: 38px 32px; }
        .moonfox .mf-ear-r { transform-origin: 82px 32px; }
        .moonfox .mf-sparkle { transform-origin: center; animation: mf-twinkle 2.6s ease-in-out infinite; }
        .moonfox .mf-sparkle-2 { animation-delay: .6s; }
        .moonfox .mf-sparkle-3 { animation-delay: 1.2s; }
        .moonfox .mf-halo { opacity: 0; }
        .moonfox .mf-mark { animation: mf-mark 4s ease-in-out infinite; }

        .moonfox--petted { animation: mf-happy 1.6s ease-in-out infinite; }
        .moonfox--petted .mf-tail { animation-duration: 1.1s; }
        .moonfox--petted .mf-sparkle { animation-duration: 1s; }
        .moonfox--petted .mf-ear { animation-duration: 1.2s; }

        .moonfox--thinking .mf-body { animation-duration: 2.2s; }
        .moonfox--thinking .mf-halo { opacity: .85; transform-origin: 60px 52px; animation: mf-spin 3s linear infinite; }

        @keyframes mf-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes mf-happy { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-3px) scale(1.06); } }
        @keyframes mf-tail { 0%,100% { transform: rotate(-7deg); } 50% { transform: rotate(9deg); } }
        @keyframes mf-ear { 0%,88%,100% { transform: rotate(0deg); } 92% { transform: rotate(-7deg); } 96% { transform: rotate(3deg); } }
        @keyframes mf-twinkle { 0%,100% { opacity: .3; transform: scale(.85); } 50% { opacity: 1; transform: scale(1.15); } }
        @keyframes mf-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes mf-mark { 0%,100% { opacity: .85; } 50% { opacity: 1; } }

        @media (prefers-reduced-motion: reduce) {
          .moonfox, .moonfox * { animation: none !important; }
        }
      `}</style>
    </svg>
  );
}