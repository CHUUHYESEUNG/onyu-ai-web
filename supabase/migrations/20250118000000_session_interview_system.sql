-- 온유록(Onyu.ai) 세션 기반 인터뷰 시스템
-- Chapter → Session → Question → TextBlock 구조 추가

-- ============================================================================
-- 1. 챕터 (Chapters) - 시간대별 또는 주제별 큰 단위
-- ============================================================================
CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL, -- "어린 시절", "청년 시절" 등
  description TEXT, -- 챕터 설명
  order_index INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN (
    'not_started',     -- 시작 안 함
    'in_progress',     -- 진행 중
    'completed'        -- 완료
  )),
  estimated_duration INTEGER, -- 예상 소요 시간 (분)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chapters_project_id ON chapters(project_id);
CREATE INDEX idx_chapters_order ON chapters(project_id, order_index);
CREATE INDEX idx_chapters_status ON chapters(status);

CREATE TRIGGER update_chapters_updated_at
  BEFORE UPDATE ON chapters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. 세션 (Sessions) - 실제 인터뷰 단위 (10-15분)
-- ============================================================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  title TEXT NOT NULL, -- "고향 이야기", "가족 이야기" 등
  description TEXT, -- 세션 설명
  order_index INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN (
    'not_started',     -- 시작 안 함
    'in_progress',     -- 진행 중
    'completed'        -- 완료
  )),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  total_duration INTEGER DEFAULT 0, -- 실제 녹음 시간 (초)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_chapter_id ON sessions(chapter_id);
CREATE INDEX idx_sessions_order ON sessions(chapter_id, order_index);
CREATE INDEX idx_sessions_status ON sessions(status);

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. 질문 (Questions) - AI가 제시하는 질문 및 사용자 답변
-- ============================================================================
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL, -- AI가 제시하는 질문
  order_index INTEGER NOT NULL DEFAULT 0,

  -- 답변 관련
  audio_asset_id UUID REFERENCES audio_assets(id) ON DELETE SET NULL, -- 녹음 파일
  transcription TEXT, -- STT 결과
  duration INTEGER, -- 녹음 길이 (초)

  -- 상태
  is_skipped BOOLEAN NOT NULL DEFAULT FALSE, -- 건너뛰기 여부
  is_completed BOOLEAN NOT NULL DEFAULT FALSE, -- 완료 여부
  recorded_at TIMESTAMPTZ, -- 녹음 시간

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_questions_session_id ON questions(session_id);
CREATE INDEX idx_questions_order ON questions(session_id, order_index);
CREATE INDEX idx_questions_audio_asset_id ON questions(audio_asset_id);
CREATE INDEX idx_questions_status ON questions(is_completed, is_skipped);

CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. 텍스트 블록 (Text Blocks) - 편집 가능한 자서전 텍스트
-- ============================================================================
CREATE TABLE text_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,

  content TEXT NOT NULL, -- AI 생성 또는 사용자 수정 텍스트
  order_index INTEGER NOT NULL DEFAULT 0,

  -- 출처
  source_question_ids UUID[], -- 원본 질문 참조 (배열)
  source_type TEXT NOT NULL DEFAULT 'ai_generated' CHECK (source_type IN (
    'ai_generated',    -- AI가 생성
    'user_edited',     -- 사용자가 수정
    'user_added'       -- 사용자가 직접 추가
  )),

  -- 편집 권한
  is_editable BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_text_blocks_project_id ON text_blocks(project_id);
CREATE INDEX idx_text_blocks_chapter_id ON text_blocks(chapter_id);
CREATE INDEX idx_text_blocks_order ON text_blocks(project_id, order_index);
CREATE INDEX idx_text_blocks_source_type ON text_blocks(source_type);

CREATE TRIGGER update_text_blocks_updated_at
  BEFORE UPDATE ON text_blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. 댓글 (Comments) - 협업용 텍스트/음성 메모
-- ============================================================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text_block_id UUID NOT NULL REFERENCES text_blocks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- Supabase Auth 사용자
  user_name TEXT NOT NULL,

  content TEXT, -- 텍스트 댓글
  comment_type TEXT NOT NULL DEFAULT 'text' CHECK (comment_type IN ('text', 'voice')),
  audio_url TEXT, -- 음성 메모 URL

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comments_text_block_id ON comments(text_block_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. audio_assets 테이블 확장 - question 연결 추가
-- ============================================================================
ALTER TABLE audio_assets
  ADD COLUMN question_id UUID REFERENCES questions(id) ON DELETE SET NULL;

CREATE INDEX idx_audio_assets_question_id ON audio_assets(question_id);

-- ============================================================================
-- 7. Row Level Security (RLS) 정책
-- ============================================================================

-- 챕터: 프로젝트 소유자만
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage chapters of their projects"
  ON chapters FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = chapters.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- 세션: 챕터 소유자만
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage sessions of their chapters"
  ON sessions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM chapters
      JOIN projects ON projects.id = chapters.project_id
      WHERE chapters.id = sessions.chapter_id
      AND projects.user_id = auth.uid()
    )
  );

-- 질문: 세션 소유자만
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage questions of their sessions"
  ON questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      JOIN chapters ON chapters.id = sessions.chapter_id
      JOIN projects ON projects.id = chapters.project_id
      WHERE sessions.id = questions.session_id
      AND projects.user_id = auth.uid()
    )
  );

-- 텍스트 블록: 프로젝트 소유자만
ALTER TABLE text_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage text blocks of their projects"
  ON text_blocks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = text_blocks.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- 댓글: 프로젝트 참여자만 (읽기는 모두, 쓰기는 본인만)
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on their projects' text blocks"
  ON comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM text_blocks
      JOIN projects ON projects.id = text_blocks.project_id
      WHERE text_blocks.id = comments.text_block_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 8. 유틸리티 함수
-- ============================================================================

-- 프로젝트 진행률 자동 계산 함수
CREATE OR REPLACE FUNCTION calculate_project_progress(p_project_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_sessions INTEGER;
  completed_sessions INTEGER;
  progress INTEGER;
BEGIN
  -- 전체 세션 수
  SELECT COUNT(*)
  INTO total_sessions
  FROM sessions s
  JOIN chapters c ON c.id = s.chapter_id
  WHERE c.project_id = p_project_id;

  -- 완료된 세션 수
  SELECT COUNT(*)
  INTO completed_sessions
  FROM sessions s
  JOIN chapters c ON c.id = s.chapter_id
  WHERE c.project_id = p_project_id
  AND s.status = 'completed';

  -- 진행률 계산
  IF total_sessions = 0 THEN
    progress := 0;
  ELSE
    progress := ROUND((completed_sessions::NUMERIC / total_sessions::NUMERIC) * 100);
  END IF;

  -- 프로젝트 진행률 업데이트
  UPDATE projects
  SET progress = calculate_project_progress.progress
  WHERE id = p_project_id;

  RETURN progress;
END;
$$ LANGUAGE plpgsql;

-- 세션 완료 시 자동으로 프로젝트 진행률 업데이트
CREATE OR REPLACE FUNCTION update_project_progress_on_session_complete()
RETURNS TRIGGER AS $$
DECLARE
  p_project_id UUID;
BEGIN
  -- 챕터를 통해 프로젝트 ID 찾기
  SELECT c.project_id INTO p_project_id
  FROM chapters c
  WHERE c.id = NEW.chapter_id;

  -- 진행률 재계산
  PERFORM calculate_project_progress(p_project_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_progress
  AFTER UPDATE OF status ON sessions
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION update_project_progress_on_session_complete();

-- ============================================================================
-- 9. 샘플 데이터 (개발용 - 필요 시 주석 해제)
-- ============================================================================

-- 프로젝트가 이미 있다고 가정 (기존 마이그레이션에서 생성)
-- INSERT INTO chapters (id, project_id, title, description, order_index, status)
-- VALUES
--   ('c1', '550e8400-e29b-41d4-a716-446655440000', '어린 시절', '1950-1960년대', 0, 'in_progress'),
--   ('c2', '550e8400-e29b-41d4-a716-446655440000', '청년 시절', '1970-1980년대', 1, 'not_started');
--
-- INSERT INTO sessions (id, chapter_id, title, order_index, status)
-- VALUES
--   ('s1', 'c1', '고향 이야기', 0, 'completed'),
--   ('s2', 'c1', '가족 이야기', 1, 'in_progress'),
--   ('s3', 'c1', '학교 생활', 2, 'not_started');
--
-- INSERT INTO questions (id, session_id, prompt, order_index)
-- VALUES
--   ('q1', 's1', '어디에서 태어나셨나요?', 0),
--   ('q2', 's1', '고향에서 가장 기억에 남는 곳은 어디인가요?', 1),
--   ('q3', 's1', '어렸을 때 친구들과 무엇을 하며 놀았나요?', 2);
