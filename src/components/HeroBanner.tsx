import React from 'react';
import { Sparkles, Camera, ShieldCheck, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeroBannerProps {
  onOpenCreate: () => void;
  onOpenLogin: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onOpenCreate, onOpenLogin }) => {
  const { user } = useAuth();

  return (
    <div className="relative mb-8 pt-4 pb-2">
      {/* Decorative Die-cut Stickers */}
      <div className="absolute -top-1 right-4 md:right-16 rotate-6 z-10 hidden sm:block">
        <div className="bg-[#FF4388] text-white px-3 py-1.5 rounded-full border-2 border-[#111111] shadow-brutal-sm font-display font-extrabold text-xs uppercase tracking-wider flex items-center gap-1">
          <span>🔥</span> 100% CERTIFIED CHAOS
        </div>
      </div>

      <div className="absolute top-12 -left-3 -rotate-6 z-10 hidden md:block">
        <div className="bg-[#39D62D] text-[#111111] px-3 py-1 rounded-md border-2 border-[#111111] shadow-brutal-xs font-display font-black text-xs uppercase tracking-widest flex items-center gap-1">
          <span>⭐</span> ONLY @CVV.AC.IN
        </div>
      </div>

      {/* Main Hero Card */}
      <div className="bg-[#FFF9F0] border-[3px] border-[#111111] rounded-2xl p-6 sm:p-8 md:p-10 shadow-brutal-lg relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-dots-pattern opacity-10 pointer-events-none" />

        {/* Asymmetrical folder-tab top accent */}
        <div className="inline-flex items-center gap-2 bg-[#8055F5] text-white px-3 py-1 rounded-md border-2 border-[#111111] shadow-brutal-xs font-display font-extrabold text-xs uppercase tracking-wider mb-4 -rotate-1">
          <Sparkles className="w-3.5 h-3.5 text-[#FFD719]" />
          <span>OFFICIAL CHINMAYA VISHWAVIDYAPEETH ARCHIVE</span>
        </div>

        <div className="max-w-3xl">
          <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-[#111111] leading-[1.05] tracking-tight mb-4">
            YOUR CAMPUS. <br className="hidden sm:inline" />
            <span className="bg-[#FFD719] px-2 py-0.5 border-2 border-[#111111] shadow-brutal-sm inline-block rotate-1 mt-1">
              YOUR CHAOS. 💀
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl font-medium text-[#111111]/85 mb-6 max-w-2xl leading-relaxed">
            Funny moments deserve fame. The exclusive hall of legends for college roasts, hostel
            hacks, canteen drama, and exam delusions. Shared with consent, voted with laughs.
          </p>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={user ? onOpenCreate : onOpenLogin}
              className="px-6 py-3 bg-[#FF4388] text-white rounded-xl border-[3px] border-[#111111] shadow-brutal font-display font-black text-sm sm:text-base uppercase tracking-wider flex items-center gap-2 btn-press"
            >
              <Camera className="w-5 h-5 stroke-[2.5]" />
              <span>Post a Legendary Moment</span>
            </button>

            <div className="flex items-center gap-2 px-3 py-2 bg-[#FFD719] border-2 border-[#111111] rounded-xl shadow-brutal-xs text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-[#111111]" />
              <span>Moderated & Consent-Checked</span>
            </div>
          </div>
        </div>

        {/* Bottom ticker bar */}
        <div className="mt-8 pt-4 border-t-2 border-[#111111]/20 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-[#111111]/80">
          <div className="flex items-center gap-1.5">
            <span className="text-lg">😂</span>
            <span>Laugh</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-lg">💀</span>
            <span>Dead/Skull</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-lg">🤡</span>
            <span>Clown Moment</span>
          </div>

          <div className="flex items-center gap-2 bg-[#FFF9F0] px-2.5 py-1 rounded-md border border-[#111111]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#39D62D] inline-block border border-black" />
            <span className="font-display uppercase text-[11px] tracking-wider">Live Feed Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
