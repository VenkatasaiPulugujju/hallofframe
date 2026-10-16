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
@@
       await setDoc(postDocRef, {
         postId,
         authorUid: user.uid,
         authorDisplayName: user.displayName || 'Campus Student',
         authorPhotoURL: user.photoURL || null,
         imagePath,
         imageUrl: dataUrl,
         caption: caption.trim(),
         category,
-        status: 'pending', // Pending moderation
+        status: 'approved',
         consentConfirmed: true,
         reactionCounts: { laugh: 0, skull: 0, clown: 0, heart: 0 },
         reportCount: 0,
         createdAt: serverTimestamp(),
+        approvedAt: serverTimestamp(),
+        approvedBy: user.uid,
         updatedAt: serverTimestamp(),
       });
