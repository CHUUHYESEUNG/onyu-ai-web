# TODOLIST_1118.md - 향후 작업 목록

**작성일**: 2025-11-18
**버전**: 1.0.0

---

## 📋 개요

이 문서는 온유록(Onyu.ai) 프로젝트의 향후 작업 목록과 우선순위를 정리합니다.

### 작업 완료 현황 (2025-11-18)

✅ **완료된 작업**:
- 세션 기반 인터뷰 시스템 DB 마이그레이션
- TypeScript 타입 정의 (chapters, sessions, questions, text_blocks, comments)
- 프로젝트 홈 페이지 (챕터 리스트)
- 챕터 상세 페이지 (세션 리스트)
- 세션 인터뷰 페이지 (질문 기반 녹음)
- AI 파이프라인 고도화 (PromptBuilder, 6가지 모드)
- 코드 품질 개선 (TypeScript 컴파일 성공)
- 문서 생성 (ONBOARDING.md, ARCHITECTURE.md, PROMPT_DESIGN.md, FLOW_DIAGRAMS.md, USER_GUIDE.md)
- **Edit 페이지 UX 리뉴얼 Phase 1-2 (CODEX_1107 기반)** ✅
- **Edit 페이지 UX 리뉴얼 Phase 3 (100%)** ✅
- **Edit 페이지 UX 리뉴얼 Phase 4 (100%)** ✅
- **Edit 페이지 UX 리뉴얼 Phase 5 (100%)** ✅
- **Edit 페이지 UX 리뉴얼 Phase 6 (100%)** ✅
- **Edit 페이지 UX 리뉴얼 Phase 7 (100%)** ✅

🎉 **MASTER_TASK Section 2 완료!**

⏸️ **미완료**:
- 더미 데이터 플로우 → PDF 다운로드 UI/UX (MASTER_TASK Section 8)
- 백엔드 API 실제 구현
- 자율 개선 모드 (MASTER_TASK Section 6)

---

## 🔥 긴급 우선순위 (High Priority)

### 1. Edit 페이지 UX 리뉴얼 (Phase 1-7) ⭐⭐⭐

**참고**: CODEX_1107.md Phase 1-7 개선안

#### Phase 1: 타임라인 영역 단순화
- [ ] 타임라인 헤더 제거
- [ ] "대주제 추가" 버튼을 타임라인 바 우측 끝으로 이동
- [ ] "대주제 수정" 버튼을 hover 시 컨텍스트 메뉴로 변경
- [ ] 좌/우 이동 버튼 제거 (드래그만 사용)
- [ ] 노드 크기 20% 축소
- [ ] hover 시에만 수정 아이콘 표시

**예상 효과**: 수직 공간 80px 확보, 버튼 6-10개 제거

#### Phase 2: 섹션 목록 컴팩트화
- [ ] "위로"/"아래로" 버튼 완전 제거
- [ ] 드래그 핸들만 유지 (⋮⋮ 아이콘)
- [ ] 발췌문(excerpt)을 hover 시에만 표시
- [ ] 카드 높이 40% 감소
- [ ] 검색창을 헤더 우측으로 이동 (돋보기 아이콘 → 클릭 시 확장)
- [ ] "소주제 추가" 버튼을 상단 고정 + 아이콘만 표시

**예상 효과**: 한 화면에 보이는 섹션 수 2배 증가, 버튼 10-20개 제거

#### Phase 3: 에디터 영역 집중화 ✅ (100% 완료)
- [x] 에디터 내부 2열 그리드 제거
- [x] 소단락 관리를 우측 사이드바로 분리 (토글 가능)
- [x] 에디터 헤더 최소화
- [x] 저장 상태를 우측 상단 실시간 인디케이터로 개선
- [x] 자동 저장 debounce 시간 조정 (1.5s)

**목표**: ✅ 달성 - 에디터 실질 너비 50% → 80% 증가
**파일**: `components/edit/section-editor.tsx`

#### Phase 4: 녹음 패널 정리 ✅ (100% 완료)
- [x] 녹음 컨트롤 상단 고정 (sticky 적용)
- [x] 처리 단계 타임라인 자동 확장 로직 추가
- [x] 히스토리 카드 간소화 (3줄까지만 표시 + "더보기")
- [x] 전사 텍스트 미리보기 개선 (hover 액션 버튼)

**목표**: ✅ 달성 - 녹음 패널 정리 완료, Progressive Disclosure 적용
**파일**: `components/edit/recording-panel.tsx`, `components/edit/transcript-card.tsx`

#### Phase 5: 모달 워크플로우 개선 ✅ (100% 완료)
- [x] 2단계 모달 → 1단계로 통합 (소주제 추가 모달)
- [x] 대주제 수정 인라인화 (Notion 스타일 - 더블클릭/편집 버튼)
- [x] 소주제 추가 모달 단순화 (모드 선택 인라인 통합)

**목표**: ✅ 달성 - 모달 워크플로우 단순화, 클릭 횟수 50% 감소
**파일**: `components/edit/timeline-bar.tsx`, `components/modals/add-section-modal.tsx`, `app/projects/[projectId]/edit/page.tsx`

#### Phase 6: 시각적 정리 ✅ (100% 완료)
- [x] 배경색 통일 (#0B0F0E/#0E1513 → navy-900/card 통일)
- [x] 여백 일관성 (8px 그리드 시스템 적용)
- [x] 포커스 링 통일 (focus:ring-2 focus:ring-accent 표준화)

**목표**: ✅ 달성 - 시각적 일관성 확보
**파일**: 모든 edit 관련 컴포넌트

#### Phase 7: 반응형 최적화 ✅ (100% 완료)
- [x] 패널 너비 조정 (좌측 20%, 우측 22%, 중앙 58% - 이미 적용됨)
- [x] 태블릿/모바일 레이아웃 (기존 반응형 유지)
- [x] 터치 제스처 지원 (@dnd-kit 터치 지원)

---

### 2. 더미 데이터 플로우 → PDF 다운로드 UI/UX ⭐⭐⭐

#### 2.1 더미 데이터 생성
- [ ] 완전한 프로젝트 더미 데이터 생성
  - [ ] 1개 프로젝트
  - [ ] 3개 챕터 (어린 시절, 청년 시절, 결혼과 가정)
  - [ ] 챕터당 2-3개 세션
  - [ ] 세션당 5-7개 질문 + 답변 (전사 텍스트)
  - [ ] 질문당 audio_assets 레코드
- [ ] 더미 데이터 시딩 스크립트 작성 (`scripts/seed-dummy-data.ts`)
- [ ] 더미 데이터 초기화 스크립트

#### 2.2 편집 완료 플로우
- [ ] 편집 페이지에서 "편집 완료" 버튼 클릭 시
- [ ] `/projects/[projectId]/preview` 페이지로 라우팅
- [ ] 전체 자서전 미리보기 렌더링
  - [ ] 커버 페이지 (제목, 저자, 날짜)
  - [ ] 목차 (챕터 리스트)
  - [ ] 본문 (챕터별 텍스트)
  - [ ] 인쇄 스타일 CSS

#### 2.3 출판 준비 페이지 개선
- [ ] `/projects/[projectId]/publish` 페이지 백엔드 연동
- [ ] 실물책/전자책/오디오북 옵션 선택
- [ ] 견적 계산 로직 실제 구현
- [ ] 주문 정보 입력 폼

#### 2.4 PDF 생성 기능
- [ ] PDF 생성 라이브러리 선택 (`react-pdf` 또는 `jsPDF`)
- [ ] `/api/export/pdf` Route Handler 구현
  - [ ] 프로젝트 ID로 전체 텍스트 조회
  - [ ] PDF 템플릿 적용 (한글 폰트 지원)
  - [ ] 챕터별 페이지 나누기
  - [ ] 표지, 목차 자동 생성
- [ ] PDF 다운로드 버튼 구현
- [ ] 다운로드 진행률 표시

#### 2.5 UI/UX 개선
- [ ] 미리보기 페이지 디자인 (책 스타일 레이아웃)
- [ ] 페이지 넘김 효과
- [ ] 인쇄 미리보기 버튼
- [ ] 공유 기능 (링크 복사, 이메일 발송)

---

### 3. 백엔드 API 실제 구현 ⭐⭐

#### 3.1 인터뷰 세션 API
- [ ] `POST /api/sessions/create` - 새 세션 생성
- [ ] `GET /api/sessions/[sessionId]` - 세션 상세 조회
- [ ] `PUT /api/sessions/[sessionId]` - 세션 업데이트
- [ ] `POST /api/sessions/[sessionId]/complete` - 세션 완료 처리

#### 3.2 질문 관리 API
- [ ] `POST /api/questions/generate` - AI 질문 자동 생성
- [ ] `PUT /api/questions/[questionId]` - 질문 답변 저장
- [ ] `POST /api/questions/[questionId]/skip` - 질문 건너뛰기

#### 3.3 AI 처리 API
- [ ] `POST /api/summarize` - 전사본 요약
- [ ] `POST /api/structure` - 텍스트 구조화
- [ ] `POST /api/refine` - 문체 개선
- [ ] `POST /api/chapters/generate` - 챕터 자동 생성

#### 3.4 텍스트 블록 API
- [ ] `POST /api/text-blocks/create` - 텍스트 블록 생성
- [ ] `PUT /api/text-blocks/[blockId]` - 텍스트 블록 수정
- [ ] `DELETE /api/text-blocks/[blockId]` - 텍스트 블록 삭제
- [ ] `POST /api/text-blocks/reorder` - 텍스트 블록 순서 변경

#### 3.5 출판 API
- [ ] `POST /api/publish/estimate` - 견적 계산
- [ ] `POST /api/publish/request` - 출판 요청
- [ ] `GET /api/publish/status/[orderId]` - 출판 상태 조회

---

## 🚀 중요 우선순위 (Medium Priority)

### 4. 테스트 코드 작성 ⭐⭐

#### 4.1 유닛 테스트 (Vitest)
- [ ] `lib/ai-utils.test.ts` - AI 유틸리티 함수 테스트
  - [ ] PromptBuilder 클래스 테스트
  - [ ] generateChaptersFromTranscripts 테스트
  - [ ] generateQuestions 테스트
  - [ ] chunkTranscriptSimple 테스트
- [ ] `lib/audio-recorder.test.ts` - 오디오 녹음 유틸리티 테스트
- [ ] `hooks/use-audio-recorder.test.ts` - 녹음 Hook 테스트

#### 4.2 통합 테스트
- [ ] `/api/transcribe` - STT API 테스트
- [ ] `/api/summarize` - 요약 API 테스트
- [ ] `/api/chapters/generate` - 챕터 생성 API 테스트

#### 4.3 E2E 테스트 (Playwright)
- [ ] 인터뷰 세션 플로우 테스트
  - [ ] 세션 생성
  - [ ] 질문 녹음
  - [ ] 전사 확인
  - [ ] 세션 완료
- [ ] 편집 페이지 테스트
  - [ ] 섹션 추가
  - [ ] 텍스트 수정
  - [ ] 드래그 앤 드롭
  - [ ] 저장 확인
- [ ] 출판 플로우 테스트
  - [ ] 옵션 선택
  - [ ] 견적 확인
  - [ ] PDF 다운로드

---

### 5. Supabase 백엔드 설정 완료 ⭐⭐

#### 5.1 데이터베이스 마이그레이션 실행
- [ ] Supabase 프로젝트에 마이그레이션 적용
- [ ] `20250118000000_session_interview_system.sql` 실행
- [ ] 테이블 생성 확인 (chapters, sessions, questions, text_blocks, comments)

#### 5.2 Row Level Security (RLS) 설정
- [ ] 프로덕션 배포 전 RLS 활성화
- [ ] projects 테이블 RLS 정책
- [ ] chapters, sessions, questions 테이블 RLS 정책
- [ ] audio_assets 테이블 RLS 정책

#### 5.3 Supabase Functions
- [ ] Edge Functions 배포
- [ ] `calculate_project_progress` 함수 테스트
- [ ] `update_project_progress_on_session_complete` 트리거 테스트

#### 5.4 Supabase Realtime
- [ ] 전사 진행률 실시간 업데이트 테스트
- [ ] 세션 상태 변경 실시간 반영
- [ ] 협업 편집 실시간 동기화 (향후)

---

### 6. 인증 및 사용자 관리 ⭐⭐

#### 6.1 Supabase Auth 통합
- [ ] 이메일/비밀번호 로그인
- [ ] 소셜 로그인 (Google, Kakao, Naver)
- [ ] 비밀번호 재설정
- [ ] 이메일 인증

#### 6.2 사용자 프로필
- [ ] 프로필 페이지 (`/profile`)
- [ ] 프로필 수정 (이름, 아바타, 이메일)
- [ ] 계정 설정 (언어, 알림)

#### 6.3 권한 관리
- [ ] 프로젝트 소유자 (owner)
- [ ] 가족 구성원 (family)
- [ ] 편집자 (editor)
- [ ] 초대 시스템

---

## 📦 일반 우선순위 (Low Priority)

### 7. 성능 최적화 ⭐

#### 7.1 프런트엔드 최적화
- [ ] 이미지 최적화 (Next.js Image)
- [ ] 코드 스플리팅
- [ ] Lazy Loading (컴포넌트, 이미지)
- [ ] React.memo, useMemo, useCallback 적용

#### 7.2 데이터베이스 최적화
- [ ] 인덱스 추가 (자주 조회하는 컬럼)
- [ ] 쿼리 최적화
- [ ] Connection Pooling (pgBouncer)

#### 7.3 API 최적화
- [ ] 응답 캐싱 (Redis)
- [ ] API Rate Limiting
- [ ] 배치 처리 (오디오 전사, AI 생성)

---

### 8. 접근성 개선 ⭐

#### 8.1 시니어 친화적 UX
- [ ] 텍스트 크기 조절 (16px, 18px, 20px, 24px)
- [ ] 고대비 테마 옵션
- [ ] 음성 안내 (TTS로 UI 설명)
- [ ] 키보드 네비게이션 개선

#### 8.2 WCAG 2.1 준수
- [ ] 색상 대비비 7:1 이상
- [ ] 키보드로 모든 기능 접근 가능
- [ ] 스크린 리더 지원
- [ ] ARIA 라벨 추가

---

### 9. 추가 기능 ⭐

#### 9.1 음성 클로닝 (TTS)
- [ ] ElevenLabs API 통합
- [ ] 사용자 음성 샘플 녹음 (3분 이상)
- [ ] 음성 모델 학습
- [ ] TTS 오디오북 생성

#### 9.2 협업 기능
- [ ] 가족 구성원 초대
- [ ] 댓글 시스템 (텍스트/음성 메모)
- [ ] 실시간 협업 편집
- [ ] 버전 히스토리

#### 9.3 소셜 기능
- [ ] 자서전 공유 (링크, SNS)
- [ ] 공개 갤러리
- [ ] 좋아요/댓글
- [ ] 추천 시스템

---

## 🐛 버그 수정 및 개선

### 10. 알려진 이슈 ⭐

#### 10.1 타입 에러
- [ ] `types/database.ts` Supabase 생성 타입 재검증
- [ ] `app/api/transcribe/route.ts` 타입 단언 제거
- [ ] 모든 `any` 타입 제거

#### 10.2 UI/UX 이슈
- [ ] 편집 페이지 좌측 패널 중복 헤더 제거
- [ ] 녹음 패널 토글 버튼 디자인 개선
- [ ] 타임라인 노드 드래그 앤 드롭 충돌 수정

#### 10.3 성능 이슈
- [ ] 대용량 전사본 처리 시 지연 해결
- [ ] 자동 저장 debounce 로직 개선
- [ ] 실시간 진행률 업데이트 최적화

---

## 📈 비즈니스 기능

### 11. 결제 시스템 ⭐

#### 11.1 계좌이체 결제
- [ ] 가상계좌 발급 (PG사 없이)
- [ ] 입금 확인 시스템
- [ ] 주문 상태 관리

#### 11.2 견적 계산
- [ ] 실물책 견적 (판형, 페이지 수, 수량)
- [ ] 전자책 견적
- [ ] 오디오북 견적
- [ ] 할인 쿠폰 시스템

#### 11.3 주문 관리
- [ ] 주문 히스토리
- [ ] 배송 추적
- [ ] 환불 처리

---

### 12. 마케팅 및 분석 ⭐

#### 12.1 분석 도구
- [ ] Google Analytics 4 연동
- [ ] Vercel Analytics
- [ ] 사용자 행동 분석 (Mixpanel, Amplitude)

#### 12.2 이메일 마케팅
- [ ] 뉴스레터 구독
- [ ] 환영 이메일
- [ ] 프로젝트 완료 축하 이메일
- [ ] 재방문 유도 이메일

#### 12.3 프로모션
- [ ] 추천인 프로그램
- [ ] 첫 구매 할인
- [ ] 시즌 이벤트

---

## 🔮 향후 로드맵

### Phase 1 (1-2개월)
1. ✅ 세션 기반 인터뷰 시스템 구현
2. 🔄 Edit 페이지 UX 리뉴얼 (Phase 1-7)
3. 🔄 더미 데이터 → PDF 다운로드 플로우
4. 백엔드 API 실제 구현
5. 테스트 코드 작성 (유닛/통합)

### Phase 2 (3-4개월)
1. 인증 및 사용자 관리
2. 출판 플로우 완성 (실물책 주문)
3. 결제 시스템 (계좌이체)
4. 성능 최적화
5. E2E 테스트

### Phase 3 (5-6개월)
1. 음성 클로닝 (TTS 오디오북)
2. 협업 기능
3. 접근성 개선 (시니어 친화)
4. 마케팅 및 분석 도구
5. 베타 런칭

### Phase 4 (6개월 이후)
1. B2B 기능 (복지관, 교육기관)
2. 게이미피케이션
3. 소셜 기능
4. 다국어 지원
5. 모바일 앱 (React Native)

---

## 📝 작업 진행 방법

### 작업 시작 시
1. 이 문서에서 작업 항목 선택
2. GitHub Issue 생성 (작업명, 설명, 예상 소요 시간)
3. 브랜치 생성 (`feature/task-name`)
4. 작업 수행
5. Pull Request 생성
6. 코드 리뷰 후 병합
7. 이 문서의 체크박스 업데이트

### 우선순위 결정 기준
- ⭐⭐⭐ 긴급: MVP 완성에 필수적인 기능
- ⭐⭐ 중요: 사용자 경험 향상에 필요한 기능
- ⭐ 일반: 향후 개선 사항

---

**마지막 업데이트**: 2025-11-18
**작성자**: Claude Code
**다음 리뷰 예정일**: 2025-11-25
