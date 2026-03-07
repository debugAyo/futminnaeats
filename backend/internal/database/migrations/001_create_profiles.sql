CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  campus TEXT NOT NULL CHECK (campus IN ('GK', 'Bosso', 'Off-Campus')),
  course TEXT,
  level TEXT,
  avatar TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
