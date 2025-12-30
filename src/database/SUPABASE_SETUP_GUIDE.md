# 🚀 Guía de Configuración de Supabase para Business Hub

## Requisitos Previos

- Cuenta de Supabase activa
- Proyecto de Supabase creado
- URL y Clave Pública de Supabase (ya configuradas en `.env`)

---

## 📋 Paso 1: Acceder al SQL Editor

1. Ve a tu dashboard de Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. En el menú izquierdo, haz clic en **"SQL Editor"**

---

## 🔧 Paso 2: Crear las Tablas y Políticas

### Opción A: Usar el Script SQL (Recomendado)

1. En el SQL Editor, haz clic en **"New Query"**
2. Copia todo el contenido del archivo `supabase_setup.sql`
3. Pega el código en el editor
4. Haz clic en el botón **"Run"** (o presiona Ctrl+Enter)
5. Espera a que se complete (verás un mensaje de éxito)

### Opción B: Ejecutar Paso a Paso (Si tienes problemas)

Si el script completo da error, ejecuta cada sección por separado:

#### Sección 1: Crear la tabla

```sql
CREATE TABLE IF NOT EXISTS public.backups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_backups_user_id ON public.backups(user_id);
CREATE INDEX IF NOT EXISTS idx_backups_updated_at ON public.backups(updated_at DESC);

ALTER TABLE public.backups
ADD CONSTRAINT unique_user_backup UNIQUE(user_id);
```

#### Sección 2: Habilitar RLS

```sql
ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;
```

#### Sección 3: Crear Políticas de Seguridad

```sql
CREATE POLICY "Users can view their own backups"
  ON public.backups
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own backups"
  ON public.backups
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own backups"
  ON public.backups
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own backups"
  ON public.backups
  FOR DELETE
  USING (auth.uid() = user_id);
```

#### Sección 4: Crear Función y Trigger para Timestamp Automático

```sql
CREATE OR REPLACE FUNCTION public.update_backup_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_backups_timestamp ON public.backups;
CREATE TRIGGER update_backups_timestamp
  BEFORE UPDATE ON public.backups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_backup_timestamp();
```

---

## ✅ Paso 3: Verificar la Instalación

En el SQL Editor, ejecuta:

```sql
-- Ver todas las tablas creadas
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- Ver los índices
SELECT indexname FROM pg_indexes
WHERE tablename = 'backups';

-- Ver las políticas RLS
SELECT * FROM pg_policies
WHERE tablename = 'backups';

-- Ver los triggers
SELECT tgname FROM pg_trigger
WHERE tgrelid = 'public.backups'::regclass;
```

Deberías ver:

- ✅ Tabla `backups` creada
- ✅ 2 índices (`idx_backups_user_id`, `idx_backups_updated_at`)
- ✅ 4 políticas RLS
- ✅ 1 trigger (`update_backups_timestamp`)

---

## 🔐 Entender las Políticas de Seguridad (RLS)

Las políticas RLS (Row Level Security) aseguran que:

| Política                               | Acción | Permite                                |
| -------------------------------------- | ------ | -------------------------------------- |
| **Users can view their own backups**   | SELECT | Usuarios ven solo sus respaldos        |
| **Users can insert their own backups** | INSERT | Usuarios insertan respaldos con su ID  |
| **Users can update their own backups** | UPDATE | Usuarios actualizan solo sus respaldos |
| **Users can delete their own backups** | DELETE | Usuarios eliminan solo sus respaldos   |

**Resultado:** Un usuario no puede ver, modificar o eliminar datos de otro usuario, incluso si intenta hacer una consulta SQL directa.

---

## 📊 Estructura de la Tabla `backups`

```
┌─────────────────────────────────────────┐
│          TABLA: backups                 │
├─────────────────────────────────────────┤
│ id (UUID)          → Identificador único│
│ user_id (UUID)     → ID del usuario     │
│ data (TEXT)        → JSON de datos      │
│ created_at (TIMESTAMP) → Fecha creación │
│ updated_at (TIMESTAMP) → Última actua.  │
└─────────────────────────────────────────┘
```

---

## 🐛 Solucionar Problemas

### ❌ Error: "Table already exists"

**Solución:** El script usa `IF NOT EXISTS`, debería ser seguro. Si persiste:

```sql
DROP TABLE IF EXISTS public.backups CASCADE;
-- Luego ejecuta el script nuevamente
```

### ❌ Error: "Permission denied"

**Solución:** Asegúrate de estar usando tu cuenta de Supabase con permisos de administrador

### ❌ Error: "RLS is enabled but no policies exist"

**Solución:** Ejecuta nuevamente la sección 3 del script (Crear Políticas)

### ❌ Los datos no se sincronizan

**Solución:**

1. Verifica que el usuario esté autenticado: `supabaseAuth.isAuthenticated`
2. Verifica que `isPremium` sea `true` en settings
3. Revisa la consola del navegador para ver si hay errores
4. Verifica que `isOnline` sea `true`

---

## 📧 Verificación de Email

Cuando un usuario se registra en Business Hub:

### El flujo es así:

1. El usuario va a **Configuración** → **Supabase** (si es Premium)
2. Hace clic en **Registrarse**
3. Ingresa su email y contraseña
4. Supabase envía automáticamente un **email de verificación**
5. La app muestra un mensaje diciendo:
   - ✉️ "Hemos enviado un enlace de verificación a tu email"
   - "Por favor verifica tu email para completar el registro"

### Qué debe hacer el usuario:

1. **Abre su correo electrónico**
2. **Busca un email de Supabase** con el asunto de verificación
3. **Haz clic en el botón "Confirmar tu email"** del email
4. **Vuelve a la app** en la sección Configuración
5. **Inicia sesión** con el email y contraseña que acabas de usar

> **⚠️ Importante:** Sin verificar el email, el usuario NO podrá iniciar sesión. La verificación es un paso obligatorio para la seguridad de la cuenta.

---

## 🎯 Próximos Pasos en la App

Una vez que la tabla está creada en Supabase:

1. **Instala la dependencia:**

   ```bash
   npm install @supabase/supabase-js
   ```

2. **Reinicia el servidor de desarrollo:**

   ```bash
   npm run dev
   ```

3. **En la app:**

   - Ve a **Configuración**
   - Si eres **Premium**, verás la sección de **Supabase**
   - Haz click en **Registrarse** o **Iniciar Sesión**
   - Completa email y contraseña
   - Los datos se sincronizarán automáticamente

4. **Verifica en Supabase:**
   - Ve a Table Editor
   - Selecciona tabla `backups`
   - Deberías ver una fila con tus datos

---

## 📱 Características Habilitadas Después de la Configuración

✅ **Auto-Sincronización:** Cada cambio se guarda automáticamente en Supabase  
✅ **Indicador Visual:** Ícono de nube que gira mientras guarda  
✅ **Sincronización Inteligente:** Carga el dato más reciente (Supabase vs localStorage)  
✅ **Offline-First:** Sin internet, usa localStorage; con internet, usa Supabase  
✅ **Seguridad:** Cada usuario solo accede a sus propios datos

---

## 📞 Contacto y Soporte

Si tienes problemas:

1. Revisa los logs en la consola del navegador (F12)
2. Verifica en Supabase → Logs → Edge Functions
3. Asegúrate de que las variables de `.env` son correctas
4. Recarga la página (Ctrl+F5)

¡Listo para sincronizar! 🎉
