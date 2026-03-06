# Análisis de Seguridad y Estructura de Supabase - Polarishub

**Fecha de Análisis:** 5 de marzo de 2026  
**Versión:** 1.0  
**Estado:** Documentación Completa

---

## 📋 Tabla de Contenidos

1. [Configuración General](#configuración-general)
2. [Estructura de Autenticación](#estructura-de-autenticación)
3. [Tablas del Sistema](#tablas-del-sistema)
4. [Tablas de Proyectos (Colaboración)](#tablas-de-proyectos-colaboración)
5. [Políticas RLS Implementadas](#políticas-rls-implementadas)
6. [Patrones de Seguridad](#patrones-de-seguridad)
7. [Flujos de Datos](#flujos-de-datos)
8. [Checklist de Seguridad](#checklist-de-seguridad)

---

## Configuración General

### Variables de Entorno Requeridas

```env
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[anon-key]
VITE_ENCRIPTED_KEY=[passphrase-para-encriptación]
VITE_OPERATOR_ID=[hedera-operator-id]
VITE_OPERATOR_KEY=[hedera-operator-key]
VITE_PINATA_JWT_SECRET=[pinata-jwt]
VITE_PINATA_URL=[pinata-gateway-url]
```

### Cliente Supabase

**Ubicación:** `src/lib/supabase.ts`

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
```

**Tipos de Datos Principales:**

- `AuthUser`: {id, email, subscription}
- `DataBackup`: {id?, userId, data, created_at?, updated_at?}

---

## Estructura de Autenticación

### Sistema de Autenticación

**Proveedor:** Supabase Auth (nativo)  
**Métodos:** Email/Contraseña  
**Ubicación del Hook:** `src/hooks/use-supabase-auth.ts`

### Funcionalidades de Autenticación

#### 1. Registro de Usuario

```typescript
const { success, requiresVerification, error } = await register(
  email,
  password,
);
```

**Proceso:**

1. Crear usuario en `auth.users`
2. Enviar email de verificación
3. **Automáticamente crea:**
   - Wallet de Hedera (testnet) en tabla `wallets`
   - Wallets personales: "Principal" y "USDC" en tabla `personal_wallets`

#### 2. Login

```typescript
const { success, error } = await login(email, password);
```

**Validación:** Email verificado requerido

#### 3. Logout

Cierra sesión y limpia el estado local

### Contexto de Autenticación

**Ubicación:** `src/contexts/AppContext.tsx`

**Datos Gestionados:**

- Datos de usuario
- Proyectos seleccionados
- Información de miembros del proyecto
- Sincronización con Supabase

---

## Tablas del Sistema

### 1. **backups** - Respaldos de Datos

**Propósito:** Almacenar respaldos completos del estado de la aplicación  
**Ubicación:** `src/database/supabase_setup.sql`

#### Estructura

| Campo      | Tipo        | Descripción                            |
| ---------- | ----------- | -------------------------------------- |
| id         | UUID        | Identificador único                    |
| user_id    | UUID        | Referencia a auth.users                |
| data       | TEXT        | JSON stringificado con datos de la app |
| created_at | TIMESTAMPTZ | Fecha de creación                      |
| updated_at | TIMESTAMPTZ | Fecha de última actualización          |

#### Índices

```sql
CREATE INDEX idx_backups_user_id ON public.backups(user_id);
CREATE INDEX idx_backups_updated_at ON public.backups(updated_at DESC);
```

#### Constraint

```sql
ALTER TABLE public.backups ADD CONSTRAINT unique_user_backup UNIQUE(user_id);
-- Solo un backup activo por usuario
```

#### Trigger

```sql
CREATE TRIGGER update_backups_timestamp
  BEFORE UPDATE ON public.backups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_backup_timestamp();
```

#### RLS Policies

- **SELECT:** Solo el propietario del backup
- **INSERT:** Solo el propietario
- **UPDATE:** Solo el propietario
- **DELETE:** Solo el propietario

#### Hook de Sincronización

**Ubicación:** `src/hooks/use-supabase-sync.ts`

**Funcionalidades:**

- Sincroniza datos locales con Supabase (usuarios premium)
- Detección automática de conflictos
- Sincronización periódica
- Detección de estado online/offline

**Lógica de Conflictos:**

```typescript
const hasCloudData = cloudStats.products > 0 || cloudStats.sales > 0;
if (hasCloudData && !force) {
  // Mostrar resolución de conflicto
  setSyncConflict({ cloudStats, localStats });
}
```

---

### 2. **wallets** - Wallets de Hedera

**Propósito:** Almacenar direcciones y claves privadas encriptadas de Hedera  
**Ubicación:** Creadas por `src/hooks/use-supabase-auth.ts`

#### Estructura

| Campo      | Tipo      | Descripción                     |
| ---------- | --------- | ------------------------------- |
| id         | UUID/TEXT | Identificador                   |
| userId     | TEXT/UUID | ID del usuario                  |
| address    | TEXT      | Account ID de Hedera (0.0.xxxx) |
| privateKey | TEXT      | Clave privada encriptada        |

#### Encriptación

```typescript
const passphrase = import.meta.env.VITE_ENCRIPTED_KEY;
const encryptedKey = encrypt(wallet.privateKey, passphrase);
```

**Ubicación:** `src/lib/crypto.ts`

#### RLS Policies

- Solo el propietario puede ver/editar su wallet

#### Utilización

- Transacciones de Hedera
- Creación de colecciones NFT
- Transferencias de tokens (PUSD)

---

### 3. **personal_wallets** - Wallets Internas

**Propósito:** Wallets virtuales para gestión de dinero interno (Principal, USDC)  
**Ubicación Interfaz:** `src/pages/Wallet.tsx`

#### Estructura

| Campo     | Tipo        | Descripción               |
| --------- | ----------- | ------------------------- |
| id        | TEXT/UUID   | Identificador             |
| userId    | TEXT/UUID   | Propietario               |
| name      | TEXT        | "Principal", "USDC", etc. |
| balance   | NUMERIC     | Saldo actual              |
| createdAt | TIMESTAMPTZ | Fecha de creación         |

#### Funciones Asociadas

**Ubicación:** `src/lib/personalWallets.ts`

```typescript
// Obtener todas las wallets del usuario
const wallets = await getPersonalWallets(userId);

// Crear nueva wallet
const wallet = await createPersonalWallet(userId, "MyWallet", 0);

// Actualizar balance
await updateWalletBalance(walletId, newBalance);

// Transferir entre wallets
await createTransfer(userId, fromWalletId, toWalletId, amount);
```

#### RLS Policies

- Solo el propietario puede ver/editar sus wallets

---

### 4. **personal_wallet_transfers** - Historial de Transferencias

**Propósito:** Registro auditado de transferencias entre wallets personales  
**Ubicación:** Referenced en `src/lib/personalWallets.ts`

#### Estructura

| Campo          | Tipo        | Descripción            |
| -------------- | ----------- | ---------------------- |
| id             | UUID/TEXT   | Identificador          |
| userId         | TEXT/UUID   | Propietario            |
| fromWalletId   | TEXT        | ID wallet origen       |
| toWalletId     | TEXT        | ID wallet destino      |
| fromWalletName | TEXT        | Nombre wallet origen   |
| toWalletName   | TEXT        | Nombre wallet destino  |
| amount         | NUMERIC     | Monto transferido      |
| createdAt      | TIMESTAMPTZ | Fecha de transferencia |

#### RLS Policies

- Solo el propietario puede ver/crear transferencias propias

---

## Tablas de Proyectos (Colaboración)

### Modelo de Proyectos

**Propósito:** Compartir datos entre miembros de un equipo

**Ubicación de Definiciones:** `src/database/SUPABASE_PROJECTS_SCHEMA.sql`

### Base Table: **projects**

#### Estructura Esperada

| Campo      | Tipo        | Descripción                             |
| ---------- | ----------- | --------------------------------------- |
| id         | BIGINT      | Identificador único                     |
| owner_id   | UUID        | Propietario del proyecto                |
| name       | TEXT        | Nombre del proyecto                     |
| members    | JSONB       | Array de {email, departament, role}     |
| created_at | TIMESTAMPTZ | Fecha de creación                       |
| data       | JSONB       | Datos completos del proyecto (opcional) |
| history    | JSONB       | Historial de cambios (opcional)         |
| collection | JSONB       | Datos de colección NFT (opcional)       |

#### Función de Seguridad Clave

```sql
CREATE OR REPLACE FUNCTION public.is_project_member(_project_id bigint)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.projects p,
         jsonb_array_elements(p.members) m
    WHERE p.id = _project_id
      AND m->>'email' = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Funcionamiento:**

1. Obtiene el email del usuario actual (`auth.uid()`)
2. Busca el proyecto
3. Verifica si el email está en el array `members` de ese proyecto
4. Retorna `true` si es miembro, `false` si no

#### RLS Policies

- **SELECT:** Owner o miembros
- **INSERT:** Solo owners pueden crear proyectos
- **UPDATE:** Solo owner
- **DELETE:** Solo owner

---

### Tablas de Datos del Proyecto

**Patrón General:** Todas tienen `project_id BIGINT` referenciando `projects(id)`

#### 1. **project_sales** - Registros de Ventas

```sql
CREATE TABLE project_sales (
  id TEXT PRIMARY KEY,
  project_id BIGINT NOT NULL,
  product_id TEXT,
  quantity NUMERIC,
  amount NUMERIC NOT NULL,
  date TEXT NOT NULL,
  client_id TEXT,
  payment_method TEXT DEFAULT 'efectivo',
  notes TEXT,
  created_at TIMESTAMP
);
```

**Uso:**

- Registrar ventas de productos
- Informes de ingresos
- Análisis de rendimiento

**Interfaz:** `src/pages/Ventas.tsx`, `src/components/forms/SaleForm.tsx`

---

#### 2. **project_expenses** - Registros de Gastos

```sql
CREATE TABLE project_expenses (
  id TEXT PRIMARY KEY,
  project_id BIGINT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  tags TEXT[],
  is_recurring BOOLEAN DEFAULT false,
  recurring_id TEXT,
  client_id TEXT,
  created_at TIMESTAMP
);
```

**Categorías Comunes:**

- Operativo
- Administrativo
- Marketing
- Personal
- Otros

**Uso:**

- Gastos operativos
- Pagos recurrentes
- Control presupuestario

**Interfaz:** `src/pages/Gastos.tsx`, `src/components/forms/ExpenseForm.tsx`

---

#### 3. **project_products** - Inventario

```sql
CREATE TABLE project_products (
  id TEXT PRIMARY KEY,
  project_id BIGINT NOT NULL,
  name TEXT NOT NULL,
  quantity NUMERIC DEFAULT 0,
  cost NUMERIC DEFAULT 0,
  price NUMERIC DEFAULT 0,
  category TEXT,
  min_stock NUMERIC,
  barcode TEXT,
  image TEXT,
  created_at TIMESTAMP
);
```

**Funcionalidades:**

- Control de inventario
- Escaneo de códigos de barras
- Alertas de stock bajo
- Gestión de categorías

**Interfaces:**

- `src/pages/Inventario.tsx`
- `src/components/forms/ProductForm.tsx`
- `src/components/inventory/BarcodeScanner.tsx`

---

#### 4. **project_clients** - Base de Datos de Clientes

```sql
CREATE TABLE project_clients (
  id TEXT PRIMARY KEY,
  project_id BIGINT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP
);
```

**Información Almacenada:**

- Datos de contacto
- Notas personales
- Historial de compras (vía ventas)

---

#### 5. **project_workers** - Gestión de Empleados

```sql
CREATE TABLE project_workers (
  id TEXT PRIMARY KEY,
  project_id BIGINT NOT NULL,
  name TEXT NOT NULL,
  role TEXT,
  email TEXT,
  phone TEXT,
  salary NUMERIC DEFAULT 0,
  start_date TEXT,
  notes TEXT,
  created_at TIMESTAMP
);
```

**Información:**

- Datos de empleados
- Roles y salarios
- Historial de contratación

---

#### 6. **project_events** - Calendario

```sql
CREATE TABLE project_events (
  id TEXT PRIMARY KEY,
  project_id BIGINT NOT NULL,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT,
  type TEXT, -- 'recordatorio', 'cita', 'pago', etc.
  description TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP
);
```

**Tipos de Eventos:**

- Recordatorios
- Citas
- Pagos programados
- Reuniones

**Interfaz:** `src/pages/Agenda.tsx`

---

#### 7. **project_goals** - Metas Financieras

```sql
CREATE TABLE project_goals (
  id TEXT PRIMARY KEY,
  project_id BIGINT NOT NULL,
  title TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC DEFAULT 0,
  deadline TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP
);
```

**Dashboard:** `src/components/dashboard/GoalsState.tsx`

---

#### 8. **project_debts** - Deudas por Cobrar/Pagar

```sql
CREATE TABLE project_debts (
  id TEXT PRIMARY KEY,
  project_id BIGINT NOT NULL,
  type TEXT NOT NULL, -- 'por_cobrar' or 'por_pagar'
  entity_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  concept TEXT,
  due_date TEXT,
  is_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMP
);
```

---

#### 9. **project_recurring_payments** - Pagos Recurrentes

```sql
CREATE TABLE project_recurring_payments (
  id TEXT PRIMARY KEY,
  project_id BIGINT NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT,
  frequency TEXT, -- 'mensual', 'anual', etc.
  day_of_month NUMERIC,
  last_paid_date TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP
);
```

**Interfaz:** `src/pages/PagosRecurrentes.tsx`

---

#### 10. **project_suppliers** - Proveedores

```sql
CREATE TABLE project_suppliers (
  id TEXT PRIMARY KEY,
  project_id BIGINT NOT NULL,
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  category TEXT,
  notes TEXT,
  created_at TIMESTAMP
);
```

**Interfaz:** `src/pages/Proveedores.tsx`

---

#### 11. **project_supplier_orders** - Órdenes de Compra

```sql
CREATE TABLE project_supplier_orders (
  id TEXT PRIMARY KEY,
  project_id BIGINT NOT NULL,
  supplier_id TEXT NOT NULL,
  date TEXT NOT NULL,
  expected_date TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'received', 'cancelled'
  total_amount NUMERIC DEFAULT 0,
  items JSONB, -- [{productId, quantity, unitCost}]
  notes TEXT,
  created_at TIMESTAMP
);
```

---

#### 12. **project_services** - Catálogo de Servicios

```sql
CREATE TABLE project_services (
  id TEXT PRIMARY KEY,
  project_id BIGINT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC DEFAULT 0,
  category TEXT,
  duration_minutes NUMERIC,
  created_at TIMESTAMP
);
```

---

#### 13. **project_service_incomes** - Ingresos por Servicios

```sql
CREATE TABLE project_service_incomes (
  id TEXT PRIMARY KEY,
  project_id BIGINT NOT NULL,
  service_id TEXT,
  client_id TEXT,
  amount NUMERIC NOT NULL,
  date TEXT NOT NULL,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP
);
```

**Interfaz:** `src/pages/Servicios.tsx`

---

## Políticas RLS Implementadas

### Archivo: `RLS.sql`

Todas las políticas RLS están definidas en el archivo raíz `RLS.sql`

### Resumen de Políticas

| Tabla                         | SELECT                          | INSERT                | UPDATE                | DELETE                |
| ----------------------------- | ------------------------------- | --------------------- | --------------------- | --------------------- |
| **backups**                   | user_id = auth.uid()            | user_id = auth.uid()  | user_id = auth.uid()  | user_id = auth.uid()  |
| **wallets**                   | userId = auth.uid()             | userId = auth.uid()   | userId = auth.uid()   | userId = auth.uid()   |
| **personal_wallets**          | userId = auth.uid()             | userId = auth.uid()   | userId = auth.uid()   | userId = auth.uid()   |
| **personal_wallet_transfers** | userId = auth.uid()             | userId = auth.uid()   | userId = auth.uid()   | userId = auth.uid()   |
| **projects**                  | owner_id OR is_project_member() | owner_id = auth.uid() | owner_id = auth.uid() | owner_id = auth.uid() |
| **project\_\***               | is_project_member()             | is_project_member()   | is_project_member()   | is_project_member()   |

### Niveles de Seguridad

#### 1. RLS Basado en Usuario (`user_id` / `userId`)

```sql
USING (auth.uid() = user_id)
```

**Tablas Afectadas:**

- backups
- wallets
- personal_wallets
- personal_wallet_transfers

**Garantía:** Solo el propietario puede acceder

---

#### 2. RLS Basado en Miembros de Proyecto

```sql
USING (public.is_project_member(project_id))
```

**Tablas Afectadas:**

- Todas las tablas `project_*`

**Garantía:** Solo miembros del proyecto pueden acceder

**Validación:**

1. Busca el proyecto en la tabla `projects`
2. Obtiene el array `members`
3. Verifica si el email del usuario actual está en el array

---

### Configuración de Grants

```sql
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON [table] TO authenticated;
```

**Significado:**

- `authenticated`: Usuarios registrados y logeados
- Permiten operaciones CRUD en tablas específicas
- Combinadas con RLS para validación de acceso

---

## Patrones de Seguridad

### 1. Encriptación de Datos Sensibles

**Claves privadas de wallets:**

```typescript
// Encriptación
const passphrase = import.meta.env.VITE_ENCRIPTED_KEY;
const encryptedKey = encrypt(privateKey, passphrase);

// Desencriptación (solo cuando es necesario)
const decryptedKey = await decrypt(encryptedKey, passphrase);
```

**Ubicación:** `src/lib/crypto.ts`

**Datos Encriptados:**

- Claves privadas de Hedera
- Claves de suministro de NFT
- Claves de metadatos de NFT

---

### 2. Control de Acceso Basado en Roles

**Función:** `is_project_member()`

**Verificación:**

```sql
WHERE p.id = _project_id
  AND m->>'email' = (SELECT email FROM auth.users WHERE id = auth.uid())
```

**Beneficios:**

- ✅ Flexibilidad: Roles almacenados en JSONB
- ✅ Colaboración: Múltiples usuarios por proyecto
- ✅ Auditoría: Email del usuario en la validación

---

### 3. Sincronización Segura

**Ubicación:** `src/hooks/use-supabase-sync.ts`

**Características:**

- Validación de cambios antes de sincronizar
- Detección de conflictos
- Sincronización selectiva (solo usuarios premium)
- Monitoreo de estado online/offline

```typescript
// No permitir guardar si la sincronización inicial no está completa
if (!isInitialCheckDone && !force) {
  console.warn("Preventing save: Initial sync check not complete");
  return;
}
```

---

### 4. Auditoría de Cambios

**Triggers Automáticos:**

```sql
CREATE TRIGGER update_backups_timestamp
  BEFORE UPDATE ON public.backups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_backup_timestamp();
```

**Campos Auditados:**

- `created_at`: Fecha de creación
- `updated_at`: Fecha de última modificación

---

### 5. Validación de Entrada en Cliente

**Ejemplos:**

- Validación de emails
- Validación de montos numéricos
- Validación de fechas
- Validación de accountId de Hedera

```typescript
const validateHederaAccountId = (accountId: any): string => {
  if (typeof accountId === "string") {
    const parts = accountId.split(".");
    if (parts.length !== 3) {
      throw new Error(`Formato de accountId inválido: ${accountId}`);
    }
    return accountId;
  }
  // ...
};
```

---

## Flujos de Datos

### 1. Flujo de Registro y Creación de Wallets

```
Usuario registra
    ↓
auth.users creado
    ↓
useSupabaseAuth.register()
    ↓
    ├─→ createHederaWallet()
    │   └─→ Wallet de Hedera creada en tabla "wallets"
    │
    └─→ createPersonalWallet() (x2)
        ├─→ Wallet "Principal" creada
        └─→ Wallet "USDC" creada
```

---

### 2. Flujo de Sincronización de Datos

```
LocalStorage
    ↓
useSupabaseSync.saveToSupabase()
    ↓
    ├─→ ¿Usuario Premium?
    │   └─→ No: No sincronizar
    │
    ├─→ ¿Online?
    │   └─→ No: No sincronizar
    │
    └─→ Sincronizar a tabla "backups"
        └─→ Actualizar timestamp
```

---

### 3. Flujo de Colaboración en Proyectos

```
Usuario A crea proyecto
    ↓
projects.owner_id = user_a_id
projects.members = [{email: a@mail, role: owner}]
    ↓
Usuario A invita a Usuario B
    ↓
projects.members = [
  {email: a@mail, role: owner},
  {email: b@mail, role: member}
]
    ↓
Usuario B ahora puede:
  ├─→ Ver datos del proyecto (SELECT)
  ├─→ Crear registros (INSERT)
  ├─→ Editar registros (UPDATE)
  └─→ Eliminar registros (DELETE)
```

---

### 4. Flujo de Creación de NFT de Proyecto

```
Usuario solicita crear NFT
    ↓
createHederaNftCollection()
    ↓
    ├─→ Crear colección en Hedera
    ├─→ Encriptar claves de suministro y metadata
    └─→ Guardar en projects.collection (JSONB)
    ↓
mintNftForCollection()
    ↓
    ├─→ Desencriptar claves
    ├─→ Recopilar datos del período
    ├─→ Subir metadatos a Pinata (IPFS)
    ├─→ Crear NFT con metadata de IPFS
    └─→ Guardar en projects.history
```

---

## Checklist de Seguridad

### Antes de Producción

- [ ] **Activar HTTPS** en todas las conexiones a Supabase
- [ ] **Validar CORS** en la configuración de Supabase
- [ ] **Rotación de keys** periódica
- [ ] **Backup regular** de la base de datos
- [ ] **Monitoreo de logs** de acceso
- [ ] **Pruebas de RLS** con diferentes usuarios
- [ ] **Auditoría de cambios** en estructura de datos
- [ ] **Encriptación de datos en tránsito** (verificar certif. SSL)

### Pruebas de RLS

```sql
-- Prueba 1: Usuario solo ve sus propios datos
SELECT * FROM backups WHERE user_id = auth.uid();
-- Debe retornar solo datos del usuario actual

-- Prueba 2: Intentar acceder a datos de otro usuario
-- SELECT * FROM backups WHERE user_id = 'other-uuid';
-- Debe retornar error de permisos

-- Prueba 3: Miembro puede ver datos del proyecto
SELECT * FROM project_sales WHERE project_id = 1;
-- Debe retornar datos si el usuario es miembro
```

### Verificación de Políticas

```sql
-- Ver todas las políticas RLS
SELECT tablename, policyname, permissive
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;

-- Ver si RLS está habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

## Recomendaciones Adicionales

### 1. Implementar Auditoría Completa

```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP DEFAULT now()
);
```

---

### 2. Implementar Rate Limiting

Limitar operaciones por usuario para evitar abuso:

```typescript
const rateLimiter = async (userId: string, action: string) => {
  // Implementar lógica de rate limiting
};
```

---

### 3. Implementar Versionado de Datos

Mantener historial completo de cambios:

```sql
ALTER TABLE project_sales ADD COLUMN version INT DEFAULT 1;
ALTER TABLE project_sales ADD COLUMN previous_version_id TEXT;
```

---

### 4. Implementar Webhooks de Cambios

Notificar a usuarios cuando sus datos cambian:

```typescript
const { data: subscription } = supabase
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "project_sales",
    },
    (payload) => {
      // Procesar cambio
      console.log("Change:", payload);
    },
  )
  .subscribe();
```

---

## Conclusión

La arquitectura de seguridad de Polarishub implementa:

✅ **RLS a múltiples niveles** - Basado en usuario y membresía  
✅ **Encriptación de datos sensibles** - Claves privadas encriptadas  
✅ **Auditoría automática** - Timestamps de cambios  
✅ **Sincronización segura** - Validación y detección de conflictos  
✅ **Control de acceso flexible** - JSONB para permisos dinámicos

El archivo `RLS.sql` proporciona todas las políticas necesarias para una implementación segura en producción.

---

**Preguntas o mejoras:** Consulta el archivo `RLS.sql` para la implementación completa.
