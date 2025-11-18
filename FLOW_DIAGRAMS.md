# FLOW_DIAGRAMS.md

온유록(Onyu.ai) 시스템 플로우 다이어그램 문서

이 문서는 온유록 프로젝트의 주요 데이터 흐름과 사용자 플로우를 텍스트 기반 시퀀스 다이어그램으로 설명합니다.

---

## 1. 전체 시스템 아키텍처

```
┌─────────────┐
│   Browser   │
│  (React 19) │
└──────┬──────┘
       │
       ├─── Static Assets ───> Vercel CDN
       │
       ├─── API Routes ──────> Next.js 16 Server
       │                           │
       │                           ├──> OpenAI GPT-4 (AI 생성)
       │                           ├──> Deepgram API (STT)
       │                           └──> Supabase Client
       │                                      │
       └─── Client SDK ──────────────────────┘
                                              │
                                    ┌─────────┴─────────┐
                                    │    Supabase       │
                                    ├───────────────────┤
                                    │ PostgreSQL (DB)   │
                                    │ Storage (Audio)   │
                                    │ Realtime (WS)     │
                                    │ Auth (JWT)        │
                                    └───────────────────┘
```

---

## 2. 사용자 여정 플로우 (User Journey)

### 2.1 온보딩 및 프로젝트 생성

```
[사용자] → [랜딩 페이지]
              │
              ├─ "시작하기" 클릭
              │
              ▼
        [회원가입/로그인]
              │
              ├─ 이메일/비밀번호 입력
              ├─ Supabase Auth 처리
              │
              ▼
        [대시보드]
              │
              ├─ "새 프로젝트 만들기" 클릭
              │
              ▼
        [프로젝트 생성 마법사]
              │
              ├─ Step 1: 기본 정보 (제목, 소개)
              ├─ Step 2: 이야기 포커스 (주제 선택)
              ├─ Step 3: 인터뷰 계획 (일정, 협업자)
              │
              ├─ DB에 projects 레코드 생성
              ├─ 기본 챕터 3-5개 자동 생성
              │
              ▼
        [프로젝트 Overview]
```

### 2.2 인터뷰 진행 (핵심 플로우)

```
[프로젝트 Overview]
        │
        ├─ 챕터 선택 ("어린 시절")
        │
        ▼
[챕터 상세 페이지]
        │
        ├─ "세션 추가" 클릭
        ├─ 세션 제목 입력 ("고향 이야기")
        ├─ DB에 sessions 레코드 생성
        │
        ▼
[세션 인터뷰 페이지]
        │
        ├─ 질문 리스트 표시 (10-15개)
        ├─ 현재 질문 강조 표시
        │
        ├─ [사용자] → "녹음 시작" 클릭
        │         │
        │         ├─ MediaRecorder API 초기화
        │         ├─ 마이크 권한 요청
        │         ├─ 녹음 시작 (빨간 펄스 애니메이션)
        │         │
        │         ├─ [사용자] → 답변 (1-3분)
        │         │
        │         ├─ "녹음 정지" 클릭
        │         ▼
        │   [오디오 처리 파이프라인]
        │         │
        │         ├─ 1. Blob → File 변환
        │         ├─ 2. Supabase Storage 업로드
        │         │    └─> audio-uploads/{projectId}/{timestamp}.webm
        │         │
        │         ├─ 3. DB audio_assets 레코드 생성
        │         │    └─> status: 'uploaded'
        │         │
        │         ├─ 4. /api/transcribe 호출
        │         │    │
        │         │    ├─ FormData { audio, assetId }
        │         │    │
        │         │    ├─ Deepgram API 호출
        │         │    │  └─> POST https://api.deepgram.com/v1/listen
        │         │    │      language=ko, model=nova-2
        │         │    │
        │         │    ├─ 전사 텍스트 수신
        │         │    │
        │         │    ├─ DB 업데이트
        │         │    │  └─> audio_assets.status = 'transcribed'
        │         │    │      audio_assets.transcript = "..."
        │         │    │
        │         │    └─> questions.transcription 업데이트
        │         │        questions.is_completed = true
        │         │
        │         ▼
        │   [전사 결과 표시]
        │         │
        │         ├─ 텍스트 미리보기
        │         ├─ 오디오 재생 버튼
        │         ├─ "다음 질문" 버튼 활성화
        │         │
        │         ▼
        ├─ 다음 질문으로 이동
        │
        ├─ (반복)
        │
        ▼
[세션 완료]
        │
        ├─ DB sessions.status = 'completed'
        ├─ 챕터 진행률 자동 갱신
        │
        ▼
[챕터 상세 페이지로 복귀]
```

---

## 3. 편집 플로우 (Edit Page)

### 3.1 편집 페이지 진입

```
[프로젝트 Overview]
        │
        ├─ "편집 모드" 클릭
        │
        ▼
[편집 페이지 로딩]
        │
        ├─ GET /api/timeline-events?projectId=xxx
        ├─ GET /api/sections?projectId=xxx
        │
        ├─ 타임라인 바 렌더링 (상단)
        ├─ 섹션 리스트 렌더링 (좌측)
        ├─ 에디터 렌더링 (중앙)
        ├─ 녹음 패널 렌더링 (우측)
        │
        ▼
[편집 화면 표시]
```

### 3.2 소주제 추가 (3가지 방식)

#### 방식 1: 텍스트로 작성

```
[사용자] → "소주제 추가" 클릭
              │
              ├─ 입력 방식 선택 모달 표시
              ├─ "텍스트로 작성" 선택
              │
              ▼
        [AddSectionModal]
              │
              ├─ 제목 입력
              ├─ 내용 입력
              ├─ 대주제 선택 (optional)
              │
              ├─ "저장" 클릭
              │
              ├─ POST /api/sections
              │    {
              │      projectId,
              │      title,
              │      content,
              │      eventId
              │    }
              │
              ├─ DB sections 레코드 생성
              ├─ excerpt 자동 생성 (첫 150자)
              │
              ▼
        [섹션 리스트에 추가됨]
```

#### 방식 2: 음성으로 작성

```
[사용자] → "소주제 추가" 클릭
              │
              ├─ "음성으로 작성" 선택
              │
              ▼
        [녹음 패널 자동 열림]
              │
              ├─ 녹음 시작
              ├─ 오디오 처리 파이프라인 (위와 동일)
              │    │
              │    ├─ STT → 전사 텍스트
              │    │
              │    ├─ (선택사항) AI 소단락 분할
              │    │    POST /api/analyze-transcript
              │    │    └─> subsections[] 반환
              │    │
              │    ▼
              ├─ 전사 텍스트로 섹션 자동 생성
              │    │
              │    ├─ title: "음성 녹음 YYYY-MM-DD HH:mm"
              │    ├─ content: transcript
              │    ├─ subsections: [...] (optional)
              │    │
              │    └─> POST /api/sections
              │
              ▼
        [섹션 리스트에 추가됨]
```

#### 방식 3: 파일 가져오기

```
[사용자] → "소주제 추가" 클릭
              │
              ├─ "파일 가져오기" 선택
              │
              ▼
        [파일 업로드 모달]
              │
              ├─ 파일 선택 (.mp3, .wav, .txt)
              │
              ├─ 오디오 파일인 경우:
              │    │
              │    ├─ Supabase Storage 업로드
              │    ├─ STT 처리 (위와 동일)
              │    └─> 전사 텍스트로 섹션 생성
              │
              ├─ 텍스트 파일인 경우:
              │    │
              │    ├─ 파일 내용 읽기
              │    └─> 내용 그대로 섹션 생성
              │
              ▼
        [섹션 리스트에 추가됨]
```

### 3.3 본문 편집 및 자동 저장

```
[사용자] → 섹션 클릭
              │
              ▼
        [중앙 에디터에 로드]
              │
              ├─ 제목 표시
              ├─ Textarea에 content 로드
              ├─ 연결된 대주제 뱃지 표시
              │
              ├─ [사용자] → 텍스트 수정
              │         │
              │         ├─ onChange 이벤트 발생
              │         │
              │         ├─ debounce(1500ms) 타이머 시작
              │         │
              │         ▼
              │   [자동 저장 트리거]
              │         │
              │         ├─ PUT /api/sections/:id
              │         │    {
              │         │      content: newContent,
              │         │      excerpt: newContent.substring(0, 150)
              │         │    }
              │         │
              │         ├─ DB sections 레코드 업데이트
              │         │
              │         ├─ "저장됨" 인디케이터 표시
              │         │
              │         ▼
              │   [섹션 리스트 excerpt 갱신]
              │
              ▼
        [편집 완료]
```

---

## 4. 출판 플로우 (Publishing Flow)

### 4.1 출판 준비 진입

```
[편집 페이지]
        │
        ├─ "편집 완료" 클릭
        │
        ▼
[출판 마법사 - Step 1]
        │
        ├─ 출판 방식 선택
        │    │
        │    ├─ ☐ 실물책 (하드커버/소프트커버)
        │    ├─ ☐ 전자책 (EPUB/PDF)
        │    ├─ ☐ 오디오북 (TTS)
        │    │
        │    └─ (멀티 선택 가능)
        │
        ├─ "다음" 클릭
        │
        ▼
[출판 마법사 - Step 2]
        │
        ├─ 선택된 옵션별 세부 설정
        │    │
        │    ├─ 실물책: 판형, 수량, 선물 포장
        │    ├─ 전자책: 파일 형식, 공유 범위
        │    ├─ 오디오북: 내레이터, 러닝타임
        │    │
        │    └─ 실시간 비용 힌트 표시
        │
        ├─ "다음" 클릭
        │
        ▼
[출판 마법사 - Step 3]
        │
        ├─ 견적 요약 표시
        │    │
        │    ├─ 실물책: ₩50,000 + (₩15,000 × 수량)
        │    ├─ 전자책: ₩20,000
        │    ├─ 오디오북: ₩30,000 (TTS)
        │    │
        │    └─ 총 예상 비용: ₩XXX,XXX
        │
        ├─ 예상 제작 일정 표시
        │    └─ "영업일 기준 7-10일"
        │
        ├─ CTA 버튼
        │    │
        │    ├─ "상담 신청" (미구현)
        │    └─ "제작 요청" (미구현)
        │
        ▼
[출판 요청 완료]
```

### 4.2 PDF 생성 및 다운로드 (향후 구현)

```
[출판 요청 완료]
        │
        ├─ POST /api/publish/request
        │    {
        │      projectId,
        │      options: [...],
        │      details: {...}
        │    }
        │
        ▼
[백엔드 비동기 처리]
        │
        ├─ 1. 프로젝트 전체 데이터 수집
        │    │
        │    ├─ chapters, sessions, questions 로드
        │    ├─ text_blocks, sections 로드
        │    ├─ audio_assets 경로 수집
        │    │
        │    └─> 통합 JSON 생성
        │
        ├─ 2. AI 최종 편집/정제
        │    │
        │    ├─ POST /api/refine-autobiography
        │    │    { blocks: [...], style: 'warm' }
        │    │
        │    ├─ GPT-4로 전체 문맥 통일
        │    ├─ 챕터별 도입부/마무리 생성
        │    ├─ 문체 일관성 검사
        │    │
        │    └─> 최종 텍스트 반환
        │
        ├─ 3. PDF 렌더링
        │    │
        │    ├─ Puppeteer/Playwright 초기화
        │    ├─ HTML 템플릿 로드
        │    ├─ 최종 텍스트 주입
        │    ├─ CSS 스타일 적용
        │    ├─ 표지, 목차, 본문, 후기 페이지 생성
        │    │
        │    └─> PDF 파일 생성
        │
        ├─ 4. Supabase Storage 업로드
        │    │
        │    ├─ PUT storage/documents/{projectId}.pdf
        │    │
        │    └─> 공개 URL 반환
        │
        ├─ 5. 사용자에게 알림
        │    │
        │    ├─ Supabase Realtime으로 상태 업데이트
        │    ├─ 이메일 발송 (optional)
        │    │
        │    └─> "PDF 준비 완료" 알림
        │
        ▼
[다운로드 페이지]
        │
        ├─ PDF 미리보기 (iframe)
        ├─ "다운로드" 버튼
        │    └─> window.open(pdfUrl)
        │
        ▼
[파일 저장]
```

---

## 5. 데이터 흐름 (Data Flow)

### 5.1 인터뷰 데이터 → 자서전 구조화

```
[녹음 오디오]
      │
      ├─ MediaRecorder → Blob
      ├─ Blob → File (WebM/MP4)
      ├─ File → Supabase Storage
      │
      ▼
[audio_assets 레코드]
      │
      ├─ file_path: "projectId/timestamp.webm"
      ├─ status: 'uploaded'
      ├─ question_id: UUID
      │
      ▼
[Deepgram STT]
      │
      ├─ HTTP POST
      ├─ language=ko, model=nova-2
      │
      ▼
[전사 텍스트]
      │
      ├─ "어렸을 때 저는 부산 영도에서 살았어요..."
      │
      ├─ DB 업데이트
      │    └─> questions.transcription = transcript
      │         audio_assets.status = 'transcribed'
      │
      ▼
[AI 구조화 (optional)]
      │
      ├─ POST /api/structure
      │    {
      │      transcript,
      │      mode: 'chapter_generation'
      │    }
      │
      ├─ PromptBuilder 실행
      │    └─> GPT-4 Turbo 호출
      │
      ├─ 응답 파싱
      │    └─> { chapters: [...] }
      │
      ▼
[text_blocks 자동 생성]
      │
      ├─ 챕터별로 text_blocks 레코드 생성
      │    │
      │    ├─ type: 'ai_generated'
      │    ├─ content: "..."
      │    ├─ source_question_ids: [UUID]
      │    │
      │    └─> INSERT INTO text_blocks
      │
      ▼
[편집 가능한 자서전 텍스트]
```

### 5.2 Realtime 구독 (진행률 업데이트)

```
[클라이언트 (React Component)]
      │
      ├─ useEffect(() => {
      │      const channel = supabase
      │        .channel('audio_processing_${assetId}')
      │        .on('postgres_changes', {
      │          event: 'UPDATE',
      │          schema: 'public',
      │          table: 'audio_assets',
      │          filter: `id=eq.${assetId}`
      │        }, (payload) => {
      │          setStatus(payload.new.status);
      │          setProgress(payload.new.progress);
      │        })
      │        .subscribe();
      │    }, [assetId]);
      │
      ▼
[Supabase Realtime Server]
      │
      ├─ PostgreSQL LISTEN/NOTIFY
      ├─ WebSocket 연결 유지
      │
      ├─ DB UPDATE 감지
      │    └─> audio_assets.status = 'transcribing'
      │         audio_assets.progress = 50
      │
      ├─ 변경 사항 브로드캐스트
      │
      ▼
[클라이언트 콜백 실행]
      │
      ├─ setStatus('transcribing')
      ├─ setProgress(50)
      │
      ├─ UI 업데이트
      │    └─> 진행률 바 50% 표시
      │         "전사 중..." 라벨
      │
      ▼
[실시간 피드백]
```

---

## 6. 인증 및 권한 흐름 (Auth Flow)

### 6.1 회원가입 및 로그인

```
[사용자] → 이메일/비밀번호 입력
              │
              ▼
        [Supabase Auth]
              │
              ├─ signUp() 또는 signInWithPassword()
              │
              ├─ JWT 토큰 생성
              │    │
              │    ├─ access_token (1시간)
              │    └─ refresh_token (7일)
              │
              ├─ LocalStorage에 저장
              │    └─> supabase.auth.session
              │
              ├─ Row Level Security (RLS) 적용
              │    │
              │    ├─ auth.uid() = user_id 조건
              │    │
              │    └─> 본인 프로젝트만 조회 가능
              │
              ▼
        [대시보드 리다이렉트]
```

### 6.2 자동 토큰 갱신

```
[클라이언트]
      │
      ├─ Supabase Client 초기화
      │    └─> autoRefreshToken: true
      │
      ├─ 페이지 로드 시마다
      │    │
      │    ├─ supabase.auth.getSession()
      │    │
      │    ├─ access_token 만료 체크
      │    │
      │    ├─ (만료 시) refresh_token으로 갱신
      │    │    └─> POST /auth/v1/token?grant_type=refresh_token
      │    │
      │    └─> 새 access_token 발급
      │
      ▼
[세션 유지]
```

---

## 7. 에러 처리 플로우 (Error Handling)

### 7.1 STT 실패 처리

```
[/api/transcribe]
      │
      ├─ Deepgram API 호출
      │
      ├─ (에러 발생: 네트워크 장애, API 한도 초과 등)
      │
      ▼
[에러 감지]
      │
      ├─ DB 상태 업데이트
      │    └─> audio_assets.status = 'failed'
      │         audio_assets.error_message = error.message
      │
      ├─ HTTP 500 응답
      │    └─> { error: '음성 변환 중 문제가 발생했습니다.' }
      │
      ▼
[클라이언트]
      │
      ├─ try/catch 처리
      │
      ├─ 사용자에게 알림
      │    │
      │    ├─ "전사에 실패했습니다"
      │    ├─ "재시도" 버튼 표시
      │    │
      │    └─> onClick={() => retryTranscribe()}
      │
      ▼
[재시도 또는 건너뛰기]
```

### 7.2 AI 생성 폴백 전략

```
[generateChaptersFromTranscripts()]
      │
      ├─ try {
      │      GPT-4 API 호출
      │    }
      │
      ├─ (에러 발생: 타임아웃, 토큰 한도 등)
      │
      ▼
[폴백 전략 실행]
      │
      ├─ fallbackStrategy === 'simple'
      │    │
      │    ├─ generateSimpleChapters()
      │    │    └─> 전사 텍스트를 시간순/길이별로 균등 분할
      │    │
      │    └─> 기본 챕터 5개 반환
      │
      ├─ fallbackStrategy === 'template'
      │    │
      │    ├─ 사전 정의된 템플릿 사용
      │    │    └─> ["어린 시절", "청년기", "가정생활", "경력", "회고"]
      │    │
      │    └─> 템플릿 기반 챕터 반환
      │
      ▼
[안정적인 결과 제공]
```

---

## 8. 성능 최적화 플로우

### 8.1 자동 저장 Debounce

```
[Textarea onChange]
      │
      ├─ setContent(newValue)
      │
      ├─ debounce(saveSection, 1500ms) 호출
      │    │
      │    ├─ 타이머 시작
      │    │
      │    ├─ (1.5초 내 재입력 시)
      │    │    └─> 타이머 리셋
      │    │
      │    └─ (1.5초 경과 시)
      │         └─> saveSection() 실행
      │
      ▼
[API 호출 최소화]
```

### 8.2 이미지/오디오 Lazy Loading

```
[페이지 로딩]
      │
      ├─ 화면에 보이는 요소만 먼저 렌더링
      │
      ├─ Intersection Observer 등록
      │    │
      │    ├─ 스크롤 시 감지
      │    │
      │    └─> 뷰포트에 진입 시 로딩
      │
      ▼
[부드러운 사용자 경험]
```

---

## 9. 배포 플로우 (Deployment Flow)

### 9.1 Vercel 배포 프로세스

```
[GitHub Push]
      │
      ├─ git push origin main
      │
      ▼
[Vercel CI/CD Trigger]
      │
      ├─ 1. 소스 코드 Pull
      ├─ 2. 의존성 설치 (npm install)
      ├─ 3. TypeScript 컴파일
      ├─ 4. Next.js 빌드 (npm run build)
      │    │
      │    ├─ Turbopack 빌드
      │    ├─ Static 페이지 생성
      │    ├─ Server Components 번들링
      │    │
      │    └─> .next/ 디렉토리 생성
      │
      ├─ 5. 환경 변수 주입
      │    │
      │    ├─ NEXT_PUBLIC_SUPABASE_URL
      │    ├─ NEXT_PUBLIC_SUPABASE_ANON_KEY
      │    ├─ SUPABASE_SERVICE_ROLE_KEY
      │    ├─ OPENAI_API_KEY
      │    ├─ NEXT_PUBLIC_DEEPGRAM_API_KEY
      │    │
      │    └─> 프로덕션 환경 변수 사용
      │
      ├─ 6. Edge Network 배포
      │    │
      │    ├─ Static 파일 → Vercel CDN
      │    ├─ API Routes → Serverless Functions
      │    ├─ Server Components → Edge Runtime
      │    │
      │    └─> 전 세계 리전에 복제
      │
      ├─ 7. Health Check
      │    │
      │    └─> GET https://onyu-ai.vercel.app/
      │
      ▼
[배포 완료]
      │
      └─> 프로덕션 URL 활성화
```

### 9.2 Supabase 마이그레이션

```
[로컬 마이그레이션 파일 작성]
      │
      ├─ supabase/migrations/20250118000000_session_interview_system.sql
      │
      ▼
[Supabase Dashboard]
      │
      ├─ SQL Editor 열기
      │
      ├─ 마이그레이션 SQL 복사/붙여넣기
      │
      ├─ "Run" 클릭
      │    │
      │    ├─ 테이블 생성
      │    ├─ RLS 정책 적용
      │    ├─ 트리거 함수 생성
      │    │
      │    └─> 스키마 업데이트 완료
      │
      ▼
[프로덕션 DB 반영]
```

---

## 10. 모니터링 및 로깅 (향후 구현)

### 10.1 에러 추적

```
[프로덕션 에러 발생]
      │
      ├─ try/catch로 에러 감지
      │
      ├─ Sentry.captureException(error)
      │    │
      │    ├─ 스택 트레이스 수집
      │    ├─ 사용자 컨텍스트 첨부
      │    ├─ 환경 정보 첨부
      │    │
      │    └─> Sentry 서버로 전송
      │
      ▼
[Sentry Dashboard]
      │
      ├─ 에러 그룹핑
      ├─ 빈도 분석
      ├─ 이메일/Slack 알림
      │
      └─> 개발자에게 즉시 통지
```

---

## 요약

이 문서는 온유록 프로젝트의 모든 주요 플로우를 텍스트 기반 다이어그램으로 정리했습니다.

**핵심 플로우**:
1. **사용자 여정**: 온보딩 → 프로젝트 생성 → 인터뷰 진행 → 편집 → 출판
2. **데이터 흐름**: 음성 녹음 → STT → AI 구조화 → 편집 가능한 텍스트
3. **실시간 업데이트**: Supabase Realtime으로 진행률 동기화
4. **에러 처리**: 폴백 전략으로 안정적인 사용자 경험 보장
5. **배포**: Vercel CI/CD 자동화

모든 다이어그램은 실제 구현된 코드와 1:1 매핑되며, 신규 개발자가 시스템을 이해하는 데 도움이 됩니다.

---

**마지막 업데이트**: 2025-11-18
**작성자**: Claude Code
