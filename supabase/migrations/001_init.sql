-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create lessons table
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  subject TEXT NOT NULL,
  language TEXT NOT NULL,
  html_path TEXT NOT NULL,
  lesson_key TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT
);

-- Create lesson_assets table
CREATE TABLE lesson_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_key TEXT NOT NULL,
  type TEXT NOT NULL,
  path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_lessons_date ON lessons(date);
CREATE INDEX idx_lessons_lesson_key ON lessons(lesson_key);
CREATE INDEX idx_lesson_assets_lesson_key ON lesson_assets(lesson_key);

-- Enable Row Level Security
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lessons
-- Allow public (anon) to SELECT
CREATE POLICY "Public read access on lessons"
  ON lessons FOR SELECT
  TO anon
  USING (true);

-- Allow authenticated users with admin role to INSERT
CREATE POLICY "Admin insert access on lessons"
  ON lessons FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Allow authenticated users with admin role to UPDATE
CREATE POLICY "Admin update access on lessons"
  ON lessons FOR UPDATE
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin');

-- Allow authenticated users with admin role to DELETE
CREATE POLICY "Admin delete access on lessons"
  ON lessons FOR DELETE
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin');

-- Service role bypass (used by server-side admin API)
-- Note: service_role automatically bypasses RLS, no explicit policy needed

-- RLS Policies for lesson_assets
-- Allow public (anon) to SELECT
CREATE POLICY "Public read access on lesson_assets"
  ON lesson_assets FOR SELECT
  TO anon
  USING (true);

-- Allow authenticated users with admin role to INSERT
CREATE POLICY "Admin insert access on lesson_assets"
  ON lesson_assets FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Allow authenticated users with admin role to UPDATE
CREATE POLICY "Admin update access on lesson_assets"
  ON lesson_assets FOR UPDATE
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin');

-- Allow authenticated users with admin role to DELETE
CREATE POLICY "Admin delete access on lesson_assets"
  ON lesson_assets FOR DELETE
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin');

-- Seed data: 2 sample lessons
INSERT INTO lessons (date, subject, language, html_path, lesson_key, title, created_by)
VALUES
  ('2025-10-09', 'historia', 'en', 'historia/2025-10-09/en.html', 'historia_2025-10-09', 'World War II Overview', 'admin'),
  ('2025-10-09', 'historia', 'pl', 'historia/2025-10-09/pl.html', 'historia_2025-10-09', 'Przegląd II Wojny Światowej', 'admin');

-- Seed data: 2 sample assets
INSERT INTO lesson_assets (lesson_key, type, path)
VALUES
  ('historia_2025-10-09', 'txt', 'historia/2025-10-09/notes.txt'),
  ('historia_2025-10-09', 'pdf', 'historia/2025-10-09/worksheet.pdf');