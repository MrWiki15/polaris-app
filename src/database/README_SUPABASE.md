# 📦 SQL Scripts para Supabase - Business Hub

## 📍 Ubicación de los Archivos

```
business-hub/
├── supabase_setup.sql              ← SCRIPT PRINCIPAL
├── SUPABASE_SETUP_GUIDE.md         ← GUÍA PASO A PASO
├── SUPABASE_QUERIES_REFERENCE.sql  ← COMANDOS ÚTILES
└── .env                            ← CONFIGURACIÓN (ya actualizado)
```

---

## 🚀 INICIO RÁPIDO (3 PASOS)

### 1️⃣ Abre el SQL Editor de Supabase

```
https://supabase.com/dashboard → Tu Proyecto → SQL Editor → New Query
```

### 2️⃣ Copia el Script SQL

```
Abre: supabase_setup.sql
Copia TODO el contenido
Pégalo en el SQL Editor
```

### 3️⃣ Ejecuta (Ctrl + Enter)

```
Verás un mensaje de éxito ✅
La tabla se ha creado con todas las políticas
```

---

## 📋 QUÉ SE CREA

| Componente              | Descripción                    | Propósito                        |
| ----------------------- | ------------------------------ | -------------------------------- |
| **Tabla `backups`**     | Almacena datos sincronizados   | Guardar respaldos de usuarios    |
| **2 Índices**           | `user_id`, `updated_at`        | Búsquedas y ordenamiento rápido  |
| **1 Constraint UNIQUE** | Un respaldo por usuario        | Evitar duplicados                |
| **4 Políticas RLS**     | SELECT, INSERT, UPDATE, DELETE | Seguridad de datos               |
| **1 Función**           | `update_backup_timestamp()`    | Auto-actualizar fecha            |
| **1 Trigger**           | `update_backups_timestamp`     | Ejecutar función automáticamente |

---

## 🔒 POLÍTICAS DE SEGURIDAD CREADAS

```sql
1. SELECT: Solo puedes leer TUS respaldos
2. INSERT: Solo puedes crear respaldos CON TU ID
3. UPDATE: Solo puedes editar TUS respaldos
4. DELETE: Solo puedes eliminar TUS respaldos
```

**Resultado:** 🛡️ Nadie puede acceder a datos de otros usuarios

---

## 📊 ESTRUCTURA DE LA TABLA

```
┌──────────────────────────────────────────────────────────┐
│ TABLA: backups                                           │
├──────────────────────────────────────────────────────────┤
│ Column      │ Type      │ Constraints & Defaults        │
├─────────────┼───────────┼──────────────────────────────┤
│ id          │ UUID      │ PRIMARY KEY (auto-generated) │
│ user_id     │ UUID      │ FK auth.users(id), NOT NULL │
│ data        │ TEXT      │ NOT NULL (JSON stringified) │
│ created_at  │ TIMESTAMP │ DEFAULT now() UTC           │
│ updated_at  │ TIMESTAMP │ DEFAULT now(), auto-update  │
├──────────────────────────────────────────────────────────┤
│ Índices:                                                 │
│ - idx_backups_user_id (búsquedas rápidas por usuario)  │
│ - idx_backups_updated_at (ordenar por fecha)           │
│ Constraint:                                              │
│ - unique_user_backup (solo 1 respaldo por usuario)     │
└──────────────────────────────────────────────────────────┘
```

---

## ✅ VERIFICACIÓN DESPUÉS DE EJECUTAR

Ejecuta estos comandos para confirmar que todo está correcto:

### Ver la tabla creada

```sql
SELECT * FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'backups';
```

**Debe devolver 1 fila** ✅

### Ver los índices

```sql
SELECT indexname FROM pg_indexes
WHERE tablename = 'backups';
```

**Debe devolver 2 índices** ✅

### Ver las políticas RLS

```sql
SELECT policyname FROM pg_policies
WHERE tablename = 'backups';
```

**Debe devolver 4 políticas** ✅

### Verificar que RLS está habilitado

```sql
SELECT rowsecurity FROM pg_tables
WHERE tablename = 'backups';
```

**Debe devolver `true`** ✅

---

## 🎯 FLUJO DE SINCRONIZACIÓN

```
┌─────────────────────────────┐
│  Usuario hace un cambio      │
│  (crear/editar/eliminar)     │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  ¿Es Premium?               │
└──────────────┬──────────────┘
               │ SÍ
               ▼
┌─────────────────────────────┐
│  ¿Está Online?              │
└──────────────┬──────────────┘
               │ SÍ
               ▼
┌─────────────────────────────┐
│  🌐 Guarda en Supabase      │
│  📱 Guarda en localStorage  │
│  ✅ Muestra indicador       │
└─────────────────────────────┘

Si es Free:    Solo localStorage (sin conexión)
Si es Premium: Supabase + localStorage (con internet)
```

---

## 🔄 AL CARGAR LA APP

```
┌──────────────────────────────┐
│  Usuario abre la app         │
└────────────┬─────────────────┘
             │
             ▼
┌──────────────────────────────┐
│  ¿Es Free?                   │
└────────────┬─────────────────┘
             │ SÍ
             ▼
┌──────────────────────────────┐
│  Carga desde localStorage     │
│  ✅ Rápido, sin internet      │
└──────────────────────────────┘

             O
             │ NO (Premium)
             ▼
┌──────────────────────────────┐
│  ¿Hay conexión?              │
└────────────┬─────────────────┘
             │ SÍ
             ▼
┌──────────────────────────────┐
│  Compara timestamps:         │
│  Supabase vs localStorage    │
│  Carga la MÁS RECIENTE 🏆   │
└──────────────────────────────┘
             O
             │ NO
             ▼
┌──────────────────────────────┐
│  Usa localStorage local       │
│  Sincronizará cuando vuelva  │
│  a estar online              │
└──────────────────────────────┘
```

---

## 📞 ERRORES COMUNES Y SOLUCIONES

| Error                          | Causa                                | Solución                             |
| ------------------------------ | ------------------------------------ | ------------------------------------ |
| `Table already exists`         | Tabla duplicada                      | Usa `IF NOT EXISTS` o elimina antes  |
| `Permission denied`            | No eres admin                        | Asegúrate usar cuenta con permisos   |
| `Policies required for RLS`    | RLS sin políticas                    | Ejecuta la sección 3 del script      |
| `Foreign key constraint fails` | `user_id` no existe                  | El usuario debe estar autenticado    |
| `Unique constraint violation`  | Intentas 2 respaldos para un usuario | El UPDATE debe reemplazar, no INSERT |

---

## 🛠️ COMANDOS DE MANTENIMIENTO

### Eliminar TODO y empezar de cero

```sql
DROP TABLE IF EXISTS public.backups CASCADE;
```

Luego ejecuta el script principal nuevamente.

### Ver el tamaño de la tabla

```sql
SELECT pg_size_pretty(pg_total_relation_size('public.backups'));
```

### Ver cantidad de respaldos guardados

```sql
SELECT COUNT(*) FROM public.backups;
```

### Limpiar datos antiguos (más de 30 días)

```sql
DELETE FROM public.backups
WHERE updated_at < NOW() - INTERVAL '30 days';
```

### Exportar un respaldo como JSON

```sql
SELECT data FROM public.backups
WHERE user_id = 'tu-user-id'
LIMIT 1;
```

---

## � FLUJO DE AUTENTICACIÓN Y VERIFICACIÓN

### Cuando el usuario se registra:

```
Usuario ingresa a Configuración → Supabase
         ↓
Click en "Registrarse"
         ↓
Ingresa email: usuario@ejemplo.com
         ↓
Ingresa contraseña: ••••••••
         ↓
Supabase envía email de verificación
         ↓
App muestra: "✉️ Verifica tu email para completar el registro"
         ↓
Usuario abre su correo → Click en enlace de Supabase
         ↓
Email verificado en Supabase ✅
         ↓
Usuario regresa a la app y hace LOGIN
         ↓
¡Sincronización activada! 🎉
```

### Estados del usuario:

| Estado                            | Descripción               | Puede Sincronizar |
| --------------------------------- | ------------------------- | ----------------- |
| **Registrado pero no verificado** | Email aún no confirmado   | ❌ NO             |
| **Email verificado**              | Click en enlace del email | ✅ SÍ             |
| **Autenticado**                   | Inició sesión             | ✅ SÍ             |

> **Nota:** Supabase requiere verificación de email para seguridad. El usuario recibe un email automático después de registrarse.

---

## �📱 DESPUÉS DE EJECUTAR

### En la App:

1. Ve a **⚙️ Configuración**
2. Si eres **Premium**, verás "Supabase - Sincronización en la Nube"
3. Haz click en **"Registrarse"** o **"Iniciar Sesión"**
4. Completa email y contraseña
5. ✅ Los datos se sincronizarán automáticamente

### En Supabase Dashboard:

1. Ve a **Table Editor**
2. Selecciona tabla **`backups`**
3. Deberías ver una fila con tus datos guardados
4. `updated_at` se actualizará cada vez que hagas cambios

---

## 🎉 ¡LISTO!

Tienes:

- ✅ Tabla de respaldos segura
- ✅ Autenticación de usuarios
- ✅ Sincronización automática
- ✅ Protección de datos (RLS)
- ✅ Indicador visual de guardado

**La aplicación ahora guarda tus datos en la nube de forma segura.** 🚀

---

## 📚 REFERENCIAS

- **Documentación Supabase:** https://supabase.com/docs
- **PostgreSQL RLS:** https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- **Supabase Auth:** https://supabase.com/docs/guides/auth
- **JavaScript SDK:** https://github.com/supabase/supabase-js
