// components/WeatherWidget.tsx
// 天气数据来自 Open-Meteo：免费、免密钥、支持跨域，所以纯静态托管也能直接拿到真实数据
"use client";

import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Snowflake, CloudLightning, CloudFog, Loader2 } from 'lucide-react';

// 作者所在地：广东省 深圳市 宝安区
const LOCATION = { latitude: 22.555, longitude: 113.883, city: '深圳市', district: '宝安区' };

type Kind = 'sun' | 'cloud' | 'rain' | 'snow' | 'thunder' | 'fog';
type Weather = { temp: number; text: string; kind: Kind };

// WMO 天气代码 → 中文描述 + 图标类型（Open-Meteo 用的是 WMO 标准）
function describe(code: number): { text: string; kind: Kind } {
  if (code === 0) return { text: '晴', kind: 'sun' };
  if (code <= 2) return { text: '多云', kind: 'cloud' };
  if (code === 3) return { text: '阴', kind: 'cloud' };
  if (code <= 48) return { text: '雾', kind: 'fog' };
  if (code <= 57) return { text: '毛毛雨', kind: 'rain' };
  if (code <= 67) return { text: '雨', kind: 'rain' };
  if (code <= 77) return { text: '雪', kind: 'snow' };
  if (code <= 82) return { text: '阵雨', kind: 'rain' };
  if (code <= 86) return { text: '阵雪', kind: 'snow' };
  return { text: '雷阵雨', kind: 'thunder' };
}

function Icon({ kind }: { kind: Kind }) {
  const size = 38;
  if (kind === 'sun') return <Sun className="text-amber-400" size={size} />;
  if (kind === 'rain') return <CloudRain className="text-blue-400" size={size} />;
  if (kind === 'snow') return <Snowflake className="text-indigo-200" size={size} />;
  if (kind === 'thunder') return <CloudLightning className="text-amber-300" size={size} />;
  if (kind === 'fog') return <CloudFog className="text-slate-400" size={size} />;
  return <Cloud className="text-slate-300" size={size} />;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${LOCATION.latitude}` +
          `&longitude=${LOCATION.longitude}&current=temperature_2m,weather_code&timezone=Asia%2FShanghai`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
        const data = await res.json();
        const code = Number(data?.current?.weather_code);
        const temp = Math.round(Number(data?.current?.temperature_2m));
        if (!Number.isFinite(temp) || !Number.isFinite(code)) throw new Error('返回数据不完整');
        if (!alive) return;
        setWeather({ temp, text: describe(code).text, kind: describe(code).kind });
      } catch {
        if (alive) setFailed(true);
      }
    };

    load();
    // 每 30 分钟刷新一次，长时间挂着页面也不会一直显示旧数据
    const timer = setInterval(load, 30 * 60 * 1000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="w-full h-full rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-6 flex flex-col justify-center transition-all duration-700 hover:scale-[1.02] group relative overflow-hidden">
      <div className={`absolute -right-6 -top-6 w-32 h-32 blur-3xl rounded-full transition-colors duration-700 ${failed ? 'bg-slate-500/20' : 'bg-indigo-500/20 group-hover:bg-indigo-500/40'}`}></div>

      {!weather && !failed && (
        <div className="flex flex-col items-center gap-3 text-slate-500 w-full justify-center relative z-10">
          <Loader2 className="animate-spin text-indigo-400" size={28} />
          <span className="text-[10px] font-black tracking-widest uppercase">正在读取深圳天气…</span>
        </div>
      )}

      {failed && (
        <div className="flex flex-col items-center gap-2 text-slate-500 w-full justify-center relative z-10 text-center">
          <CloudFog className="text-slate-400" size={28} />
          <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">Weather offline</span>
          <span className="text-xs font-bold">天气信号暂时没接通</span>
        </div>
      )}

      {weather && !failed && (
        <div className="flex items-center justify-between relative z-10 w-full">
          <div className="flex flex-col flex-1 pr-2">
            <span className="text-[10px] font-black uppercase tracking-widest mb-1 text-indigo-500 dark:text-indigo-400">
              SHENZHEN · BAO&apos;AN
            </span>
            <span className="text-base font-bold text-slate-800 dark:text-white line-clamp-1">
              {LOCATION.city} {LOCATION.district}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tighter">{weather.temp}°</span>
              <span className="text-xs font-bold text-slate-500">{weather.text}</span>
            </div>
          </div>
          <div className="relative z-10 group-hover:scale-110 transition-transform duration-500 drop-shadow-md">
            <Icon kind={weather.kind} />
          </div>
        </div>
      )}
    </div>
  );
}
