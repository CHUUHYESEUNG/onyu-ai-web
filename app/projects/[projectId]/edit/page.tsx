'use client';

import { useState, useEffect } from 'react';
import { TimelineBar } from '@/components/edit/timeline-bar';
import { SectionList } from '@/components/edit/section-list';
import { SectionEditor } from '@/components/edit/section-editor';
import { RecordingPanel } from '@/components/edit/recording-panel';
import { TimelineEvent, Section, ProcessingState } from '@/types/edit';
import {
  getTimeline,
  getSections,
  saveSection,
  uploadAudio,
  processAudio,
  reorderTimelineEvents,
  reorderSections,
} from '@/lib/mock-api';

export default function EditPage({ params }: { params: { projectId: string } }) {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>();
  const [selectedSectionId, setSelectedSectionId] = useState<string>();
  const [processingState, setProcessingState] = useState<ProcessingState | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
  const handleSectionSave = async (sectionId: string, content: string) => {
    await saveSection(sectionId, content);
    // 섹션 데이터 업데이트
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, content } : s))
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
    const newSections = [...sections];
    const [movedItem] = newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, movedItem);
    setSections(newSections);

    // API 호출
    await reorderSections(newSections.map((s) => s.id));
  };

  const selectedSection = sections.find((s) => s.id === selectedSectionId);
  const selectedEvent = timeline.find((e) => e.id === selectedEventId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F0E] flex items-center justify-center">
        <div className="text-[#A8C3BC]">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F0E] flex flex-col">
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
          <div className="col-span-3">
            <SectionList
              sections={sections}
              selectedSectionId={selectedSectionId}
              onSectionSelect={handleSectionSelect}
              onReorder={handleSectionReorder}
            />
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
    </div>
  );
}
