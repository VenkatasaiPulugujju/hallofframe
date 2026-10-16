import React, { useState } from 'react';
import type { Post, ReactionType } from '../types';
import { usePosts } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';
import { X, Share2, Flag, Check, ShieldAlert, Sparkles, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PostDetailModalProps {
  post: Post | null;
  onClose: () => void;
  onOpenReport: (post: Post) => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({ post, onClose, onOpenReport }) => {
  const { posts, userReactions, toggleReaction, deleteOwnPost } = usePosts();
  const { user, isAdmin } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!post) return null;

  // Retrieve freshest post state from context
  const currentPost = posts.find((p) => p.postId === post.postId) || post;
  const activeReaction = userReactions[currentPost.postId];
  const isAuthor = user?.uid === currentPost.authorUid;

  const handleReactionClick = (type: ReactionType) => {
    if (!user) {
      alert('Please sign in with your @cvv.ac.in account to react!');
      return;
    }
    if (type === 'skull' && activeReaction !== 'skull') {
      confetti({ particleCount: 20, spread: 50, colors: ['#111111', '#FF4388', '#FFD719'] });
    }
    toggleReaction(currentPost.postId, type);
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${url}#${currentPost.postId}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-[#FFF9F0] border-[3px] border-[#111111] rounded-2xl shadow-brutal-xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-5 py-3 border-b-[2.5px] border-[#111111] bg-[#FFD719] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-[#8055F5] text-white text-xs font-display font-black px-2.5 py-0.5 rounded-full border border-[#111111] uppercase tracking-wider">
              {currentPost.category}
            </span>
            <span className="text-xs font-bold text-[#111111]">
              Moment #{currentPost.postId.slice(-4)}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#FFF9F0] border-2 border-[#111111] shadow-brutal-xs flex items-center justify-center font-black hover:bg-[#ffdad6] btn-press text-[#111111]"
            aria-label="Close details"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* High-res Image */}
          <div className="w-full rounded-xl border-[2.5px] border-[#111111] overflow-hidden bg-black shadow-brutal-sm">
            <img
              src={currentPost.imageUrl}
              alt={currentPost.caption}
              className="w-full max-h-[460px] object-contain mx-auto bg-[#1c1b1b]"
            />
          </div>

          {/* Caption */}
          <div className="bg-white p-4 rounded-xl border-2 border-[#111111] shadow-brutal-xs">
            <p className="text-base sm:text-lg font-semibold text-[#111111] leading-relaxed">
              {currentPost.caption}
            </p>
          </div>

          {/* Author & Timestamp Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-gray-700 bg-[#ffe170]/40 p-3 rounded-xl border-2 border-[#111111]/30">
            <div className="flex items-center gap-2">
              {currentPost.authorPhotoURL ? (
                <img
                  src={currentPost.authorPhotoURL}
                  alt={currentPost.authorDisplayName}
                  className="w-7 h-7 rounded-full object-cover border border-[#111111]"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#8055F5] text-white font-bold flex items-center justify-center text-xs border border-[#111111]">
                  {currentPost.authorDisplayName.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-extrabold text-[#111111]">{currentPost.authorDisplayName}</p>
                <p className="text-[10px] text-gray-500">Verified CVV Student</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[11px] text-gray-600">
                Published {new Date(currentPost.createdAt).toLocaleDateString()} at{' '}
                {new Date(currentPost.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Reactions and Controls */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {/* Laugh */}
              <button
                onClick={() => handleReactionClick('laugh')}
                className={`h-10 px-3.5 rounded-full border-2 border-[#111111] flex items-center gap-1.5 font-display font-black text-sm btn-press ${
                  activeReaction === 'laugh'
                    ? 'bg-[#FFD719] shadow-brutal-xs scale-105'
                    : 'bg-[#FFF9F0] hover:bg-[#ffe170] shadow-brutal-xs'
                }`}
              >
                <span className="text-base">😂</span>
                <span>{currentPost.reactionCounts.laugh}</span>
              </button>

              {/* Skull */}
              <button
                onClick={() => handleReactionClick('skull')}
                className={`h-10 px-3.5 rounded-full border-2 border-[#111111] flex items-center gap-1.5 font-display font-black text-sm btn-press ${
                  activeReaction === 'skull'
                    ? 'bg-[#FF4388] text-white shadow-brutal-xs scale-105'
                    : 'bg-[#FFF9F0] hover:bg-[#ffd9e0] shadow-brutal-xs'
                }`}
              >
                <span className="text-base">💀</span>
                <span>{currentPost.reactionCounts.skull}</span>
              </button>

              {/* Clown */}
              <button
                onClick={() => handleReactionClick('clown')}
                className={`h-10 px-3.5 rounded-full border-2 border-[#111111] flex items-center gap-1.5 font-display font-black text-sm btn-press ${
                  activeReaction === 'clown'
                    ? 'bg-[#8055F5] text-white shadow-brutal-xs scale-105'
                    : 'bg-[#FFF9F0] hover:bg-[#e0d4ff] shadow-brutal-xs'
                }`}
              >
                <span className="text-base">🤡</span>
                <span>{currentPost.reactionCounts.clown}</span>
              </button>
            </div>

            {/* Share and Report Options */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="px-3 py-2 bg-[#FFF9F0] hover:bg-white border-2 border-[#111111] rounded-xl font-display font-bold text-xs uppercase tracking-wider shadow-brutal-xs flex items-center gap-1.5 btn-press"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600 stroke-[3]" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-[#111111]" />
                    <span>Share</span>
                  </>
                )}
              </button>

              {isAuthor || isAdmin ? (
                <button
                  onClick={() => {
                    if (confirm('Delete this post permanently?')) {
                      deleteOwnPost(currentPost.postId);
                      onClose();
                    }
                  }}
                  className="px-3 py-2 bg-[#ffdad6] hover:bg-red-200 border-2 border-[#111111] rounded-xl font-display font-bold text-xs uppercase tracking-wider text-red-800 shadow-brutal-xs flex items-center gap-1.5 btn-press"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    onOpenReport(currentPost);
                  }}
                  className="px-3 py-2 bg-[#FFF9F0] hover:bg-amber-100 border-2 border-[#111111] rounded-xl font-display font-bold text-xs uppercase tracking-wider text-gray-700 shadow-brutal-xs flex items-center gap-1.5 btn-press"
                >
                  <Flag className="w-4 h-4" />
                  <span>Report</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
