// components/WeatherWidget.tsx
// Weather data comes from Open-Meteo: free, no API key, CORS-enabled, so even a pure static host can fetch real data directly
"use client";

import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Snowflake, CloudLightning, CloudFog, Loader2 } from 'lucide-react';

// Where the author is: Bao'an District, Shenzhen, Guangdong
const LOCATION = { latitude: 22.555, longitude: 113.883, city: "Shenzhen", district: "Bao'an District" };

type Kind = 'sun' | 'cloud' | 'rain' | 'snow' | 'thunder' | 'fog';
type Weather = { temp: number; text: string; kind: Kind };

// WMO weather code → description + icon type (Open-Meteo uses the WMO standard)
function describe(code: number): { text: string; kind: Kind } {
  if (code === 0) return { text: 'Clear', kind: 'sun' };
  if (code <= 2) return { text: 'Partly cloudy', kind: 'cloud' };
  if (code === 3) return { text: 'Overcast', kind: 'cloud' };
  if (code <= 48) return { text: 'Fog', kind: 'fog' };
  if (code <= 57) return { text: 'Drizzle', kind: 'rain' };
  if (code <= 67) return { text: 'Rain', kind: 'rain' };
  if (code <= 77) return { text: 'Snow', kind: 'snow' };
  if (code <= 82) return { text: 'Showers', kind: 'rain' };
  if (code <= 86) return { text: 'Snow showers', kind: 'snow' };
  return { text: 'Thunderstorms', kind: 'thunder' };
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
        if (!Number.isFinite(temp) || !Number.isFinite(code)) throw new Error('Incomplete response data');
        if (!alive) return;
        setWeather({ temp, text: describe(code).text, kind: describe(code).kind });
      } catch {
        if (alive) setFailed(true);
      }
    };

    load();
    // refresh every 30 minutes so a page left open does not keep showing stale data
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
          <span className="text-[10px] font-black tracking-widest uppercase">Reading Shenzhen weather…</span>
        </div>
      )}

      {failed && (
        <div className="flex flex-col items-center gap-2 text-slate-500 w-full justify-center relative z-10 text-center">
          <CloudFog className="text-slate-400" size={28} />
          <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">Weather offline</span>
          <span className="text-xs font-bold">Weather signal is not coming through</span>
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
