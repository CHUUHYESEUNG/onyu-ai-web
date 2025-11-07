"use client";

import { ProjectShell } from "@/components/project-shell";
import { useParams, usePathname } from "next/navigation";

interface ProjectLayoutProps {
  children: React.ReactNode;
}

// 프로젝트 제목 매핑 (임시 - 추후 API로 대체)
const getProjectTitle = (projectId?: string) => {
  const projectTitles: Record<string, string> = {
    'project-1': '할아버지의 이야기',
    'project-2': '나의 청춘 시절',
    'project-3': '가족과 함께한 시간',
  };
  return projectTitles[projectId || ''] || '프로젝트';
};

export default function ProjectLayout({ children }: ProjectLayoutProps) {
  const params = useParams<{ projectId: string }>();
  const pathname = usePathname();

  // 현재 페이지에 따라 breadcrumb 마지막 항목 결정
  const getCurrentPageLabel = () => {
    if (pathname?.includes('/edit')) return '편집';
    if (pathname?.includes('/overview')) return '개요';
    if (pathname?.includes('/publish')) return '출판';
    return '';
  };

  const currentPageLabel = getCurrentPageLabel();

  const breadcrumb: Array<{ label: string; href?: string }> = [
    { label: '홈', href: '/' },
    { label: '내 프로젝트', href: '/projects' },
    { label: getProjectTitle(params?.projectId), href: `/projects/${params?.projectId ?? ''}/overview` },
  ];

  // 현재 페이지 라벨이 있으면 추가
  if (currentPageLabel) {
    breadcrumb.push({ label: currentPageLabel });
  }

  return (
    <ProjectShell breadcrumb={breadcrumb}>
      {children}
    </ProjectShell>
  );
}
