# CODEX 작업 로그 (2025-11-07)

## 구현 내용

- `/app/projects/[projectId]/edit/page.tsx`  
  - 우측 녹음 패널을 “핀 고정” 개념으로 전환해 텍스트 모드에서는 완전히 숨기고, 음성 모드 진입(`소주제 → 음성으로 작성`) 시 자동으로 펼쳐지도록 상태(`isRecordingPanelPinned`)와 런처 버튼을 추가했습니다.  
  - 헤더 우측에 `녹음 도구` 토글 버튼을 배치해 사용자가 임의로 패널을 열고 닫을 수 있게 했습니다.  
  - 전사 히스토리를 세션/조각 단위로 관리하도록 `TranscriptItem` 메타데이터(세션 ID, chunkIndex, status, wordCount)를 저장하고, merge/split/insert/delete 핸들러를 구현했습니다.  
  - 녹음 패널이 닫힌 경우에는 좁은 런처 버튼만 노출해 글 작성자는 넓은 에디터 폭을 확보합니다.
  - `더미 녹음` 버튼을 추가하여 실제 녹음 없이도 세션/조각 흐름을 확인할 수 있도록 DEMO 데이터를 주입합니다.

- `components/edit/recording-panel.tsx`  
  - 패널 헤더에 세션 요약과 닫기 버튼을 추가하고, 음성 플로우가 필요할 때만 열리도록 상위에서 전달된 토글을 사용합니다.  
  - 녹음/업로드 후 전사 결과를 문장 단위로 자동 분할(`chunkTranscript`)하여 여러 조각으로 상위 state에 전달하고, 각 조각을 다시 삽입·병합·분할할 수 있도록 콜백을 노출했습니다.  
  - 기존 mock 흐름에서 사용하지 않던 `blob` 데이터를 활용해 chunk duration을 추정하고, 파일 업로드/녹음 완료 시 세션 ID를 부여합니다.

- `components/edit/transcript-card.tsx`  
  - 세션/조각 정보, 단어 수, 상태 뱃지(임시/본문 반영)를 표시하고, `분할`, `이전/다음과 병합`, `본문에 삽입` 등 조작 버튼을 추가했습니다.

- `types/edit.ts`, `components/edit/section-list.tsx`, `components/edit/timeline-bar.tsx`  
  - 전사 타입 확장(`TranscriptStatus`, wordCount, sessionId 등)과 좌측 패널/타임라인의 이전 단계 개선과 충돌 없이 동작하도록 타입·props 조정.
- `/app/projects/new/page.tsx`  
  - ‘새 프로젝트 만들기’ 온보딩 페이지를 추가해 기본 정보, 이야기 포커스, 인터뷰 계획을 입력할 수 있는 3단 폼과 실시간 요약 사이드 패널을 구성했습니다.  
  - HERO 구간에 단계별 스텝 카드와 가이드 카피를 배치하고, 현재는 더미 알림으로만 프로젝트 생성 결과를 보여주도록 처리했습니다 (실제 API 연동 준비용).  
  - Step 3에 초대 이메일 입력/추가/삭제가 가능한 선택 영역을 넣어 프로젝트 생성 시 바로 초대 메일 발송 목록을 수집할 수 있게 했습니다.
- `/app/projects/[projectId]/overview/page.tsx`, `/app/projects/page.tsx`  
  - Step 2 전용 “프로젝트 준비 점검” 페이지를 새로 추가해 인터뷰 타임라인, 초대 메일 상태, AI 셋업 현황을 카드로 요약하고, 편집/출판 CTA를 제공했습니다.  
  - 프로젝트 목록 UI를 `public/capture/6.png`처럼 어둡고 앱스러운 대시보드로 리디자인했고, 좌측 사이드바·상단 바를 통해 언제든 홈(`/`)으로 이동할 수 있게 했습니다.
- `components/navigation.tsx`, `components/upgrade-modal.tsx`  
  - 루트 랜딩의 화이트/블루 톤에 맞춰 헤더를 밝은 배경, 네비게이션 링크, 업그레이드/시작하기 CTA로 재구성했고 모달은 동일하게 연결됩니다.  
  - 각 플랜을 선택하면 `/projects/new`로 이동해 새 프로젝트 플로우와 자연스럽게 이어집니다.
- `components/landing-page.tsx`  
  - `public/capture/ref_main_1.png` 레이아웃을 참고해 루트 상품 소개 페이지를 Hero → 신뢰지표 → 기능 섹션(2개) → 솔루션 카드 → 탭형 핵심 기능 4종 → 후기 → CTA 순서로 화이트/블루 톤으로 재구성했습니다.  
  - 탭 섹션에는 `thumbnail.png`와 기존 캡처 이미지를 사용해 플랜별 기능을 시각적으로 보여주고, 각 영역에 아이콘을 추가해 완성도를 높였습니다.
- `app/projects/[projectId]/edit/page.tsx`, `components/edit/collapsed-panel.tsx`  
  - 좌측/우측 패널 토글을 캡처 스타일의 칩 버튼으로 변경해 접힘 상태에서도 헤더를 따라가는 스키니 토글 UI를 제공했고, `ProjectShell`을 도입해 `/projects`와 동일한 사이드바/브레드크럼을 유지한 채 본문만 교체되도록 했습니다.
- `components/project-shell.tsx`  
  - `/projects`, `/projects/[projectId]/overview`, `/projects/[projectId]/edit`에서 재사용되는 대시보드 프레임을 구현해 좌측 자동 접힘 사이드바 + 상단 바 + 브레드크럼을 통일했습니다. 편집 페이지도 이 레이아웃을 공유하도록 업데이트했습니다.
- `/app/projects/new/page.tsx`  
  - `ProjectShell` 레이아웃을 활용해 `/projects`·`/overview`·`/edit`와 동일한 다크 톤에서 새 프로젝트 온보딩 폼을 구성했습니다.  
  - 기존 입력 필드와 기능은 유지하면서 대시보드 헤더/사이드바를 그대로 사용해 흐름이 자연스럽게 이어집니다.

## 테스트

- `npm run lint`  
  - **결과:** 실패. 새로운 변경으로 인한 오류는 없으며, 기존부터 존재하던 `app/api/transcribe/route.ts` 의 `@ts-nocheck` 및 여러 `any` 사용, 또 사용되지 않는 mock 함수 등으로 인해 동일한 에러/경고가 재현됩니다.

## 현재 이슈 요약

- `app/projects/[projectId]/edit/page.tsx`에서 `<ProjectShell>`을 감싸는 JSX 구조를 정리하는 과정에서 여전히 ESLint가 “clos-ing tag mismatch” 오류를 보고합니다. 렌더 함수 하단의 모달 컴포넌트들이 `<ProjectShell>` 밖으로 빠져있지 않은지 재점검 필요합니다.
- `app/api/transcribe/route.ts`는 `@ts-nocheck`와 다수 `any`로 인해 린트가 진행되지 않고 있습니다. 타입 정의와 환경변수 처리 방식을 손보면 전체 빌드/테스트 확인이 가능해집니다.

## 다음 단계 제안

1. `app/api/transcribe/route.ts`의 타입 정의 정리 및 `@ts-nocheck` 제거로 lint 오류 제거.
2. 녹음 패널과 에디터 간 커서 동기화를 구현해 `TranscriptCard`의 “본문에 삽입”이 실제 커서 위치를 반영하도록 개선.
3. 세션/조각 데이터를 서버나 mock API로 연동해 새로고침 후에도 히스토리가 유지되도록 확장.
