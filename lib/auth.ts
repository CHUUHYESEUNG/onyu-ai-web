/**
 * Supabase 인증 헬퍼 함수
 *
 * 사용자 인증, 세션 관리, 권한 확인 등의 유틸리티를 제공합니다.
 */

import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

/**
 * 이메일로 회원가입합니다.
 *
 * @param email 이메일
 * @param password 비밀번호
 * @param name 사용자 이름 (선택사항)
 * @returns 생성된 사용자 정보
 */
export async function signUp(
  email: string,
  password: string,
  name?: string
): Promise<AuthUser> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name || email.split('@')[0],
      },
    },
  });

  if (error) {
    console.error('Sign up error:', error);
    throw new Error(error.message || '회원가입에 실패했습니다.');
  }

  if (!data.user) {
    throw new Error('사용자 정보를 생성할 수 없습니다.');
  }

  return {
    id: data.user.id,
    email: data.user.email!,
    name: data.user.user_metadata?.name,
  };
}

/**
 * 이메일로 로그인합니다.
 *
 * @param email 이메일
 * @param password 비밀번호
 * @returns 로그인된 사용자 정보
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthUser> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Sign in error:', error);
    throw new Error(error.message || '로그인에 실패했습니다.');
  }

  if (!data.user) {
    throw new Error('사용자 정보를 불러올 수 없습니다.');
  }

  return {
    id: data.user.id,
    email: data.user.email!,
    name: data.user.user_metadata?.name,
  };
}

/**
 * 로그아웃합니다.
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Sign out error:', error);
    throw new Error('로그아웃에 실패했습니다.');
  }
}

/**
 * 현재 로그인된 사용자 정보를 가져옵니다.
 *
 * @returns 현재 사용자 정보 (로그아웃 상태면 null)
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email!,
    name: user.user_metadata?.name,
    avatarUrl: user.user_metadata?.avatar_url,
  };
}

/**
 * 현재 세션을 가져옵니다.
 *
 * @returns 세션 정보 (로그아웃 상태면 null)
 */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * 비밀번호 재설정 이메일을 전송합니다.
 *
 * @param email 이메일
 */
export async function resetPassword(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });

  if (error) {
    console.error('Reset password error:', error);
    throw new Error('비밀번호 재설정 이메일 전송에 실패했습니다.');
  }
}

/**
 * 비밀번호를 변경합니다.
 *
 * @param newPassword 새 비밀번호
 */
export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error('Update password error:', error);
    throw new Error('비밀번호 변경에 실패했습니다.');
  }
}

/**
 * 사용자 프로필을 업데이트합니다.
 *
 * @param updates 업데이트할 정보
 */
export async function updateProfile(updates: {
  name?: string;
  avatarUrl?: string;
}): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    data: {
      name: updates.name,
      avatar_url: updates.avatarUrl,
    },
  });

  if (error) {
    console.error('Update profile error:', error);
    throw new Error('프로필 업데이트에 실패했습니다.');
  }
}

/**
 * 인증 상태 변경 리스너를 등록합니다.
 *
 * @param callback 상태 변경 시 호출될 함수
 * @returns unsubscribe 함수
 */
export function onAuthStateChange(
  callback: (user: AuthUser | null) => void
) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (session?.user) {
        callback({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name,
          avatarUrl: session.user.user_metadata?.avatar_url,
        });
      } else {
        callback(null);
      }
    }
  );

  return () => subscription.unsubscribe();
}

/**
 * 사용자가 특정 프로젝트에 접근 권한이 있는지 확인합니다.
 *
 * @param userId 사용자 ID
 * @param projectId 프로젝트 ID
 * @returns 권한 여부
 */
export async function canAccessProject(
  userId: string,
  projectId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('projects')
    .select('user_id')
    .eq('id', projectId)
    .single();

  if (error || !data) {
    return false;
  }

  return data.user_id === userId;
}
