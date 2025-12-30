-- ============================================
-- SUPABASE QUICK REFERENCE
-- ============================================

-- 1. Ver todas las tablas en el schema público
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- 2. Ver estructura de la tabla backups
\d public.backups

-- 3. Ver todas las columnas de backups con detalles
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'backups';

-- 4. Ver los índices creados
SELECT indexname, indexdef
FROM pg_indexes 
WHERE tablename = 'backups';

-- 5. Ver todas las políticas RLS
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'backups';

-- 6. Ver los triggers
SELECT 
  tgname,
  tgrelid::regclass,
  tgfoid::regprocedure
FROM pg_trigger 
WHERE tgrelid = 'public.backups'::regclass;

-- 7. Ver si RLS está habilitado en la tabla
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'backups';

-- 8. Ver todas las funciones creadas
SELECT 
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' AND p.proname = 'update_backup_timestamp';

-- 9. Ver los datos de respaldo (si hay alguno)
-- NOTA: Ejecuta esto si eres el propietario del respaldo
SELECT 
  id,
  user_id,
  created_at,
  updated_at,
  LENGTH(data) as data_size_bytes
FROM public.backups
ORDER BY updated_at DESC;

-- 10. Limpiar/Resetear TODO (CUIDADO - ELIMINA TODOS LOS DATOS)
-- DROP TABLE IF EXISTS public.backups CASCADE;

-- ============================================
-- COMMANDS ÚTILES
-- ============================================

-- Ver el tamaño de la tabla en bytes
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE tablename = 'backups';

-- Ver la cantidad de filas
SELECT COUNT(*) as total_backups FROM public.backups;

-- Ver el respaldo más reciente
SELECT 
  id,
  user_id,
  updated_at,
  LENGTH(data) as data_size
FROM public.backups
ORDER BY updated_at DESC
LIMIT 1;

-- Ver respaldos de un usuario específico (reemplaza con el UUID)
SELECT 
  id,
  created_at,
  updated_at,
  LENGTH(data) as data_size
FROM public.backups
WHERE user_id = 'your-user-uuid-here'
ORDER BY updated_at DESC;

-- Obtener el JSON de un respaldo (si necesitas ver los datos)
-- SELECT data::jsonb FROM public.backups 
-- WHERE user_id = 'your-user-uuid-here' 
-- LIMIT 1;
