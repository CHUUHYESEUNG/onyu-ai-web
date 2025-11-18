온유록(Onyu.ai) — 풀스택 자동 확장/리팩터링/UX·AI 고도화 마스터 프롬프트

⸻

📌 전체 개요

너(Claude)는 지금부터 온유.ai(온유록) 프로젝트의 전체 기능을
**“MVP → 상용화 수준”**까지 확장하는 장시간 자동화 개발 모드로 진입한다.

이 문서에 정의된 모든 작업을 순차적으로 자동 수행하며,
각 작업의 결과를 파일 단위로 정리하여 출력하고,
필요 시 후속 개선·리팩터링·문서화 작업까지 자율적으로 이어서 수행한다. 마지막으로 npm build를 통해 에러가 없도록 마무리한다.

⸻

🚀 0. 작업 환경 컨텍스트

다음 파일들을 온전히 이해한 뒤 작업을 시작해야 한다:
	•	CLAUDE.md
	•	CLAUDE_1107.md
	•	CODEX.md
	•	CODEX_1107.md
	•	IMPLEMENTATION_SUMMARY.md
	•	SETUP_GUIDE.md
    •	0423.md
	•	프로젝트 전체 디렉토리(app/*, lib/*, components/*, types/*, supabase schema 등)

이 문서들에 정의된:
	•	기능 흐름
	•	데이터 모델
	•	AI 파이프라인
	•	UX 구조
	•	페이지 구조
	•	개선 플랜
을 전부 고려해서 아래 미션을 수행한다.

⸻

🟥 1. 세션 기반 인터뷰 시스템 — 완전 구현

CLAUDE.md에 명확히 정의된:

📌 Chapter → Session → Question → TextBlock 구조

📌 녹음 기반 인터뷰 흐름

📌 질문 리스트 / 진행률 / 세션 네비게이션

📌 STT → 구조화 → 저장 파이프라인

이 모든 것을 다음 산출물 형태로 구현한다.

해야 할 작업
	1.	Supabase 마이그레이션 SQL 생성
	•	chapters
	•	sessions
	•	questions
	•	text_blocks
	•	audio_assets (연결)
	•	foreign key, index 등 포함
	2.	타입 정의 업데이트
	•	types/database.ts
	•	types/projects.ts 또는 새로운 타입 파일
	3.	페이지 생성
	•	/projects/[projectId]/index → 챕터 리스트 포함
	•	/projects/[projectId]/chapter/[chapterId]
	•	/projects/[projectId]/chapter/[chapterId]/session/[sessionId]
(질문 리스트 + 녹음 + 현재 질문 표시)
	4.	STT 파이프라인 연결
	•	녹음한 오디오 파일 → Deepgram or OpenAI → text
	•	text를 해당 Question.transcription에 저장
	•	섹션 생성 파이프라인과도 연결
	5.	API/유틸 정리
	•	lib/supabase-api.ts 확장
	•	lib/ai-utils.ts 업데이트
	•	lib/audio-recorder.ts 업데이트
	6.	UI 컴포넌트
	•	진행률 표시
	•	질문 카드
	•	타임라인
	•	녹음 플로팅 패널
	•	세션 헤더

⸻

🟩 2. Edit 페이지 UX 리뉴얼 — Phase 1~7 전부 적용

CODEX_1107.md에 정의된 개선안 Phase 1~7을 모두 구현한다.

적용 대상 파일:
	•	components/edit/timeline-bar.tsx
	•	components/edit/section-list.tsx
	•	components/edit/section-editor.tsx
	•	components/edit/recording-panel.tsx
	•	(필요 시) app/projects/[projectId]/edit/page.tsx

구현 포인트:
	•	버튼 절대 수 줄이기
	•	에디터 영역 최대화
	•	hover/active 기반 minimal UI
	•	기록 패널 접기/펼치기
	•	소단락 미리보기 단순화
	•	이동 버튼 → drag handle
	•	자동 저장 인디케이터

각 Phase별 적용 여부를 체크리스트로 출력하며 진행할 것.

⸻

🟨 3. AI 파이프라인 고도화 — 문체·음성→자서전 변환 최적화

아래 항목을 실제 코드로 구현한다:
	1.	전략 패턴 기반 프롬프트 생성기
	•	buildPrompt({ mode, tone, style })
	•	mode: summarize, structure, warm_storytelling, respectful_memories 등
	•	tone: formal, warm, casual 등
	2.	챕터 자동 생성 프롬프트
	•	인터뷰 전사 → 5~8개 주요 챕터 자동 생성
	3.	소단락 자동 생성 개선
	•	더 자연스러운 흐름
	•	한국어 존댓말/경어 최적화
	4.	AI 실패 폴백 강화
	•	네트워크 장애
	•	문답 과소·과다
	•	전사 품질 낮음
	5.	각 API의 프롬프트·파서 개선
	•	/api/summarize
	•	/api/structure
	•	/api/refine
	•	/api/questions (자동 질문 생성)

⸻

🟧 4. 코드 품질 개선 — 타입/에러/테스트 종합 정리
	1.	전체 strict TypeScript 정리
	•	남아있는 any, @ts-nocheck 모두 제거
	•	lib/* 에 반환 타입·에러 타입 명시
	2.	에러 핸들링 체계 통일
	•	결과 객체 패턴: {ok: boolean, data?: T, error?: string}
	3.	테스트 코드 작성(vitest)
	•	ai-utils (프롬프트 생성/파서)
	•	supabase-api CRUD mock
	•	audio-recorder 포맷 테스트
	4.	ESLint / Prettier 정비
	•	eslint-config-next + custom rules 반영

⸻

🟪 5. 문서/개발자용 가이드 자동 생성

문서 자동 생성:
	•	ONBOARDING.md
(신규 팀원이 30분 만에 개발 환경 세팅할 수 있게)
	•	ARCHITECTURE.md
(폴더 구조, 데이터 흐름, API 흐름)
	•	PROMPT_DESIGN.md
(요약/구조화/문체 변환 프롬프트 설명)
	•	FLOW_DIAGRAMS.md
(텍스트 기반 시퀀스 다이어그램)
	•	USER_GUIDE.md
(고객용 UI 설명서 초안)
	•	TODOLIST_1118.md
(추후 진행해야할 to-do list)

⸻

🟫 6. 이후 자율 개선 모드

위의 미션을 모두 수행한 뒤, 너는 아래 자율 미션을 반복 수행한다:
	1.	리팩터링 포인트 자동 탐색 → 수정
	2.	UI 정렬/간격/타이포 일관성 검사 → 개선
	3.	AI 프롬프트 품질 개선 실험 → 적용
	4.	전반적 성능 개선(Promise, 캐싱, memo 등)
	5.	코드 중복 제거 및 컴포넌트화
	6.	작업 로그를 MARKDOWN으로 출력 (log/1118_WORK.md)

⸻

🟦 7. 출력 형식 (중요)

모든 작업은 아래 형태로 출력해야 한다:

✔️ 파일 단위 변경 출력

# FILE: app/projects/[projectId]/chapter/[chapterId]/session/[sessionId]/page.tsx
<코드 전체>

✔️ 변경 이유 설명

# WHY:
- CODEX_1107 Phase3 적용
- UI 단순화
- 진행률 구조 개선

✔️ 다음 단계

# NEXT STEP:
- Section Editor Phase4 적용
- Summarize API 전략 패턴 통합


⸻

8. 더미 데이터를 통해 편집 후 로딩을 거쳐
최종 출판본 pdf 다운로드 예시를
보여줄 수 있는 UI/UX까지 구축한다. 

---

🟧 9. 실행 지시문

지금부터 위의 모든 작업을 순서대로 수행한다.
모든 기능은 기존 코드 스타일을 유지하며,
반드시 프로덕션 수준 코드 품질로 작성한다.
마지막은 build error fix로 완성도를 높인다.

작업을 시작하라.