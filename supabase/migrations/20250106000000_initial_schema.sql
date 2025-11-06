-- 온유록(Onyu.ai) 초기 데이터베이스 스키마
-- 음성 인터뷰 기반 AI 자서전 제작 플랫폼

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. 프로젝트 (Projects)
-- ============================================================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL, -- 향후 Supabase Auth와 연동
  title TEXT NOT NULL DEFAULT '나의 자서전',
  description TEXT,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 프로젝트 업데이트 시간 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. 타임라인 이벤트 / 대주제 (Timeline Events)
-- ============================================================================
CREATE TABLE timeline_events (
  id TEXT PRIMARY KEY, -- 예: "1950_birth"
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  label TEXT NOT NULL, -- "탄생", "학창시절" 등
  date TEXT, -- "1950년" 또는 "1956-1968"
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'done')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_timeline_events_project_id ON timeline_events(project_id);
CREATE INDEX idx_timeline_events_order ON timeline_events(project_id, order_index);

CREATE TRIGGER update_timeline_events_updated_at
  BEFORE UPDATE ON timeline_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. 섹션 / 소주제 (Sections)
-- ============================================================================
CREATE TABLE sections (
  id TEXT PRIMARY KEY, -- 예: "sec_1"
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  event_id TEXT REFERENCES timeline_events(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  excerpt TEXT, -- 미리보기 1-2문장
  content TEXT, -- 본문
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sections_project_id ON sections(project_id);
CREATE INDEX idx_sections_event_id ON sections(event_id);
CREATE INDEX idx_sections_order ON sections(project_id, order_index);

CREATE TRIGGER update_sections_updated_at
  BEFORE UPDATE ON sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. 소단락 (Subsections)
-- ============================================================================
CREATE TABLE subsections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id TEXT NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('text', 'voice', 'file')),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subsections_section_id ON subsections(section_id);
CREATE INDEX idx_subsections_order ON subsections(section_id, order_index);

CREATE TRIGGER update_subsections_updated_at
  BEFORE UPDATE ON subsections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. 오디오 에셋 (Audio Assets)
-- ============================================================================
CREATE TABLE audio_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  section_id TEXT REFERENCES sections(id) ON DELETE SET NULL,
  file_path TEXT NOT NULL, -- Storage 경로
  file_size BIGINT, -- 파일 크기 (bytes)
  duration NUMERIC, -- 오디오 길이 (초)
  status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN (
    'uploaded',        -- 업로드 완료
    'transcribing',    -- 전사 중
    'transcribed',     -- 전사 완료
    'processing',      -- AI 처리 중
    'completed',       -- 완료
    'failed'           -- 실패
  )),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  transcript TEXT, -- 전사 결과
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audio_assets_project_id ON audio_assets(project_id);
CREATE INDEX idx_audio_assets_section_id ON audio_assets(section_id);
CREATE INDEX idx_audio_assets_status ON audio_assets(status);

CREATE TRIGGER update_audio_assets_updated_at
  BEFORE UPDATE ON audio_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. 출판 주문 (Publish Orders)
-- ============================================================================
CREATE TABLE publish_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE NOT NULL, -- "ONYU-20250106-001"
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,

  -- 출판 옵션 (JSON)
  options JSONB NOT NULL,
  /* 예시:
  {
    "print": {
      "enabled": true,
      "trimSize": "148x210",
      "coverType": "soft",
      "quantity": 3
    },
    "ebook": {
      "enabled": true,
      "format": "both",
      "distribution": "private"
    },
    "audio": {
      "enabled": false
    }
  }
  */

  -- 견적 및 결제
  total_amount INTEGER NOT NULL, -- 총 금액 (원)
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN (
    'pending',         -- 대기 중
    'paid',            -- 입금 완료
    'confirmed',       -- 확인 완료
    'refunded'         -- 환불
  )),
  payment_method TEXT DEFAULT 'bank_transfer', -- 계좌이체 고정
  paid_at TIMESTAMPTZ,

  -- 제작 상태
  production_status TEXT NOT NULL DEFAULT 'waiting' CHECK (production_status IN (
    'waiting',         -- 입금 대기
    'in_production',   -- 제작 중
    'completed',       -- 제작 완료
    'shipped',         -- 배송 중 (실물책)
    'delivered'        -- 배송 완료
  )),

  -- 파일 URL (제작 완료 후)
  pdf_url TEXT,
  epub_url TEXT,
  audiobook_url TEXT,

  notes TEXT, -- 관리자 메모
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_publish_orders_project_id ON publish_orders(project_id);
CREATE INDEX idx_publish_orders_order_number ON publish_orders(order_number);
CREATE INDEX idx_publish_orders_payment_status ON publish_orders(payment_status);
CREATE INDEX idx_publish_orders_production_status ON publish_orders(production_status);

CREATE TRIGGER update_publish_orders_updated_at
  BEFORE UPDATE ON publish_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. Row Level Security (RLS) 정책
-- ============================================================================

-- 프로젝트: 본인만 접근 가능
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- 타임라인 이벤트: 프로젝트 소유자만
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage timeline events of their projects"
  ON timeline_events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = timeline_events.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- 섹션: 프로젝트 소유자만
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage sections of their projects"
  ON sections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = sections.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- 소단락: 섹션 소유자만
ALTER TABLE subsections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage subsections of their sections"
  ON subsections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM sections
      JOIN projects ON projects.id = sections.project_id
      WHERE sections.id = subsections.section_id
      AND projects.user_id = auth.uid()
    )
  );

-- 오디오 에셋: 프로젝트 소유자만
ALTER TABLE audio_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage audio assets of their projects"
  ON audio_assets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = audio_assets.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- 출판 주문: 프로젝트 소유자만
ALTER TABLE publish_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage orders of their projects"
  ON publish_orders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = publish_orders.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 8. Storage 버킷 설정 (Supabase Dashboard에서 수동 생성 필요)
-- ============================================================================

-- 다음 버킷을 Supabase Dashboard에서 생성하세요:
-- 1. audio-uploads (공개)
-- 2. generated-audio (공개)
-- 3. documents (공개)

-- Storage 정책 예시 (버킷 생성 후 적용):
-- CREATE POLICY "Users can upload audio"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'audio-uploads'
--     AND auth.uid()::text = (storage.foldername(name))[1]
--   );

-- ============================================================================
-- 9. 유틸리티 함수
-- ============================================================================

-- 주문 번호 생성 함수
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  today TEXT;
  seq INTEGER;
BEGIN
  today := TO_CHAR(NOW(), 'YYYYMMDD');

  SELECT COALESCE(MAX(
    NULLIF(regexp_replace(order_number, '^ONYU-\d{8}-(\d+)$', '\1'), '')::INTEGER
  ), 0) + 1
  INTO seq
  FROM publish_orders
  WHERE order_number LIKE 'ONYU-' || today || '-%';

  RETURN 'ONYU-' || today || '-' || LPAD(seq::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 10. 샘플 데이터 (개발용 - 필요 시 주석 해제)
-- ============================================================================

-- INSERT INTO projects (id, user_id, title, status, progress)
-- VALUES
--   ('550e8400-e29b-41d4-a716-446655440000', '00000000-0000-0000-0000-000000000000', '할아버지의 이야기', 'in_progress', 30);
--
-- INSERT INTO timeline_events (id, project_id, label, date, order_index, status)
-- VALUES
--   ('1950_birth', '550e8400-e29b-41d4-a716-446655440000', '탄생', '1950년', 0, 'done'),
--   ('1956_school', '550e8400-e29b-41d4-a716-446655440000', '학창시절', '1956-1968', 1, 'done'),
--   ('1973_job', '550e8400-e29b-41d4-a716-446655440000', '첫 직장', '1973년', 2, 'todo');
