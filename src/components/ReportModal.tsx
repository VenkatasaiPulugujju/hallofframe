import React, { useState } from 'react';
import type { Post, ReportReason } from '../types';
import { usePosts } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';
import { X, AlertTriangle, ShieldCheck, Check } from 'lucide-react';

interface ReportModalProps {
  post: Post | null;
  onClose: () => void;
}

const REASONS: ReportReason[] = [
  'No Consent',
  'Bullying/Harassment',
  'Hate Speech',
  'Not College Related',
  'Spam/Fake',
  'Other',
];

export const ReportModal: React.FC<ReportModalProps> = ({ post, onClose }) => {
  const { reportPost } = usePosts();
  const { user } = useAuth();
  const [reason, setReason] = useState<ReportReason>('No Consent');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!post) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      return;
    }

    setSubmitting(true);
    await reportPost(post.postId, reason, details.trim());
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-[#FFF9F0] border-[3px] border-[#111111] rounded-2xl shadow-brutal-xl w-full max-w-md overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3 border-b-[2.5px] border-[#111111] bg-[#FF4388] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            <h3 className="font-display font-extrabold text-sm uppercase tracking-wider">
              REPORT THIS POST
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-[#FFF9F0] text-[#111111] border-2 border-[#111111] shadow-brutal-xs flex items-center justify-center font-black hover:bg-gray-200 btn-press"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-[#39D62D] rounded-full border-2 border-[#111111] mx-auto flex items-center justify-center shadow-brutal-xs">
              <Check className="w-6 h-6 stroke-[3] text-[#111111]" />
            </div>
            <h4 className="font-display font-black text-lg text-[#111111]">REPORT SUBMITTED</h4>
            <p className="text-xs text-gray-700">
              Thank you for keeping Campus Wall of Fame safe. Our moderators will review this
              immediately.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <p className="text-xs font-semibold text-gray-700">
              If this photo violates campus dignity, lacks personal consent, or constitutes
              harassment, report it below:
            </p>

            <div>
              <label className="block font-display font-bold text-xs uppercase tracking-wider text-[#111111] mb-1.5">
                Primary Reason *
              </label>
              <div className="space-y-1.5">
                {REASONS.map((r) => (
                  <label
                    key={r}
                    className={`flex items-center gap-2.5 p-2 rounded-lg border-2 border-[#111111] cursor-pointer text-xs font-bold transition-all ${
                      reason === r
                        ? 'bg-[#FFD719] shadow-brutal-xs'
                        : 'bg-white hover:bg-amber-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      checked={reason === r}
                      onChange={() => setReason(r)}
                      className="accent-[#111111] w-4 h-4"
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-display font-bold text-xs uppercase tracking-wider text-[#111111] mb-1.5">
                Additional Details (Optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Explain the context or subject consent issue..."
                rows={2}
                maxLength={400}
                className="w-full bg-[#FFF9F0] border-2 border-[#111111] rounded-xl p-2.5 text-xs font-medium text-[#111111] shadow-brutal-xs focus:outline-none focus:bg-white"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#FFF9F0] border-2 border-[#111111] rounded-xl font-display font-bold text-xs uppercase tracking-wider shadow-brutal-xs btn-press"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-[#FF4388] text-white border-2 border-[#111111] rounded-xl font-display font-black text-xs uppercase tracking-wider shadow-brutal-xs btn-press"
              >
                {submitting ? 'Submitting...' : 'Flag for Review'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
