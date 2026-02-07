## Guía de Wallets Personales del Usuario

### 📋 Descripción General

El sistema de wallets personales permite a los usuarios en **modo personal** (sin proyecto seleccionado) crear y gestionar múltiples wallets virtuales con sus propios balances e historial de transferencias.

---

### 🎯 Características Principales

#### 1. **Wallet Principal**

- Se crea automáticamente en el primer acceso
- Sincroniza dinámicamente con el balance total del negocio (`totalBalance`)
- **No puede ser eliminada ni renombrada**
- Contiene el saldo combinado de:
  - Saldo transferible
  - Saldo no transferible (ganancias de ventas)
  - Saldo simbólico (inventario)

#### 2. **Crear Wallets Adicionales**

```javascript
// El usuario puede crear wallets como:
- Reinversión
- Fondo de Emergencia
- Ahorros
- Inversiones
// (Nombre personalizado)
```

#### 3. **Transferencias Entre Wallets**

- Trasladar fondos de cualquier wallet a otra
- Validaciones automáticas:
  - Saldo suficiente
  - Montos válidos (> 0)
  - Wallets seleccionadas
- Registro automático de cada transferencia en la historia

#### 4. **Editar Wallets**

- Cambiar el nombre de cualquier wallet (excepto Principal)
- Botón de edición en cada tarjeta
- Diálogo modal para ingreso seguro

#### 5. **Eliminar Wallets**

- Borrar wallets personalizadas
- Protección: no permite eliminar la wallet Principal
- Confirmación automática antes de eliminar

#### 6. **Historial de Transferencias**

- Todas las transferencias internas quedan registradas
- Se sincroniza automáticamente con Supabase
- Visible en el bloque "Historial" con:
  - Icono de transferencia (Repeat2)
  - Detalles: "Wallet A → Wallet B · $50.00"
  - Fecha y hora

---

### 🔧 Implementación Técnica

#### **Archivos Modificados:**

1. **`src/lib/personalWallets.ts`** (Librería)
   - `getPersonalWallets()` - Obtiene todas las wallets del usuario
   - `createPersonalWallet()` - Crea una nueva wallet
   - `updateWalletName()` - Renombra una wallet
   - `updateWalletBalance()` - Actualiza el balance
   - `deletePersonalWallet()` - Elimina una wallet
   - `performTransfer()` - Realiza transferencias con validaciones
   - `getTransferHistory()` - Obtiene el historial

2. **`src/pages/Wallet.tsx`** (Componente)
   - Estados para edición: `editingWalletId`, `editingWalletName`
   - Handlers:
     - `handleCreatePersonalWallet()` - Crea wallet en Supabase
     - `handleTransferBetweenPersonal()` - Transferencia con sync
     - `handleEditWalletName()` - Actualiza nombre
     - `handleDeleteWallet()` - Elimina wallet
   - UI mejorada con botones Edit/Delete en cada tarjeta
   - Sincronización del balance Principal en `useEffect`

3. **`src/database/PERSONAL_WALLETS_MIGRATION.sql`** (Esquema)
   ```sql
   -- Tablas creadas:
   -- personal_wallets
   -- personal_wallet_transfers
   -- Índices y RLS habilitado
   ```

---

### 📊 Sincronización con Supabase

#### **Tablas en Supabase:**

**personal_wallets**

```sql
- id (UUID, PK)
- userId (TEXT, FK → auth.users)
- name (TEXT)
- balance (DECIMAL)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

**personal_wallet_transfers**

```sql
- id (UUID, PK)
- userId (TEXT, FK)
- fromWalletId (UUID, FK)
- toWalletId (UUID, FK)
- fromWalletName (TEXT)
- toWalletName (TEXT)
- amount (DECIMAL)
- createdAt (TIMESTAMP)
```

#### **RLS (Row Level Security)**

- Cada usuario solo ve/modifica sus propias wallets
- Políticas automáticas de seguridad

---

### ⚙️ Instalación / Setup

#### **1. Ejecutar migración en Supabase**

```sql
-- Copiar el contenido de:
-- src/database/PERSONAL_WALLETS_MIGRATION.sql
--
-- Pegar en: Supabase Dashboard → SQL Editor
-- Ejecutar
```

#### **2. Verificar que importes estén correctos**

En `src/pages/Wallet.tsx`:

```typescript
import {
  getPersonalWallets,
  createPersonalWallet,
  performTransfer,
  getTransferHistory,
  updateWalletName,
  deletePersonalWallet,
  updateWalletBalance,
  type PersonalWallet,
  type PersonalWalletTransfer,
} from "@/lib/personalWallets";
```

#### **3. No requiere variables de entorno adicionales**

- Usa la configuración de Supabase existente

---

### 🧪 Flujo de Uso

```
1. Usuario inicia sesión en modo personal
   ↓
2. Se cargan wallets desde Supabase
   ↓ (Si no existen)
3. Se crea "Principal" con totalBalance
   ↓
4. Se sincronizan balances dinámicamente
   ↓
5. Usuario puede:
   - Ver sus wallets con saldos
   - Crear nuevas wallets
   - Transferir entre wallets
   - Editar nombres
   - Eliminar wallets (excepto Principal)
   ↓
6. Cada acción refleja en Supabase automáticamente
   ↓
7. Historial visible en bloque "Historial"
```

---

### 🚨 Validaciones

| Acción       | Validación              | Error                            |
| ------------ | ----------------------- | -------------------------------- |
| Crear wallet | Nombre no vacío         | "Nombre requerido"               |
| Transferir   | Wallet origen ≠ destino | "Selecciona wallets válidas"     |
| Transferir   | Monto > 0               | "Monto inválido"                 |
| Transferir   | Balance suficiente      | "Saldo insuficiente"             |
| Editar       | Nombre no vacío         | "Nombre inválido"                |
| Editar       | Principal protegida     | (deshabilitado)                  |
| Eliminar     | Principal protegida     | "No se puede eliminar Principal" |

---

### 💡 Ejemplos de Uso

#### **Crear wallet de reinversión:**

```
1. Nombre: "Reinversión"
2. Estado inicial: $0.00
3. Transferir dinero desde Principal
```

#### **Usar como tabla de ahorros:**

```
1. Crear: "Fondo de Vacaciones"
2. Transferir mensualmente desde Principal
3. Ver crecimiento en historial
```

---

### 🔐 Seguridad

- ✅ RLS habilitado en ambas tablas
- ✅ Usuario solo accede a sus propias wallets
- ✅ Protección de wallet Principal
- ✅ Transacciones atómicas (revertibles si fallan)
- ✅ Validaciones en cliente y servidor

---

### 📱 Soporta

- ✅ **Modo Personal**: Completo (wallets + transferencias + historial)
- ❌ **Modo Proyecto**: Deshabilitado (tiene su propio sistema)
- ✅ **Responsive**: Mobile, tablet, desktop
- ✅ **Sincronización**: En tiempo real con Supabase

---

### 🆘 Troubleshooting

| Problema                         | Solución                                          |
| -------------------------------- | ------------------------------------------------- |
| Wallets no cargan                | Verificar migración SQL en Supabase               |
| Principal no sincroniza          | Verificar `totalBalance` se calcula correctamente |
| Transferencias no se guardan     | Revisar RLS en Supabase                           |
| Botones de editar deshabilitados | Es la wallet Principal (normal)                   |

---

### 📝 Notas Futuras

- [ ] Exportar historial de wallets a CSV/PDF
- [ ] Objetivos de ahorro por wallet
- [ ] Gráficos de tendencia de wallets
- [ ] Alertas cuando wallet alcanza monto límite
- [ ] Integración con wallets on-chain (avisar si Principal es real y actualizar)
