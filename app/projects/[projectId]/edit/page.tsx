'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Mic, MicOff } from 'lucide-react';
import { TimelineBar } from '@/components/edit/timeline-bar';
import { SectionList } from '@/components/edit/section-list';
import { SectionEditor } from '@/components/edit/section-editor';
import { RecordingPanel } from '@/components/edit/recording-panel';
import { CollapsedPanel } from '@/components/edit/collapsed-panel';
import { AddSectionModal } from '@/components/modals/add-section-modal';
import { TimelineEvent, Section, TranscriptItem, SessionMetadata } from '@/types/edit';
import {
  loadGamificationData,
  onSectionCreated,
  onRecordingCompleted,
  onTimelineEventCreated,
} from '@/lib/gamification';
import {
  getTimeline,
  getSections,
  saveSection,
  reorderTimelineEvents,
  reorderSections,
  createTimelineEvent,
  updateTimelineEvent,
  createSection,
} from '@/lib/mock-api';
import { Button } from '@/components/ui/button';

const countWords = (text: string) => {
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  return tokens.length;
};

const splitTranscriptNaturally = (text: string): [string, string] | null => {
  const trimmed = text.trim();
  if (trimmed.length < 40) return null;
  const ideal = Math.floor(trimmed.length / 2);

  const isBreaker = (char: string) => /[.!?]/.test(char);

  const findBreak = (start: number, direction: 1 | -1) => {
    let index = start;
    while (index >= 0 && index < trimmed.length) {
      if (isBreaker(trimmed[index])) {
        return index + 1;
      }
      index += direction;
    }
    return -1;
  };

  let splitIndex = findBreak(ideal, 1);
  if (splitIndex === -1) {
    splitIndex = findBreak(ideal, -1);
  }

  if (splitIndex === -1) {
    splitIndex = ideal;
  }

  const first = trimmed.slice(0, splitIndex).trim();
  const second = trimmed.slice(splitIndex).trim();

  if (!first || !second) {
    return null;
  }

  return [first, second];
};

const reindexFragments = (items: TranscriptItem[]) => {
  const sessionCounters = new Map<string, number>();
  return items.map((item) => {
    const currentIndex = sessionCounters.get(item.sessionId) ?? 0;
    sessionCounters.set(item.sessionId, currentIndex + 1);
    return { ...item, chunkIndex: currentIndex };
  });
};

const DEMO_TRANSCRIPTS = [
  '1950년대 피난길에 들었던 냄새와 바닷바람을 아직도 기억해요. 가족이 한데 모여 있어서 무엇보다 든든했고요.',
  '첫 직장에 입사하던 날, 새 구두가 얼마나 발을 아프게 하던지요. 그래도 부모님이 웃으시는 모습이 잊히지 않아요.',
  '아이들이 태어나고 나선 하루가 눈 깜짝할 사이에 지나갔어요. 잠은 부족했지만 웃음이 끊이질 않았죠.',
];

export default function EditPage() {
  const params = useParams<{ projectId: string }>();
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>();
  const [selectedSectionId, setSelectedSectionId] = useState<string>();
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

  // 패널 토글 상태
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [isRecordingPanelPinned, setIsRecordingPanelPinned] = useState(false);

  // 녹음 히스토리 관리
  const [transcriptHistory, setTranscriptHistory] = useState<TranscriptItem[]>([]);
  const [editorCursorPosition, setEditorCursorPosition] = useState(0);

  // 세션 관리
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessionMetadata, setSessionMetadata] = useState<Map<string, SessionMetadata>>(new Map());

  const router = useRouter();

  // 프로젝트 제목 매핑 (임시 - 추후 API로 대체)
  const getProjectTitle = (projectId?: string) => {
    const projectTitles: Record<string, string> = {
      'project-1': '할아버지의 이야기',
      'project-2': '나의 청춘 시절',
      'project-3': '가족과 함께한 시간',
    };
    return projectTitles[projectId || ''] || '프로젝트';
  };

  // 패널 토글 상태 localStorage 로드
  useEffect(() => {
    const savedLeftCollapsed = localStorage.getItem('leftPanelCollapsed');
    const savedRightCollapsed = localStorage.getItem('rightPanelCollapsed');

    if (savedLeftCollapsed !== null) {
      setLeftPanelCollapsed(JSON.parse(savedLeftCollapsed));
    }
    if (savedRightCollapsed !== null) {
      setRightPanelCollapsed(JSON.parse(savedRightCollapsed));
    }
    const savedRecordingPinned = localStorage.getItem('recordingPanelPinned');
    if (savedRecordingPinned !== null) {
      setIsRecordingPanelPinned(JSON.parse(savedRecordingPinned));
    }
  }, []);

  // 패널 토글 상태 localStorage 저장
  useEffect(() => {
    localStorage.setItem('leftPanelCollapsed', JSON.stringify(leftPanelCollapsed));
  }, [leftPanelCollapsed]);

  useEffect(() => {
    localStorage.setItem('rightPanelCollapsed', JSON.stringify(rightPanelCollapsed));
  }, [rightPanelCollapsed]);

  useEffect(() => {
    localStorage.setItem('recordingPanelPinned', JSON.stringify(isRecordingPanelPinned));
  }, [isRecordingPanelPinned]);

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

  // 세션 관리 헬퍼
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30분

  const isSessionActive = (sessionId: string): boolean => {
    const metadata = sessionMetadata.get(sessionId);
    if (!metadata) return false;
    const timeSinceLastRecording = Date.now() - metadata.lastRecordingTime.getTime();
    return timeSinceLastRecording < SESSION_TIMEOUT;
  };

  const createNewSession = (sectionTitle?: string): string => {
    const newSessionId = `session_${Date.now()}`;
    const now = new Date();
    setSessionMetadata(prev => {
      const next = new Map(prev);
      next.set(newSessionId, {
        sessionId: newSessionId,
        startTime: now,
        lastRecordingTime: now,
        chunkCount: 0,
        totalDuration: 0,
        sectionTitle,
        isActive: true,
      });
      return next;
    });
    setActiveSessionId(newSessionId);
    return newSessionId;
  };

  const updateSessionMetadata = (sessionId: string, duration: number) => {
    setSessionMetadata(prev => {
      const next = new Map(prev);
      const metadata = next.get(sessionId);
      if (metadata) {
        next.set(sessionId, {
          ...metadata,
          lastRecordingTime: new Date(),
          chunkCount: metadata.chunkCount + 1,
          totalDuration: metadata.totalDuration + duration,
          isActive: true,
        });
      }
      return next;
    });
  };

  const getOrCreateActiveSession = (): string => {
    // 현재 활성 세션이 있고 아직 유효하면 재사용
    if (activeSessionId && isSessionActive(activeSessionId)) {
      return activeSessionId;
    }
    // 아니면 새 세션 생성
    return createNewSession(selectedSection?.title);
  };

  // 전사 결과 히스토리에 추가
  const handleAddTranscript = (fragment: {
    transcript: string;
    duration: number;
    sessionId: string;
    chunkIndex: number;
  }) => {
    const trimmed = fragment.transcript.trim();
    if (!trimmed) return;

    showRecordingPanel();

    // 세션 메타데이터 업데이트
    updateSessionMetadata(fragment.sessionId, fragment.duration);

    const newItem: TranscriptItem = {
      id: `transcript_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      transcript: trimmed,
      timestamp: new Date(),
      duration: fragment.duration,
      status: 'draft',
      sessionId: fragment.sessionId,
      chunkIndex: fragment.chunkIndex,
      wordCount: countWords(trimmed),
    };

    setTranscriptHistory((prev) => reindexFragments([...prev, newItem]));

    // 게이미피케이션: 녹음 완료 미션 업데이트
    if (params?.projectId) {
      const gamificationData = loadGamificationData(params.projectId);
      onRecordingCompleted(gamificationData, fragment.duration, newItem.wordCount);
    }
  };

  // 전사 결과 수정
  const handleUpdateTranscript = (id: string, newTranscript: string) => {
    setTranscriptHistory((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, transcript: newTranscript, wordCount: countWords(newTranscript) }
          : item,
      ),
    );
  };

  // 전사 결과 삭제
  const handleDeleteTranscript = (id: string) => {
    setTranscriptHistory((prev) => reindexFragments(prev.filter((item) => item.id !== id)));
  };

  const handleInsertTranscriptIntoEditor = (id: string, transcript: string) => {
    handleAutoInsertToEditor(transcript);
    setTranscriptHistory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'inserted' } : item,
      ),
    );
  };

  const handleMergeFragments = (id: string, direction: 'prev' | 'next') => {
    setTranscriptHistory((prev) => {
      const currentIndex = prev.findIndex((item) => item.id === id);
      if (currentIndex === -1) return prev;
      const neighborIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
      if (neighborIndex < 0 || neighborIndex >= prev.length) return prev;

      const current = prev[currentIndex];
      const neighbor = prev[neighborIndex];
      if (current.sessionId !== neighbor.sessionId) return prev;

      const mergedTranscript =
        direction === 'prev'
          ? `${neighbor.transcript} ${current.transcript}`.trim()
          : `${current.transcript} ${neighbor.transcript}`.trim();

      const primaryIndex = direction === 'prev' ? neighborIndex : currentIndex;
      const secondaryIndex = direction === 'prev' ? currentIndex : neighborIndex;
      const primary = prev[primaryIndex];
      const secondary = prev[secondaryIndex];

      const mergedItem: TranscriptItem = {
        ...primary,
        transcript: mergedTranscript,
        duration: primary.duration + secondary.duration,
        status: primary.status === 'inserted' || secondary.status === 'inserted' ? 'inserted' : 'draft',
        timestamp: primary.timestamp < secondary.timestamp ? primary.timestamp : secondary.timestamp,
        wordCount: countWords(mergedTranscript),
      };

      const copy = [...prev];
      const start = Math.min(currentIndex, neighborIndex);
      copy.splice(start, 2, mergedItem);
      return reindexFragments(copy);
    });
  };

  const handleSplitFragment = (id: string) => {
    setTranscriptHistory((prev) => {
      const index = prev.findIndex((item) => item.id === id);
      if (index === -1) return prev;
      const target = prev[index];
      const splitResult = splitTranscriptNaturally(target.transcript);
      if (!splitResult) return prev;

      const [first, second] = splitResult;
      const firstDuration = Math.max(Math.round(target.duration / 2), 5);
      const secondDuration = Math.max(target.duration - firstDuration, 5);

      const firstFragment: TranscriptItem = {
        ...target,
        transcript: first,
        duration: firstDuration,
        wordCount: countWords(first),
      };

      const secondFragment: TranscriptItem = {
        ...target,
        id: `transcript_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        transcript: second,
        duration: secondDuration,
        wordCount: countWords(second),
        status: 'draft',
        timestamp: new Date(),
      };

      const next = [...prev];
      next.splice(index, 1, firstFragment, secondFragment);
      return reindexFragments(next);
    });
  };

  // 전체 삭제
  const handleClearAllTranscripts = () => {
    if (confirm('모든 녹음 기록을 삭제하시겠습니까?')) {
      setTranscriptHistory([]);
    }
  };

  const handleInjectDummyRecording = () => {
    const sessionId = `demo_${Date.now()}`;
    DEMO_TRANSCRIPTS.forEach((transcript, index) => {
      handleAddTranscript({
        transcript,
        duration: 25 + index * 5,
        sessionId,
        chunkIndex: index,
      });
    });
  };

  // 자동 삽입 함수 (Phase 4에서 구현)
  const handleAutoInsertToEditor = (transcript: string) => {
    if (!selectedSection) {
      alert('먼저 섹션을 선택해주세요.');
      return;
    }

    const currentContent = selectedSection.content;
    const cursorPos = editorCursorPosition;

    // 커서 위치에 텍스트 삽입
    const before = currentContent.slice(0, cursorPos);
    const after = currentContent.slice(cursorPos);

    // 자연스러운 간격 추가
    const spacer = before.endsWith('\n') ? '' : '\n\n';
    const newContent = before + spacer + transcript + '\n\n' + after;

    // 섹션 업데이트
    setSections(prev =>
      prev.map(s =>
        s.id === selectedSection.id
          ? { ...s, content: newContent }
          : s
      )
    );

    // TODO: Phase 7에서 자동 저장 추가
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

  const showRecordingPanel = () => {
    setIsRecordingPanelPinned(true);
    setRightPanelCollapsed(false);
  };

  const hideRecordingPanel = () => {
    setIsRecordingPanelPinned(false);
  };

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
    // voice 모드일 때는 모달에서 "녹음 시작하기" 버튼 클릭 시 패널 펼침
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

      // 게이미피케이션: 타임라인 이벤트 추가 미션 업데이트
      if (params?.projectId) {
        const gamificationData = loadGamificationData(params.projectId);
        onTimelineEventCreated(gamificationData);
      }
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

      // 게이미피케이션: 소주제 작성 미션 업데이트
      if (params?.projectId) {
        const gamificationData = loadGamificationData(params.projectId);
        onSectionCreated(gamificationData);
      }

      if (mode === 'voice') {
        showRecordingPanel();
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
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="text-[#a0a3b1]">로딩 중...</div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white/70 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p>타임라인과 녹음 패널을 사용해 챕터를 정리하고 자서전을 완성하세요.</p>
          <div className="flex flex-wrap gap-2 text-sm">
            <Button
              variant="outline"
              onClick={() => (isRecordingPanelPinned ? hideRecordingPanel() : showRecordingPanel())}
              className={`border-white/30 text-white ${isRecordingPanelPinned ? 'bg-white/10' : 'bg-transparent'}`}
            >
              {isRecordingPanelPinned ? (
                <>
                  <MicOff className="mr-2 h-4 w-4" />
                  녹음 숨기기
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" />
                  녹음 도구
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleInjectDummyRecording}
              className="border-white/30 text-white"
            >
              더미 녹음
            </Button>
            <Button
              variant="outline"
              onClick={handleTemporarySave}
              disabled={isSaving}
              className="border-white/30 text-white"
            >
              {isSaving ? '임시 저장 중...' : '임시 저장'}
            </Button>
            <Button onClick={handleComplete}>편집 완료</Button>
          </div>
        </div>

        <TimelineBar
          events={timeline}
          selectedEventId={selectedEventId}
          onEventSelect={handleEventSelect}
          onReorder={handleTimelineReorder}
          onAddEvent={openAddEventModal}
          onEditEvent={openEditEventModal}
        />

        <div className="flex gap-4 h-[calc(100vh-220px)] relative">
          {/* 좌측: 섹션 리스트 */}
          <div
            className={`flex h-full flex-col transition-all duration-300 ${
              leftPanelCollapsed ? 'w-16' : 'w-[20%] min-w-[240px]'
            }`}
          >
            {leftPanelCollapsed ? (
              <CollapsedPanel type="left" />
            ) : (
              <div className="flex-1">
                <SectionList
                  sections={filteredSections}
                  selectedSectionId={selectedSectionId}
                  onSectionSelect={handleSectionSelect}
                  onReorder={handleSectionReorder}
                  onAddSection={openAddSectionModeModal}
                />
              </div>
            )}
          </div>

          {/* 좌측 토글 버튼 */}
          <button
            onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 rounded-full border border-white/10 bg-white/5 text-white hover:border-white/40 hover:bg-white/10 transition-colors"
            title={leftPanelCollapsed ? '섹션 목록 펼치기' : '섹션 목록 접기'}
          >
            {leftPanelCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          {/* 중앙: 에디터 */}
          <div className="flex-1 min-w-0">
            <SectionEditor
              section={selectedSection || null}
              event={selectedEvent}
              onSave={handleSectionSave}
            />
          </div>

          {/* 우측: 녹음 패널 또는 런처 */}
          {isRecordingPanelPinned ? (
            <>
              <button
                onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 rounded-full border border-white/10 bg-white/5 text-white hover:border-white/40 hover:bg-white/10 transition-colors"
                title={rightPanelCollapsed ? '녹음 패널 펼치기' : '녹음 패널 접기'}
              >
                {rightPanelCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              <div
                className={`flex h-full flex-col transition-all duration-300 ${
                  rightPanelCollapsed ? 'w-16' : 'w-[22%] min-w-[260px]'
                }`}
              >
                {rightPanelCollapsed ? (
                  <CollapsedPanel type="right" />
                ) : (
                  <RecordingPanel
                    transcriptHistory={transcriptHistory}
                    currentSectionTitle={selectedSection?.title}
                    activeSessionId={activeSessionId}
                    activeSessionMetadata={activeSessionId ? sessionMetadata.get(activeSessionId) : undefined}
                    onTranscriptAdd={handleAddTranscript}
                    onTranscriptUpdate={handleUpdateTranscript}
                    onTranscriptDelete={handleDeleteTranscript}
                    onTranscriptInsert={handleInsertTranscriptIntoEditor}
                    onMergeFragments={handleMergeFragments}
                    onSplitFragment={handleSplitFragment}
                    onClearAll={handleClearAllTranscripts}
                    onClosePanel={hideRecordingPanel}
                    onCreateNewSession={() => createNewSession(selectedSection?.title)}
                    getOrCreateActiveSession={getOrCreateActiveSession}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="flex w-12 flex-col items-center justify-center">
              <button
                onClick={showRecordingPanel}
                className="flex flex-col items-center gap-2 rounded-full border border-dashed border-navy-700/70 bg-navy-900 px-2 py-4 text-[#a0a3b1] hover:border-accent hover:text-accent transition-colors"
                title="녹음 도구 열기"
              >
                <Mic className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-[0.2em]">Voice</span>
              </button>
            </div>
          )}
        </div>
      {isAddEventOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddEventOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-accent/30 bg-card p-6 shadow-2xl shadow-black/50">
            <h2 className="text-xl font-semibold text-[#e4e6eb]">새로운 대주제 추가</h2>
            <p className="mt-1 text-sm text-[#a0a3b1]">
              인생의 중요한 사건을 추가하면 타임라인에 새 챕터가 생성됩니다.
            </p>
            <div className="mt-6 space-y-4">
              <label className="space-y-2 text-sm text-[#a0a3b1]">
                대주제 이름
                <input
                  type="text"
                  value={eventForm.label}
                  onChange={(e) => {
                    setEventForm((prev) => ({ ...prev, label: e.target.value }));
                    setEventError(null);
                  }}
                  className="w-full rounded-lg border border-navy-700 bg-navy-900 px-4 py-2 text-[#e4e6eb] placeholder:text-[#7a7d8c] focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50"
                  placeholder="예: 첫 직장에 입사하다"
                />
              </label>

              <label className="space-y-2 text-sm text-[#a0a3b1]">
                날짜/기간 (선택)
                <input
                  type="text"
                  value={eventForm.date}
                  onChange={(e) => setEventForm((prev) => ({ ...prev, date: e.target.value }))}
                  className="w-full rounded-lg border border-navy-700 bg-navy-900 px-4 py-2 text-[#e4e6eb] placeholder:text-[#7a7d8c] focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50"
                  placeholder="예: 1985년 3월"
                />
              </label>

              <label className="space-y-2 text-sm text-[#a0a3b1]">
                메모 (선택)
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-navy-700 bg-navy-900 px-4 py-2 text-[#e4e6eb] placeholder:text-[#7a7d8c] focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50"
                  placeholder="이 시기의 대표적인 에피소드나 감정 등을 기록해 보세요."
                />
              </label>

              {eventError && <p className="text-sm text-red-400">{eventError}</p>}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddEventOpen(false)} className="border-navy-700 text-[#e4e6eb]">
                취소
              </Button>
              <Button onClick={handleCreateEvent} disabled={isCreatingEvent}>
                {isCreatingEvent ? '생성 중...' : '대주제 추가'}
              </Button>
            </div>
          </div>
        </div>
      )}
        {isAddSectionModeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddSectionModeOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-accent/30 bg-card p-6 shadow-2xl shadow-black/50">
            <h2 className="text-xl font-semibold text-[#e4e6eb]">소주제 입력 방식 선택</h2>
            <p className="mt-1 text-sm text-[#a0a3b1]">
              새로운 소주제를 어떻게 기록할지 선택해주세요. 언제든 다른 방식을 다시 선택할 수 있습니다.
            </p>
            <div className="mt-6 space-y-3">
              <button
                onClick={() => {
                  openAddSectionModalForMode('text');
                  setIsAddSectionModeOpen(false);
                }}
                className="w-full rounded-xl border border-navy-700 bg-navy-900 px-4 py-3 text-left text-[#e4e6eb] transition-colors hover:border-accent/60 hover:bg-card-hover"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">텍스트로 작성</span>
                  <span className="text-xs text-accent">추천</span>
                </div>
                <p className="mt-1 text-xs text-[#7a7d8c]">직접 입력하면서 내용을 정리합니다.</p>
              </button>

              <button
                onClick={() => {
                  openAddSectionModalForMode('voice');
                  setIsAddSectionModeOpen(false);
                }}
                className="w-full rounded-xl border border-navy-700 bg-navy-900 px-4 py-3 text-left text-[#e4e6eb] transition-colors hover:border-accent/60 hover:bg-card-hover"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">음성으로 작성</span>
                </div>
                <p className="mt-1 text-xs text-[#7a7d8c]">말로 기록하고 AI가 소단락으로 정리해줍니다.</p>
              </button>

              <button
                onClick={() => {
                  openAddSectionModalForMode('file');
                  setIsAddSectionModeOpen(false);
                }}
                className="w-full rounded-xl border border-navy-700 bg-navy-900 px-4 py-3 text-left text-[#e4e6eb] transition-colors hover:border-accent/60 hover:bg-card-hover"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">파일 가져오기</span>
                </div>
                <p className="mt-1 text-xs text-[#7a7d8c]">음성/텍스트 파일을 업로드하면 자동으로 정리됩니다.</p>
              </button>
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={() => setIsAddSectionModeOpen(false)} className="border-navy-700 text-[#e4e6eb]">
                닫기
              </Button>
            </div>
          </div>
        </div>
      )}

        {isEditEventOpen && selectedEventId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditEventOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-accent/30 bg-card p-6 shadow-2xl shadow-black/50">
            <h2 className="text-xl font-semibold text-[#e4e6eb]">대주제 수정</h2>
            <p className="mt-1 text-sm text-[#a0a3b1]">
              잘못 입력된 정보를 수정하거나 보조 설명을 업데이트할 수 있습니다.
            </p>
            <div className="mt-6 space-y-4">
              <label className="space-y-2 text-sm text-[#a0a3b1]">
                대주제 이름
                <input
                  type="text"
                  value={editEventForm.label}
                  onChange={(e) => {
                    setEditEventForm((prev) => ({ ...prev, label: e.target.value }));
                    setEditEventError(null);
                  }}
                  className="w-full rounded-lg border border-navy-700 bg-navy-900 px-4 py-2 text-[#e4e6eb] placeholder:text-[#7a7d8c] focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50"
                  placeholder="예: 첫 직장에 입사하다"
                />
              </label>

              <label className="space-y-2 text-sm text-[#a0a3b1]">
                날짜/기간 (선택)
                <input
                  type="text"
                  value={editEventForm.date}
                  onChange={(e) => setEditEventForm((prev) => ({ ...prev, date: e.target.value }))}
                  className="w-full rounded-lg border border-navy-700 bg-navy-900 px-4 py-2 text-[#e4e6eb] placeholder:text-[#7a7d8c] focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50"
                  placeholder="예: 1985년 3월"
                />
              </label>

              <label className="space-y-2 text-sm text-[#a0a3b1]">
                메모 (선택)
                <textarea
                  value={editEventForm.description}
                  onChange={(e) => setEditEventForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-navy-700 bg-navy-900 px-4 py-2 text-[#e4e6eb] placeholder:text-[#7a7d8c] focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50"
                  placeholder="이 시기의 대표적인 에피소드나 감정 등을 기록해 보세요."
                />
              </label>

              {editEventError && <p className="text-sm text-red-400">{editEventError}</p>}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditEventOpen(false)} className="border-navy-700 text-[#e4e6eb]">
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
          onStartRecording={() => {
            setIsAddSectionOpen(false);
            setRightPanelCollapsed(false);
            setIsRecordingPanelPinned(true);
          }}
        />
    </>
  );
}
