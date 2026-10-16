import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostContext';
import { X, LogOut, Trash2, ShieldCheck, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { Post } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDetail: (post: Post) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenDetail,
}) => {
  const { user, signOut } = useAuth();
  const { userPosts, deleteOwnPost } = usePosts();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  if (!isOpen || !user) return null;

  const myPosts = userPosts;
  const filteredMyPosts = myPosts.filter((p) => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-[#FFF9F0] border-[3px] border-[#111111] rounded-2xl shadow-brutal-xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3 border-b-[2.5px] border-[#111111] bg-[#FFD719] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎓</span>
            <h2 className="font-display font-extrabold text-base sm:text-lg text-[#111111]">
              STUDENT PROFILE & SUBMISSIONS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#FFF9F0] border-2 border-[#111111] shadow-brutal-xs flex items-center justify-center font-black hover:bg-[#ffdad6] btn-press"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* User Card */}
          <div className="bg-white border-2 border-[#111111] rounded-xl p-4 shadow-brutal-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-14 h-14 rounded-xl border-2 border-[#111111] object-cover shadow-brutal-xs"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-[#8055F5] border-2 border-[#111111] text-white font-black text-2xl flex items-center justify-center shadow-brutal-xs">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="font-display font-black text-base text-[#111111]">
                  {user.displayName}
                </h3>
                <p className="text-xs font-semibold text-gray-600">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 bg-[#39D62D] text-[#111111] text-[10px] font-black px-2 py-0.5 rounded-md border border-[#111111]">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified @cvv.ac.in</span>
                  </span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">
                    Role: {user.role}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                signOut();
                onClose();
              }}
              className="px-3 py-1.5 bg-[#ffdad6] hover:bg-red-200 border-2 border-[#111111] rounded-xl font-display font-bold text-xs uppercase tracking-wider text-red-900 shadow-brutal-xs btn-press flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Submissions Section */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h4 className="font-display font-black text-base text-[#111111]">
                MY SUBMITTED MOMENTS ({myPosts.length})
              </h4>

              {/* Status filter tabs */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#111111]">
                {(['all', 'approved', 'pending', 'rejected'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilter(st)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                      filter === st
                        ? 'bg-[#111111] text-white'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {filteredMyPosts.length === 0 ? (
              <div className="bg-white border-2 border-[#111111] rounded-xl p-8 text-center text-xs font-semibold text-gray-500 shadow-brutal-xs">
                No moments found for this status.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMyPosts.map((post) => (
                  <div
                    key={post.postId}
                    className="bg-white border-2 border-[#111111] rounded-xl p-3 shadow-brutal-xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-14 rounded-lg bg-black border border-[#111111] overflow-hidden shrink-0">
                        <img
                          src={post.imageUrl}
                          alt={post.caption}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#111111] truncate">{post.caption}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase border border-[#111111] ${
                              post.status === 'approved'
                                ? 'bg-[#39D62D] text-[#111111]'
                                : post.status === 'pending'
                                ? 'bg-[#FFD719] text-[#111111]'
                                : 'bg-[#FF4388] text-white'
                            }`}
                          >
                            {post.status}
                          </span>
                          <span className="text-[10px] text-gray-500">{post.category}</span>
                        </div>
                        {post.rejectionReason && (
                          <p className="text-[10px] text-red-600 font-bold mt-0.5">
                            Reason: {post.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {post.status === 'approved' && (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenDetail(post);
                          }}
                          className="px-2.5 py-1 bg-[#FFD719] border border-[#111111] rounded text-[11px] font-bold"
                        >
                          View
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (confirm('Delete this post permanently?')) {
                            deleteOwnPost(post.postId);
                          }
                        }}
                        className="p-1.5 bg-red-100 hover:bg-red-200 border border-[#111111] rounded text-red-700"
                        title="Delete Post"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
