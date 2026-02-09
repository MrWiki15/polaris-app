# Guía Rápida - API de Polaris Hub

## 🚀 Inicio Rápido

### 1. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT
JWT_SECRET=your-jwt-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars

# Encryption
VITE_ENCRIPTED_KEY=your-encryption-passphrase
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Desarrollo Local

```bash
npm run dev
```

La API estará disponible en `http://localhost:3000/api`

### 4. Deploy en Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configurar variables de entorno
vercel env add JWT_SECRET
vercel env add JWT_REFRESH_SECRET
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

## 📚 Endpoints Principales

### Autenticación

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"new@example.com","password":"password123"}'
```

### Ventas

```bash
# Listar ventas
curl http://localhost:3000/api/sales \
  -H "Authorization: Bearer YOUR_TOKEN"

# Crear venta
curl -X POST http://localhost:3000/api/sales \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-02-09",
    "amount": 150.50,
    "category": "Alimentos"
  }'
```

## 💻 Usar desde el Frontend

```typescript
import { authApi, salesApi } from "@/lib/api-client";

// Login
const result = await authApi.login("user@example.com", "password123");

// Get sales
const sales = await salesApi.list({ category: "Alimentos" });

// Create sale
const newSale = await salesApi.create({
  date: "2026-02-09",
  amount: 150.5,
  category: "Alimentos",
});
```

## 🔒 Seguridad

1. **NUNCA** expongas tu `SUPABASE_SERVICE_ROLE_KEY` en el cliente
2. Usa secrets únicos de al menos 32 caracteres
3. Los tokens JWT expiran en 24 horas
4. Usa refresh tokens para renovar acceso

## 📂 Estructura de la API

```
api/
├── _utils/          # Utilidades (JWT, Supabase, validación)
├── _middleware/     # Middleware de autenticación
├── auth/           # Endpoints de autenticación
├── data/           # Endpoint de datos completos
├── settings/       # Endpoint de configuración
├── sales/          # CRUD de ventas
├── expenses/       # CRUD de gastos
├── products/       # CRUD de productos
├── clients/        # CRUD de clientes
├── services/       # CRUD de servicios
└── README.md       # Documentación completa
```

## 📖 Documentación Completa

Lee [api/README.md](./README.md) para documentación detallada de todos los endpoints.

## ❓ Preguntas Frecuentes

### ¿Cómo generar secrets seguros?

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### ¿Cómo probar la API localmente?

1. Inicia el servidor: `npm run dev`
2. La API estará en `http://localhost:3000/api`
3. Usa Postman, Insomnia o cURL para probar

### ¿Los endpoints funcionan en producción?

Sí, Vercel detecta automáticamente los archivos en `/api` y los despliega como Serverless Functions.

### ¿Cómo manejar errores?

```typescript
try {
  const result = await salesApi.create(sale);
  if (result.success) {
    // Éxito
  } else {
    // Error
    console.error(result.error);
  }
} catch (error) {
  // Error de red o excepción
  console.error(error);
}
```

## 🆘 Soporte

- Documentación completa: [api/README.md](./README.md)
- Variables de entorno: [api/.env.example](./api/.env.example)
- Cliente TypeScript: [src/lib/api-client.ts](./src/lib/api-client.ts)
