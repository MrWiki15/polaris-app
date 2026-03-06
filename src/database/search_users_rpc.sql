-- ============================================
-- FUNCIÓN RPC PARA BUSCAR USUARIOS POR EMAIL
-- ============================================
-- Esta función permite buscar usuarios de My Business  por email
-- para transferencias de USDC

-- Crear la función
CREATE OR REPLACE FUNCTION search_users_by_email(search_email TEXT)
RETURNS TABLE (
  id UUID,
  email VARCHAR
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email::VARCHAR
  FROM auth.users u
  WHERE 
    u.email ILIKE '%' || search_email || '%'
    AND u.id != auth.uid() -- Excluir al usuario actual
    AND u.email IS NOT NULL
  LIMIT 5;
END;
$$;

-- Dar permisos a usuarios autenticados
GRANT EXECUTE ON FUNCTION search_users_by_email(TEXT) TO authenticated;

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Para probar la función:
-- SELECT * FROM search_users_by_email('test');
