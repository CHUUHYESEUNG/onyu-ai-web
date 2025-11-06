/**
 * Supabase 클라이언트 설정
 *
 * 브라우저와 서버 환경 모두에서 사용 가능한 Supabase 클라이언트를 제공합니다.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// 환경 변수 검증
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.\n' +
    '필요한 변수: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}

/**
 * 브라우저 및 서버 사이드에서 사용할 Supabase 클라이언트
 *
 * @example
 * import { supabase } from '@/lib/supabase';
 *
 * const { data, error } = await supabase
 *   .from('projects')
 *   .select('*');
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

/**
 * 서버 사이드 전용 Supabase 클라이언트 (Service Role)
 * Route Handler에서 RLS 우회가 필요한 경우 사용
 *
 * @example
 * import { supabaseAdmin } from '@/lib/supabase';
 *
 * // RLS를 우회하고 모든 데이터에 접근
 * const { data } = await supabaseAdmin
 *   .from('admin_only_table')
 *   .select('*');
 */
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Storage 헬퍼 함수
 */
export const storage = {
  /**
   * 오디오 파일 업로드
   * @param file - 업로드할 파일
   * @param projectId - 프로젝트 ID
   * @returns 업로드된 파일의 공개 URL
   */
  async uploadAudio(file: File, projectId: string): Promise<string> {
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `${projectId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('audio-uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error(`오디오 업로드 실패: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('audio-uploads')
      .getPublicUrl(data.path);

    return publicUrl;
  },

  /**
   * 오디오 파일 다운로드
   * @param filePath - 파일 경로
   * @returns Blob 데이터
   */
  async downloadAudio(filePath: string): Promise<Blob> {
    const { data, error } = await supabase.storage
      .from('audio-uploads')
      .download(filePath);

    if (error) {
      throw new Error(`오디오 다운로드 실패: ${error.message}`);
    }

    return data;
  },

  /**
   * 생성된 문서(PDF/EPUB) 업로드
   * @param file - 업로드할 파일
   * @param projectId - 프로젝트 ID
   * @param type - 파일 타입 (pdf, epub)
   * @returns 공개 URL
   */
  async uploadDocument(file: Blob, projectId: string, type: 'pdf' | 'epub'): Promise<string> {
    const fileName = `${projectId}.${type}`;
    const filePath = `${projectId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      throw new Error(`문서 업로드 실패: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(data.path);

    return publicUrl;
  },
};

/**
 * Realtime 헬퍼 함수
 */
export const realtime = {
  /**
   * 음성 처리 진행 상황 구독
   * @param assetId - 오디오 에셋 ID
   * @param callback - 상태 변경 시 실행할 콜백
   * @returns Unsubscribe 함수
   */
  subscribeToAudioProcessing(
    assetId: string,
    callback: (status: string, progress?: number) => void
  ) {
    const channel = supabase
      .channel(`audio_processing_${assetId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'audio_assets',
          filter: `id=eq.${assetId}`,
        },
        (payload) => {
          callback(payload.new.status, payload.new.progress);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * 섹션 자동 저장 구독
   * @param sectionId - 섹션 ID
   * @param callback - 변경 시 실행할 콜백
   * @returns Unsubscribe 함수
   */
  subscribeToSection(sectionId: string, callback: (section: any) => void) {
    const channel = supabase
      .channel(`section_${sectionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sections',
          filter: `id=eq.${sectionId}`,
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
