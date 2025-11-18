# 온유록(Onyu.ai) 신규 팀원 온보딩 가이드

**목표**: 30분 안에 개발 환경 세팅 완료

---

## 📋 개요

온유록은 음성 인터뷰 기반 AI 오디오북 자서전 제작 플랫폼입니다.
- **타겟**: 50대 이상 시니어
- **핵심 기능**: 음성 녹음 → AI 전사 → 자서전 생성 → 오디오북/PDF 제작
- **기술 스택**: Next.js 16, React 19, Supabase, Deepgram STT, OpenAI GPT-4

---

## ⚡ 빠른 시작 (5분)

### 1. 저장소 클론 및 의존성 설치

```bash
# 저장소 클론
git clone <repository-url>
cd onyu-ai-web

# 의존성 설치
npm install

# 개발 서버 실행 (환경 변수 설정 전에는 에러 발생 예상)
npm run dev
```

---

## 🔑 환경 변수 설정 (15분)

### 1. `.env.local` 파일 생성

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 입력하세요:

```bash
# Supabase (필수)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Deepgram STT (필수)
NEXT_PUBLIC_DEEPGRAM_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# OpenAI (선택사항 - AI 요약/구조화 기능용)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. Supabase 설정

1. [supabase.com](https://supabase.com)에서 프로젝트 생성
2. Settings → API에서 `Project URL`과 `anon/service_role` 키 복사
3. Database → Migrations에서 마이그레이션 실행:

```bash
# Supabase CLI 설치 (macOS)
brew install supabase/tap/supabase

# 프로젝트 연결
supabase link --project-ref YOUR_PROJECT_ID

# 마이그레이션 실행
supabase db push
```

4. Storage → Create bucket:
   - `audio-uploads` (Public, 50MB limit)
   - `generated-audio` (Public, 100MB limit)
   - `documents` (Public, 20MB limit)

### 3. Deepgram API 키 발급

1. [console.deepgram.com](https://console.deepgram.com)에서 회원가입
2. $200 무료 크레딧 자동 지급 확인
3. API Keys → Create a New API Key
4. 키 복사 후 `.env.local`에 입력

### 4. OpenAI API 키 발급 (선택사항)

1. [platform.openai.com](https://platform.openai.com)에서 회원가입
2. 결제 정보 등록 (필수)
3. API keys → Create new secret key
4. 키 복사 후 `.env.local`에 입력

---

## 🚀 개발 서버 실행 (2분)

```bash
# 개발 서버 실행
npm run dev

# 브라우저 열기
open http://localhost:3000
```

**기대 결과**:
- 랜딩 페이지 로드 확인 ✅
- 콘솔에 에러 없음 ✅

---

## 🧭 프로젝트 구조 이해 (5분)

```
onyu-ai-web/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 랜딩 페이지
│   ├── api/               # API Routes
│   │   └── transcribe/    # Deepgram STT API
│   ├── projects/          # 프로젝트 관련 페이지
│   │   ├── [projectId]/   # 프로젝트 상세
│   │   │   ├── page.tsx   # 프로젝트 홈 (챕터 리스트)
│   │   │   ├── chapter/[chapterId]/  # 챕터 상세
│   │   │   │   ├── page.tsx  # 세션 리스트
│   │   │   │   └── session/[sessionId]/page.tsx  # 인터뷰 화면
│   │   │   ├── edit/      # 편집 페이지
│   │   │   ├── preview/   # 미리보기
│   │   │   └── publish/   # 출판 플로우
│   ├── auth/              # 인증 페이지
│   │   ├── login/
│   │   └── signup/
├── components/            # React 컴포넌트
│   ├── edit/              # 편집 페이지 컴포넌트
│   ├── modals/
│   └── ui/               # 재사용 가능한 UI
├── hooks/                 # React Hooks
│   └── use-audio-recorder.ts  # 녹음 Hook
├── lib/                   # 유틸리티 함수
│   ├── supabase.ts       # Supabase 클라이언트
│   ├── ai-utils.ts       # AI 유틸리티
│   └── audio-recorder.ts # 녹음 유틸리티
├── types/                 # TypeScript 타입
│   ├── database.ts       # Supabase DB 타입
│   └── edit.ts           # 편집 페이지 타입
├── supabase/             # Supabase 설정
│   └── migrations/       # DB 마이그레이션
└── public/               # 정적 파일
```

---

## 📝 주요 개념

### 1. 세션 기반 인터뷰 시스템

**구조**: Project → Chapter → Session → Question

- **Project**: 사용자의 자서전 프로젝트
- **Chapter**: 시간대별 큰 단위 (예: 어린 시절, 청년 시절)
- **Session**: 10-15분 인터뷰 단위 (예: 고향 이야기, 가족 이야기)
- **Question**: 세션 내 질문 (5-8개)

### 2. 음성 처리 파이프라인

```
녹음 → Supabase Storage 업로드 → Deepgram STT → DB 저장 → AI 요약 → 소단락 생성
```

### 3. 편집 페이지 레이아웃

```
┌─────────────────────────────────────────────────────────┐
│ Timeline Bar (가로 타임라인 - 대주제)                         │
├──────────────┬────────────────────────┬──────────────────┤
│ Section List │   Section Editor      │ Recording Panel  │
│ (소주제 목록)  │   (본문 에디터)          │ (녹음 & 처리)      │
│              │                        │                  │
└──────────────┴────────────────────────┴──────────────────┘
```

---

## 🧪 테스트 체크리스트

- [ ] 랜딩 페이지 로드 확인
- [ ] `/projects/new` 새 프로젝트 생성 확인
- [ ] `/projects/[id]` 챕터 리스트 확인
- [ ] `/projects/[id]/chapter/[chapterId]` 세션 리스트 확인
- [ ] `/projects/[id]/chapter/[chapterId]/session/[sessionId]` 인터뷰 화면 확인
- [ ] 음성 녹음 버튼 클릭 (마이크 권한 허용)
- [ ] 녹음 → 전사 → 결과 확인
- [ ] `/projects/[id]/edit` 편집 페이지 확인
- [ ] `/projects/[id]/preview` 미리보기 확인

---

## 🔧 문제 해결

### Supabase 연결 오류

**증상**: `Failed to fetch` 또는 `Invalid API key`

**해결**:
```bash
# 환경 변수 확인
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# 개발 서버 재시작
npm run dev
```

### Deepgram API 오류

**증상**: `401 Unauthorized`

**해결**:
- Deepgram Console → API Keys에서 키 활성화 확인
- 크레딧 잔액 확인 ($200 무료 크레딧)
- `.env.local`에 키가 정확히 입력되었는지 확인

### 타입 오류

**증상**: `@ts-nocheck` 관련 에러

**해결**:
```bash
# Supabase 타입 재생성
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts

# 개발 서버 재시작
npm run dev
```

---

## 📚 다음 단계

1. **CLAUDE.md 읽기**: 프로젝트 전체 가이드
2. **ARCHITECTURE.md 읽기**: 아키텍처 상세 설명
3. **SETUP_GUIDE.md 참고**: 환경 설정 세부 사항
4. **첫 이슈 할당**: [GitHub Issues](링크)에서 `good first issue` 태그 확인

---

## 💬 도움말

- 프로젝트 관련 질문: CLAUDE.md 참고
- 기술적 이슈: GitHub Issues
- 긴급 문의: 팀 Slack 채널

---

**온보딩 완료 예상 시간**: 30분
**첫 커밋까지 예상 시간**: 1-2시간

환영합니다! 🎉
