import React from 'react';
import { Home, Award, PlusCircle, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostContext';

interface BottomNavigationProps {
  currentTab: 'feed' | 'trending' | 'moderation';
  setCurrentTab: (tab: 'feed' | 'trending' | 'moderation') => void;
  onOpenCreate: () => void;
  onOpenProfile: () => void;
  onOpenLogin: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  setCurrentTab,
  onOpenCreate,
  onOpenProfile,
  onOpenLogin,
}) => {
  const { user, isAdmin } = useAuth();
  const { pendingPosts } = usePosts();

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFF9F0] border-t-[3px] border-[#111111] px-2 py-2 select-none shadow-[0_-4px_0_rgba(17,17,17,0.15)]">
      <div className="flex items-center justify-around">
        {/* Feed Tab */}
        <button
          onClick={() => setCurrentTab('feed')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg ${
            currentTab === 'feed' ? 'text-[#FF4388] font-black' : 'text-[#111111] font-bold'
          }`}
        >
          <span className="text-lg">💀</span>
          <span className="font-display text-[10px] uppercase tracking-wider">Feed</span>
        </button>

        {/* Trending Tab */}
        <button
          onClick={() => setCurrentTab('trending')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg ${
            currentTab === 'trending' ? 'text-[#FF4388] font-black' : 'text-[#111111] font-bold'
          }`}
        >
          <Award className="w-5 h-5" />
          <span className="font-display text-[10px] uppercase tracking-wider">Trending</span>
        </button>

        {/* Create Post Action Button in Center */}
        <button
          onClick={user ? onOpenCreate : onOpenLogin}
          className="w-12 h-12 -mt-5 bg-[#FF4388] text-white rounded-full border-[3px] border-[#111111] shadow-brutal-sm flex items-center justify-center btn-press active:translate-y-1"
          aria-label="Post Chaos"
        >
          <PlusCircle className="w-7 h-7 stroke-[2.5]" />
        </button>

        {/* Admin Mod Queue or Discover */}
        {isAdmin ? (
          <button
            onClick={() => setCurrentTab('moderation')}
            className={`relative flex flex-col items-center gap-0.5 p-1.5 rounded-lg ${
              currentTab === 'moderation' ? 'text-[#8055F5] font-black' : 'text-[#111111] font-bold'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="font-display text-[10px] uppercase tracking-wider">Mod</span>
            {pendingPosts.length > 0 && (
              <span className="absolute top-0 right-1 w-4 h-4 bg-[#FF4388] text-white text-[9px] font-black rounded-full flex items-center justify-center border border-black">
                {pendingPosts.length}
              </span>
            )}
          </button>
        ) : (
          <div className="flex flex-col items-center gap-0.5 p-1.5 text-gray-400">
            <span className="text-lg">⚡</span>
            <span className="font-display text-[10px] uppercase tracking-wider">CVV</span>
          </div>
        )}

        {/* User Profile */}
        <button
          onClick={user ? onOpenProfile : onOpenLogin}
          className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg text-[#111111] font-bold"
        >
          <UserIcon className="w-5 h-5" />
          <span className="font-display text-[10px] uppercase tracking-wider">
            {user ? 'Profile' : 'Login'}
          </span>
        </button>
      </div>
    </nav>
  );
};
