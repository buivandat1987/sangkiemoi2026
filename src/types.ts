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
  }
}

export interface Profile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role: 'user' | 'admin';
}

export interface Initiative {
  id: string;
  title: string;
  description?: string;
  content: string;
  category: 'Mầm non' | 'Tiểu học' | 'Trung học Cơ sở' | 'Trung học Phổ thông' | 'Quản lý Giáo dục' | 'Khác';
  subject?: string;
  authorId: string;
  authorName: string;
  status: 'draft' | 'published' | 'archived';
  likesCount: number;
  createdAt: any;
  updatedAt: any;
}

export interface Comment {
  id: string;
  initiativeId: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: any;
}
