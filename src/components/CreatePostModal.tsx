import React, { useState, useRef } from 'react';
import { usePosts } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';
import type { PostCategory } from '../types';
import { X, UploadCloud, Image, AlertCircle, CheckCircle, ShieldCheck, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: PostCategory[] = [
  'Hostel Shenanigans',
  'Canteen Chronicles',
  'Exam Brainrot',
  'Lab Disasters',
  'Fest Fever',
  'Library Stealth',
  'General Chaos',
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose }) => {
  const { createPost } = usePosts();
  const { user } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<PostCategory>('General Chaos');
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<'compressing' | 'uploading' | 'saving' | 'done'>('compressing');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];

      // Validate 10MB limit (photos are optimized client-side before upload)
      if (selected.size > 10 * 1024 * 1024) {
        setError('Image file is too large! Maximum allowed original size is 10 MB.');
        return;
      }

      // Validate type (including image/jpg)
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(selected.type.toLowerCase()) && !selected.name.match(/\.(jpe?g|png|webp|gif)$/i)) {
        setError('Unsupported format. Please select a JPEG, PNG, WEBP, or GIF image.');
        return;
      }

      setFile(selected);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return; // Prevent duplicate clicks
    setError(null);

    if (!file) {
      setError('Please select or drag an image to upload.');
      return;
    }

    if (!caption.trim() || caption.trim().length < 3) {
      setError('Please enter a caption (at least 3 characters).');
      return;
    }

    if (caption.trim().length > 280) {
      setError('Caption must be within 280 characters.');
      return;
    }

    if (!consentConfirmed) {
      setError('You must confirm subject consent before publishing on the Wall of Fame.');
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);
    setUploadStage('compressing');

    const result = await createPost(
      {
        file,
        caption,
        category,
        consentConfirmed,
      },
      (progress, stage) => {
        setUploadProgress(progress);
        if (stage) setUploadStage(stage);
      }
    );

    setSubmitting(false);

    if (result.success) {
      setSuccess(true);
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        handleReset();
        onClose();
      }, 2500);
    } else {
      setError(result.error || 'Failed to submit post.');
    }
  };

  const handleReset = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCaption('');
    setCategory('General Chaos');
    setConsentConfirmed(false);
    setUploadProgress(0);
    setUploadStage('compressing');
    setError(null);
    setSuccess(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-[#FFF9F0] border-[3px] border-[#111111] rounded-2xl shadow-brutal-xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3 border-b-[2.5px] border-[#111111] bg-[#FFD719] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📸</span>
            <h2 className="font-display font-extrabold text-lg text-[#111111] tracking-tight">
              POST A LEGENDARY MOMENT
            </h2>
          </div>

          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-[#FFF9F0] border-2 border-[#111111] shadow-brutal-xs flex items-center justify-center font-black hover:bg-[#ffdad6] btn-press text-[#111111]"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Form Body */}
        {success ? (
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="w-16 h-16 bg-[#39D62D] rounded-full border-[3px] border-[#111111] shadow-brutal-sm mx-auto flex items-center justify-center text-3xl">
              🎉
            </div>
            <h3 className="font-display font-black text-2xl text-[#111111]">
              SUBMITTED FOR MODERATION!
            </h3>
            <p className="text-sm font-medium text-gray-700 max-w-md mx-auto">
              Your legendary moment has been dispatched to campus moderators. Once approved, it will
              grace the public Wall of Fame! 💀
            </p>
            <div className="p-3 bg-[#FFD719] border-2 border-[#111111] rounded-xl text-xs font-bold inline-block shadow-brutal-xs">
              Status: <span className="uppercase text-[#FF4388]">Pending Approval</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
            {error && (
              <div className="p-3 bg-[#ffdad6] border-2 border-[#111111] rounded-xl text-xs font-bold text-red-900 flex items-center gap-2 shadow-brutal-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-700" />
                <span>{error}</span>
              </div>
            )}

            {/* Image Dropzone / Preview */}
            <div>
              <label className="block font-display font-bold text-xs uppercase tracking-wider text-[#111111] mb-1.5">
                Photo (Max 5 MB • JPEG, PNG, WEBP, GIF) *
              </label>

              {previewUrl ? (
                <div className="relative rounded-xl border-[2.5px] border-[#111111] overflow-hidden bg-black/5 aspect-[16/9] shadow-brutal-xs flex items-center justify-center">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setPreviewUrl(null);
                    }}
                    className="absolute top-2 right-2 px-2.5 py-1 bg-[#FF4388] text-white border-2 border-[#111111] rounded-lg font-display text-xs font-bold shadow-brutal-xs btn-press"
                  >
                    Change Image
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#111111] rounded-xl p-6 text-center cursor-pointer hover:bg-[#ffe170]/30 transition-colors bg-white/50"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <UploadCloud className="w-10 h-10 mx-auto text-[#111111] mb-2" />
                  <p className="font-display font-bold text-sm text-[#111111]">
                    Click or Drag to Upload Campus Photo
                  </p>
                  <p className="text-xs text-gray-500 mt-1">High-res candid photos, lab chaos, hostel engineering</p>
                </div>
              )}
            </div>

            {/* Category Select */}
            <div>
              <label className="block font-display font-bold text-xs uppercase tracking-wider text-[#111111] mb-1.5">
                Campus Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PostCategory)}
                className="w-full bg-[#FFF9F0] border-2 border-[#111111] rounded-xl px-3 py-2 text-sm font-semibold text-[#111111] shadow-brutal-xs focus:outline-none focus:bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Caption Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-display font-bold text-xs uppercase tracking-wider text-[#111111]">
                  Humorous Caption *
                </label>
                <span
                  className={`text-[11px] font-bold ${
                    caption.length > 280 ? 'text-red-600' : 'text-gray-500'
                  }`}
                >
                  {caption.length}/280
                </span>
              </div>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Give context or roast the moment with affection..."
                rows={3}
                maxLength={280}
                className="w-full bg-[#FFF9F0] border-2 border-[#111111] rounded-xl p-3 text-sm font-medium text-[#111111] placeholder:text-gray-400 shadow-brutal-xs focus:outline-none focus:bg-white focus:shadow-brutal transition-all"
              />
            </div>

            {/* Consent Confirmation Checkbox */}
            <div className="bg-[#FFD719]/30 border-2 border-[#111111] rounded-xl p-3 shadow-brutal-xs">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentConfirmed}
                  onChange={(e) => setConsentConfirmed(e.target.checked)}
                  className="mt-0.5 w-5 h-5 rounded border-2 border-[#111111] accent-[#111111] cursor-pointer"
                />
                <span className="text-xs font-bold text-[#111111] leading-tight select-none">
                  <span className="text-[#FF4388] font-black uppercase">Consent Pledge:</span> I
                  confirm that I have permission to publish this photo and that all identifiable
                  classmates or faculty have consented to its appearance on Campus Wall of Fame.
                </span>
              </label>
            </div>

            {/* Upload progress indicator */}
            {submitting && (
              <div className="space-y-2 bg-white p-3.5 rounded-xl border-2 border-[#111111] shadow-brutal-xs">
                <div className="flex items-center justify-between text-xs font-bold text-[#111111]">
                  <span className="flex items-center gap-1.5">
                    {uploadStage === 'compressing' && <span>⚡ Optimizing image for web...</span>}
                    {uploadStage === 'uploading' && <span>☁️ Uploading to Cloud Storage...</span>}
                    {uploadStage === 'saving' && <span>📝 Publishing to Wall of Fame...</span>}
                    {uploadStage === 'done' && <span>🎉 Post submitted!</span>}
                  </span>
                  <span className="font-mono bg-[#FFD719] px-2 py-0.5 rounded-md border border-[#111111] text-[11px] font-black">
                    {uploadProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3.5 border border-[#111111] overflow-hidden">
                  <div
                    className="bg-[#39D62D] h-full transition-all duration-200 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(5, uploadProgress))}%` }}
                  />
                </div>
                {uploadProgress < 90 && (
                  <p className="text-[10px] text-gray-500 font-medium">
                    Resumable stream active. Files are automatically compressed for high performance on campus networks.
                  </p>
                )}
              </div>
            )}

            {/* Notice */}
            <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-600">
              <ShieldCheck className="w-4 h-4 text-[#8055F5] shrink-0" />
              <span>Posts enter a pending moderation state before going live.</span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  handleReset();
                  onClose();
                }}
                disabled={submitting}
                className="px-4 py-2 bg-[#FFF9F0] border-2 border-[#111111] rounded-xl font-display font-bold text-xs uppercase tracking-wider shadow-brutal-xs hover:bg-gray-100 btn-press"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting || !file || !consentConfirmed || !caption.trim()}
                className="px-5 py-2.5 bg-[#FF4388] text-white border-[2.5px] border-[#111111] rounded-xl font-display font-black text-xs uppercase tracking-wider shadow-brutal-sm btn-press disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {submitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <span>Submit for Approval</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
