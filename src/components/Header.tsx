import React, { useState, useEffect } from 'react';
import { Sparkles, Activity, Clock, Info, Github } from 'lucide-react';

interface HeaderProps {
  apiStatus: string;
  isLiveConnected: boolean;
  onOpenInfo: () => void;
  onOpenGitHub?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  apiStatus,
  isLiveConnected,
  onOpenInfo,
  onOpenGitHub,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString('my-MM', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }) ||
        now.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="relative overflow-hidden text-white bg-gradient-to-r from-[#2414a7] via-[#6532ed] to-[#078bea] rounded-b-[28px] shadow-[0_8px_30px_rgba(49,39,181,0.25)] px-4 py-5 md:py-6">
      {/* Subtle decorative glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>

      <div className="max-w-[1100px] mx-auto flex items-center justify-between gap-3 relative z-10">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 md:w-14 md:h-14 grid place-items-center flex-shrink-0 rounded-[18px] bg-gradient-to-tr from-[#00dcff] to-[#a12bff] font-black text-2xl md:text-3xl text-white shadow-[0_6px_20px_rgba(0,217,255,0.4)] tracking-wider">
            2D
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-3xl font-extrabold tracking-tight leading-none">
                2D Analysis Tool
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-xs border border-white/30">
                <Sparkles className="w-2.5 h-2.5 text-yellow-300" /> Pro Edition
              </span>
            </div>
            <p className="text-xs md:text-sm text-blue-100/90 font-medium mt-1">
              Data • Analysis • Better Decisions
            </p>
          </div>
        </div>

        {/* Live Badge & Date */}
        <div className="flex items-center gap-2">
          {onOpenGitHub && (
            <button
              onClick={onOpenGitHub}
              title="GitHub Sync & Autobuild Setup"
              className="hidden sm:flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 text-white/95 border border-white/25 px-3 py-2 rounded-xl transition cursor-pointer"
            >
              <Github className="w-3.5 h-3.5 text-white" />
              <span className="font-semibold">GitHub Sync</span>
            </button>
          )}

          <button
            onClick={onOpenInfo}
            title="SET Index တွက်ချက်ပုံ သိကောင်းစရာ"
            className="hidden lg:flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 text-white/90 border border-white/20 px-3 py-2 rounded-xl transition cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-cyan-300" />
            <span className="font-medium">SET အကြောင်း</span>
          </button>

          <div className="text-right px-3 py-1.5 md:py-2 border border-white/20 bg-white/10 backdrop-blur-md rounded-2xl shadow-sm text-xs md:text-sm">
            <div className="flex items-center justify-end gap-1.5 font-semibold">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  isLiveConnected
                    ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]'
                    : 'bg-emerald-300'
                }`}
              ></span>
              <span className="text-xs tracking-wide">{apiStatus}</span>
            </div>
            <div className="flex items-center justify-end gap-1 text-[11px] text-blue-100 font-mono mt-0.5">
              <Clock className="w-3 h-3 opacity-75" />
              <span>{currentTime}</span>
              <span className="opacity-40">•</span>
              <span>{currentDate}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
