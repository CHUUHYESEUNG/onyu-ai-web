# CLAUDE.md - 온유록(Onyu.ai) 프로젝트 가이드

이 문서는 Claude Code가 프로젝트를 효과적으로 이해하고 작업할 수 있도록 작성된 가이드입니다.

## 프로젝트 개요

**온유록(Onyu.ai)**는 음성 인터뷰 기반 AI 오디오북 자서전 제작 플랫폼입니다.

### 핵심 가치
- "글을 쓰지 않아도, 말로 남기는 나의 기록"
- AI가 대신 써주고, 나의 목소리로 다시 들려주는 인생 이야기
- 시니어 세대를 위한 접근성과 감정 전달에 중점

### 주요 기능
1. 🎤 **음성 인터뷰 수집** - 질문에 답변하거나 자유롭게 이야기
2. ✍️ **AI 요약 및 구조화** - Whisper + GPT 기반 STT & 문맥 정리
3. 📖 **AI 자서전 자동 생성** - 생애별 챕터 구성
4. 🗣️ **본인 음성 오디오북 합성** - 음성 복제 후 AI 낭독
5. 💾 **PDF + 오디오북 다운로드/공유**

## 기술 스택

### Core
- **Framework**: Next.js 16.0.1 (App Router with Turbopack)
- **Language**: TypeScript 5
- **UI Library**: React 19.2.0

### Styling
- **CSS Framework**: Tailwind CSS 3.4.15
- **Icons**: Lucide React

### Development
- **Package Manager**: npm
- **Linting**: ESLint 9
- **Build**: Next.js with Turbopack (네이티브 빌드)

### UI/UX
- **Drag & Drop**: @dnd-kit (core, sortable, utilities)
- **시니어 친화적 설계**: 버튼식 이동 + 드래그 앤 드롭 하이브리드

### 특이사항
- Next.js 16부터 ARM64 Mac (M-series) 네이티브 지원
- Turbopack이 기본 번들러로 활성화됨
- 이전 버전의 WASM fallback은 더 이상 불필요
- @dnd-kit으로 접근성 내장 드래그 앤 드롭 구현

## 프로젝트 구조

```
onyu-ai-web/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 랜딩 페이지
│   ├── layout.tsx         # 루트 레이아웃
│   ├── dashboard/         # 메인 대시보드
│   │   └── page.tsx
│   ├── projects/[projectId]/  # 프로젝트별 페이지
│   │   ├── edit/          # 편집 페이지 ⭐ 기능 확장
│   │   │   └── page.tsx
│   │   ├── publish/       # 출판 준비 페이지 ⭐ 신규 추가
│   │   │   └── page.tsx
│   │   └── preview/       # 미리보기 페이지
│   │       └── page.tsx
│   └── auth/              # 인증 페이지
│       ├── login/
│       └── signup/
├── components/            # React 컴포넌트
│   ├── edit/              # ⭐ 편집 페이지 컴포넌트
│   │   ├── timeline-bar.tsx      # 상단 가로 타임라인
│   │   ├── section-list.tsx      # 좌측 섹션 리스트
│   │   ├── section-editor.tsx    # 중앙 본문 에디터
│   │   └── recording-panel.tsx   # 우측 녹음 & 처리 타임라인
│   ├── modals/            # ⭐ 모달 컴포넌트
│   │   └── add-section-modal.tsx # 소주제 추가 모달
│   ├── publishing-flow.tsx # ⭐ 출판 마법사 (3단계)
│   ├── landing-page.tsx   # 랜딩 페이지
│   ├── editor-page.tsx    # 음성 녹음/편집 페이지
│   ├── result-page.tsx    # 결과 표시 페이지
│   ├── recording-button.tsx    # 녹음 버튼
│   ├── waveform-visualizer.tsx # 음성 파형 시각화
│   ├── navigation.tsx     # 상단 네비게이션
│   ├── footer.tsx         # 하단 푸터
│   ├── chapter-card.tsx   # 챕터 카드
│   ├── topic-card.tsx     # 토픽 카드
│   ├── export-modal.tsx   # 내보내기 모달
│   └── ui/               # 재사용 가능한 UI 컴포넌트
│       ├── button.tsx
│       ├── badge.tsx
│       └── progress.tsx
├── types/                 # TypeScript 타입 정의
│   ├── index.ts          # 통합 export
│   ├── autobiography.ts  # 자서전 프로젝트 타입
│   ├── user.ts           # 사용자 및 권한 타입
│   ├── edit.ts           # ⭐ 편집 페이지 타입 (확장됨)
│   └── story.ts          # 기존 스토리 타입 (호환성)
├── lib/                   # 유틸리티 함수
│   └── mock-api.ts       # ⭐ 목업 API 함수 (확장됨)
└── public/               # 정적 파일
```

## 주요 파일 설명

### [app/page.tsx](app/page.tsx)
- 메인 엔트리 포인트
- 페이지 상태 관리: `landing` → `editor` → `result`
- StoryData 타입으로 데이터 전달

### 컴포넌트 역할

#### 사용자 플로우 컴포넌트
1. **LandingPage** - 서비스 소개 및 시작
2. **EditorPage** - 음성 녹음 및 인터뷰 진행
3. **ResultPage** - 생성된 자서전 결과 표시

#### 기능 컴포넌트
- **RecordingButton** - 음성 녹음 제어
- **WaveformVisualizer** - 실시간 음성 파형 표시
- **ChapterCard** - 챕터 단위 표시
- **TopicCard** - 주제별 카드
- **ExportModal** - PDF/오디오 내보내기

## 개발 가이드

### 로컬 개발 실행
```bash
npm run dev
```
- 개발 서버: http://localhost:3000
- WASM 모드로 실행되며 핫 리로드 지원

### 빌드
```bash
npm run build
npm start
```

### 코딩 컨벤션
- **컴포넌트**: PascalCase (예: `LandingPage`)
- **파일명**: kebab-case (예: `landing-page.tsx`)
- **스타일**: Tailwind utility classes 사용
- **타입**: TypeScript strict mode

### 디자인 시스템

#### 컬러 팔레트 (다크 + 딥그린 테마)
- **배경색**:
  - Primary: `#0B0F0E` (메인 배경)
  - Secondary: `#0E1513` (카드/입력 필드)
- **텍스트**:
  - Primary: `#E6F0ED` (메인 텍스트)
  - Secondary: `#A8C3BC` (서브 텍스트)
- **포인트 컬러**:
  - Primary: `#1F6F63` (딥그린)
  - Hover/Accent: `#2BA08C` (라이트 그린)
- **폰트**:
  - 타이틀: Inter / DM Sans
  - 본문: Noto Sans KR
  - 시스템: Geist (next/font)
- **반응형**:
  - ≥1024px: 3열 레이아웃
  - <1024px: 2열 스택
  - <640px: 1열 스택

## 편집 페이지 (Edit Page)

### 개요
음성 인터뷰 자서전 편집 페이지는 사용자가 자서전을 체계적으로 작성하고 편집할 수 있는 핵심 인터페이스입니다.

### ⭐ 최근 추가된 기능 (2025-01-06)

#### 1. 대주제/소주제 CRUD 기능
- **대주제 추가**: 타임라인 상단에 "대주제 추가" 버튼, 모달에서 제목·날짜·메모 입력
- **대주제 수정**: 선택된 대주제를 수정할 수 있는 모달
- **소주제 추가**: 3가지 입력 방식 선택
  - 텍스트 작성: 직접 입력
  - 음성 녹음: 녹음 → 전사 → 소단락 자동 생성
  - 파일 가져오기: 음성/텍스트 파일 업로드 → 자동 처리
- **AddSectionModal 컴포넌트**: 소주제 추가 UI 모듈화

#### 2. 편집 워크플로우 개선
- **임시 저장**: 헤더 우측에 "임시 저장" 버튼 (자동 저장 전 수동 저장)
- **편집 완료**: "편집 완료" 버튼 클릭 → `/projects/[id]/publish`로 라우팅
- **대주제별 필터링**: 타임라인 이벤트 선택 시 해당 소주제만 자동 필터링
- **본문 저장 시 요약 자동 갱신**: 섹션 내용 저장 시 excerpt 자동 업데이트

#### 3. 소단락 (Subsections) 관리
- `Section` 타입에 `subsections` 필드 추가
- 음성/파일 입력 시 AI가 자동으로 소단락 생성
- 각 소단락은 개별 편집 가능 (향후 구현 예정)

### 레이아웃 구조

#### 상단: 가로 타임라인
- 생애 사건/챕터를 시간순으로 표시
- 점선 + 둥근 노드로 표현
- 현재 선택 이벤트 딥그린 강조
- 수평 스크롤 지원 (Shift + 마우스 휠)
- 키보드 네비게이션 (좌/우 방향키)

#### 하단: 3열 레이아웃

**1. 좌측 - 섹션 리스트 (col-span-3)**
- 각 섹션의 제목 + 미리보기 (2줄 말줄임)
- 검색/필터 기능
- 선택 항목 딥그린 라인 강조
- 클릭 시 중앙 에디터로 로드

**2. 중앙 - 본문 에디터 (col-span-6)**
- 섹션 제목 + 연결된 이벤트 뱃지
- Textarea 기반 편집기 (추후 Rich Editor 교체 가능)
- 자동 저장 (debounce 1.5s)
- 저장/취소 버튼
- 버전 보기 아이콘 (추후 히스토리 연동)

**3. 우측 - 녹음 & 처리 패널 (col-span-3)**
- 큰 녹음 버튼 (REC 토글)
- 파일 업로드 대안 경로
- **세로 처리 타임라인**:
  - recording → uploading → transcribing → summarizing → structuring → tts → done
  - 각 단계별 진행률 표시 (%)
  - 완료 단계: 체크 아이콘
  - 현재 단계: 딥그린 원형 + 내부 채움
  - 대기 단계: 점선 원
- 전사 텍스트 미리보기/복사
- 합성 오디오 플레이어
- 에러 시 경고 + 재시도 버튼

### 상호작용 시나리오

1. **타임라인 → 섹션 → 에디터 플로우**
   - 상단 타임라인 이벤트 클릭
   - 좌측 리스트 해당 섹션 자동 스크롤 및 강조
   - 중앙 에디터에 첫 섹션 자동 로드

2. **녹음 및 처리**
   - 우측 녹음 버튼 클릭 → 녹음 시작 (빨간 펄스 애니메이션)
   - 정지 → 자동 업로드 및 처리 시작
   - 세로 타임라인에서 단계별 진행 상황 실시간 표시
   - 처리 완료 → 전사 텍스트 표시

3. **텍스트 병합**
   - 전사 완료 시 모달 제안:
     - "본문 앞에 추가"
     - "본문 끝에 추가"
     - "교체"
     - "무시"

4. **AI 제안**
   - 요약/챕터화 결과를 새 섹션으로 제안
   - 리스트 상단에 "AI 제안" 배지와 함께 고정
   - 사용자 수락 시 섹션 리스트에 추가

### 컴포넌트 구조

```
EditPage (/app/projects/[projectId]/edit/page.tsx)
 ├─ TimelineBar (components/edit/timeline-bar.tsx)
 ├─ ContentGrid
 │   ├─ SectionList (components/edit/section-list.tsx)
 │   ├─ SectionEditor (components/edit/section-editor.tsx)
 │   └─ RecordingPanel (components/edit/recording-panel.tsx)
 └─ Toaster / Modal (추후 추가)
```

### 데이터 타입 (types/edit.ts)

```typescript
type TimelineEvent = {
  id: string;
  label: string;
  date?: string;
  status?: "todo"|"done";
};

type Section = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  eventId?: string;
};

type ProcessingStep =
  | "recording" | "uploading" | "transcribing"
  | "summarizing" | "structuring" | "voice_cloning"
  | "tts" | "done" | "error";

type ProcessingState = {
  current: ProcessingStep;
  progress?: number;
  errorMessage?: string;
  audioUrl?: string;
  transcript?: string;
};
```

### 접근성
- 타임라인 노드: `role="tab"`, 키보드 좌우 이동
- 리스트 항목: 키보드 포커스 스타일, 엔터로 선택
- 녹음 버튼: 명확한 라벨 ("녹음 시작/정지")
- 대비비 7:1 이상 유지
- 포커스 링 색상: 딥그린 (`#2BA08C`)

## 출판 플로우 (Publishing Flow) ⭐ 신규 추가

### 개요
편집 완료 후 사용자가 실물책/전자책/오디오북을 선택하고 제작을 의뢰할 수 있는 3단계 마법사 UI입니다.

### 라우트
- **경로**: `/projects/[projectId]/publish`
- **진입점**: 편집 페이지에서 "편집 완료" 버튼 클릭

### 3단계 마법사 구조

#### 1단계: 출판 방식 선택
**UI 구성**:
- 실물책/전자책/오디오북 카드형 멀티 선택
- 각 옵션별 아이콘, 제목, 설명
- 멀티 선택 가능 (여러 형식 동시 제작 가능)
- 우측 사이드 패널: 선택된 옵션 요약

**옵션**:
- **실물책** (🖨️ Printer Icon)
  - 하드커버 / 소프트커버 선택
  - 수량 지정
  - 선물용 포장 옵션
- **전자책** (📖 BookOpen Icon)
  - EPUB / PDF / 둘 다
  - 공유 범위 (비공개/가족/공개)
  - 사진 포함 여부
- **오디오북** (🎧 Headphones Icon)
  - 내레이터 타입 (전문 성우/가족 음성/TTS)
  - 예상 러닝타임 (30분/45분/60분)
  - 배경 음악 포함 여부

#### 2단계: 세부 정보 설정
**동적 폼 렌더링**:
- 1단계에서 선택된 옵션에 따라 폼 구성
- 각 옵션별 세부 설정 입력
- 실시간 비용 힌트 제공

**실물책 설정**:
```typescript
{
  trimSize: "148x210" | "152x225" | "A5",  // 판형
  coverType: "hard" | "soft",               // 커버 타입
  quantity: number,                         // 수량
  giftWrap: boolean                         // 선물 포장
}
```

**전자책 설정**:
```typescript
{
  format: "epub" | "pdf" | "both",         // 파일 형식
  distribution: "private" | "family" | "public",  // 공유 범위
  includePhotos: boolean                   // 사진 포함
}
```

**오디오북 설정**:
```typescript
{
  narrator: "professional" | "family" | "tts",  // 내레이터
  duration: "30" | "45" | "60",                 // 러닝타임 (분)
  includeBgm: boolean                           // 배경 음악
}
```

#### 3단계: 견적 및 다음 단계
**UI 구성**:
- 선택된 옵션별 항목 요약
- 예상 비용 계산 (동적)
- 예상 제작 일정
- CTA 버튼: "상담 신청" / "제작 요청"
- 보조 액션: "이야기 다시 보기" / "처음으로"

**견적 계산 로직** (목업):
```typescript
const baseCosts = {
  print: {
    hard: 50000,
    soft: 30000,
    perCopy: 15000,
  },
  ebook: {
    epub: 20000,
    pdf: 15000,
    both: 30000,
  },
  audio: {
    professional: 100000,
    family: 50000,
    tts: 30000,
  }
};
```

### 컴포넌트 구조
```
PublishingFlow (components/publishing-flow.tsx)
├─ Step 1: OptionSelection
│   ├─ OptionCard (실물책)
│   ├─ OptionCard (전자책)
│   ├─ OptionCard (오디오북)
│   └─ SelectedSummaryPanel
├─ Step 2: DetailsForm
│   ├─ PrintDetailsForm
│   ├─ EbookDetailsForm
│   └─ AudioDetailsForm
└─ Step 3: ReviewAndEstimate
    ├─ SelectedOptionsReview
    ├─ CostBreakdown
    └─ NextStepsActions
```

### 상태 관리
```typescript
const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
const [selectedOptions, setSelectedOptions] = useState<PublishOption[]>([]);
const [details, setDetails] = useState<PublishingDetails>(DEFAULT_DETAILS);
```

### 향후 확장 계획
- 백엔드 API 연동 (`/api/publish/estimate`, `/api/publish/request`)
- 실제 결제 시스템 통합 (토스페이먼츠, 아임포트 등)
- 제작 진행 상황 대시보드
- 알림 시스템 (이메일/SMS)
- 파일 다운로드 기능

### 목업 API (lib/mock-api.ts)

실제 API 구현 전까지 사용할 목업 함수:
- `getTimeline()`: Promise<TimelineEvent[]>
- `getSections(eventId?)`: Promise<Section[]>
- `saveSection(sectionId, content)`: Promise<void>
- `uploadAudio(file)`: Promise<{assetId:string}>
- `processAudio(assetId)`: AsyncGenerator<ProcessingState>
- ⭐ `createTimelineEvent(input)`: Promise<TimelineEvent> - 신규 추가
- ⭐ `updateTimelineEvent(eventId, updates)`: Promise<TimelineEvent> - 신규 추가
- ⭐ `createSection(input)`: Promise<Section> - 신규 추가
- ⭐ `analyzeTranscriptToSubsections(transcript)`: Promise<Subsection[]> - 신규 추가
- ⭐ `reorderTimelineEvents(eventIds)`: Promise<void> - 순서 변경
- ⭐ `reorderSections(sectionIds)`: Promise<void> - 순서 변경

모든 함수는 실제와 유사한 지연(delay)을 포함하여 로딩/에러/완료 상태를 확인할 수 있습니다.

## 개발 로드맵

### Phase 1 (현재)
- ✅ 웹 기반 MVP 구조
- ✅ 기본 UI/UX 컴포넌트
- ✅ 시니어 친화적 순서 변경 기능 (드래그 앤 드롭 + 버튼)
- ✅ 편집 페이지 3열 레이아웃
- ✅ 대주제/소주제 CRUD 기능
- ✅ 3가지 입력 방식 (텍스트/음성/파일)
- ✅ 출판 플로우 UI (3단계 마법사)
- ✅ 출판 옵션 견적 계산
- 🔄 세션 기반 인터뷰 시스템
- 🔄 음성 녹음 실제 구현
- 🔄 텍스트 변환 (STT) API 연동

### Phase 2 (예정)
- OpenAI Whisper API 연동 (STT)
- GPT-4 기반 자서전 생성 및 요약
- 소단락 자동 생성 및 편집 UI
- 텍스트 크기 조절 기능 (시니어 접근성)
- 고대비 테마 옵션
- 출판 백엔드 API 연동
- 결제 시스템 통합

### Phase 3 (예정)
- 음성 클로닝 (OpenVoice/ElevenLabs)
- TTS 오디오북 실제 생성
- PDF/EPUB 생성 및 다운로드
- 실물책 주문/배송 시스템
- 가족 협업 기능
- 제작 진행 상황 대시보드

### Phase 4 (예정)
- B2B 기능 (복지관, 교육기관)
- 게이미피케이션 (미션북 시스템)
- 유료 구독 모델

## 세션 기반 인터뷰 시스템

### 핵심 컨셉: "나의 인생 앨범 만들기"

#### 시스템 설계 원칙
- **분할 진행**: 전체 자서전을 챕터 → 세션으로 분할
- **단기 집중**: 한 세션은 10~15분 이내 (시니어 집중력 고려)
- **자동 저장**: 모든 녹음은 실시간 클라우드 저장
- **언제든 중단/재개**: 진행 상황 보존 및 이어하기

#### 구조 예시
```
📖 나의 자서전
  ├─ 📘 1장. 어린 시절 (1950-1960년대)
  │   ├─ ✅ 세션 1: 고향 이야기 (완료)
  │   ├─ ✅ 세션 2: 가족 이야기 (완료)
  │   └─ 🎤 세션 3: 학교 생활 (진행 중)
  ├─ 📗 2장. 청년 시절 (1970-1980년대)
  │   └─ ⏸️ 세션 1: 첫 직장 (대기 중)
  └─ 📙 3장. 결혼과 가정
      └─ ⏸️ (아직 시작 안 함)
```

### 인터뷰 플로우

#### 1. 메인 대시보드
- 전체 진행률 표시 (프로그레스 바)
- 챕터별 완료 상태 (✅ 완료, 🎤 진행 중, ⏸️ 대기)
- "오늘 이어서 하기" / "새 챕터 시작하기" CTA

#### 2. 인터뷰 세션 화면
- 현재 챕터 및 세션 정보
- 질문 목록 (완료/진행 중 표시)
- 녹음 버튼 (큰 사이즈, 시니어 친화)
- 세션 내 진행률 표시
- "잠시 쉬기" / "이전 답변 듣기" / "다음 질문" 버튼

#### 3. 핵심 기능
- **자동 저장**: 녹음 즉시 클라우드 업로드
- **음성 재생**: 녹음한 내용 다시 듣기
- **질문 건너뛰기**: "지금은 패스" 옵션
- **추가 녹음**: "더 얘기하고 싶어요" 버튼
- **음성 품질 체크**: 볼륨 체크 및 알림

## 데이터 모델

### TypeScript 인터페이스 정의

```typescript
// 자서전 프로젝트 전체
interface AutobiographyProject {
  id: string;
  userId: string;
  title: string;
  progress: number; // 0-100
  chapters: Chapter[];
  createdAt: Date;
  lastEditedAt: Date;
  status: 'draft' | 'in_progress' | 'completed' | 'published';
}

// 챕터 (시간대별 또는 주제별)
interface Chapter {
  id: string;
  projectId: string;
  title: string;
  description?: string; // ⭐ 메모/설명 추가 (2025-01-06)
  order: number;
  sessions: Session[];
  status: 'not_started' | 'in_progress' | 'completed';
  estimatedDuration?: number; // 예상 소요 시간 (분)
}

// 세션 (실제 인터뷰 단위)
interface Session {
  id: string;
  chapterId: string;
  title: string;
  questions: Question[];
  startedAt?: Date;
  completedAt?: Date;
  totalDuration?: number; // 실제 녹음 시간 (초)
  status: 'not_started' | 'in_progress' | 'completed';
}

// 질문 및 답변
interface Question {
  id: string;
  sessionId: string;
  prompt: string; // AI가 제시하는 질문
  order: number;
  audioUrl?: string; // 녹음 파일 URL
  transcription?: string; // STT 결과
  duration?: number; // 녹음 길이 (초)
  isSkipped: boolean;
  isCompleted: boolean;
  recordedAt?: Date;
}

// 편집 가능한 텍스트 블록
interface TextBlock {
  id: string;
  projectId: string;
  chapterId?: string;
  content: string; // AI 생성 또는 사용자 수정 텍스트
  order: number;
  sourceQuestionIds: string[]; // 원본 질문 참조
  type: 'ai_generated' | 'user_edited' | 'user_added';
  editable: boolean;
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
  subsections?: Array<{  // ⭐ 소단락 관리 (2025-01-06)
    id: string;
    title: string;
    content: string;
    sourceType: 'text' | 'voice' | 'file';
  }>;
}

// 협업용 코멘트
interface Comment {
  id: string;
  blockId: string;
  userId: string;
  userName: string;
  content: string;
  type: 'text' | 'voice'; // 텍스트 또는 음성 메모
  audioUrl?: string;
  createdAt: Date;
}

// 사용자 정보
interface User {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'family' | 'editor'; // 소유자, 가족, 편집자
  avatarUrl?: string;
  projects: AutobiographyProject[];
}
```

### 데이터베이스 설계 고려사항

- **실시간 동기화**: Supabase Realtime 또는 Firebase
- **파일 저장**: S3/R2 for audio files
- **관계형 구조**: PostgreSQL (챕터-세션-질문 관계)
- **캐싱**: Redis for session state

## UX/UI 플로우 상세

### 사용자 여정 (User Journey)

#### Day 1: 첫 방문
```
로그인 → 온보딩 → 챕터 선택 → 세션 시작
→ 10분 녹음 → "잠시 쉬기" → 자동 저장 → 로그아웃
```

#### Day 2: 재방문
```
로그인 → "이어서 하기" 버튼 표시 → 이전 녹음 재생
→ 세션 완료 → AI 텍스트 생성 알림 → 텍스트 확인
```

#### Day 5: 편집 단계
```
로그인 → 전체 챕터 확인 → 편집 모드 진입
→ 드래그 앤 드롭으로 순서 변경 → 텍스트 수정
→ 미리보기 → 다운로드
```

### 페이지 구조

```
/
├── / (landing)                    # 랜딩 페이지
├── /auth
│   ├── /login                    # 로그인
│   └── /signup                   # 회원가입
├── /dashboard                    # 메인 대시보드 (✅ 구현됨)
├── /projects
│   ├── /new                      # 새 프로젝트 생성
│   └── /[projectId]
│       ├── /                     # 프로젝트 홈 (챕터 목록)
│       ├── /chapter/[chapterId]
│       │   └── /session/[sessionId]  # 인터뷰 세션
│       ├── /edit                 # 편집 모드 (✅ 구현됨)
│       ├── /publish              # ⭐ 출판 준비 (✅ 구현됨)
│       └── /preview              # 미리보기
├── /export
│   ├── /pdf                      # PDF 다운로드
│   ├── /audiobook                # 오디오북 다운로드
│   └── /print                    # 인쇄용 책
└── /settings                     # 설정
```

## 편집 기능 및 드래그 앤 드롭

### 3단계 편집 프로세스

#### 1단계: 텍스트 확인 (STT 결과 검증)
- 질문별 STT 결과 표시
- 녹음 재생 기능
- 간단한 텍스트 수정
- "정확해요" 승인 버튼

#### 2단계: 스토리 구조 편집
- **드래그 앤 드롭**: 문단/섹션 순서 변경
- **버튼식 이동**: ↑↓ 버튼 (시니어 접근성)
- **챕터 재구성**: 시간순 ↔ 주제별 전환
- **삭제/추가**: 불필요한 부분 제거, 새 내용 추가

#### 3단계: AI 생성 글 최종 확인
- AI가 작성한 완성 텍스트 표시
- 문장 단위 수정
- 음성 추가 녹음 (보완 설명)
- 최종 승인

### 드래그 앤 드롭 구현 (✅ 구현 완료)

#### 사용 라이브러리: `@dnd-kit`

**설치**:
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**선택 이유**:
- React 19 완벽 호환
- 터치스크린 지원 (태블릿 사용 시니어)
- 접근성 내장 (키보드 네비게이션)
- 부드러운 애니메이션
- TypeScript 지원

**구현된 기능**:
1. **타임라인 이벤트 순서 변경** (components/edit/timeline-bar.tsx)
   - 가로 드래그 앤 드롭 (horizontalListSortingStrategy)
   - ⬅️ ➡️ 버튼식 이동
   - 8px 이동 후 드래그 활성화 (실수 방지)

2. **섹션 리스트 순서 변경** (components/edit/section-list.tsx)
   - 세로 드래그 앤 드롭 (verticalListSortingStrategy)
   - ↑ ↓ 버튼식 이동 (큰 버튼, 명확한 라벨)
   - 시니어 친화적: 버튼 기본 제공, 드래그는 옵션

**구현 예시**:
```typescript
import { DndContext, closestCenter, PointerSensor, useSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SectionList({ sections, onReorder }) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }, // 8px 이동 후 활성화
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      onReorder(oldIndex, newIndex);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
        {sections.map((section, index) => (
          <SortableItem key={section.id} section={section} index={index} />
        ))}
      </SortableContext>
    </DndContext>
  );
}
```

### 시니어 친화적 대안: 버튼식 이동 (✅ 구현 완료)

**구현 위치**: components/edit/section-list.tsx, components/edit/timeline-bar.tsx

**특징**:
- 큰 버튼 크기 (px-4 py-3, 48px 이상 터치 타겟)
- 명확한 아이콘 + 텍스트 라벨
- Disabled 상태 명확 표시 (opacity-30)
- 접근성 라벨 (aria-label)
- 포커스 링 (focus:ring-2 ring-[#2BA08C])

**섹션 리스트 예시**:
```tsx
<div className="flex gap-2 px-3">
  <button
    onClick={onMoveUp}
    disabled={isFirst}
    className="
      flex-1 flex items-center justify-center gap-2
      px-4 py-3 text-base font-medium
      bg-[#1F6F63] hover:bg-[#2BA08C]
      text-[#E6F0ED]
      rounded-lg transition-colors
      disabled:opacity-30 disabled:cursor-not-allowed
      focus:outline-none focus:ring-2 focus:ring-[#2BA08C]
    "
    aria-label="위로 이동"
  >
    <ChevronUp className="h-5 w-5" />
    <span>위로</span>
  </button>

  <button
    onClick={onMoveDown}
    disabled={isLast}
    className="..." // 동일한 스타일
    aria-label="아래로 이동"
  >
    <ChevronDown className="h-5 w-5" />
    <span>아래로</span>
  </button>
</div>
```

**타임라인 예시** (가로 이동):
```tsx
<div className="flex gap-1 mb-1">
  <button onClick={onMoveLeft} disabled={isFirst} aria-label="왼쪽으로 이동">
    <ChevronLeft className="h-3 w-3" />
  </button>
  <button onClick={onMoveRight} disabled={isLast} aria-label="오른쪽으로 이동">
    <ChevronRight className="h-3 w-3" />
  </button>
</div>
```

## 추천 라이브러리 및 도구

### 음성 관련
- **녹음**: `react-media-recorder` 또는 native MediaRecorder API
- **파형 시각화**: `wavesurfer.js` 또는 `react-audio-player`
- **음성 처리**: Web Audio API

### 드래그 앤 드롭
- **@dnd-kit/core**: 메인 드래그 앤 드롭 라이브러리
- **@dnd-kit/sortable**: 정렬 가능한 리스트
- **@dnd-kit/utilities**: 유틸리티 함수

### 상태 관리
- **Zustand**: 가볍고 간단한 상태 관리 (추천)
- 또는 **React Context + useReducer**: 빌트인 솔루션

### 폼 관리
- **React Hook Form**: 텍스트 편집 폼
- **Zod**: 스키마 검증

### 파일 업로드
- **Uppy**: 진보된 파일 업로더 (진행률, 재시도)
- 또는 native `<input type="file">`

### 데이터베이스/백엔드
- **Supabase**: PostgreSQL + Realtime + Storage + Auth
- 또는 **Firebase**: NoSQL + Realtime + Storage
- 또는 **PlanetScale**: Serverless MySQL

### AI API
- **OpenAI API**: Whisper (STT), GPT-4 (텍스트 생성)
- **ElevenLabs API**: Voice Cloning, TTS
- **Azure Speech Services**: STT/TTS 대안

## 자동 저장 및 동기화 전략

### 자동 저장 메커니즘

```typescript
import { useEffect, useRef } from 'react';
import { debounce } from 'lodash';

function useAutoSave(data: any, saveFunction: (data: any) => Promise<void>) {
  const debouncedSave = useRef(
    debounce(async (data) => {
      try {
        await saveFunction(data);
        console.log('자동 저장 완료');
      } catch (error) {
        console.error('저장 실패:', error);
      }
    }, 3000) // 3초 debounce
  ).current;

  useEffect(() => {
    debouncedSave(data);
  }, [data]);
}
```

### 낙관적 업데이트 (Optimistic Update)

```typescript
async function updateTextBlock(blockId: string, newContent: string) {
  // 1. UI 즉시 업데이트
  setBlocks(prev => prev.map(b =>
    b.id === blockId ? { ...b, content: newContent } : b
  ));

  // 2. 백그라운드에서 서버 동기화
  try {
    await api.updateBlock(blockId, newContent);
  } catch (error) {
    // 3. 실패 시 롤백
    setBlocks(prev => prev.map(b =>
      b.id === blockId ? { ...b, content: originalContent } : b
    ));
    toast.error('저장에 실패했습니다');
  }
}
```

### 오프라인 지원

```typescript
// IndexedDB를 사용한 로컬 저장
import { openDB } from 'idb';

async function saveOffline(data: any) {
  const db = await openDB('onyu-db', 1, {
    upgrade(db) {
      db.createObjectStore('drafts');
    },
  });
  await db.put('drafts', data, 'current-project');
}

// 온라인 복귀 시 동기화
window.addEventListener('online', async () => {
  const db = await openDB('onyu-db', 1);
  const draft = await db.get('drafts', 'current-project');
  if (draft) {
    await syncToServer(draft);
    await db.delete('drafts', 'current-project');
  }
});
```

## AI 기능 구현 계획

### STT (Speech-to-Text)
- **Phase 1**: OpenAI Whisper API
- **Phase 2**: Azure Speech Services (대체)

### 텍스트 생성
- **모델**: GPT-4 / GPT-4 Turbo
- **프롬프트**: 생애별 챕터 구조화
- **어투**: 따뜻하고 존중하는 어조

### 음성 합성 (TTS)
- **Phase 1**: ElevenLabs Voice Cloning
- **Phase 2**: OpenVoice (오픈소스)
- **요구사항**: 3분 이상 음성 샘플

## 중요 참고사항

### 타겟 사용자
- **주 타겟**: 50대 이상 시니어
- **UX 원칙**:
  - 큰 텍스트, 명확한 버튼
  - 단순한 플로우
  - 음성 중심 인터랙션

### 감정적 고려사항
- 사용자의 이야기를 존중하는 태도
- 개인정보 보호 (GDPR, PIPA 준수)
- 가족과의 정서적 연결 강조

### 성능 최적화
- 음성 파일 스트리밍 처리
- 청크 단위 STT 처리
- Progressive 오디오북 생성

## 문제 해결

### SWC 관련 이슈
- ARM64 Mac에서 네이티브 SWC 빌드 실패 시
- `force-wasm.js` 스크립트가 자동으로 WASM 버전 사용

### 빌드 에러
```bash
# 캐시 클리어
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Next.js 16 업그레이드 관련
- ESLint 9 이상 필요
- React 19 공식 지원
- Turbopack이 기본 번들러 (프로덕션 빌드 포함)
- ARM64 네이티브 지원으로 WASM 불필요

## 참고 문서
- [사업 기획서](summary_1.md) - 전체 비즈니스 컨텍스트
- [Next.js 문서](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 기여 가이드

### 새로운 컴포넌트 추가 시
1. `components/` 디렉토리에 kebab-case 파일명으로 생성
2. TypeScript 타입 명시
3. 필요시 `types/` 에 타입 정의 추가
4. Tailwind 클래스 사용 (인라인 스타일 지양)

### API 연동 시
1. `lib/` 디렉토리에 API 클라이언트 생성
2. 환경 변수는 `.env.local` 사용
3. 에러 핸들링 필수

---

**마지막 업데이트**: 2025-11-04
**프로젝트 상태**: MVP 개발 중 (Phase 1)

**주요 업데이트**:
- Next.js 14.2.17 → 16.0.1
- React 18.2.0 → 19.2.0
- ESLint 8 → 9
- Turbopack 프로덕션 빌드 지원
- ⭐ 편집 페이지 완전 구현 (edit.md 기반)
- ⭐ **시니어 친화적 UX 개선**
  - @dnd-kit 설치 및 통합
  - 타임라인 & 섹션 순서 변경 기능 (하이브리드 방식)
  - 버튼식 이동 (시니어 최우선) + 드래그 앤 드롭 (고급 사용자)
  - 큰 터치 타겟, 명확한 피드백, 접근성 강화
- ⭐ **대주제/소주제 CRUD 기능** (2025-11-04)
  - 대주제 추가/수정 모달 및 목업 API
  - 소주제 3가지 입력 방식 (텍스트/음성/파일)
  - AddSectionModal 컴포넌트 분리 및 검증 로직
  - 대주제별 소주제 자동 필터링
  - 소단락(subsections) 데이터 모델 추가
- ⭐ **출판 플로우 구현** (2025-11-04)
  - /projects/[projectId]/publish 라우트 추가
  - PublishingFlow 3단계 마법사 컴포넌트
  - 실물책/전자책/오디오북 옵션 및 세부 설정
  - 동적 견적 계산 로직
  - 편집 완료 → 출판 준비 플로우 연결

**최근 추가된 기획 내용**:
- 세션 기반 인터뷰 시스템 아키텍처
- 완전한 데이터 모델 (TypeScript 인터페이스)
- 드래그 앤 드롭 편집 기능 설계
- 자동 저장 및 오프라인 지원 전략
- 시니어 친화적 UX 플로우
- 추천 라이브러리 목록 (@dnd-kit, Supabase, Zustand 등)
- 출판 플로우 고도화 제안 (백엔드 API, 결제 시스템, 비동기 처리)

**최근 구현된 기능**:
- ✅ App Router 기반 라우팅 구조 (/, /dashboard, /projects/[id]/edit, /projects/[id]/publish)
- ✅ 편집 페이지 3열 레이아웃 (타임라인 + 섹션 리스트 + 에디터 + 녹음 패널)
- ✅ 다크 + 딥그린 디자인 시스템 적용
- ✅ 목업 API 함수 (실제 API 연동 준비 완료)
- ✅ 처리 단계 세로 타임라인 (녹음 → 전사 → 요약 → 합성)
- ✅ **시니어 친화적 순서 변경 기능** (버튼식 + 드래그 앤 드롭 하이브리드)
  - 타임라인 이벤트 순서 변경 (가로 이동)
  - 섹션 리스트 순서 변경 (세로 이동)
  - @dnd-kit 라이브러리 활용
  - 큰 버튼, 명확한 라벨, 접근성 지원
- ✅ **대주제/소주제 CRUD 기능** (2025-11-04)
  - 대주제 추가/수정 모달
  - 소주제 3가지 입력 방식 (텍스트/음성/파일)
  - AddSectionModal 컴포넌트 분리
  - 대주제별 소주제 자동 필터링
- ✅ **출판 플로우** (2025-11-04)
  - 3단계 마법사 UI (옵션 선택 → 세부 설정 → 견적)
  - 실물책/전자책/오디오북 멀티 선택
  - 동적 견적 계산
  - PublishingFlow 컴포넌트
- ✅ **편집 워크플로우 개선** (2025-11-04)
  - 임시 저장/편집 완료 버튼
  - 본문 저장 시 요약 자동 갱신
  - 소단락(subsections) 관리
  - 음성/파일 업로드 플레이스홀더 처리
