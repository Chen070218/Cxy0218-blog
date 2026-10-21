"use client";
import { useTheme } from './ThemeProvider';
import Fireflies from './Fireflies';
import Sakura from './Sakura';
import WindyGrass from './WindyGrass';

export default function BackgroundEffects() {
  const { isDark } = useTheme();

  return (
    <>
      {/* The core trick: switch effect components based on isDark */}
      <div className={`transition-opacity duration-1000 ${isDark ? 'opacity-100' : 'opacity-0'}`}>
        <Fireflies />
      </div>
      <div className={`transition-opacity duration-1000 ${isDark ? 'opacity-0' : 'opacity-100'}`}>
        <Sakura />
      </div>

      {/* The grass is always there, but it changes color on its own inside */}
      <WindyGrass />
    </>
  );
}