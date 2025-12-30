-- ============================================
-- SUPABASE SETUP SCRIPT FOR BUSINESS HUB
-- ============================================
-- Ejecuta este script en el SQL Editor del dashboard de Supabase
-- https://supabase.com/dashboard

-- 1. CREATE BACKUPS TABLE
-- Esta tabla almacena los respaldos automáticos de los datos de los usuarios
CREATE TABLE IF NOT EXISTS public.backups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear índice en user_id para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_backups_user_id ON public.backups(user_id);

-- Crear índice en updated_at para ordenamiento eficiente
CREATE INDEX IF NOT EXISTS idx_backups_updated_at ON public.backups(updated_at DESC);

-- Crear constraint único para que cada usuario tenga solo un respaldo activo
ALTER TABLE public.backups
ADD CONSTRAINT unique_user_backup UNIQUE(user_id);

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE RLS POLICIES
-- ============================================

-- POLICY 1: Usuarios solo pueden ver sus propios respaldos
CREATE POLICY "Users can view their own backups"
  ON public.backups
  FOR SELECT
  USING (auth.uid() = user_id);

-- POLICY 2: Usuarios solo pueden insertar sus propios respaldos
CREATE POLICY "Users can insert their own backups"
  ON public.backups
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- POLICY 3: Usuarios solo pueden actualizar sus propios respaldos
CREATE POLICY "Users can update their own backups"
  ON public.backups
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- POLICY 4: Usuarios solo pueden eliminar sus propios respaldos
CREATE POLICY "Users can delete their own backups"
  ON public.backups
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
-- Permitir que usuarios autenticados accedan a la tabla
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.backups TO authenticated;

-- ============================================
-- CREAR FUNCIÓN PARA AUTO-ACTUALIZAR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION public.update_backup_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CREAR TRIGGER PARA AUTO-ACTUALIZAR updated_at
-- ============================================
DROP TRIGGER IF EXISTS update_backups_timestamp ON public.backups;
CREATE TRIGGER update_backups_timestamp
  BEFORE UPDATE ON public.backups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_backup_timestamp();

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================
-- Ejecuta este SELECT para verificar que la tabla fue creada correctamente:
-- SELECT * FROM public.backups LIMIT 1;

-- Para verificar las políticas RLS creadas:
-- SELECT * FROM pg_policies WHERE tablename = 'backups';
