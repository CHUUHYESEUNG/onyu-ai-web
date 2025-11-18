/**
 * Supabase API 함수
 *
 * 실제 Supabase 데이터베이스와 통신하는 함수들을 제공합니다.
 * lib/mock-api.ts를 대체합니다.
 */

import { supabase } from './supabase';
import type { Database } from '@/types/database';
import type { TimelineEvent, Section } from '@/types/edit';

type TimelineEventRow = Database['public']['Tables']['timeline_events']['Row'];
type TimelineEventInsert = Database['public']['Tables']['timeline_events']['Insert'];
type TimelineEventUpdate = Database['public']['Tables']['timeline_events']['Update'];

type SectionRow = Database['public']['Tables']['sections']['Row'];
type SectionInsert = Database['public']['Tables']['sections']['Insert'];
type SectionUpdate = Database['public']['Tables']['sections']['Update'];

type SubsectionInsert = Database['public']['Tables']['subsections']['Insert'];

/**
 * 프로젝트의 타임라인 이벤트 목록을 가져옵니다.
 *
 * @param projectId 프로젝트 ID
 * @returns 타임라인 이벤트 배열
 */
export async function getTimeline(projectId: string): Promise<TimelineEvent[]> {
  const { data, error } = await supabase
    .from('timeline_events')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Failed to fetch timeline:', error);
    throw new Error('타임라인을 불러올 수 없습니다.');
  }

  // DB Row를 UI 타입으로 변환
  return (data || []).map(row => ({
    id: row.id,
    label: row.label,
    date: row.date || undefined,
    status: row.status || undefined,
  }));
}

/**
 * 프로젝트의 섹션 목록을 가져옵니다.
 *
 * @param projectId 프로젝트 ID
 * @param eventId 특정 이벤트의 섹션만 필터링 (선택사항)
 * @returns 섹션 배열
 */
export async function getSections(
  projectId: string,
  eventId?: string
): Promise<Section[]> {
  let query = supabase
    .from('sections')
    .select('*')
    .eq('project_id', projectId);

  if (eventId) {
    query = query.eq('event_id', eventId);
  }

  const { data, error } = await query.order('order_index', { ascending: true });

  if (error) {
    console.error('Failed to fetch sections:', error);
    throw new Error('섹션을 불러올 수 없습니다.');
  }

  // DB Row를 UI 타입으로 변환
  return (data || []).map(row => ({
    id: row.id,
    title: row.title,
    excerpt: row.excerpt || '',
    content: row.content || '',
    eventId: row.event_id || undefined,
  }));
}

/**
 * 타임라인 이벤트를 생성합니다.
 *
 * @param input 생성할 이벤트 데이터
 * @returns 생성된 이벤트
 */
export async function createTimelineEvent(input: {
  projectId: string;
  id: string;
  label: string;
  date?: string;
  description?: string;
}): Promise<TimelineEvent> {
  // 현재 최대 order_index 조회
  const { data: existing } = await supabase
    .from('timeline_events')
    .select('order_index')
    .eq('project_id', input.projectId)
    .order('order_index', { ascending: false })
    .limit(1);

  const maxOrder = existing?.[0]?.order_index ?? 0;

  const newEvent: TimelineEventInsert = {
    id: input.id,
    project_id: input.projectId,
    label: input.label,
    date: input.date || null,
    description: input.description || null,
    order_index: maxOrder + 1,
    status: 'todo',
  };

  const { data, error } = await supabase
    .from('timeline_events')
    .insert(newEvent)
    .select()
    .single();

  if (error) {
    console.error('Failed to create timeline event:', error);
    throw new Error('대주제를 생성할 수 없습니다.');
  }

  return {
    id: data.id,
    label: data.label,
    date: data.date || undefined,
    status: data.status || undefined,
  };
}

/**
 * 타임라인 이벤트를 수정합니다.
 *
 * @param eventId 이벤트 ID
 * @param updates 수정할 데이터
 * @returns 수정된 이벤트
 */
export async function updateTimelineEvent(
  eventId: string,
  updates: {
    label?: string;
    date?: string;
    description?: string;
    status?: 'todo' | 'done';
  }
): Promise<TimelineEvent> {
  const updateData: TimelineEventUpdate = {};

  if (updates.label !== undefined) updateData.label = updates.label;
  if (updates.date !== undefined) updateData.date = updates.date || null;
  if (updates.description !== undefined) updateData.description = updates.description || null;
  if (updates.status !== undefined) updateData.status = updates.status;

  const { data, error } = await supabase
    .from('timeline_events')
    .update(updateData)
    .eq('id', eventId)
    .select()
    .single();

  if (error) {
    console.error('Failed to update timeline event:', error);
    throw new Error('대주제를 수정할 수 없습니다.');
  }

  return {
    id: data.id,
    label: data.label,
    date: data.date || undefined,
    status: data.status || undefined,
  };
}

/**
 * 섹션을 생성합니다.
 *
 * @param input 생성할 섹션 데이터
 * @returns 생성된 섹션
 */
export async function createSection(input: {
  projectId: string;
  id: string;
  title: string;
  content?: string;
  eventId?: string;
}): Promise<Section> {
  // 현재 최대 order_index 조회
  const { data: existing } = await supabase
    .from('sections')
    .select('order_index')
    .eq('project_id', input.projectId)
    .order('order_index', { ascending: false })
    .limit(1);

  const maxOrder = existing?.[0]?.order_index ?? 0;

  const newSection: SectionInsert = {
    id: input.id,
    project_id: input.projectId,
    event_id: input.eventId || null,
    title: input.title,
    content: input.content || '',
    excerpt: input.content ? input.content.substring(0, 150) + '...' : '',
    order_index: maxOrder + 1,
  };

  const { data, error } = await supabase
    .from('sections')
    .insert(newSection)
    .select()
    .single();

  if (error) {
    console.error('Failed to create section:', error);
    throw new Error('소주제를 생성할 수 없습니다.');
  }

  return {
    id: data.id,
    title: data.title,
    excerpt: data.excerpt || '',
    content: data.content || '',
    eventId: data.event_id || undefined,
  };
}

/**
 * 섹션을 저장합니다 (content 업데이트).
 *
 * @param sectionId 섹션 ID
 * @param content 새 내용
 * @returns void
 */
export async function saveSection(
  sectionId: string,
  content: string
): Promise<void> {
  // excerpt 자동 생성 (첫 150자 + ...)
  const excerpt = content.length > 150
    ? content.substring(0, 150) + '...'
    : content;

  const updateData: SectionUpdate = {
    content,
    excerpt,
  };

  const { error } = await supabase
    .from('sections')
    .update(updateData)
    .eq('id', sectionId);

  if (error) {
    console.error('Failed to save section:', error);
    throw new Error('섹션을 저장할 수 없습니다.');
  }
}

/**
 * 타임라인 이벤트 순서를 변경합니다.
 *
 * @param projectId 프로젝트 ID
 * @param eventIds 새로운 순서의 이벤트 ID 배열
 */
export async function reorderTimelineEvents(
  projectId: string,
  eventIds: string[]
): Promise<void> {
  // 각 이벤트의 order_index 업데이트
  const updates = eventIds.map((id, index) => ({
    id,
    order_index: index + 1,
  }));

  for (const update of updates) {
    await supabase
      .from('timeline_events')
      .update({ order_index: update.order_index })
      .eq('id', update.id)
      .eq('project_id', projectId);
  }
}

/**
 * 섹션 순서를 변경합니다.
 *
 * @param projectId 프로젝트 ID
 * @param sectionIds 새로운 순서의 섹션 ID 배열
 */
export async function reorderSections(
  projectId: string,
  sectionIds: string[]
): Promise<void> {
  // 각 섹션의 order_index 업데이트
  const updates = sectionIds.map((id, index) => ({
    id,
    order_index: index + 1,
  }));

  for (const update of updates) {
    await supabase
      .from('sections')
      .update({ order_index: update.order_index })
      .eq('id', update.id)
      .eq('project_id', projectId);
  }
}

/**
 * 오디오 파일을 업로드합니다.
 *
 * @param file 오디오 파일
 * @param projectId 프로젝트 ID
 * @returns 업로드된 파일 정보 (assetId, filePath)
 */
export async function uploadAudio(
  file: File,
  projectId: string
): Promise<{ assetId: string; filePath: string }> {
  // 1. Storage에 파일 업로드
  const timestamp = Date.now();
  const fileName = `${timestamp}_${file.name}`;
  const filePath = `${projectId}/${fileName}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('audio-uploads')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Failed to upload audio:', uploadError);
    throw new Error('오디오 파일을 업로드할 수 없습니다.');
  }

  // 2. DB에 audio_assets 레코드 생성
  const { data: assetData, error: assetError } = await supabase
    .from('audio_assets')
    .insert({
      project_id: projectId,
      file_path: uploadData.path,
      file_size: file.size,
      status: 'uploaded',
      progress: 0,
    })
    .select()
    .single();

  if (assetError) {
    console.error('Failed to create audio asset:', assetError);
    throw new Error('오디오 메타데이터를 생성할 수 없습니다.');
  }

  return {
    assetId: assetData.id,
    filePath: uploadData.path,
  };
}

/**
 * 소단락을 DB에 저장합니다.
 *
 * @param sectionId 섹션 ID
 * @param subsections 소단락 배열
 */
export async function saveSubsections(
  sectionId: string,
  subsections: Array<{
    title: string;
    content: string;
    sourceType: 'text' | 'voice' | 'file';
  }>
): Promise<void> {
  const inserts: SubsectionInsert[] = subsections.map((sub, index) => ({
    section_id: sectionId,
    title: sub.title,
    content: sub.content,
    source_type: sub.sourceType,
    order_index: index + 1,
  }));

  const { error } = await supabase
    .from('subsections')
    .insert(inserts);

  if (error) {
    console.error('Failed to save subsections:', error);
    throw new Error('소단락을 저장할 수 없습니다.');
  }
}

/**
 * 섹션의 소단락 목록을 조회합니다.
 *
 * @param sectionId 섹션 ID
 * @returns 소단락 배열
 */
export async function getSubsections(sectionId: string) {
  const { data, error } = await supabase
    .from('subsections')
    .select('*')
    .eq('section_id', sectionId)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Failed to fetch subsections:', error);
    throw new Error('소단락을 불러올 수 없습니다.');
  }

  return data || [];
}
