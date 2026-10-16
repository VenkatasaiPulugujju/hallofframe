import React, { useState } from 'react';
import { usePosts } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Clock,
  Trash2,
  Eye,
  History,
  Lock,
} from 'lucide-react';
import type { Post } from '../types';

interface ModerationDashboardProps {
  onOpenDetail: (post: Post) => void;
}

export const ModerationDashboard: React.FC<ModerationDashboardProps> = ({ onOpenDetail }) => {
  const { posts, pendingPosts, reports, moderationLogs, approvePost, rejectPost, removePost } =
    usePosts();
  const { isAdmin, user } = useAuth();

  const [activeTab, setActiveTab] = useState<'pending' | 'reports' | 'logs' | 'published'>('pending');
  const [rejectModalPost, setRejectModalPost] = useState<Post | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  if (!isAdmin) {
    return (
      <div className="bg-[#FFF9F0] border-[3px] border-[#111111] rounded-2xl p-10 text-center shadow-brutal-lg max-w-xl mx-auto my-12">
        <div className="w-16 h-16 bg-[#FF4388] rounded-full border-2 border-[#111111] mx-auto flex items-center justify-center text-white mb-4 shadow-brutal-sm">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="font-display font-black text-2xl text-[#111111] mb-2">
          RESTRICTED AREA: CAMPUS MODERATORS ONLY
        </h2>
        <p className="text-sm font-medium text-gray-700 leading-relaxed mb-6">
          Access to this dashboard requires verified administrator privileges or the moderator
          role assigned through trusted institutional claims.
        </p>
        <div className="p-3 bg-[#FFD719] border-2 border-[#111111] rounded-xl text-xs font-bold inline-block shadow-brutal-xs">
          Your Account: {user?.email || 'Not Signed In'} (Role: {user?.role || 'Guest'})
        </div>
      </div>
    );
  }

  const handleConfirmReject = async () => {
    if (!rejectModalPost) return;
    await rejectPost(rejectModalPost.postId, rejectReason || 'Did not meet campus standards');
    setRejectModalPost(null);
    setRejectReason('');
  };

  const publishedPosts = posts.filter((p) => p.status === 'approved');

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner */}
      <div className="bg-[#8055F5] text-white border-[3px] border-[#111111] rounded-2xl p-6 shadow-brutal-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#39D62D] text-[#111111] px-3 py-1 rounded-md border-2 border-[#111111] font-display font-black text-xs uppercase tracking-wider mb-2 shadow-brutal-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>MODERATION HEADQUARTERS</span>
          </div>
          <h2 className="font-display font-black text-3xl tracking-tight">
            CAMPUS CONTENT GOVERNANCE
          </h2>
          <p className="text-xs sm:text-sm font-medium text-white/90">
            Review submissions for consent compliance, student dignity, and campus safety.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 bg-[#FFF9F0] p-1.5 rounded-xl border-2 border-[#111111] shadow-brutal-sm">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-lg font-display font-bold text-xs uppercase tracking-wider transition-all btn-press flex items-center gap-1.5 ${
              activeTab === 'pending'
                ? 'bg-[#FF4388] text-white shadow-brutal-xs'
                : 'text-[#111111] hover:bg-gray-100'
            }`}
          >
            <span>Pending Submissions</span>
            <span className="w-5 h-5 bg-[#111111] text-white rounded-full text-[10px] flex items-center justify-center font-black">
              {pendingPosts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded-lg font-display font-bold text-xs uppercase tracking-wider transition-all btn-press flex items-center gap-1.5 ${
              activeTab === 'reports'
                ? 'bg-[#FF4388] text-white shadow-brutal-xs'
                : 'text-[#111111] hover:bg-gray-100'
            }`}
          >
            <span>Flagged Reports</span>
            <span className="w-5 h-5 bg-[#FFD719] text-[#111111] rounded-full text-[10px] flex items-center justify-center font-black border border-black">
              {reports.filter((r) => r.status === 'pending').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('published')}
            className={`px-3 py-1.5 rounded-lg font-display font-bold text-xs uppercase tracking-wider transition-all btn-press ${
              activeTab === 'published'
                ? 'bg-[#FF4388] text-white shadow-brutal-xs'
                : 'text-[#111111] hover:bg-gray-100'
            }`}
          >
            Published ({publishedPosts.length})
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg font-display font-bold text-xs uppercase tracking-wider transition-all btn-press ${
              activeTab === 'logs'
                ? 'bg-[#FF4388] text-white shadow-brutal-xs'
                : 'text-[#111111] hover:bg-gray-100'
            }`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {/* Tab: Pending Submissions */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-black text-xl text-[#111111]">
              PENDING MOMENTS AWAITING VERIFICATION
            </h3>
            <span className="text-xs font-bold text-gray-700">
              {pendingPosts.length} submissions in queue
            </span>
          </div>

          {pendingPosts.length === 0 ? (
            <div className="bg-[#FFF9F0] border-2 border-[#111111] rounded-2xl p-12 text-center shadow-brutal">
              <div className="text-4xl mb-2">🎉</div>
              <h4 className="font-display font-black text-xl text-[#111111]">QUEUE IS TOTALLY CLEAR!</h4>
              <p className="text-xs font-semibold text-gray-600 mt-1">
                All submitted photos have been reviewed and approved or resolved.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingPosts.map((post) => (
                <div
                  key={post.postId}
                  className="bg-[#FFF9F0] border-[2.5px] border-[#111111] rounded-2xl shadow-brutal p-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="bg-[#FFD719] px-2.5 py-0.5 rounded-md border border-[#111111]">
                        {post.category}
                      </span>
                      <span className="text-gray-500">
                        {new Date(post.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="aspect-[16/10] bg-black rounded-xl border-2 border-[#111111] overflow-hidden">
                      <img
                        src={post.imageUrl}
                        alt={post.caption}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-[#111111]">{post.caption}</p>
                      <p className="text-xs font-bold text-gray-500 mt-1">
                        By {post.authorDisplayName} ({post.authorUid})
                      </p>
                    </div>

                    <div className="p-2.5 bg-[#39D62D]/20 border border-[#111111] rounded-lg text-[11px] font-bold text-gray-800">
                      ✅ Consent Confirmed by submitter
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 mt-3 border-t-2 border-[#111111]/20 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setRejectModalPost(post)}
                      className="px-3.5 py-2 bg-[#ffdad6] hover:bg-red-200 border-2 border-[#111111] rounded-xl font-display font-bold text-xs uppercase tracking-wider text-red-900 shadow-brutal-xs flex items-center gap-1 btn-press"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>

                    <button
                      onClick={() => approvePost(post.postId)}
                      className="px-4 py-2 bg-[#39D62D] hover:bg-green-400 border-2 border-[#111111] rounded-xl font-display font-black text-xs uppercase tracking-wider text-[#111111] shadow-brutal-xs flex items-center gap-1 btn-press"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve to Feed</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Flagged Reports */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <h3 className="font-display font-black text-xl text-[#111111]">
            STUDENT FLAGGED REPORTS
          </h3>

          {reports.length === 0 ? (
            <div className="bg-[#FFF9F0] border-2 border-[#111111] rounded-2xl p-10 text-center shadow-brutal">
              <p className="font-display font-bold text-sm text-gray-600">
                No active complaints or safety reports filed!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => {
                const targetPost = posts.find((p) => p.postId === rep.postId);
                return (
                  <div
                    key={rep.reportId}
                    className="bg-[#FFF9F0] border-2 border-[#111111] rounded-xl p-4 shadow-brutal-sm flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#FF4388] text-white text-[10px] font-black px-2 py-0.5 rounded-md border border-[#111111] uppercase tracking-wider">
                          Reason: {rep.reason}
                        </span>
                        <span className="text-xs text-gray-500">
                          Filed {new Date(rep.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {rep.details && (
                        <p className="text-xs font-medium text-gray-800">
                          Details: "{rep.details}"
                        </p>
                      )}
                      <p className="text-[11px] font-bold text-gray-500">
                        Target Post ID: {rep.postId} • Reporter UID: {rep.reporterUid}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {targetPost && (
                        <button
                          onClick={() => onOpenDetail(targetPost)}
                          className="px-3 py-1.5 bg-[#FFD719] border-2 border-[#111111] rounded-lg font-display font-bold text-xs shadow-brutal-xs btn-press"
                        >
                          View Post
                        </button>
                      )}

                      <button
                        onClick={() => removePost(rep.postId, `Takedown: ${rep.reason}`)}
                        className="px-3 py-1.5 bg-[#FF4388] text-white border-2 border-[#111111] rounded-lg font-display font-bold text-xs shadow-brutal-xs btn-press flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Take Down Post</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Published Posts */}
      {activeTab === 'published' && (
        <div className="space-y-4">
          <h3 className="font-display font-black text-xl text-[#111111]">
            LIVE PUBLISHED POSTS (ADMIN VIEW)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {publishedPosts.map((post) => (
              <div
                key={post.postId}
                className="bg-[#FFF9F0] border-2 border-[#111111] rounded-xl p-3 shadow-brutal-xs flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[16/10] rounded-lg overflow-hidden border border-[#111111] mb-2">
                    <img src={post.imageUrl} alt={post.caption} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-xs font-bold text-[#111111] truncate">{post.caption}</p>
                  <p className="text-[10px] text-gray-500">By {post.authorDisplayName}</p>
                </div>

                <div className="pt-2 mt-2 border-t border-gray-300 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-600">
                    👍 {post.reactionCounts.laugh + post.reactionCounts.skull + post.reactionCounts.clown + (post.reactionCounts.heart || 0)} reactions
                  </span>
                  <button
                    onClick={() => {
                      if (confirm('Permanently remove this published moment?')) {
                        removePost(post.postId, 'Administrative removal');
                      }
                    }}
                    className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-800 border border-black rounded text-[10px] font-bold"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Audit Logs */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <h3 className="font-display font-black text-xl text-[#111111]">
            IMMUTABLE MODERATION AUDIT TRAIL
          </h3>
          <div className="bg-[#FFF9F0] border-2 border-[#111111] rounded-2xl overflow-hidden shadow-brutal">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold">
                <thead className="bg-[#FFD719] border-b-2 border-[#111111] uppercase font-display font-bold">
                  <tr>
                    <th className="p-3">Log ID</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Target Post</th>
                    <th className="p-3">Moderator</th>
                    <th className="p-3">Reason / Details</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#111111]/20">
                  {moderationLogs.map((log) => (
                    <tr key={log.logId} className="hover:bg-amber-50/50">
                      <td className="p-3 font-mono text-[11px]">{log.logId}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded border border-[#111111] font-display uppercase font-bold text-[10px] ${
                            log.action === 'approve'
                              ? 'bg-[#39D62D] text-[#111111]'
                              : log.action === 'reject'
                              ? 'bg-[#FF4388] text-white'
                              : 'bg-red-200 text-red-900'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[11px]">{log.postId}</td>
                      <td className="p-3">{log.moderatorUid}</td>
                      <td className="p-3">{log.reason || 'None specified'}</td>
                      <td className="p-3 text-gray-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Dialog */}
      {rejectModalPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FFF9F0] border-[3px] border-[#111111] rounded-2xl shadow-brutal-xl p-5 max-w-md w-full space-y-4">
            <h4 className="font-display font-black text-lg text-[#111111]">
              PROVIDE REASON FOR REJECTION
            </h4>
            <p className="text-xs font-semibold text-gray-700">
              The submitter will see this reason in their private dashboard:
            </p>
            <input
              type="text"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Unverified consent, identifiable third party..."
              className="w-full bg-white border-2 border-[#111111] rounded-xl p-2.5 text-xs font-semibold"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalPost(null)}
                className="px-3 py-1.5 bg-[#FFF9F0] border-2 border-[#111111] rounded-xl font-display font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-1.5 bg-[#FF4388] text-white border-2 border-[#111111] rounded-xl font-display font-black text-xs uppercase"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
