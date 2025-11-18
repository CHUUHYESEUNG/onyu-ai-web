# 온유록(Onyu.ai) 아키텍처 문서

**작성일**: 2025-11-18
**버전**: 1.0.0

---

## 📐 전체 아키텍처 개요

```
┌─────────────┐     ┌───────────────┐     ┌──────────────┐
│   Browser   │────▶│   Next.js 16  │────▶│  Supabase   │
│  (Frontend) │     │  (App Router) │     │  (Backend)  │
└─────────────┘     └───────────────┘     └──────────────┘
       │                     │                     │
       │                     │                     │
       ▼                     ▼                     ▼
  MediaRecorder         API Routes           PostgreSQL
  (녹음)                (STT, AI)           (Data Storage)
                                                   │
                                                   ▼
                                              Storage
                                           (Audio Files)
```

---

## 🏗️ 시스템 구조

### 1. 프론트엔드 (Browser)

**기술 스택**:
- **Framework**: Next.js 16.0.1 (App Router with Turbopack)
- **UI Library**: React 19.2.0
- **Styling**: Tailwind CSS 3.4.15
- **Icons**: Lucide React
- **Drag & Drop**: @dnd-kit

**주요 기능**:
- 음성 녹음 (MediaRecorder API)
- 실시간 파형 시각화
- 드래그 앤 드롭 편집
- 서버 컴포넌트 최적화

### 2. 백엔드 (Next.js API Routes + Supabase)

**API Routes**:
- `/api/transcribe` - Deepgram STT
- `/api/summarize` - OpenAI GPT-4 요약
- `/api/structure` - 텍스트 구조화
- `/api/export/pdf` - PDF 생성

**Supabase**:
- **Database**: PostgreSQL
- **Auth**: Supabase Auth (이메일/소셜 로그인)
- **Storage**: 오디오 파일, PDF, EPUB
- **Realtime**: 실시간 진행률 업데이트

### 3. 외부 서비스

**STT (Speech-to-Text)**:
- **Deepgram API** (Nova-2 모델, 한국어 최적화)
- 폴백: Azure Speech Services (5시간/월 무료)

**AI**:
- **OpenAI GPT-4 Turbo** (요약, 구조화, 자서전 생성)
- 폴백: GPT-3.5 Turbo (비용 절감)

---

## 🗄️ 데이터베이스 스키마

### ERD (Entity Relationship Diagram)

```
┌──────────┐
│ projects │
└─────┬────┘
      │ 1:N
      ▼
┌──────────┐     ┌──────────┐     ┌──────────┐
│ chapters │────▶│ sessions │────▶│questions │
└─────┬────┘ 1:N └─────┬────┘ 1:N └─────┬────┘
      │ 1:N          │ 1:N          │ 1:1
      ▼              ▼              ▼
┌──────────┐   ┌──────────┐   ┌──────────┐
│text_block│   │subsection│   │audio_asse│
│    s     │   │    s     │   │    ts    │
└──────────┘   └──────────┘   └──────────┘
```

### 핵심 테이블

#### 1. `projects` (프로젝트)
```sql
- id: UUID (PK)
- user_id: UUID (FK → Supabase Auth)
- title: TEXT
- description: TEXT
- progress: INTEGER (0-100)
- status: ENUM ('draft', 'in_progress', 'completed', 'published')
- created_at, updated_at: TIMESTAMPTZ
```

#### 2. `chapters` (챕터 - 시간대별 큰 단위)
```sql
- id: UUID (PK)
- project_id: UUID (FK → projects)
- title: TEXT (예: "어린 시절", "청년 시절")
- description: TEXT
- order_index: INTEGER
- status: ENUM ('not_started', 'in_progress', 'completed')
- estimated_duration: INTEGER (예상 소요 시간, 분)
- created_at, updated_at: TIMESTAMPTZ
```

#### 3. `sessions` (세션 - 10-15분 인터뷰 단위)
```sql
- id: UUID (PK)
- chapter_id: UUID (FK → chapters)
- title: TEXT (예: "고향 이야기", "가족 이야기")
- description: TEXT
- order_index: INTEGER
- status: ENUM ('not_started', 'in_progress', 'completed')
- started_at, completed_at: TIMESTAMPTZ
- total_duration: INTEGER (실제 녹음 시간, 초)
- created_at, updated_at: TIMESTAMPTZ
```

#### 4. `questions` (질문)
```sql
- id: UUID (PK)
- session_id: UUID (FK → sessions)
- prompt: TEXT (AI가 제시하는 질문)
- order_index: INTEGER
- audio_asset_id: UUID (FK → audio_assets)
- transcription: TEXT (STT 결과)
- duration: INTEGER (녹음 길이, 초)
- is_skipped: BOOLEAN
- is_completed: BOOLEAN
- recorded_at: TIMESTAMPTZ
- created_at, updated_at: TIMESTAMPTZ
```

#### 5. `audio_assets` (오디오 파일)
```sql
- id: UUID (PK)
- project_id: UUID (FK → projects)
- section_id: TEXT (FK → sections, nullable)
- question_id: UUID (FK → questions, nullable)
- file_path: TEXT (Supabase Storage 경로)
- file_size: BIGINT (bytes)
- duration: NUMERIC (초)
- status: ENUM ('uploaded', 'transcribing', 'transcribed', 'processing', 'completed', 'failed')
- progress: INTEGER (0-100)
- transcript: TEXT
- error_message: TEXT
- created_at, updated_at: TIMESTAMPTZ
```

#### 6. `text_blocks` (편집 가능한 텍스트 블록)
```sql
- id: UUID (PK)
- project_id: UUID (FK → projects)
- chapter_id: UUID (FK → chapters, nullable)
- content: TEXT (AI 생성 또는 사용자 수정)
- order_index: INTEGER
- source_question_ids: UUID[] (원본 질문 참조)
- source_type: ENUM ('ai_generated', 'user_edited', 'user_added')
- is_editable: BOOLEAN
- created_at, updated_at: TIMESTAMPTZ
```

---

## 🔄 데이터 흐름

### 1. 음성 녹음 → 전사 → 저장

```
┌─────────────┐
│ 1. 녹음 시작 │
│ (브라우저)   │
└──────┬──────┘
       │ MediaRecorder API
       ▼
┌─────────────────┐
│ 2. 녹음 정지    │
│ → Blob 생성     │
└──────┬──────────┘
       │ FormData
       ▼
┌────────────────────────┐
│ 3. Supabase Storage 업로드│
│ → file_path 획득       │
└──────┬─────────────────┘
       │ Insert
       ▼
┌────────────────────┐
│ 4. audio_assets 생성│
│ (status: uploaded) │
└──────┬─────────────┘
       │ POST /api/transcribe
       ▼
┌─────────────────────┐
│ 5. Deepgram API 호출│
│ → STT 결과 획득      │
└──────┬──────────────┘
       │ Update
       ▼
┌──────────────────────┐
│ 6. audio_assets 업데이트│
│ (status: transcribed)│
│ transcript: "..."    │
└──────┬───────────────┘
       │ Update
       ▼
┌──────────────────────┐
│ 7. question 업데이트 │
│ transcription: "..." │
│ is_completed: true   │
└──────────────────────┘
```

### 2. AI 요약 → 구조화 → 소단락 생성

```
┌──────────────────┐
│ 1. 전사 텍스트    │
│ (transcript)     │
└──────┬───────────┘
       │ POST /api/summarize
       ▼
┌────────────────────┐
│ 2. OpenAI GPT-4    │
│ → 요약 텍스트 생성 │
└──────┬─────────────┘
       │ summary
       ▼
┌──────────────────────┐
│ 3. POST /api/structure│
│ → 소단락 분할         │
└──────┬───────────────┘
       │ subsections[]
       ▼
┌──────────────────────┐
│ 4. subsections 생성  │
│ (DB INSERT)          │
└──────────────────────┘
```

### 3. 편집 → 미리보기 → 출판

```
┌──────────────┐
│ 1. 편집 페이지│
│ (드래그 & 편집)│
└──────┬───────┘
       │ Save
       ▼
┌────────────────┐
│ 2. DB 저장     │
│ (text_blocks)  │
└──────┬─────────┘
       │ Preview
       ▼
┌──────────────────┐
│ 3. 미리보기 페이지│
│ (전체 자서전 렌더링)│
└──────┬───────────┘
       │ Publish
       ▼
┌─────────────────────┐
│ 4. 출판 플로우      │
│ (3단계 마법사)       │
│ → PDF/EPUB/오디오북 │
└─────────────────────┘
```

---

## 🧩 컴포넌트 아키텍처

### 페이지 구조

```
/
├── / (landing-page.tsx)
├── /auth
│   ├── /login (login/page.tsx)
│   └── /signup (signup/page.tsx)
├── /projects (projects/page.tsx)
│   ├── /new (projects/new/page.tsx)
│   └── /[projectId]
│       ├── / (projects/[projectId]/page.tsx) - 챕터 리스트
│       ├── /overview (projects/[projectId]/overview/page.tsx) - 준비 점검
│       ├── /chapter/[chapterId]
│       │   ├── / (chapter/[chapterId]/page.tsx) - 세션 리스트
│       │   └── /session/[sessionId]
│       │       └── / (session/[sessionId]/page.tsx) - 인터뷰 화면
│       ├── /edit (projects/[projectId]/edit/page.tsx)
│       ├── /preview (projects/[projectId]/preview/page.tsx)
│       └── /publish (projects/[projectId]/publish/page.tsx)
```

### 주요 컴포넌트

**편집 페이지**:
- `TimelineBar` - 가로 타임라인 (대주제)
- `SectionList` - 소주제 리스트
- `SectionEditor` - 본문 에디터
- `RecordingPanel` - 녹음 & 처리 타임라인

**출판 플로우**:
- `PublishingFlow` - 3단계 마법사
  - Step 1: 출판 방식 선택
  - Step 2: 세부 정보 입력
  - Step 3: 견적 확인

**인터뷰 시스템**:
- `QuestionCard` - 질문 카드
- `RecordingControls` - 녹음 컨트롤
- `ProgressBar` - 진행률 표시

---

## 🔐 보안 및 인증

### Row Level Security (RLS)

**모든 테이블에 RLS 적용**:

```sql
-- 프로젝트: 본인만 접근
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

-- 챕터: 프로젝트 소유자만
CREATE POLICY "Users can manage chapters of their projects"
  ON chapters FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = chapters.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- 동일한 패턴을 모든 테이블에 적용
```

### API 키 보안

**환경 변수**:
- `NEXT_PUBLIC_*`: 클라이언트 노출 가능 (Supabase anon key, Deepgram API key)
- `SUPABASE_SERVICE_ROLE_KEY`: 서버 전용 (RLS 우회)
- `OPENAI_API_KEY`: 서버 전용

---

## 📊 성능 최적화

### 1. 서버 컴포넌트 활용

```tsx
// app/projects/[projectId]/page.tsx
// Server Component로 데이터 사전 로딩
export default async function ProjectHomePage() {
  const chapters = await supabase
    .from('chapters')
    .select('*, sessions(*)')
    .eq('project_id', projectId);

  return <ChapterList chapters={chapters} />;
}
```

### 2. Supabase Realtime

```tsx
// 실시간 진행률 업데이트
const channel = supabase
  .channel(`audio_${assetId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'audio_assets',
    filter: `id=eq.${assetId}`,
  }, (payload) => {
    setProgress(payload.new.progress);
  })
  .subscribe();
```

### 3. 이미지 최적화

```tsx
import Image from 'next/image';

<Image
  src="/thumbnail.png"
  width={400}
  height={300}
  alt="Thumbnail"
  priority
/>
```

---

## 🧪 테스트 전략

### 1. 유닛 테스트 (Vitest)

```typescript
// lib/ai-utils.test.ts
import { describe, it, expect } from 'vitest';
import { chunkTranscriptSimple } from './ai-utils';

describe('chunkTranscriptSimple', () => {
  it('should split transcript into chunks', () => {
    const transcript = '문장1. 문장2. 문장3. 문장4.';
    const chunks = chunkTranscriptSimple(transcript, 2);
    expect(chunks).toHaveLength(2);
  });
});
```

### 2. E2E 테스트 (Playwright)

```typescript
// tests/e2e/interview.spec.ts
import { test, expect } from '@playwright/test';

test('should complete interview session', async ({ page }) => {
  await page.goto('/projects/project-1/chapter/chapter-1/session/session-1');
  await page.click('[aria-label="녹음 시작"]');
  await page.waitForTimeout(5000);
  await page.click('[aria-label="녹음 정지"]');
  await expect(page.locator('text=전사 중')).toBeVisible();
});
```

---

## 🚀 배포 전략

### Vercel 배포

```bash
# 환경 변수 설정 (Vercel Dashboard)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_DEEPGRAM_API_KEY=...
OPENAI_API_KEY=...

# 배포
git push origin main
```

### 성능 모니터링

- **Vercel Analytics**: 페이지 로딩 시간, Core Web Vitals
- **Supabase Dashboard**: DB 쿼리 성능, Storage 사용량
- **Sentry**: 에러 추적

---

## 📈 확장성 고려사항

### 1. 데이터베이스 확장

- **Read Replica**: Supabase Pro 플랜 ($25/월)
- **Connection Pooling**: pgBouncer 활성화
- **Indexing**: 자주 조회하는 컬럼에 인덱스 추가

### 2. 파일 저장소 확장

- **Supabase Storage** (1GB 무료) → **Cloudflare R2** (무제한, $0.015/GB)
- **CDN**: Cloudflare CDN 적용

### 3. AI 비용 절감

- **GPT-4 Turbo** → **GPT-3.5 Turbo** (10배 저렴)
- **Deepgram** ($200 크레딧 소진) → **Azure Speech Services** (5시간/월 무료)

---

**마지막 업데이트**: 2025-11-18
**작성자**: Claude Code
**버전**: 1.0.0
