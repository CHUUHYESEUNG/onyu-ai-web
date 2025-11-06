# Supabase 설정 가이드

이 가이드는 온유록(Onyu.ai) 프로젝트에서 Supabase를 설정하는 방법을 안내합니다.

## 1. Supabase 프로젝트 생성

### 1-1. 계정 생성
1. https://supabase.com 접속
2. "Start your project" 클릭
3. GitHub 계정으로 로그인 (또는 이메일)

### 1-2. 프로젝트 생성
1. Dashboard에서 "New Project" 클릭
2. 프로젝트 정보 입력:
   - **Name**: `onyu-ai` (원하는 이름)
   - **Database Password**: 강력한 비밀번호 생성 (저장 필수!)
   - **Region**: `Northeast Asia (Seoul)` 선택 (한국 서버)
   - **Pricing Plan**: `Free` 선택 (초기 단계)
3. "Create new project" 클릭
4. 프로젝트 생성 완료 (1-2분 소요)

---

## 2. 환경 변수 설정

### 2-1. API 키 확인
1. Supabase Dashboard → `Settings` → `API`
2. 다음 값 복사:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public** 키
   - **service_role** 키 (Show 클릭 후 복사)

### 2-2. .env.local 파일 생성
프로젝트 루트에서:

```bash
cp .env.example .env.local
```

### 2-3. 환경 변수 입력
`.env.local` 파일을 열고 다음 값 입력:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 3. 데이터베이스 마이그레이션 실행

### 방법 1: Supabase Dashboard에서 직접 실행 (추천)

1. Supabase Dashboard → `SQL Editor`
2. `New query` 클릭
3. `supabase/migrations/20250106000000_initial_schema.sql` 파일 내용 복사
4. SQL Editor에 붙여넣기
5. `Run` 버튼 클릭
6. 성공 메시지 확인

### 방법 2: Supabase CLI 사용 (고급)

Supabase CLI를 설치하고 마이그레이션을 실행합니다:

```bash
# Supabase CLI 설치 (Mac)
brew install supabase/tap/supabase

# 프로젝트 초기화
supabase init

# 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref your-project-id

# 마이그레이션 실행
supabase db push
```

---

## 4. Storage 버킷 생성

### 4-1. audio-uploads 버킷
1. Dashboard → `Storage` → `New bucket`
2. 버킷 정보 입력:
   - **Name**: `audio-uploads`
   - **Public bucket**: ✅ 체크
3. "Create bucket" 클릭
4. 버킷 정책 설정:
   - Bucket → `Policies` → `New policy`
   - Template: "Allow public access"
   - "Review" → "Save policy"

### 4-2. generated-audio 버킷
위와 동일하게 `generated-audio` 버킷 생성 (공개)

### 4-3. documents 버킷
위와 동일하게 `documents` 버킷 생성 (공개)

---

## 5. Row Level Security (RLS) 설정

마이그레이션 스크립트에 이미 포함되어 있으므로 별도 작업 불필요합니다.

확인 방법:
1. Dashboard → `Authentication` → `Policies`
2. 각 테이블에 정책이 활성화되어 있는지 확인

---

## 6. 테스트 데이터 삽입 (선택)

개발 환경에서 테스트용 데이터를 삽입하려면:

1. SQL Editor 열기
2. 다음 쿼리 실행:

```sql
-- 임시 사용자 ID (실제 Auth 연동 전)
DO $$
DECLARE
  test_user_id UUID := '00000000-0000-0000-0000-000000000000';
  test_project_id UUID := '550e8400-e29b-41d4-a716-446655440000';
BEGIN
  -- 프로젝트 생성
  INSERT INTO projects (id, user_id, title, status, progress)
  VALUES (test_project_id, test_user_id, '할아버지의 이야기', 'in_progress', 30);

  -- 타임라인 이벤트
  INSERT INTO timeline_events (id, project_id, label, date, order_index, status)
  VALUES
    ('1950_birth', test_project_id, '탄생', '1950년', 0, 'done'),
    ('1956_school', test_project_id, '학창시절', '1956-1968', 1, 'done'),
    ('1973_job', test_project_id, '첫 직장', '1973년', 2, 'todo');

  -- 섹션
  INSERT INTO sections (id, project_id, event_id, title, excerpt, content, order_index)
  VALUES
    ('sec_1', test_project_id, '1950_birth', '고향 이야기',
     '경상남도 진주에서 태어나 자랐습니다.',
     '나는 1950년 경상남도 진주의 작은 마을에서 태어났습니다.', 0);
END $$;
```

---

## 7. 연결 테스트

프로젝트를 실행하고 Supabase 연결을 테스트합니다:

```bash
npm run dev
```

Next.js 콘솔에서 Supabase 초기화 에러가 없는지 확인하세요.

---

## 8. 다음 단계

Supabase 설정이 완료되었습니다! 이제 다음 작업을 진행할 수 있습니다:

- ✅ Supabase 클라이언트 사용 가능
- ✅ 음성 파일 업로드/다운로드 준비
- ✅ 실시간 데이터 동기화 준비
- ⏭️ 다음: 녹음 기능 구현

---

## 트러블슈팅

### 문제: "Supabase 환경 변수가 설정되지 않았습니다" 에러

**해결**: `.env.local` 파일이 프로젝트 루트에 있는지 확인하고, 서버를 재시작하세요:
```bash
# 서버 종료 (Ctrl+C)
npm run dev
```

### 문제: RLS 정책으로 인해 데이터 조회 실패

**원인**: 아직 인증(Auth) 구현 전이므로 `auth.uid()`가 null입니다.

**임시 해결** (개발 환경만):
1. SQL Editor에서 RLS 비활성화:
```sql
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE sections DISABLE ROW LEVEL SECURITY;
-- (다른 테이블도 동일)
```

2. 또는 테스트 사용자 ID를 하드코딩:
```typescript
// lib/supabase.ts에서
const TEST_USER_ID = '00000000-0000-0000-0000-000000000000';
```

**주의**: 프로덕션에서는 반드시 RLS를 활성화하세요!

### 문제: Storage 업로드 실패

**확인 사항**:
1. 버킷이 생성되었는지 확인
2. 버킷이 공개(public)로 설정되었는지 확인
3. 정책이 "Allow public access"로 설정되었는지 확인

---

## 비용 안내

### Free Plan 제한 (무료)
- Database: 500MB
- Storage: 1GB
- Bandwidth: 5GB/월
- Realtime connections: 200 동시 접속

### Pro Plan ($25/월)
- Database: 8GB (초과 시 $0.125/GB)
- Storage: 100GB (초과 시 $0.021/GB)
- Bandwidth: 250GB/월 (초과 시 $0.09/GB)
- Realtime connections: 500 동시 접속

**예상**: 사용자 50-100명 → Free Plan 충분
**확장**: 사용자 500명+ → Pro Plan 전환 권장

---