import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  getStorage,
} from 'firebase/storage';
import { db, storage, isFirebaseConfigured, app, cleanStorageBucket, fallbackStorageBucket } from '../firebase/config';
import { compressImageForUpload, blobToDataUrl } from '../utils/imageCompressor';
import { useAuth } from './AuthContext';
import type {
  Post,
  PostCategory,
  ReactionType,
  ReportReason,
  Report,
  ModerationLog,
} from '../types';

export type UploadStage = 'compressing' | 'uploading' | 'saving' | 'done';

export interface UploadProgressDetails {
  progress: number;
  stage: UploadStage;
  bytesTransferred?: number;
  totalBytes?: number;
}

interface PostContextType {
  posts: Post[];
  loading: boolean;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredPosts: Post[];
  trendingPosts: Post[];
  userReactions: Record<string, ReactionType>;
  toggleReaction: (postId: string, type: ReactionType) => Promise<void>;
  createPost: (
    data: {
      file: File;
      caption: string;
      category: PostCategory;
      consentConfirmed: boolean;
    },
    onProgress?: (progress: number, stage?: UploadStage, details?: UploadProgressDetails) => void
  ) => Promise<{ success: boolean; error?: string }>;
  approvePost: (postId: string) => Promise<void>;
  rejectPost: (postId: string, reason?: string) => Promise<void>;
  removePost: (postId: string, reason?: string) => Promise<void>;
  deleteOwnPost: (postId: string) => Promise<void>;
  reportPost: (postId: string, reason: ReportReason, details?: string) => Promise<void>;
  pendingPosts: Post[];
  reports: Report[];
  moderationLogs: ModerationLog[];
  userPosts: Post[];
  selectedPost: Post | null;
  setSelectedPost: (post: Post | null) => void;
  refreshPosts: () => Promise<void>;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useAuth();

  // All state begins empty - NO MOCK DATA in production
  const [posts, setPosts] = useState<Post[]>([]);
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userReactions, setUserReactions] = useState<Record<string, ReactionType>>({});
  const [reports, setReports] = useState<Report[]>([]);
  const [moderationLogs, setModerationLogs] = useState<ModerationLog[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Helper to format Firestore document data
  const mapDocToPost = (id: string, data: any): Post => {
    return {
      postId: id,
      authorUid: data.authorUid || '',
      authorDisplayName: data.authorDisplayName || 'Anonymous Student',
      authorPhotoURL: data.authorPhotoURL || undefined,
      imagePath: data.imagePath || '',
      imageUrl: data.imageUrl || '',
      caption: data.caption || '',
      category: data.category || 'General Chaos',
      status: data.status || 'pending',
      consentConfirmed: Boolean(data.consentConfirmed),
      reactionCounts: {
        laugh: Number(data.reactionCounts?.laugh) || 0,
        skull: Number(data.reactionCounts?.skull) || 0,
        clown: Number(data.reactionCounts?.clown) || 0,
        heart: Number(data.reactionCounts?.heart) || 0,
      },
      reportCount: Number(data.reportCount) || 0,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt || new Date().toISOString(),
      approvedAt: data.approvedAt?.toDate ? data.approvedAt.toDate().toISOString() : data.approvedAt || undefined,
      approvedBy: data.approvedBy || undefined,
      rejectionReason: data.rejectionReason || undefined,
    };
  };

  // 1. Live listener for Approved Posts (Main Feed)
  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const approvedQuery = query(
        collection(db, 'posts'),
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(
        approvedQuery,
        (snapshot) => {
          const loaded: Post[] = [];
          snapshot.forEach((docSnap) => {
            loaded.push(mapDocToPost(docSnap.id, docSnap.data()));
          });
          setPosts(loaded);
          setLoading(false);
        },
        (error) => {
          console.warn('Live posts subscription notice:', error.message);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (e) {
      console.warn('Approved posts query error:', e);
      setLoading(false);
    }
  }, []);

  // 2. Live listener for User's Submissions (Profile)
  useEffect(() => {
    if (!db || !user) {
      setUserPosts([]);
      return;
    }

    try {
      const userSubmissionsQuery = query(
        collection(db, 'posts'),
        where('authorUid', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(
        userSubmissionsQuery,
        (snapshot) => {
          const userSubmissions: Post[] = [];
          snapshot.forEach((docSnap) => {
            userSubmissions.push(mapDocToPost(docSnap.id, docSnap.data()));
          });
          setUserPosts(userSubmissions);
        },
        (error) => {
          console.warn('User submissions query notice:', error.message);
        }
      );

      return () => unsubscribe();
    } catch (e) {
      console.warn('User submissions query error:', e);
    }
  }, [user]);

  // 3. Live listener for Admin Moderation Queue
  useEffect(() => {
    if (!db || !isAdmin) {
      setPendingPosts([]);
      setReports([]);
      setModerationLogs([]);
      return;
    }

    try {
      // Pending posts query
      const pendingQuery = query(
        collection(db, 'posts'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );

      const unsubPending = onSnapshot(
        pendingQuery,
        (snapshot) => {
          const pendingList: Post[] = [];
          snapshot.forEach((docSnap) => {
            pendingList.push(mapDocToPost(docSnap.id, docSnap.data()));
          });
          setPendingPosts(pendingList);
        },
        (error) => {
          console.warn('Pending posts query notice:', error.message);
        }
      );

      // Reports query
      const reportsQuery = query(
        collection(db, 'reports'),
        orderBy('createdAt', 'desc')
      );

      const unsubReports = onSnapshot(
        reportsQuery,
        (snapshot) => {
          const repList: Report[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            repList.push({
              reportId: docSnap.id,
              postId: data.postId || '',
              reporterUid: data.reporterUid || '',
              reason: data.reason || 'Other',
              details: data.details || undefined,
              status: data.status || 'pending',
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
              reviewedAt: data.reviewedAt?.toDate ? data.reviewedAt.toDate().toISOString() : data.reviewedAt || undefined,
            });
          });
          setReports(repList);
        },
        (error) => {
          console.warn('Reports query notice:', error.message);
        }
      );

      // Moderation Logs query
      const logsQuery = query(
        collection(db, 'moderationLogs'),
        orderBy('createdAt', 'desc')
      );

      const unsubLogs = onSnapshot(
        logsQuery,
        (snapshot) => {
          const logsList: ModerationLog[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            logsList.push({
              logId: docSnap.id,
              postId: data.postId || '',
              moderatorUid: data.moderatorUid || '',
              action: data.action || 'approve',
              reason: data.reason || undefined,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
            });
          });
          setModerationLogs(logsList);
        },
        (error) => {
          console.warn('Logs query notice:', error.message);
        }
      );

      return () => {
        unsubPending();
        unsubReports();
        unsubLogs();
      };
    } catch (e) {
      console.warn('Admin moderation listener error:', e);
    }
  }, [isAdmin]);

  // 4. Fetch User Reactions for currently loaded posts
  useEffect(() => {
    if (!db || !user || posts.length === 0) return;

    let isMounted = true;
    const fetchReactions = async () => {
      const reactionsMap: Record<string, ReactionType> = {};
      try {
        await Promise.all(
          posts.map(async (post) => {
            const reactionDocRef = doc(db!, 'posts', post.postId, 'reactions', user.uid);
            const reactionSnap = await getDoc(reactionDocRef);
            if (reactionSnap.exists()) {
              reactionsMap[post.postId] = reactionSnap.data()?.type as ReactionType;
            }
          })
        );
        if (isMounted) {
          setUserReactions(reactionsMap);
        }
      } catch (e) {
        console.warn('Error fetching reactions:', e);
      }
    };

    fetchReactions();
    return () => {
      isMounted = false;
    };
  }, [posts, user]);

  // Toggle reaction via Firestore transaction to prevent count drift
  const toggleReaction = async (postId: string, reactionType: ReactionType) => {
    if (!user) {
      throw new Error('Authentication required to react.');
    }
    if (!db) {
      throw new Error('Firestore is not initialized.');
    }

    const postRef = doc(db, 'posts', postId);
    const reactionRef = doc(db, 'posts', postId, 'reactions', user.uid);

    try {
      await runTransaction(db, async (transaction) => {
        const postDoc = await transaction.get(postRef);
        if (!postDoc.exists()) {
          throw new Error('Post does not exist.');
        }

        const postData = postDoc.data();
        if (postData.status !== 'approved') {
          throw new Error('Cannot react to unapproved posts.');
        }

        const reactionDoc = await transaction.get(reactionRef);
        const currentCounts = {
          laugh: Number(postData.reactionCounts?.laugh) || 0,
          skull: Number(postData.reactionCounts?.skull) || 0,
          clown: Number(postData.reactionCounts?.clown) || 0,
          heart: Number(postData.reactionCounts?.heart) || 0,
        };

        if (reactionDoc.exists()) {
          const existingType = reactionDoc.data()?.type as ReactionType;
          if (existingType === reactionType) {
            // Remove reaction
            transaction.delete(reactionRef);
            currentCounts[reactionType] = Math.max(0, currentCounts[reactionType] - 1);
            setUserReactions((prev) => {
              const next = { ...prev };
              delete next[postId];
              return next;
            });
          } else {
            // Switch reaction
            transaction.update(reactionRef, {
              type: reactionType,
              updatedAt: serverTimestamp(),
            });
            currentCounts[existingType] = Math.max(0, currentCounts[existingType] - 1);
            currentCounts[reactionType] = (currentCounts[reactionType] || 0) + 1;
            setUserReactions((prev) => ({ ...prev, [postId]: reactionType }));
          }
        } else {
          // Add new reaction
          transaction.set(reactionRef, {
            uid: user.uid,
            type: reactionType,
            createdAt: serverTimestamp(),
          });
          currentCounts[reactionType] = (currentCounts[reactionType] || 0) + 1;
          setUserReactions((prev) => ({ ...prev, [postId]: reactionType }));
        }

        transaction.update(postRef, {
          reactionCounts: currentCounts,
          updatedAt: serverTimestamp(),
        });
      });
    } catch (err: any) {
      console.error('Failed to toggle reaction:', err);
      throw err;
    }
  };

  // Create post submission with real Cloud Storage upload and Firestore document
  const createPost = async (
    {
      file,
      caption,
      category,
      consentConfirmed,
    }: {
      file: File;
      caption: string;
      category: PostCategory;
      consentConfirmed: boolean;
    },
    onProgress?: (progress: number, stage?: UploadStage, details?: UploadProgressDetails) => void
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'You must be signed in with a verified @cvv.ac.in account.' };
    }

    if (!consentConfirmed) {
      return { success: false, error: 'You must confirm permission and consent from people featured.' };
    }

    if (!file) {
      return { success: false, error: 'Please choose an image to upload.' };
    }

    // Allow high-res camera photos up to 30 MB (e.g. 12-48MP iPhone/Android captures)
    // The client-side optimizer will compress it to ~200-450 KB in milliseconds
    if (file.size > 30 * 1024 * 1024) {
      return { success: false, error: 'Original image is too large (> 30 MB). Please choose a photo under 30 MB.' };
    }

    const validMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/pjpeg',
      'image/heic',
      'image/heif',
    ];
    const isMimeValid =
      !file.type ||
      validMimes.includes(file.type.toLowerCase()) ||
      Boolean(file.name.match(/\.(jpe?g|png|webp|gif|heic|heif)$/i));

    if (!isMimeValid) {
      return { success: false, error: 'Allowed formats: JPEG, PNG, WEBP, GIF, or HEIC.' };
    }

    if (!caption || caption.trim().length < 3) {
      return { success: false, error: 'Caption must be at least 3 characters.' };
    }

    if (caption.trim().length > 280) {
      return { success: false, error: 'Caption cannot exceed 280 characters.' };
    }

    if (!db) {
      return { success: false, error: 'Firebase Firestore database is not available.' };
    }

    // Phase 1: High-Speed Client-side Image Optimization
    if (onProgress) {
      onProgress(15, 'compressing', {
        progress: 15,
        stage: 'compressing',
      });
    }

    let compressionResult;
    try {
      compressionResult = await compressImageForUpload(file, {
        maxWidth: 1280,
        maxHeight: 1280,
        quality: 0.80,
        targetMaxKB: 300,
      });
    } catch (compressErr) {
      console.warn('Image optimization fallback:', compressErr);
    }

    // Extract Base64 Data URL for storing directly in Firebase DB
    let dataUrl = compressionResult?.dataUrl;
    if (!dataUrl) {
      try {
        dataUrl = await blobToDataUrl(compressionResult?.file || file);
      } catch (e) {
        return {
          success: false,
          error: 'Could not process photo for Firebase DB storage. Please try another image.',
        };
      }
    }

    // Ensure image fits comfortably within Firestore's 1 MiB limit (< 800 KB base64)
    if (dataUrl.length > 850000) {
      try {
        const secondary = await compressImageForUpload(file, {
          maxWidth: 960,
          maxHeight: 960,
          quality: 0.65,
          targetMaxKB: 200,
        });
        if (secondary?.dataUrl) {
          dataUrl = secondary.dataUrl;
        }
      } catch (err) {
        console.warn('Secondary compression pass notice:', err);
      }
    }

    const approxBytes = Math.round(dataUrl.length * 0.75);
    const postId = `post_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const imagePath = `firebasedb:posts/${postId}/photo`;

    // Phase 2: Storing photo into Firebase DB
    if (onProgress) {
      onProgress(50, 'uploading', {
        progress: 50,
        stage: 'uploading',
        bytesTransferred: Math.round(approxBytes * 0.4),
        totalBytes: approxBytes,
      });
    }

    // Slight simulation for smooth visual feedback on instantaneous DB writes
    await new Promise((r) => setTimeout(r, 120));

    if (onProgress) {
      onProgress(85, 'uploading', {
        progress: 85,
        stage: 'uploading',
        bytesTransferred: approxBytes,
        totalBytes: approxBytes,
      });
    }

    // Phase 3: Register post document in Firebase DB
    if (onProgress) {
      onProgress(92, 'saving', {
        progress: 92,
        stage: 'saving',
      });
    }

    try {
      const postDocRef = doc(db, 'posts', postId);
      await setDoc(postDocRef, {
        postId,
        authorUid: user.uid,
        authorDisplayName: user.displayName || 'Campus Student',
        authorPhotoURL: user.photoURL || null,
        imagePath,
        imageUrl: dataUrl,
        caption: caption.trim(),
        category,
        status: 'pending', // Pending moderation
        consentConfirmed: true,
        reactionCounts: { laugh: 0, skull: 0, clown: 0, heart: 0 },
        reportCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      if (onProgress) {
        onProgress(100, 'done', {
          progress: 100,
          stage: 'done',
        });
      }

      return { success: true };
    } catch (docError: any) {
      console.error('Firebase DB post creation error:', docError);
      return {
        success: false,
        error: `Database write failed: ${docError.message || 'Check Firestore Security Rules.'}`,
      };
    }
  };

  // Moderator approval
  const approvePost = async (postId: string) => {
    if (!isAdmin || !user || !db) return;

    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        status: 'approved',
        approvedAt: serverTimestamp(),
        approvedBy: user.uid,
        updatedAt: serverTimestamp(),
      });

      // Audit log
      const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await setDoc(doc(db, 'moderationLogs', logId), {
        logId,
        postId,
        moderatorUid: user.uid,
        action: 'approve',
        reason: 'Post complies with campus standards and verified consent.',
        createdAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.error('Approve post error:', err);
    }
  };

  // Moderator rejection
  const rejectPost = async (postId: string, reason?: string) => {
    if (!isAdmin || !user || !db) return;

    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        status: 'rejected',
        rejectionReason: reason || 'Does not meet campus community standards.',
        updatedAt: serverTimestamp(),
      });

      const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await setDoc(doc(db, 'moderationLogs', logId), {
        logId,
        postId,
        moderatorUid: user.uid,
        action: 'reject',
        reason: reason || 'Community standards violation',
        createdAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.error('Reject post error:', err);
    }
  };

  // Moderator remove published post
  const removePost = async (postId: string, reason?: string) => {
    if (!isAdmin || !user || !db) return;

    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        status: 'removed',
        rejectionReason: reason || 'Removed following user report or administrative review.',
        updatedAt: serverTimestamp(),
      });

      const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await setDoc(doc(db, 'moderationLogs', logId), {
        logId,
        postId,
        moderatorUid: user.uid,
        action: 'remove',
        reason: reason || 'Administrative removal',
        createdAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.error('Remove post error:', err);
    }
  };

  // Author deleting own post
  const deleteOwnPost = async (postId: string) => {
    if (!user || !db) return;

    try {
      const postRef = doc(db, 'posts', postId);
      const postSnap = await getDoc(postRef);
      if (!postSnap.exists()) return;

      const postData = postSnap.data();
      if (postData.authorUid !== user.uid && !isAdmin) {
        console.warn('Permission denied: You can only remove your own posts.');
        return;
      }

      // Author can soft-delete by setting status to removed, or delete if pending
      if (postData.status === 'pending' || isAdmin) {
        await deleteDoc(postRef);
        // Also clean up storage image if it was uploaded to legacy storage
        if (postData.imagePath && !postData.imagePath.startsWith('firebasedb:') && storage) {
          try {
            await deleteObject(ref(storage, postData.imagePath));
          } catch (e) {
            console.warn('Image delete notice:', e);
          }
        }
      } else {
        await updateDoc(postRef, {
          status: 'removed',
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err: any) {
      console.error('Delete post error:', err);
    }
  };

  // Submit report
  const reportPost = async (postId: string, reason: ReportReason, details?: string) => {
    if (!user || !db) {
      return;
    }

    try {
      const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await setDoc(doc(db, 'reports', reportId), {
        reportId,
        postId,
        reporterUid: user.uid,
        reason,
        details: details || null,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      // Increment reportCount on the post
      const postRef = doc(db, 'posts', postId);
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        const cur = Number(postSnap.data()?.reportCount) || 0;
        await updateDoc(postRef, {
          reportCount: cur + 1,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err: any) {
      console.error('Report submission error:', err);
    }
  };

  const refreshPosts = async () => {
    if (!db) return;
    try {
      const approvedQuery = query(
        collection(db, 'posts'),
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(approvedQuery);
      const loaded: Post[] = [];
      snapshot.forEach((docSnap) => {
        loaded.push(mapDocToPost(docSnap.id, docSnap.data()));
      });
      setPosts(loaded);
    } catch (e) {
      console.warn('Refresh posts error:', e);
    }
  };

  // Filtering
  const filteredPosts = posts.filter((post) => {
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      post.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.authorDisplayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate trending rankings purely from real approved posts and valid reactions
  const trendingPosts = [...posts].sort((a, b) => {
    const totalA =
      (a.reactionCounts.laugh || 0) +
      (a.reactionCounts.skull || 0) +
      (a.reactionCounts.clown || 0) +
      (a.reactionCounts.heart || 0);
    const totalB =
      (b.reactionCounts.laugh || 0) +
      (b.reactionCounts.skull || 0) +
      (b.reactionCounts.clown || 0) +
      (b.reactionCounts.heart || 0);
    return totalB - totalA;
  });

  return (
    <PostContext.Provider
      value={{
        posts,
        loading,
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        filteredPosts,
        trendingPosts,
        userReactions,
        toggleReaction,
        createPost,
        approvePost,
        rejectPost,
        removePost,
        deleteOwnPost,
        reportPost,
        pendingPosts,
        reports,
        moderationLogs,
        userPosts,
        selectedPost,
        setSelectedPost,
        refreshPosts,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};

export const usePosts = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
};
