'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { TimelineBar } from '@/components/edit/timeline-bar';
import { SectionList } from '@/components/edit/section-list';
import { SectionEditor } from '@/components/edit/section-editor';
import { RecordingPanel } from '@/components/edit/recording-panel';
import { AddSectionModal } from '@/components/modals/add-section-modal';
import { TimelineEvent, Section, ProcessingState } from '@/types/edit';
import {
  getTimeline,
  getSections,
  saveSection,
  uploadAudio,
  processAudio,
  reorderTimelineEvents,
  reorderSections,
  createTimelineEvent,
  updateTimelineEvent,
  createSection,
} from '@/lib/mock-api';
import { Button } from '@/components/ui/button';

export default function EditPage() {
  const params = useParams<{ projectId: string }>();
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>();
  const [selectedSectionId, setSelectedSectionId] = useState<string>();
  const [processingState, setProcessingState] = useState<ProcessingState | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [isAddSectionModeOpen, setIsAddSectionModeOpen] = useState(false);
  const [eventForm, setEventForm] = useState({ label: '', date: '', description: '' });
  const [editEventForm, setEditEventForm] = useState({ label: '', date: '', description: '' });
  const initialSectionForm = { title: '', excerpt: '', content: '', eventId: '' };
  const [sectionForm, setSectionForm] = useState(initialSectionForm);
  const [eventError, setEventError] = useState<string | null>(null);
  const [editEventError, setEditEventError] = useState<string | null>(null);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [isUpdatingEvent, setIsUpdatingEvent] = useState(false);
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [sectionOption, setSectionOption] = useState<'text' | 'voice' | 'file'>('text');
  const router = useRouter();

  // 초기 데이터 로드
  useEffect(() => {
    async function loadData() {
      try {
        const [timelineData, sectionsData] = await Promise.all([
          getTimeline(),
          getSections(),
        ]);
        setTimeline(timelineData);
        setSections(sectionsData);
        setSectionForm((prev) => ({
          ...prev,
          eventId: sectionsData[0]?.eventId ?? timelineData[0]?.id ?? '',
        }));

        // 첫 번째 섹션 자동 선택
        if (sectionsData.length > 0) {
          setSelectedSectionId(sectionsData[0].id);
          if (sectionsData[0].eventId) {
            setSelectedEventId(sectionsData[0].eventId);
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // 이벤트 선택 핸들러
  const handleEventSelect = async (eventId: string) => {
    setSelectedEventId(eventId);
    setSectionForm((prev) => ({ ...prev, eventId }));
    // 해당 이벤트의 섹션들만 필터링
    const eventSections = sections.filter((s) => s.eventId === eventId);
    if (eventSections.length > 0) {
      setSelectedSectionId(eventSections[0].id);
    }
  };

  // 섹션 선택 핸들러
  const handleSectionSelect = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    const section = sections.find((s) => s.id === sectionId);
    if (section?.eventId) {
      setSelectedEventId(section.eventId);
    }
  };

  // 섹션 저장 핸들러
  const handleSectionSave = async (sectionId: string, content: string, subsections?: Section['subsections']) => {
    await saveSection(sectionId, content);
    // 섹션 데이터 업데이트
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              content,
              excerpt: content.trim()
                ? content
                    .replace(/\n+/g, ' ')
                    .trim()
                    .slice(0, 100)
                : s.excerpt,
              subsections: subsections ?? s.subsections,
            }
          : s
      )
    );
  };

  // 녹음 시작
  const handleStartRecording = () => {
    setIsRecording(true);
    setProcessingState({ current: 'recording', progress: 0 });
  };

  // 녹음 정지
  const handleStopRecording = () => {
    setIsRecording(false);
    // 여기서 실제 녹음 데이터를 처리
    const mockFile = new File([], 'recording.webm', { type: 'audio/webm' });
    handleUploadFile(mockFile);
  };

  // 파일 업로드 및 처리
  const handleUploadFile = async (file: File) => {
    try {
      setProcessingState({ current: 'uploading', progress: 0 });

      // 업로드
      const { assetId } = await uploadAudio(file);

      // 처리 단계 진행
      for await (const state of processAudio(assetId)) {
        setProcessingState(state);
      }
    } catch (error) {
      console.error('Processing failed:', error);
      setProcessingState({
        current: 'error',
        errorMessage: '처리 중 오류가 발생했습니다.',
      });
    }
  };

  // 타임라인 순서 변경
  const handleTimelineReorder = async (fromIndex: number, toIndex: number) => {
    const newTimeline = [...timeline];
    const [movedItem] = newTimeline.splice(fromIndex, 1);
    newTimeline.splice(toIndex, 0, movedItem);
    setTimeline(newTimeline);

    // API 호출
    await reorderTimelineEvents(newTimeline.map((e) => e.id));
  };

  // 섹션 순서 변경
  const handleSectionReorder = async (fromIndex: number, toIndex: number) => {
    if (selectedEventId) {
      const eventIndices = sections.reduce<number[]>((acc, section, index) => {
        if (section.eventId === selectedEventId) {
          acc.push(index);
        }
        return acc;
      }, []);

      const fromGlobal = eventIndices[fromIndex];
      const toGlobal = eventIndices[toIndex];

      if (fromGlobal === undefined || toGlobal === undefined) {
        return;
      }

      const newSections = [...sections];
      const [movedItem] = newSections.splice(fromGlobal, 1);
      let insertIndex = toGlobal;
      if (fromGlobal < toGlobal) {
        insertIndex = toGlobal - 1;
      }
      newSections.splice(insertIndex, 0, movedItem);
      setSections(newSections);
      await reorderSections(newSections.map((s) => s.id));
    } else {
      const newSections = [...sections];
      const [movedItem] = newSections.splice(fromIndex, 1);
      newSections.splice(toIndex, 0, movedItem);
      setSections(newSections);
      await reorderSections(newSections.map((s) => s.id));
    }
  };

  const selectedSection = sections.find((s) => s.id === selectedSectionId);
  const selectedEvent = timeline.find((e) => e.id === selectedEventId);
  const filteredSections =
    selectedEventId != null
      ? sections.filter((s) => s.eventId === selectedEventId)
      : sections;

  const handleTemporarySave = async () => {
    try {
      setIsSaving(true);
      // 실제 API 연동 전까지는 목업 지연만 수행
      await new Promise((resolve) => setTimeout(resolve, 600));
      console.log('Draft saved (mock)');
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = () => {
    const projectId = params?.projectId;
    if (!projectId) return;
    router.push(`/projects/${projectId}/publish`);
  };

  const openAddEventModal = () => {
    setEventForm({ label: '', date: '', description: '' });
    setEventError(null);
    setIsAddEventOpen(true);
  };

  const openEditEventModal = () => {
    if (!selectedEventId) return;
    const event = timeline.find((item) => item.id === selectedEventId);
    if (!event) return;
    setEditEventForm({
      label: event.label ?? '',
      date: event.date ?? '',
      description: event.description ?? '',
    });
    setEditEventError(null);
    setIsEditEventOpen(true);
  };

  const openAddSectionModeModal = () => {
    const defaultEventId = selectedEventId ?? timeline[0]?.id ?? '';
    setSectionForm({
      title: '',
      excerpt: '',
      content: '',
      eventId: defaultEventId,
    });
    setSectionOption('text');
    setIsAddSectionModeOpen(true);
  };

  const openAddSectionModalForMode = (mode: 'text' | 'voice' | 'file') => {
    setSectionOption(mode);
    setIsAddSectionOpen(true);
  };

  const handleCreateEvent = async () => {
    if (!eventForm.label.trim()) {
      setEventError('대주제 이름을 입력해주세요.');
      return;
    }
    try {
      setIsCreatingEvent(true);
      const newEvent = await createTimelineEvent({
        label: eventForm.label.trim(),
        date: eventForm.date.trim() || undefined,
        description: eventForm.description.trim() || undefined,
      });
      setTimeline((prev) => [...prev, newEvent]);
      setSelectedEventId(newEvent.id);
      setSectionForm((prev) => ({ ...prev, eventId: newEvent.id }));
      setIsAddEventOpen(false);
    } catch (error) {
      console.error('Failed to create timeline event', error);
      setEventError('대주제 생성 중 오류가 발생했습니다.');
    } finally {
      setIsCreatingEvent(false);
    }
  };

  const handleCreateSection = async (formState: typeof initialSectionForm, mode: 'text' | 'voice' | 'file') => {
    try {
      setIsCreatingSection(true);
      let content = formState.content.trim();
      let excerpt = formState.excerpt.trim();
      const subsections: Section['subsections'] = [];

      if (mode === 'text') {
        if (!excerpt) {
          excerpt =
            content.slice(0, 100) ||
            '새로운 소주제가 추가되었습니다.';
        }
      } else if (mode === 'voice') {
        excerpt = '녹음 준비 중';
        content = '녹음 결과가 도착하면 내용이 업데이트됩니다.';
      } else if (mode === 'file') {
        excerpt = '파일 처리 중';
        content = '처리 결과가 도착하면 내용이 업데이트됩니다.';
      }

      const newSection = await createSection({
        title: formState.title.trim(),
        excerpt,
        content,
        eventId: formState.eventId,
        subsections,
      });
      setSections((prev) => [...prev, newSection]);
      setSelectedSectionId(newSection.id);
      setSelectedEventId(formState.eventId);
      setSectionForm(initialSectionForm);
      setIsAddSectionOpen(false);
      if (mode === 'voice') {
        setProcessingState({ current: 'recording', progress: 0 });
      }
    } catch (error) {
      console.error('Failed to create section', error);
    } finally {
      setIsCreatingSection(false);
    }
  };

  const handleUpdateEvent = async () => {
    if (!selectedEventId) return;
    if (!editEventForm.label.trim()) {
      setEditEventError('대주제 이름을 입력해주세요.');
      return;
    }

    try {
      setIsUpdatingEvent(true);
      await updateTimelineEvent(selectedEventId, {
        label: editEventForm.label.trim(),
        date: editEventForm.date.trim() || undefined,
        description: editEventForm.description.trim() || undefined,
      });
      setTimeline((prev) =>
        prev.map((event) =>
          event.id === selectedEventId
            ? {
                ...event,
                label: editEventForm.label.trim(),
                date: editEventForm.date.trim() || undefined,
                description: editEventForm.description.trim() || undefined,
              }
            : event
        )
      );
      setIsEditEventOpen(false);
    } catch (error) {
      console.error('Failed to update timeline event', error);
      setEditEventError('대주제 수정 중 오류가 발생했습니다.');
    } finally {
      setIsUpdatingEvent(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F0E] flex items-center justify-center">
        <div className="text-[#A8C3BC]">로딩 중...</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#0B0F0E] flex flex-col">
      <header className="border-b border-[#1F6F63]/20 bg-[#0F3D35]/30">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-[#2BA08C]/80">프로젝트</p>
            <h1 className="text-lg font-semibold text-[#E6F0ED]">
              #{params?.projectId ?? '프로젝트'} 이야기 편집
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleTemporarySave}
              disabled={isSaving}
              className="border-[#2BA08C]/40 bg-transparent text-[#E6F0ED]"
            >
              {isSaving ? '임시 저장 중...' : '임시 저장'}
            </Button>
            <Button onClick={handleComplete}>편집 완료</Button>
          </div>
        </div>
      </header>

      {/* 타임라인 헤더 */}
      <div className="border-b border-[#1F6F63]/30 bg-[#0E1513]">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-6 py-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-[#A8C3BC]/70">대주제 타임라인</p>
            <p className="text-sm text-[#E6F0ED]/70">
              인생의 주요 사건들을 순서대로 정리하고 필요 시 드래그로 순서를 조정하세요.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={openEditEventModal}
              disabled={!selectedEventId}
              className="border-[#2BA08C]/40 text-[#E6F0ED] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              대주제 수정
            </Button>
            <Button variant="outline" onClick={openAddEventModal} className="border-[#2BA08C]/40 text-[#E6F0ED]">
              <Plus className="mr-2 h-4 w-4" />
              대주제 추가
            </Button>
          </div>
        </div>
      </div>

      {/* 상단 타임라인 */}
      <TimelineBar
        events={timeline}
        selectedEventId={selectedEventId}
        onEventSelect={handleEventSelect}
        onReorder={handleTimelineReorder}
      />

      {/* 3열 레이아웃 */}
      <div className="flex-1 max-w-[1400px] mx-auto w-full px-4 py-6">
        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-180px)]">
          {/* 좌측: 섹션 리스트 */}
          <div className="col-span-3 flex h-full flex-col">
            <div className="mb-3 flex items-center justify-between px-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-[#A8C3BC]/70">소주제 목록</p>
                <p className="text-[11px] text-[#A8C3BC]/50">
                  현재 선택된 대주제에 속한 소주제를 관리합니다.
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={openAddSectionModeModal} className="border-[#2BA08C]/40 text-[#E6F0ED]">
                <Plus className="mr-1 h-4 w-4" />
                소주제 추가
              </Button>
            </div>
            <div className="flex-1">
              <SectionList
                sections={filteredSections}
                selectedSectionId={selectedSectionId}
                onSectionSelect={handleSectionSelect}
                onReorder={handleSectionReorder}
              />
            </div>
          </div>

          {/* 중앙: 에디터 */}
          <div className="col-span-6">
            <SectionEditor
              section={selectedSection || null}
              event={selectedEvent}
              onSave={handleSectionSave}
            />
          </div>

          {/* 우측: 녹음 패널 */}
          <div className="col-span-3">
            <RecordingPanel
              processingState={processingState}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              onUploadFile={handleUploadFile}
              isRecording={isRecording}
            />
          </div>
        </div>
      </div>
      {isAddEventOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsAddEventOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#2BA08C]/30 bg-[#0E1513] p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-[#E6F0ED]">새로운 대주제 추가</h2>
            <p className="mt-1 text-sm text-[#A8C3BC]/70">
              인생의 중요한 사건을 추가하면 타임라인에 새 챕터가 생성됩니다.
            </p>
            <div className="mt-6 space-y-4">
              <label className="space-y-2 text-sm text-[#E6F0ED]/70">
                대주제 이름
                <input
                  type="text"
                  value={eventForm.label}
                  onChange={(e) => {
                    setEventForm((prev) => ({ ...prev, label: e.target.value }));
                    setEventError(null);
                  }}
                  className="w-full rounded-lg border border-[#1F6F63]/40 bg-[#0B1412] px-4 py-2 text-[#E6F0ED] focus:border-[#2BA08C] focus:outline-none focus:ring-1 focus:ring-[#2BA08C]"
                  placeholder="예: 첫 직장에 입사하다"
                />
              </label>

              <label className="space-y-2 text-sm text-[#E6F0ED]/70">
                날짜/기간 (선택)
                <input
                  type="text"
                  value={eventForm.date}
                  onChange={(e) => setEventForm((prev) => ({ ...prev, date: e.target.value }))}
                  className="w-full rounded-lg border border-[#1F6F63]/40 bg-[#0B1412] px-4 py-2 text-[#E6F0ED] focus:border-[#2BA08C] focus:outline-none focus:ring-1 focus:ring-[#2BA08C]"
                  placeholder="예: 1985년 3월"
                />
              </label>

              <label className="space-y-2 text-sm text-[#E6F0ED]/70">
                메모 (선택)
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-[#1F6F63]/40 bg-[#0B1412] px-4 py-2 text-[#E6F0ED] focus:border-[#2BA08C] focus:outline-none focus:ring-1 focus:ring-[#2BA08C]"
                  placeholder="이 시기의 대표적인 에피소드나 감정 등을 기록해 보세요."
                />
              </label>

              {eventError && <p className="text-sm text-red-400">{eventError}</p>}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddEventOpen(false)} className="border-[#2BA08C]/30 text-[#E6F0ED]">
                취소
              </Button>
              <Button onClick={handleCreateEvent} disabled={isCreatingEvent}>
                {isCreatingEvent ? '생성 중...' : '대주제 추가'}
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>

      {isAddSectionModeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsAddSectionModeOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#2BA08C]/30 bg-[#0E1513] p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-[#E6F0ED]">소주제 입력 방식 선택</h2>
            <p className="mt-1 text-sm text-[#A8C3BC]/70">
              새로운 소주제를 어떻게 기록할지 선택해주세요. 언제든 다른 방식을 다시 선택할 수 있습니다.
            </p>
            <div className="mt-6 space-y-3">
              <button
                onClick={() => {
                  openAddSectionModalForMode('text');
                  setIsAddSectionModeOpen(false);
                }}
                className="w-full rounded-xl border border-[#1F6F63]/30 bg-[#0B1412] px-4 py-3 text-left text-[#E6F0ED] transition-colors hover:border-[#2BA08C]/60"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">텍스트로 작성</span>
                  <span className="text-xs text-[#A8C3BC]/60">추천</span>
                </div>
                <p className="mt-1 text-xs text-[#A8C3BC]/70">직접 입력하면서 내용을 정리합니다.</p>
              </button>

              <button
                onClick={() => {
                  openAddSectionModalForMode('voice');
                  setIsAddSectionModeOpen(false);
                }}
                className="w-full rounded-xl border border-[#1F6F63]/30 bg-[#0B1412] px-4 py-3 text-left text-[#E6F0ED] transition-colors hover:border-[#2BA08C]/60"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">음성으로 작성</span>
                </div>
                <p className="mt-1 text-xs text-[#A8C3BC]/70">말로 기록하고 AI가 소단락으로 정리해줍니다.</p>
              </button>

              <button
                onClick={() => {
                  openAddSectionModalForMode('file');
                  setIsAddSectionModeOpen(false);
                }}
                className="w-full rounded-xl border border-[#1F6F63]/30 bg-[#0B1412] px-4 py-3 text-left text-[#E6F0ED] transition-colors hover:border-[#2BA08C]/60"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">파일 가져오기</span>
                </div>
                <p className="mt-1 text-xs text-[#A8C3BC]/70">음성/텍스트 파일을 업로드하면 자동으로 정리됩니다.</p>
              </button>
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={() => setIsAddSectionModeOpen(false)} className="border-[#2BA08C]/30 text-[#E6F0ED]">
                닫기
              </Button>
            </div>
          </div>
        </div>
      )}

      {isEditEventOpen && selectedEventId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsEditEventOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#2BA08C]/30 bg-[#0E1513] p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-[#E6F0ED]">대주제 수정</h2>
            <p className="mt-1 text-sm text-[#A8C3BC]/70">
              잘못 입력된 정보를 수정하거나 보조 설명을 업데이트할 수 있습니다.
            </p>
            <div className="mt-6 space-y-4">
              <label className="space-y-2 text-sm text-[#E6F0ED]/70">
                대주제 이름
                <input
                  type="text"
                  value={editEventForm.label}
                  onChange={(e) => {
                    setEditEventForm((prev) => ({ ...prev, label: e.target.value }));
                    setEditEventError(null);
                  }}
                  className="w-full rounded-lg border border-[#1F6F63]/40 bg-[#0B1412] px-4 py-2 text-[#E6F0ED] focus:border-[#2BA08C] focus:outline-none focus:ring-1 focus:ring-[#2BA08C]"
                  placeholder="예: 첫 직장에 입사하다"
                />
              </label>

              <label className="space-y-2 text-sm text-[#E6F0ED]/70">
                날짜/기간 (선택)
                <input
                  type="text"
                  value={editEventForm.date}
                  onChange={(e) => setEditEventForm((prev) => ({ ...prev, date: e.target.value }))}
                  className="w-full rounded-lg border border-[#1F6F63]/40 bg-[#0B1412] px-4 py-2 text-[#E6F0ED] focus:border-[#2BA08C] focus:outline-none focus:ring-1 focus:ring-[#2BA08C]"
                  placeholder="예: 1985년 3월"
                />
              </label>

              <label className="space-y-2 text-sm text-[#E6F0ED]/70">
                메모 (선택)
                <textarea
                  value={editEventForm.description}
                  onChange={(e) => setEditEventForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-[#1F6F63]/40 bg-[#0B1412] px-4 py-2 text-[#E6F0ED] focus:border-[#2BA08C] focus:outline-none focus:ring-1 focus:ring-[#2BA08C]"
                  placeholder="이 시기의 대표적인 에피소드나 감정 등을 기록해 보세요."
                />
              </label>

              {editEventError && <p className="text-sm text-red-400">{editEventError}</p>}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditEventOpen(false)} className="border-[#2BA08C]/30 text-[#E6F0ED]">
                취소
              </Button>
              <Button onClick={handleUpdateEvent} disabled={isUpdatingEvent}>
                {isUpdatingEvent ? '수정 중...' : '저장'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <AddSectionModal
        mode={sectionOption}
        events={timeline}
        form={sectionForm}
        isOpen={isAddSectionOpen}
        isLoading={isCreatingSection}
        onClose={() => {
          setIsAddSectionOpen(false);
          setSectionForm(initialSectionForm);
        }}
        onFormChange={setSectionForm}
        onSubmit={async () => {
          await handleCreateSection(sectionForm, sectionOption);
        }}
      />
      {/* AddSectionModal handles creation UI */}
    </>
  );
}
