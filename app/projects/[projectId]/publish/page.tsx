'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

import { PublishingFlow } from '@/components/publishing-flow';
import { getSections, getTimeline } from '@/lib/mock-api';
import type { StoryData } from '@/types/story';

export default function ProjectPublishPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStory() {
      try {
        const [timeline, sections] = await Promise.all([getTimeline(), getSections()]);

        const keywords = timeline.slice(0, 4).map((event) => event.label);
        const chapters = sections.map((section, index) => ({
          title: section.title || `챕터 ${index + 1}`,
          content: section.content || section.excerpt,
        }));

        const summary =
          sections
            .map((section) => section.excerpt || section.content?.slice(0, 120))
            .filter(Boolean)
            .join(' ') || '편집한 내용을 바탕으로 제작 옵션을 선택해주세요.';

        setStoryData({
          topic: timeline[0]?.label ? `${timeline[0].label} 이야기` : '온유 이야기',
          summary,
          keywords: keywords.length ? keywords : ['기억', '기록', '가족'],
          chapters: chapters.length
            ? chapters
            : [
                {
                  title: '첫 번째 이야기',
                  content: '편집된 내용을 기반으로 제작 옵션을 설정할 수 있습니다.',
                },
              ],
        });
      } catch (error) {
        console.error('Failed to load project data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadStory();
  }, []);

  const handleRestart = () => {
    const projectId = params?.projectId;
    if (!projectId) return;
    router.push(`/projects/${projectId}/edit`);
  };

  const handleViewStory = () => {
    const projectId = params?.projectId;
    if (!projectId) return;
    router.push(`/projects/${projectId}/edit`);
  };

  if (isLoading || !storyData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0F0E] text-[#A8C3BC]">
        출판 준비 화면을 불러오는 중입니다...
      </div>
    );
  }

  return <PublishingFlow storyData={storyData} onRestart={handleRestart} onViewStory={handleViewStory} />;
}
