# 온유.ai 프로젝트 설정 가이드

이 문서는 온유.ai 프로젝트를 로컬에서 실행하거나 배포하기 위해 필요한 모든 설정을 안내합니다.

## 📋 목차

1. [환경 변수 설정](#환경-변수-설정)
2. [Supabase 설정](#supabase-설정)
3. [Deepgram API 설정](#deepgram-api-설정)
4. [OpenAI API 설정](#openai-api-설정)
5. [로컬 개발 환경 실행](#로컬-개발-환경-실행)
6. [배포 가이드](#배포-가이드)
7. [문제 해결](#문제-해결)

---

## 환경 변수 설정

### 1. `.env.local` 파일 생성

프로젝트 루트 디렉토리에 `.env.local` 파일을 생성합니다:

```bash
touch .env.local
```

### 2. 필수 환경 변수

`.env.local` 파일에 다음 내용을 추가합니다:

```bash
# ===================================
# Supabase 설정
# ===================================
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ===================================
# AI/STT 서비스
# ===================================
# Deepgram (음성 → 텍스트 변환)
NEXT_PUBLIC_DEEPGRAM_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# OpenAI (텍스트 요약 및 구조화)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ===================================
# 앱 설정 (선택사항)
# ===================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## Supabase 설정

### 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com) 접속 및 회원가입
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - **Organization**: 새로 만들거나 기존 Organization 선택
   - **Project Name**: `onyu-ai` (또는 원하는 이름)
   - **Database Password**: 강력한 비밀번호 설정 (꼭 저장하세요!)
   - **Region**: `Northeast Asia (Tokyo)` 또는 `Southeast Asia (Singapore)` 권장
   - **Pricing Plan**: Free (무료 티어로 시작)

4. 프로젝트 생성 완료 후 대시보드로 이동

### 2. API 키 확인

1. Supabase 대시보드 → **Settings** (왼쪽 사이드바 하단)
2. **API** 탭 클릭
3. 다음 값들을 복사:
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`에 입력
   - **anon public** (공개 키): `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 입력
   - **service_role** (비밀 키): `SUPABASE_SERVICE_ROLE_KEY`에 입력

⚠️ **주의**: `service_role` 키는 절대 클라이언트 코드에 노출하지 마세요!

### 3. 데이터베이스 초기화

#### 방법 1: Supabase CLI 사용 (권장)

```bash
# Supabase CLI 설치 (macOS)
brew install supabase/tap/supabase

# 또는 npm으로 설치
npm install -g supabase

# Supabase 프로젝트 연결
supabase link --project-ref YOUR_PROJECT_ID

# 마이그레이션 실행
supabase db push
```

#### 방법 2: SQL Editor 사용

1. Supabase 대시보드 → **SQL Editor**
2. `supabase/migrations/20250106000000_initial_schema.sql` 파일 내용 복사
3. SQL Editor에 붙여넣기
4. **Run** 버튼 클릭

### 4. Storage 버킷 생성

1. Supabase 대시보드 → **Storage**
2. **Create a new bucket** 클릭
3. 다음 버킷들을 생성:

| Bucket 이름 | Public | File Size Limit |
|-------------|--------|-----------------|
| `audio-uploads` | ✅ Yes | 50 MB |
| `generated-audio` | ✅ Yes | 100 MB |
| `documents` | ✅ Yes | 20 MB |

### 5. Row Level Security (RLS) 설정

**현재 단계에서는 RLS를 비활성화**합니다 (MVP 테스트용):

```sql
-- SQL Editor에서 실행
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE sections DISABLE ROW LEVEL SECURITY;
ALTER TABLE subsections DISABLE ROW LEVEL SECURITY;
ALTER TABLE audio_assets DISABLE ROW LEVEL SECURITY;
```

⚠️ **프로덕션 배포 전에는 반드시 RLS를 활성화**해야 합니다!

---

## Deepgram API 설정

Deepgram은 음성을 텍스트로 변환하는 STT(Speech-to-Text) 서비스입니다.

### 1. 계정 생성

1. [Deepgram Console](https://console.deepgram.com/signup) 접속
2. 이메일로 회원가입 (Google 로그인 가능)
3. **$200 무료 크레딧** 자동 지급 (약 555시간 사용 가능)

### 2. API 키 생성

1. Deepgram Console → **API Keys** (왼쪽 사이드바)
2. **Create a New API Key** 클릭
3. 다음 정보 입력:
   - **Name**: `onyu-ai-production` (또는 원하는 이름)
   - **Permissions**: `Member` (기본값)
4. **Create Key** 클릭
5. 생성된 키를 복사하여 `.env.local`의 `NEXT_PUBLIC_DEEPGRAM_API_KEY`에 입력

⚠️ **주의**: API 키는 한 번만 표시되므로 반드시 저장하세요!

### 3. 사용량 모니터링

- Deepgram Console → **Usage** 에서 실시간 사용량 확인 가능
- $200 크레딧 소진 전에 알림 설정 권장

---

## OpenAI API 설정

OpenAI GPT-4는 전사된 텍스트를 요약하고 자서전 형식으로 구조화합니다.

### 1. 계정 생성

1. [OpenAI Platform](https://platform.openai.com/signup) 접속
2. 이메일 또는 Google 계정으로 회원가입
3. 전화번호 인증 완료

### 2. 결제 정보 등록

⚠️ **OpenAI는 무료 크레딧이 없으므로 결제 정보를 등록해야 합니다.**

1. OpenAI Platform → **Settings** → **Billing**
2. **Add payment method** 클릭
3. 신용카드 정보 입력
4. 월 사용 한도 설정 (권장: $20-50)

### 3. API 키 생성

1. OpenAI Platform → **API keys**
2. **Create new secret key** 클릭
3. 키 이름 입력: `onyu-ai-production`
4. **Create secret key** 클릭
5. 생성된 키를 복사하여 `.env.local`의 `OPENAI_API_KEY`에 입력

### 4. 예상 비용

| 모델 | 용도 | 비용 (1,000 토큰당) | 예상 월 비용 |
|------|------|-------------------|------------|
| GPT-4 Turbo | 요약/구조화 | $0.01 (입력) / $0.03 (출력) | $30-50 |
| GPT-3.5 Turbo | 간단한 요약 | $0.0005 (입력) / $0.0015 (출력) | $5-10 |

**권장**: 초기에는 GPT-3.5 Turbo 사용 후 필요 시 GPT-4로 업그레이드

---

## 로컬 개발 환경 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 확인

```bash
# .env.local 파일이 제대로 설정되었는지 확인
cat .env.local
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 4. 기능 테스트 체크리스트

- [ ] 랜딩 페이지 로드 확인
- [ ] 새 프로젝트 생성 (`/projects/new`)
- [ ] 편집 페이지 접근 (`/projects/[id]/edit`)
- [ ] 음성 녹음 버튼 클릭 (브라우저 마이크 권한 허용)
- [ ] 음성 전사 기능 테스트
- [ ] 텍스트 저장 확인
- [ ] 출판 플로우 테스트

---

## 배포 가이드

### Vercel 배포 (권장)

1. [Vercel](https://vercel.com) 접속 및 회원가입
2. GitHub 저장소 연결
3. **Environment Variables** 섹션에 `.env.local` 내용 복사
4. **Deploy** 클릭

### 환경 변수 설정

Vercel 대시보드 → **Settings** → **Environment Variables**에 다음 추가:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_DEEPGRAM_API_KEY
OPENAI_API_KEY
NEXT_PUBLIC_APP_URL (배포된 도메인으로 설정)
```

---

## 문제 해결

### 1. Supabase 연결 오류

**증상**: `Failed to fetch` 또는 `Invalid API key`

**해결**:
```bash
# 환경 변수 확인
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# 개발 서버 재시작
npm run dev
```

### 2. Deepgram API 오류

**증상**: `401 Unauthorized`

**해결**:
- Deepgram Console → API Keys에서 키가 활성화되어 있는지 확인
- 크레딧 잔액 확인
- API 키를 `.env.local`에 정확히 복사했는지 확인

### 3. 타입 오류

**증상**: `@ts-nocheck` 관련 에러

**해결**:
```bash
# Supabase 타입 재생성
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts

# 개발 서버 재시작
npm run dev
```

### 4. 빌드 오류

```bash
# 캐시 클리어 및 재설치
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

---

## 📞 지원

문제가 계속되면 다음을 확인하세요:

1. [Supabase 문서](https://supabase.com/docs)
2. [Deepgram 문서](https://developers.deepgram.com/docs)
3. [OpenAI 문서](https://platform.openai.com/docs)
4. [Next.js 문서](https://nextjs.org/docs)

---

## ✅ 설정 완료 체크리스트

- [ ] Supabase 프로젝트 생성 완료
- [ ] Supabase 데이터베이스 마이그레이션 완료
- [ ] Supabase Storage 버킷 생성 완료
- [ ] Deepgram API 키 발급 완료
- [ ] OpenAI API 키 발급 완료 (결제 정보 등록)
- [ ] `.env.local` 파일 생성 및 모든 환경 변수 입력 완료
- [ ] `npm install` 실행 완료
- [ ] `npm run dev` 실행 및 localhost:3000 접속 확인
- [ ] 음성 녹음 및 전사 기능 테스트 완료

**모든 항목이 체크되면 개발을 시작할 준비가 완료되었습니다! 🎉**

---

**마지막 업데이트**: 2025-11-18
**작성자**: Claude Code
