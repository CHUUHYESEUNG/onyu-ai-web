# 작업 히스토리 (2025-11-06)

## 1. 코드베이스 안정화 (1단계)
- `npm run lint` 실행 → 기존 경고는 유지되나, `lib/supabase.ts`의 `any` 타입 오류 해결.
- `npm run build` 실행 → Turbopack `Failed to write app endpoint /page` 오류 발생 (OS 권한 문제 추정). 현재 Next.js 16 기본 빌드는 성공하지 못해, 향후 Webpack fallback 구성 또는 권한 확인 필요.
- 하위 경고 목록 (후속 정리 필요):
  - `components/edit/recording-panel.tsx`의 미사용 변수들 (녹음 기능 구현 시 처리 예정).
  - `lib/mock-api.ts`에서 사용되지 않는 `assetId` (실제 API 연동 시 제거 또는 활용 예정).
  - `types/edit.ts`의 제네릭 타입 `T` 미사용 (재검토 예정).

## 다음 단계 제안
1. Turbopack 빌드 오류 원인 조사 (권한/포트 문제 또는 Next 설정 재검토).
2. 음성/파일 소주제 흐름 구현을 위해 STT 서비스 선택 및 API 연동 준비.
3. 녹음 패널과 새 모달 사이의 상태 연동 (소단락 자동 생성).

## 참고
- 계획과 세부 구현 요건은 `CODEX.md`와 `0423.md`에 정리되어 있음.
- 현재까지 UI는 텍스트 기반 소주제 추가 및 소단락 편집까지 대응 가능한 상태.

## 빌드 오류 분석
- `npm run build` 실패 원인 로깅 확인: Turbopack이 앱 엔드포인트 `/page`를 쓰는 과정에서 포트 바인딩이 필요하지만, 현재 환경에서는 네트워크 포트 바인딩(`listen EPERM`)이 차단됨.
- 동일 원인으로 로컬에서 간단한 `node net` 서버 바인딩도 실패하여, 실행 환경 정책 문제로 판단.
- Turbopack은 빌드 시 내부적으로 포트를 사용하므로, 해결 옵션은 (1) 포트 바인딩 허용 환경에서 실행하거나 (2) Turbopack을 사용하지 않는 Webpack/이전 Next 버전으로 전환하는 방법 등이 있다.
