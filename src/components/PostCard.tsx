import React, { useState } from 'react';
import type { Post, ReactionType } from '../types';
import { usePosts } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';
import { Share2, Flag, Check, MessageSquare, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PostCardProps {
  post: Post;
  onOpenDetail: (post: Post) => void;
  onOpenReport: (post: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onOpenDetail, onOpenReport }) => {
  const { userReactions, toggleReaction, deleteOwnPost } = usePosts();
  const { user, isAdmin } = useAuth();
  const [copied, setCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const activeReaction = userReactions[post.postId];
  const isAuthor = user?.uid === post.authorUid;

  // Format time relative
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMinutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
      if (diffMinutes < 60) return `${Math.max(1, diffMinutes)}m ago`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch {
      return 'Recently';
    }
  };

  const handleReactionClick = (e: React.MouseEvent, type: ReactionType) => {
    e.stopPropagation();
    if (!user) {
      alert('Please sign in with your @cvv.ac.in account to react!');
      return;
    }

    // Trigger celebratory micro-confetti on skull or heart
    if ((type === 'skull' || type === 'heart') && activeReaction !== type) {
      confetti({
        particleCount: 16,
        spread: 45,
        origin: { y: 0.8 },
        colors:
          type === 'heart'
            ? ['#FF2A6D', '#FF4388', '#FFD719', '#FFFFFF']
            : ['#111111', '#FF4388', '#FFD719'],
      });
    }

    toggleReaction(post.postId, type);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${url}#${post.postId}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Hostel Shenanigans':
        return 'bg-[#8055F5] text-white';
      case 'Canteen Chronicles':
        return 'bg-[#39D62D] text-[#111111]';
      case 'Exam Brainrot':
        return 'bg-[#FF4388] text-white';
      case 'Lab Disasters':
        return 'bg-[#FFD719] text-[#111111]';
      case 'Fest Fever':
        return 'bg-[#8055F5] text-white';
      case 'Library Stealth':
        return 'bg-[#39D62D] text-[#111111]';
      default:
        return 'bg-[#FFD719] text-[#111111]';
    }
  };

  return (
    <article
      onClick={() => onOpenDetail(post)}
      className="group relative bg-[#FFF9F0] border-[3px] border-[#111111] rounded-2xl shadow-brutal hover:shadow-brutal-lg transition-all duration-150 cursor-pointer flex flex-col justify-between overflow-hidden"
    >
      {/* Folder Tab Cutout on Top Left */}
      <div className="pt-3 px-4 flex items-center justify-between border-b-2 border-[#111111]/15 pb-2.5">
        <div className="flex items-center gap-2">
          {/* Asymmetrical folder category badge */}
          <span
            className={`px-2.5 py-0.5 rounded-full border-2 border-[#111111] font-display font-extrabold text-[11px] uppercase tracking-wider shadow-brutal-xs ${getCategoryColor(
              post.category
            )}`}
          >
            {post.category}
          </span>
          <span className="text-[11px] font-bold text-gray-500">
            {formatTime(post.createdAt)}
          </span>
        </div>

        {/* Options: Author Delete or Flag Report */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {isAuthor || isAdmin ? (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to remove this post?')) {
                  deleteOwnPost(post.postId);
                }
              }}
              title="Remove post"
              className="p-1 hover:bg-[#ffdad6] rounded-md text-red-600 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => onOpenReport(post)}
              title="Report post"
              className="p-1 hover:bg-[#ffe170] rounded-md text-gray-600 transition-colors"
            >
              <Flag className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Post Photo Container */}
      <div className="relative w-full aspect-[4/3] bg-[#e5e2e1] overflow-hidden border-b-2 border-[#111111]">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
            <span className="font-display font-bold text-xs text-gray-400">Loading chaos...</span>
          </div>
        )}
        <img
          src={post.imageUrl}
          alt={post.caption}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02] ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Verified Student watermark badge */}
        <div className="absolute bottom-2 left-2 bg-[#FFF9F0]/90 backdrop-blur-xs px-2 py-0.5 rounded-md border border-[#111111] text-[10px] font-bold flex items-center gap-1 shadow-brutal-xs">
          <span>🏛️</span>
          <span>CVV Archive</span>
        </div>
      </div>

      {/* Caption Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <p className="text-sm font-semibold text-[#111111] leading-snug mb-3">
          {post.caption}
        </p>

        {/* Author signature line */}
        <div className="flex items-center gap-2 mb-3 text-xs font-bold text-gray-600">
          {post.authorPhotoURL ? (
            <img
              src={post.authorPhotoURL}
              alt={post.authorDisplayName}
              className="w-5 h-5 rounded-full object-cover border border-[#111111]"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-[#FFD719] border border-[#111111] flex items-center justify-center text-[10px] font-black">
              {post.authorDisplayName.charAt(0)}
            </div>
          )}
          <span className="truncate max-w-[180px]">{post.authorDisplayName}</span>
        </div>

        {/* Action Footer: Emoji Reaction Pills & Share Trigger */}
        <div
          className="pt-2 border-t-2 border-[#111111]/20 flex items-center justify-between gap-1 select-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Reaction Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Laugh 😂 */}
            <button
              onClick={(e) => handleReactionClick(e, 'laugh')}
              className={`h-8 px-2.5 rounded-full border-2 border-[#111111] flex items-center gap-1 font-display font-black text-xs btn-press ${
                activeReaction === 'laugh'
                  ? 'bg-[#FFD719] shadow-brutal-xs scale-105'
                  : 'bg-[#FFF9F0] hover:bg-[#ffe170] shadow-brutal-xs'
              }`}
              title="Laugh"
            >
              <span className="text-sm">😂</span>
              <span>{post.reactionCounts.laugh}</span>
            </button>

            {/* Skull 💀 */}
            <button
              onClick={(e) => handleReactionClick(e, 'skull')}
              className={`h-8 px-2.5 rounded-full border-2 border-[#111111] flex items-center gap-1 font-display font-black text-xs btn-press ${
                activeReaction === 'skull'
                  ? 'bg-[#FF4388] text-white shadow-brutal-xs scale-105'
                  : 'bg-[#FFF9F0] hover:bg-[#ffd9e0] shadow-brutal-xs'
              }`}
              title="Dead / Skull"
            >
              <span className="text-sm">💀</span>
              <span>{post.reactionCounts.skull}</span>
            </button>

            {/* Clown 🤡 */}
            <button
              onClick={(e) => handleReactionClick(e, 'clown')}
              className={`h-8 px-2.5 rounded-full border-2 border-[#111111] flex items-center gap-1 font-display font-black text-xs btn-press ${
                activeReaction === 'clown'
                  ? 'bg-[#8055F5] text-white shadow-brutal-xs scale-105'
                  : 'bg-[#FFF9F0] hover:bg-[#e0d4ff] shadow-brutal-xs'
              }`}
              title="Clown"
            >
              <span className="text-sm">🤡</span>
              <span>{post.reactionCounts.clown}</span>
            </button>

            {/* Heart ❤️ */}
            <button
              onClick={(e) => handleReactionClick(e, 'heart')}
              className={`h-8 px-2.5 rounded-full border-2 border-[#111111] flex items-center gap-1 font-display font-black text-xs btn-press ${
                activeReaction === 'heart'
                  ? 'bg-[#FF2A6D] text-white shadow-brutal-xs scale-105'
                  : 'bg-[#FFF9F0] hover:bg-[#ffe4ec] shadow-brutal-xs'
              }`}
              title="Love / Heart"
            >
              <span className="text-sm">❤️</span>
              <span>{post.reactionCounts.heart || 0}</span>
            </button>
          </div>

          {/* Share Trigger */}
          <button
            onClick={handleShare}
            className="p-1.5 bg-[#FFF9F0] hover:bg-white border-2 border-[#111111] rounded-lg shadow-brutal-xs btn-press"
            title="Copy share link"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-600 stroke-[3]" />
            ) : (
              <Share2 className="w-3.5 h-3.5 text-[#111111]" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
