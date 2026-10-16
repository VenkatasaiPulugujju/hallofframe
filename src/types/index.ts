export type UserRole = 'student' | 'moderator' | 'admin';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  status: 'active' | 'suspended';
  createdAt: string;
}

export type PostCategory =
  | 'Hostel Shenanigans'
  | 'Canteen Chronicles'
  | 'Exam Brainrot'
  | 'Lab Disasters'
  | 'Fest Fever'
  | 'Library Stealth'
  | 'General Chaos';

export type ReactionType = 'laugh' | 'skull' | 'clown';

export type PostStatus = 'pending' | 'approved' | 'rejected' | 'removed';

export interface ReactionCounts {
  laugh: number;
  skull: number;
  clown: number;
}

export interface Post {
  postId: string;
  authorUid: string;
  authorDisplayName: string;
  authorPhotoURL?: string;
  imagePath: string;
  imageUrl: string;
  caption: string;
  category: PostCategory;
  status: PostStatus;
  consentConfirmed: boolean;
  reactionCounts: ReactionCounts;
  reportCount: number;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
}

export interface UserReaction {
  uid: string;
  type: ReactionType;
  createdAt: string;
  updatedAt?: string;
}

export type ReportReason =
  | 'No Consent'
  | 'Bullying/Harassment'
  | 'Hate Speech'
  | 'Not College Related'
  | 'Spam/Fake'
  | 'Other';

export interface Report {
  reportId: string;
  postId: string;
  reporterUid: string;
  reason: ReportReason;
  details?: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  createdAt: string;
  reviewedAt?: string;
}

export interface ModerationLog {
  logId: string;
  postId: string;
  moderatorUid: string;
  action: 'approve' | 'reject' | 'remove' | 'dismiss_report';
  reason?: string;
  createdAt: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}
