# Configuración de Transferencias USDC

## Descripción

Este módulo permite a los usuarios de Polaris Hub enviar y recibir USDC (Hedera Testnet) a través de una interfaz intuitiva.

## Características

### 1. Wallet USDC Automática

- Al registrarse, cada usuario recibe automáticamente:
  - Wallet **Principal**: Para gestión general de fondos
  - Wallet **USDC**: Dedicada para operaciones con USDC en Hedera

### 2. Interfaz Especial para USDC

Cuando se selecciona la wallet USDC en el modal de transferencias, la UI muestra opciones especiales:

#### **Modo Recibir**

- Muestra la dirección Hedera del usuario
- Permite copiar la dirección al portapapeles
- Indica que es para USDC en Hedera Testnet

#### **Modo Enviar**

Dos opciones disponibles:

##### A. Enviar a Usuario de Polaris

1. Buscar usuario por email (mínimo 3 caracteres)
2. Seleccionar usuario de la lista de resultados
3. Ver la dirección Hedera del destinatario
4. Ingresar monto
5. Confirmar envío

##### B. Enviar a Wallet Externa

1. Ingresar dirección Hedera destino (formato: 0.0.xxxxx)
2. Ingresar monto USDC
3. Confirmar envío

## Configuración Requerida en Supabase

### Paso 1: Crear Función RPC

Ejecuta el archivo `search_users_rpc.sql` en el SQL Editor de Supabase:

```bash
Ubicación: src/database/search_users_rpc.sql
```

Esta función permite buscar usuarios por email de manera segura.

### Paso 2: Verificar Permisos

Asegúrate de que los usuarios autenticados tengan permisos en las tablas:

- `personal_wallets`
- `personal_wallet_transfers`
- `wallets`

### Paso 3: Configurar Variables de Entorno

Verifica que las siguientes variables estén configuradas en `.env`:

```env
VITE_OPERATOR_ID=tu_hedera_operator_id
VITE_OPERATOR_KEY=tu_hedera_operator_key
VITE_ENCRIPTED_KEY=tu_clave_de_encriptacion
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

## Flujo de Usuario

### Acceder al Modal de Opciones

1. En la página Wallet (modo personal)
2. Click en el botón de 3 puntos (⋮) arriba a la derecha
3. Seleccionar tab "Transferir"

### Usar USDC

1. Seleccionar "USDC" en el selector "Desde"
2. Elegir "Enviar" o "Recibir"
3. Seguir el flujo correspondiente

## Notas Técnicas

### Búsqueda de Usuarios

- Usa función RPC `search_users_by_email()` del lado del servidor
- Excluye al usuario actual de los resultados
- Limita resultados a 5 usuarios
- Requiere mínimo 3 caracteres para activarse
- Solo muestra usuarios con wallet Hedera configurada

### Transferencias

- **Internas (Polaris)**: Se registran en `personal_wallet_transfers`
- **Externas**: Requieren transacción real en Hedera blockchain
- Balance actualizado automáticamente en la tabla `personal_wallets`

### Seguridad

- Row Level Security (RLS) habilitado en todas las tablas
- Usuarios solo pueden ver y modificar sus propios datos
- Función RPC usa `SECURITY DEFINER` para acceso controlado a `auth.users`

## Futuras Mejoras

### Implementaciones Pendientes

1. **Transacciones Reales en Hedera**
   - Actualmente solo se actualiza el balance localmente
   - Necesario: Implementar `TokenTransferTransaction` de Hedera SDK
   - Usar token ID de USDC en Hedera Testnet

2. **Confirmaciones On-Chain**
   - Verificar transacciones en Hedera antes de actualizar balance
   - Mostrar hash de transacción en el historial

3. **Notificaciones**
   - Notificar al usuario cuando recibe USDC
   - Email/Push notification para transferencias recibidas

4. **Límites y Comisiones**
   - Implementar límites diarios/mensuales
   - Calcular comisiones de red

## Soporte

Para problemas o preguntas, revisar:

- Console del navegador para logs de errores
- Supabase Logs para errores del servidor
- Hedera HashScan para verificar transacciones on-chain
