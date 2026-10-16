import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostContext';
import {
  Flame,
  PlusCircle,
  ShieldCheck,
  User as UserIcon,
  Search,
  BookOpen,
  LogOut,
  Sparkles,
  Award,
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'feed' | 'trending' | 'moderation';
  setCurrentTab: (tab: 'feed' | 'trending' | 'moderation') => void;
  onOpenCreate: () => void;
  onOpenProfile: () => void;
  onOpenLogin: () => void;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenCreate,
  onOpenProfile,
  onOpenLogin,
  onOpenGuide,
}) => {
  const { user, isAdmin, signOut } = useAuth();
  const { searchQuery, setSearchQuery, pendingPosts } = usePosts();
  const [showSearchMobile, setShowSearchMobile] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FFD719] border-b-[3px] border-[#111111] px-4 py-3 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo & Tagline */}
        <div
          onClick={() => setCurrentTab('feed')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-11 h-11 bg-[#FFF9F0] border-[2.5px] border-[#111111] rounded-xl flex items-center justify-center shadow-brutal-sm group-hover:-rotate-3 transition-transform">
            <span className="text-2xl">💀</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-xl md:text-2xl tracking-tight text-[#111111]">
                CAMPUS WALL <span className="bg-[#FF4388] text-white px-1.5 py-0.5 rounded-md text-sm border-2 border-[#111111] shadow-brutal-xs uppercase">OF FAME</span>
              </span>
            </div>
            <p className="text-[11px] font-bold text-[#111111]/80 hidden sm:block tracking-wide">
              YOUR CAMPUS. YOUR CHAOS. 🔥
            </p>
          </div>
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search captions, moments, roasts..."
              className="w-full bg-[#FFF9F0] text-[#111111] placeholder:text-[#777777] font-medium text-sm pl-10 pr-4 py-2 rounded-lg border-[2.5px] border-[#111111] shadow-brutal-sm focus:outline-none focus:bg-white focus:shadow-brutal transition-all"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#111111]" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs font-bold text-gray-500 hover:text-black"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Search Toggle Mobile */}
          <button
            onClick={() => setShowSearchMobile(!showSearchMobile)}
            className="md:hidden p-2 bg-[#FFF9F0] border-2 border-[#111111] rounded-lg shadow-brutal-xs btn-press"
            aria-label="Toggle Search"
          >
            <Search className="w-5 h-5 text-[#111111]" />
          </button>

          {/* Trending Tab Button */}
          <button
            onClick={() => setCurrentTab(currentTab === 'trending' ? 'feed' : 'trending')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-[#111111] font-display font-bold text-xs uppercase tracking-wider btn-press ${
              currentTab === 'trending'
                ? 'bg-[#FF4388] text-white shadow-brutal-xs'
                : 'bg-[#FFF9F0] text-[#111111] hover:bg-[#ffe170]'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Trending</span>
          </button>

          {/* Moderation Dashboard for Admins */}
          {isAdmin && (
            <button
              onClick={() => setCurrentTab(currentTab === 'moderation' ? 'feed' : 'moderation')}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-[#111111] font-display font-bold text-xs uppercase tracking-wider btn-press ${
                currentTab === 'moderation'
                  ? 'bg-[#8055F5] text-white shadow-brutal-xs'
                  : 'bg-[#FFF9F0] text-[#111111] hover:bg-[#e0d4ff]'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Mod Queue</span>
              {pendingPosts.length > 0 && (
                <span className="w-5 h-5 bg-[#FF4388] text-white text-[10px] font-black rounded-full flex items-center justify-center border border-[#111111] -mr-1">
                  {pendingPosts.length}
                </span>
              )}
            </button>
          )}

          {/* Setup & Security Guide Button */}
          <button
            onClick={onOpenGuide}
            title="Firebase Setup, Rules & Deployment Guide"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-[#39D62D] text-[#111111] border-2 border-[#111111] rounded-lg font-display font-bold text-xs uppercase tracking-wider shadow-brutal-xs btn-press"
          >
            <BookOpen className="w-4 h-4" />
            <span>Setup & Rules</span>
          </button>

          {/* Post Moment CTA */}
          <button
            onClick={user ? onOpenCreate : onOpenLogin}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FF4388] text-white border-[2.5px] border-[#111111] rounded-lg font-display font-black text-xs uppercase tracking-wider shadow-brutal-sm btn-press active:translate-x-[2px] active:translate-y-[2px]"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden xs:inline">Post Chaos</span>
            <span className="xs:hidden">Post</span>
          </button>

          {/* User Profile or Sign In */}
          {user ? (
            <div className="flex items-center gap-1.5 ml-1">
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-1.5 p-1 bg-[#FFF9F0] border-2 border-[#111111] rounded-lg shadow-brutal-xs hover:bg-white btn-press"
                title={`${user.displayName} (${user.email})`}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-7 h-7 rounded-md object-cover border border-[#111111]"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-md bg-[#8055F5] text-white font-bold flex items-center justify-center text-xs">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="font-display font-bold text-xs max-w-[80px] truncate hidden md:inline">
                  {user.displayName.split(' ')[0]}
                </span>
              </button>

              <button
                onClick={signOut}
                className="p-1.5 bg-[#FFF9F0] hover:bg-[#ffdad6] border-2 border-[#111111] rounded-lg shadow-brutal-xs btn-press text-red-700"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF9F0] border-2 border-[#111111] rounded-lg font-display font-bold text-xs uppercase tracking-wider shadow-brutal-xs hover:bg-white btn-press"
            >
              <UserIcon className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Search Input expansion */}
      {showSearchMobile && (
        <div className="mt-2 md:hidden">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search captions, moments, roasts..."
              autoFocus
              className="w-full bg-[#FFF9F0] text-[#111111] placeholder:text-[#777777] font-medium text-sm pl-10 pr-4 py-2 rounded-lg border-2 border-[#111111] shadow-brutal-xs focus:outline-none"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#111111]" />
          </div>
        </div>
      )}

    </header>
  );
};
