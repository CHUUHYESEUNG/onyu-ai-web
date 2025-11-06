/**
 * 사용자 및 권한 관련 타입 정의
 */

import { AutobiographyProject } from './autobiography';

// 사용자 역할
export type UserRole = 'owner' | 'family' | 'editor' | 'viewer';

// 사용자 정보
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phoneNumber?: string;
  birthYear?: number;
  projects: AutobiographyProject[];
  createdAt: Date;
  lastLoginAt?: Date;
}

// 프로젝트 멤버 (협업용)
export interface ProjectMember {
  userId: string;
  projectId: string;
  role: UserRole;
  invitedBy: string;
  invitedAt: Date;
  acceptedAt?: Date;
  permissions: ProjectPermissions;
}

// 프로젝트 권한
export interface ProjectPermissions {
  canView: boolean;
  canEdit: boolean;
  canComment: boolean;
  canInvite: boolean;
  canDelete: boolean;
  canPublish: boolean;
}

// 초대 링크
export interface InvitationLink {
  id: string;
  projectId: string;
  createdBy: string;
  role: UserRole;
  expiresAt: Date;
  isActive: boolean;
  usageLimit?: number; // 사용 횟수 제한
  usageCount: number;
}

// 사용자 설정
export interface UserSettings {
  userId: string;
  theme: 'light' | 'dark' | 'auto';
  language: 'ko' | 'en';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  accessibility: {
    fontSize: 'small' | 'medium' | 'large' | 'xlarge';
    highContrast: boolean;
    voiceGuidance: boolean;
  };
}

// 역할별 기본 권한
export const DEFAULT_PERMISSIONS: Record<UserRole, ProjectPermissions> = {
  owner: {
    canView: true,
    canEdit: true,
    canComment: true,
    canInvite: true,
    canDelete: true,
    canPublish: true,
  },
  family: {
    canView: true,
    canEdit: true,
    canComment: true,
    canInvite: false,
    canDelete: false,
    canPublish: false,
  },
  editor: {
    canView: true,
    canEdit: true,
    canComment: true,
    canInvite: false,
    canDelete: false,
    canPublish: false,
  },
  viewer: {
    canView: true,
    canEdit: false,
    canComment: true,
    canInvite: false,
    canDelete: false,
    canPublish: false,
  },
};
