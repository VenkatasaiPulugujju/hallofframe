import React, { useState, useRef, useEffect } from 'react';
import { usePosts } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';
import type { PostCategory } from '../types';
import {
  compressImageForUpload,
  formatBytes,
  type CompressionResult,
} from '../utils/imageCompressor';
import {
  X,
  UploadCloud,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Zap,
  RotateCw,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSetupGuide?: () => void;
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

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onOpenSetupGuide,
}) => {
  const { createPost } = usePosts();
  const { user } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedInfo, setOptimizedInfo] = useState<CompressionResult | null>(null);

  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<PostCategory>('General Chaos');
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [bytesInfo, setBytesInfo] = useState<{ transferred: number; total: number } | null>(null);
  const [uploadStage, setUploadStage] = useState<'compressing' | 'uploading' | 'saving' | 'done'>('compressing');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up preview object URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];

      // Allow camera captures up to 30 MB (iPhone 14/15/16 Pro 48MP)
      if (selected.size > 30 * 1024 * 1024) {
        setError('Image file is too large! Maximum allowed original size is 30 MB.');
        return;
      }

      // Validate format (case-insensitive, includes heic, webp, pjpeg)
      const allowedExt = /\.(jpe?g|png|webp|gif|heic|heif)$/i;
      const validTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif',
        'image/pjpeg',
        'image/heic',
        'image/heif',
      ];
      if (selected.type && !validTypes.includes(selected.type.toLowerCase()) && !selected.name.match(allowedExt)) {
        setError('Please select a photo in JPEG, PNG, WEBP, GIF, or HEIC format.');
        return;
      }

      setFile(selected);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);

      // Immediately run fast background optimization
      setIsOptimizing(true);
      try {
        const result = await compressImageForUpload(selected);
        setOptimizedInfo(result);
      } catch (optErr) {
        console.warn('Background optimization notice:', optErr);
      } finally {
        setIsOptimizing(false);
      }
    }
  };

  const executeUpload = async () => {
    if (submitting) return;
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
    setBytesInfo(null);
    setUploadStage(optimizedInfo ? 'uploading' : 'compressing');

    const result = await createPost(
      {
        file,
        caption,
        category,
        consentConfirmed,
      },
      (progress, stage, details) => {
        setUploadProgress(progress);
        if (stage) setUploadStage(stage);
        if (details?.bytesTransferred && details?.totalBytes) {
          setBytesInfo({
            transferred: details.bytesTransferred,
            total: details.totalBytes,
          });
        }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeUpload();
  };

  const handleReset = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setOptimizedInfo(null);
    setIsOptimizing(false);
    setCaption('');
    setCategory('General Chaos');
    setConsentConfirmed(false);
    setUploadProgress(0);
    setBytesInfo(null);
    setUploadStage('compressing');
    setError(null);
    setSuccess(false);
  };

  const isCorsOrTimeoutError =
    error &&
    (error.toLowerCase().includes('cors') ||
      error.toLowerCase().includes('0%') ||
      error.toLowerCase().includes('timed out') ||
      error.toLowerCase().includes('retry limit'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-[#FFF9F0] border-[3px] border-[#111111] rounded-2xl shadow-brutal-xl w-full max-w-xl max-h-[94vh] flex flex-col overflow-hidden relative"
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
              POST PUBLISHED!
            </h3>
            <p className="text-sm font-medium text-gray-700 max-w-md mx-auto">
              Your legendary moment is now live on the public Wall of Fame for everyone to enjoy. 💀
            </p>
            <div className="p-3 bg-[#39D62D] border-2 border-[#111111] rounded-xl text-xs font-bold inline-block shadow-brutal-xs text-[#111111]">
              Status: <span className="uppercase text-[#111111]">Live</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4">
            {error && (
              <div className="p-3.5 bg-[#ffdad6] border-2 border-[#111111] rounded-xl text-xs font-bold text-red-950 space-y-2 shadow-brutal-xs">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-700 mt-0.5" />
                  <span className="leading-snug">{error}</span>
                </div>

                {isCorsOrTimeoutError && onOpenSetupGuide && (
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenSetupGuide();
                      }}
                      className="px-2.5 py-1 bg-[#111111] text-[#39D62D] rounded-lg font-mono text-[11px] font-bold flex items-center gap-1.5 hover:bg-black transition-colors"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>View 1-Step CORS Fix Guide</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Image Dropzone / Preview */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-display font-bold text-xs uppercase tracking-wider text-[#111111]">
                  Campus Photo (Camera / Gallery) *
                </label>
                <span className="text-[11px] font-semibold text-gray-500">
                  Auto-optimized for Firebase DB (1-2s)
                </span>
              </div>

              {previewUrl ? (
                <div className="space-y-2">
                  <div className="relative rounded-xl border-[2.5px] border-[#111111] overflow-hidden bg-black/5 aspect-[16/9] shadow-brutal-xs flex items-center justify-center">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => {
                        setFile(null);
                        if (previewUrl) URL.revokeObjectURL(previewUrl);
                        setPreviewUrl(null);
                        setOptimizedInfo(null);
                      }}
                      className="absolute top-2 right-2 px-2.5 py-1 bg-[#FF4388] text-white border-2 border-[#111111] rounded-lg font-display text-xs font-bold shadow-brutal-xs btn-press disabled:opacity-50"
                    >
                      Change Photo
                    </button>
                  </div>

                  {/* Optimization Badge & File Size Display */}
                  {isOptimizing ? (
                    <div className="p-2.5 bg-[#FFD719]/40 border-2 border-[#111111] rounded-xl flex items-center gap-2 text-xs font-bold text-[#111111] shadow-brutal-xs animate-pulse">
                      <Zap className="w-4 h-4 text-[#FF4388] animate-bounce shrink-0" />
                      <span>Optimizing high-res photo for instant Firebase DB storage...</span>
                    </div>
                  ) : optimizedInfo ? (
                    <div className="p-2.5 bg-white border-2 border-[#111111] rounded-xl flex flex-wrap items-center justify-between gap-2 shadow-brutal-xs text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-[#39D62D] border border-black flex items-center justify-center text-xs">
                          ⚡
                        </span>
                        <div>
                          <div className="text-[#111111]">
                            <span>{formatBytes(optimizedInfo.originalSize)}</span>
                            <span className="mx-1 text-gray-400">→</span>
                            <span className="text-[#39D62D] bg-[#111111] px-1.5 py-0.5 rounded text-[11px] font-mono">
                              {formatBytes(optimizedInfo.compressedSize)}
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-500 font-medium">
                            {optimizedInfo.width}×{optimizedInfo.height}px •{' '}
                            {Math.round((1 - optimizedInfo.compressionRatio) * 100)}% smaller
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded-md border border-green-300">
                        Ready for Firebase DB
                      </span>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#111111] rounded-xl p-6 text-center cursor-pointer hover:bg-[#ffe170]/30 transition-colors bg-white/50"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,image/jpeg,image/png,image/webp,image/gif,.heic,.HEIC,.jpg,.jpeg,.png,.webp,.gif"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <UploadCloud className="w-10 h-10 mx-auto text-[#111111] mb-2" />
                  <p className="font-display font-bold text-sm text-[#111111]">
                    Click or Drag to Upload Campus Photo
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Stored directly in Firebase Database • Instant 1-2s upload • No Cloud Storage setup needed
                  </p>
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
                disabled={submitting}
                onChange={(e) => setCategory(e.target.value as PostCategory)}
                className="w-full bg-[#FFF9F0] border-2 border-[#111111] rounded-xl px-3 py-2 text-sm font-semibold text-[#111111] shadow-brutal-xs focus:outline-none focus:bg-white disabled:opacity-60"
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
                disabled={submitting}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Give context or roast the moment with affection..."
                rows={3}
                maxLength={280}
                className="w-full bg-[#FFF9F0] border-2 border-[#111111] rounded-xl p-3 text-sm font-medium text-[#111111] placeholder:text-gray-400 shadow-brutal-xs focus:outline-none focus:bg-white disabled:opacity-60"
              />
            </div>

            {/* Consent Confirmation Checkbox */}
            <div className="bg-[#FFD719]/30 border-2 border-[#111111] rounded-xl p-3 shadow-brutal-xs">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={submitting}
                  checked={consentConfirmed}
                  onChange={(e) => setConsentConfirmed(e.target.checked)}
                  className="mt-0.5 w-5 h-5 rounded border-2 border-[#111111] accent-[#111111] cursor-pointer disabled:opacity-60"
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
              <div className="space-y-2.5 bg-white p-3.5 rounded-xl border-2 border-[#111111] shadow-brutal-xs">
                {/* Stage Indicators */}
                <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-bold">
                  <div
                    className={`p-1.5 rounded-lg border ${
                      uploadStage === 'compressing'
                        ? 'bg-[#FFD719] border-black text-black'
                        : 'bg-green-100 border-green-400 text-green-900'
                    }`}
                  >
                    1. Optimize {uploadStage !== 'compressing' && '✓'}
                  </div>
                  <div
                    className={`p-1.5 rounded-lg border ${
                      uploadStage === 'uploading'
                        ? 'bg-[#FFD719] border-black text-black animate-pulse'
                        : uploadStage === 'saving' || uploadStage === 'done'
                        ? 'bg-green-100 border-green-400 text-green-900'
                        : 'bg-gray-100 border-gray-300 text-gray-500'
                    }`}
                  >
                    2. Upload {uploadStage === 'saving' || uploadStage === 'done' ? '✓' : ''}
                  </div>
                  <div
                    className={`p-1.5 rounded-lg border ${
                      uploadStage === 'saving'
                        ? 'bg-[#FFD719] border-black text-black animate-pulse'
                        : uploadStage === 'done'
                        ? 'bg-green-100 border-green-400 text-green-900'
                        : 'bg-gray-100 border-gray-300 text-gray-500'
                    }`}
                  >
                    3. Publish {uploadStage === 'done' && '✓'}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-[#111111]">
                  <span className="flex items-center gap-1.5">
                    {uploadStage === 'compressing' && <span>⚡ Optimizing image resolution...</span>}
                    {uploadStage === 'uploading' && <span>💾 Storing photo directly into Firebase DB...</span>}
                    {uploadStage === 'saving' && <span>📝 Publishing post to Wall of Fame...</span>}
                    {uploadStage === 'done' && <span>🎉 Post submitted!</span>}
                  </span>
                  <div className="flex items-center gap-2">
                    {bytesInfo && uploadStage === 'uploading' && (
                      <span className="text-[10px] font-mono text-gray-600">
                        {formatBytes(bytesInfo.transferred)} / {formatBytes(bytesInfo.total)}
                      </span>
                    )}
                    <span className="font-mono bg-[#FFD719] px-2 py-0.5 rounded-md border border-[#111111] text-[11px] font-black">
                      {uploadProgress}%
                    </span>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3 border border-[#111111] overflow-hidden">
                  <div
                    className="bg-[#39D62D] h-full transition-all duration-150 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(5, uploadProgress))}%` }}
                  />
                </div>
              </div>
            )}

            {/* Notice */}
            <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-600">
              <ShieldCheck className="w-4 h-4 text-[#8055F5] shrink-0" />
              <span>Posts publish immediately to the public Wall of Fame.</span>
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
                className="px-4 py-2 bg-[#FFF9F0] border-2 border-[#111111] rounded-xl font-display font-bold text-xs uppercase tracking-wider shadow-brutal-xs hover:bg-gray-100 btn-press disabled:opacity-60"
              >
                Cancel
              </button>

              {error && (
                <button
                  type="button"
                  onClick={executeUpload}
                  disabled={submitting || !file || !consentConfirmed || !caption.trim()}
                  className="px-4 py-2 bg-[#FFD719] text-[#111111] border-[2px] border-[#111111] rounded-xl font-display font-black text-xs uppercase tracking-wider shadow-brutal-xs btn-press flex items-center gap-1.5 disabled:opacity-60"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Retry Upload</span>
                </button>
              )}

              <button
                type="submit"
                disabled={submitting || !file || !consentConfirmed || !caption.trim()}
                className="px-5 py-2.5 bg-[#FF4388] text-white border-[2.5px] border-[#111111] rounded-xl font-display font-black text-xs uppercase tracking-wider shadow-brutal-sm btn-press disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <span>Publish Post</span>
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
