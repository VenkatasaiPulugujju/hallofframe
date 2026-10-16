import React, { useState } from 'react';
import { usePosts } from '../context/PostContext';
import type { Post } from '../types';
import { PostCard } from './PostCard';
import { Trophy, Crown } from 'lucide-react';

interface TrendingViewProps {
  onOpenDetail: (post: Post) => void;
  onOpenReport: (post: Post) => void;
  onBackToFeed: () => void;
}

export const TrendingView: React.FC<TrendingViewProps> = ({
  onOpenDetail,
  onOpenReport,
  onBackToFeed,
}) => {
  const { trendingPosts } = usePosts();
  const [timeFilter, setTimeFilter] = useState<'today' | 'all-time'>('today');

  const postOfTheDay = trendingPosts[0];
  const runnerUps = trendingPosts.slice(1);

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Trending Header Banner */}
      <div className="bg-[#8055F5] text-white border-[3px] border-[#111111] rounded-2xl p-6 sm:p-8 shadow-brutal-lg relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#FFD719] text-[#111111] px-3 py-1 rounded-md border-2 border-[#111111] font-display font-black text-xs uppercase tracking-wider mb-3 shadow-brutal-xs">
              <Trophy className="w-3.5 h-3.5" />
              <span>HALL OF CAMPUS LEGENDS</span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl tracking-tight text-white">
              TRENDING CHAOS RANKINGS 👑
            </h2>
            <p className="text-sm sm:text-base font-medium text-white/90 mt-1 max-w-xl">
              The highest-voted moments voted by Chinmaya Vishwavidyapeeth students. No looks-ranking
              or personal roasts — strictly celebrating peak college chaos.
            </p>
          </div>

          {/* Time range selector */}
          <div className="flex items-center gap-2 bg-[#FFF9F0] p-1.5 rounded-xl border-2 border-[#111111] shadow-brutal-sm">
            <button
              onClick={() => setTimeFilter('today')}
              className={`px-3 py-1.5 rounded-lg font-display font-bold text-xs uppercase tracking-wider transition-all btn-press ${
                timeFilter === 'today'
                  ? 'bg-[#FF4388] text-white shadow-brutal-xs'
                  : 'text-[#111111] hover:bg-gray-100'
              }`}
            >
              Today's Viral
            </button>
            <button
              onClick={() => setTimeFilter('all-time')}
              className={`px-3 py-1.5 rounded-lg font-display font-bold text-xs uppercase tracking-wider transition-all btn-press ${
                timeFilter === 'all-time'
                  ? 'bg-[#FF4388] text-white shadow-brutal-xs'
                  : 'text-[#111111] hover:bg-gray-100'
              }`}
            >
              All-Time Legends
            </button>
          </div>
        </div>
      </div>

      {trendingPosts.length === 0 ? (
        <div className="bg-[#FFF9F0] border-[3px] border-[#111111] rounded-2xl p-12 text-center shadow-brutal-lg max-w-lg mx-auto my-6">
          <div className="w-16 h-16 bg-[#FFD719] rounded-2xl border-2 border-[#111111] mx-auto flex items-center justify-center text-3xl mb-3 shadow-brutal-xs">
            👑
          </div>
          <h3 className="font-display font-black text-2xl text-[#111111] mb-2">
            No legendary moments yet.
          </h3>
          <p className="text-sm font-semibold text-gray-700 mb-6">
            Be the first to make campus history.
          </p>
          <button
            onClick={onBackToFeed}
            className="px-5 py-2.5 bg-[#FF4388] text-white border-2 border-[#111111] rounded-xl font-display font-black text-xs uppercase tracking-wider shadow-brutal-xs btn-press"
          >
            Back to Feed
          </button>
        </div>
      ) : (
        <>
          {/* Post of the Day Spotlight Card */}
          {postOfTheDay && (
            <div className="bg-[#FFD719] border-[3px] border-[#111111] rounded-2xl p-6 shadow-brutal-xl relative">
              <div className="absolute -top-3.5 left-6 bg-[#FF4388] text-white px-4 py-1 rounded-full border-2 border-[#111111] font-display font-black text-xs uppercase tracking-widest shadow-brutal-xs flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-[#FFD719]" />
                <span>#1 POST OF THE DAY</span>
              </div>

              <div className="mt-2 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div
                  className="lg:col-span-7 aspect-[16/10] bg-black rounded-xl border-[2.5px] border-[#111111] overflow-hidden shadow-brutal cursor-pointer group"
                  onClick={() => onOpenDetail(postOfTheDay)}
                >
                  <img
                    src={postOfTheDay.imageUrl}
                    alt={postOfTheDay.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="lg:col-span-5 space-y-4">
                  <div className="inline-block bg-[#8055F5] text-white px-3 py-1 rounded-full border-2 border-[#111111] font-display font-black text-xs uppercase tracking-wider shadow-brutal-xs">
                    {postOfTheDay.category}
                  </div>

                  <h3 className="font-display font-black text-2xl sm:text-3xl text-[#111111] leading-tight">
                    "{postOfTheDay.caption}"
                  </h3>

                  <div className="text-xs font-bold text-gray-800">
                    Archived by <span className="underline">{postOfTheDay.authorDisplayName}</span>
                  </div>

                  {/* Aggregated score counter */}
                  <div className="bg-[#FFF9F0] p-3 sm:p-4 rounded-xl border-2 border-[#111111] shadow-brutal-sm flex items-center justify-around">
                    <div className="text-center">
                      <div className="text-xl">😂</div>
                      <div className="font-display font-black text-base text-[#111111]">
                        {postOfTheDay.reactionCounts.laugh}
                      </div>
                      <div className="text-[10px] uppercase font-bold text-gray-500">Laughs</div>
                    </div>
                    <div className="h-8 w-[2px] bg-[#111111]/20" />
                    <div className="text-center">
                      <div className="text-xl">💀</div>
                      <div className="font-display font-black text-base text-[#111111]">
                        {postOfTheDay.reactionCounts.skull}
                      </div>
                      <div className="text-[10px] uppercase font-bold text-gray-500">Skulls</div>
                    </div>
                    <div className="h-8 w-[2px] bg-[#111111]/20" />
                    <div className="text-center">
                      <div className="text-xl">🤡</div>
                      <div className="font-display font-black text-base text-[#111111]">
                        {postOfTheDay.reactionCounts.clown}
                      </div>
                      <div className="text-[10px] uppercase font-bold text-gray-500">Clowns</div>
                    </div>
                    <div className="h-8 w-[2px] bg-[#111111]/20" />
                    <div className="text-center">
                      <div className="text-xl">❤️</div>
                      <div className="font-display font-black text-base text-[#111111]">
                        {postOfTheDay.reactionCounts.heart || 0}
                      </div>
                      <div className="text-[10px] uppercase font-bold text-gray-500">Hearts</div>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenDetail(postOfTheDay)}
                    className="w-full py-2.5 bg-[#111111] text-white rounded-xl font-display font-black text-xs uppercase tracking-wider shadow-brutal-sm btn-press"
                  >
                    Inspect Moment & React
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Grid */}
          {runnerUps.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-black text-2xl text-[#111111]">
                  CAMPUS LEADERBOARD RUNNERS-UP
                </h3>
                <span className="text-xs font-bold text-gray-700">
                  {runnerUps.length} Ranked Posts
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {runnerUps.map((post, index) => {
                  const rank = index + 2;
                  const rankColor =
                    rank === 2
                      ? 'bg-[#39D62D]'
                      : rank === 3
                      ? 'bg-[#FF4388] text-white'
                      : 'bg-[#FFF9F0]';

                  return (
                    <div key={post.postId} className="relative">
                      <div
                        className={`absolute -top-3 left-4 z-10 px-3 py-0.5 rounded-lg border-2 border-[#111111] font-display font-black text-xs shadow-brutal-xs ${rankColor}`}
                      >
                        #{rank} RANKED
                      </div>
                      <PostCard
                        post={post}
                        onOpenDetail={onOpenDetail}
                        onOpenReport={onOpenReport}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
