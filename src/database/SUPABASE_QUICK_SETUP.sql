-- SUPABASE SETUP - COPY & PASTE VERSION
-- Paste this entire content into Supabase SQL Editor and click Run

CREATE TABLE IF NOT EXISTS public.backups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_backups_user_id ON public.backups(user_id);
CREATE INDEX IF NOT EXISTS idx_backups_updated_at ON public.backups(updated_at DESC);

ALTER TABLE public.backups ADD CONSTRAINT unique_user_backup UNIQUE(user_id);

ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own backups" ON public.backups FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own backups" ON public.backups FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own backups" ON public.backups FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own backups" ON public.backups FOR DELETE USING (auth.uid() = user_id);

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.backups TO authenticated;

CREATE OR REPLACE FUNCTION public.update_backup_timestamp() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = timezone('utc'::text, now()); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_backups_timestamp ON public.backups;
CREATE TRIGGER update_backups_timestamp BEFORE UPDATE ON public.backups FOR EACH ROW EXECUTE FUNCTION public.update_backup_timestamp();
