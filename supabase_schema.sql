-- MVP 최소 테이블 설계
-- users: Supabase Auth 사용 (별도 생성 불필요)
-- crews: AI 크루/프로젝트 관리 (jsonb로 유연한 스키마 확장)

-- crews 테이블
CREATE TABLE crews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 핵심 필드 (MVP 필수)
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  instructions TEXT NOT NULL,
  
  -- 유연한 확장을 위한 jsonb (나중에 tasks, toneAndManner, roleModel 등 추가 가능)
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- 아바타 URL
  avatar_url TEXT,
  
  -- 타임스탬프
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- 인덱스
  CONSTRAINT crews_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 인덱스
CREATE INDEX idx_crews_user_id ON crews(user_id);
CREATE INDEX idx_crews_created_at ON crews(created_at DESC);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_crews_updated_at
  BEFORE UPDATE ON crews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
