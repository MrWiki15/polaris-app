# 🔧 Setup de API Local

## Problema Común: 404 Not Found

Si ves este error al hacer peticiones a `/api/*`:

```
< HTTP/1.1 404 Not Found
```

**Causa**: Vite (`npm run dev`) NO ejecuta las Serverless Functions automáticamente.

## ✅ Solución: Usar Vercel Dev

### Paso 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

### Paso 2: Login en Vercel (primera vez)

```bash
vercel login
```

### Paso 3: Ejecutar con API

```bash
# Opción A: Usar el script configurado
npm run dev:api

# Opción B: Comando directo
vercel dev --listen 8080
```

Vercel te preguntará:

- "Set up and develop?" → **Y** (Yes)
- "Which scope?" → Selecciona tu cuenta
- "Link to existing project?" → **N** (No, si es primera vez)
- "What's your project's name?" → `My Business -hub` (o el que prefieras)
- "In which directory is your code located?" → `.` (raíz)

### Paso 4: Probar la API

```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"wikicanton439@gmail.com","password":"vegeta777"}'

# Deberías ver:
# {
#   "success": true,
#   "data": {
#     "accessToken": "eyJ...",
#     "refreshToken": "eyJ...",
#     ...
#   }
# }
```

## 🔍 Verificar Variables de Entorno

Vercel Dev busca variables en:

1. `.env` (local)
2. Variables configuradas en Vercel (si está linkeado)

Asegúrate de tener en `.env`:

```env
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
VITE_ENCRIPTED_KEY=your-encryption-key
```

## 🎯 Scripts Disponibles

```bash
# Solo Frontend (SIN API)
npm run dev

# Frontend + API (Serverless Functions)
npm run dev:api

# Build de producción
npm run build

# Preview del build
npm run preview
```

## 📝 Diferencias

| Comando           | Puerto | Frontend | API | Usos                  |
| ----------------- | ------ | -------- | --- | --------------------- |
| `npm run dev`     | 8080   | ✅       | ❌  | Desarrollo solo UI    |
| `npm run dev:api` | 8080   | ✅       | ✅  | Desarrollo completo   |
| `vercel dev`      | 3000   | ✅       | ✅  | Desarrollo con Vercel |

## 🐛 Troubleshooting

### Error: "Command not found: vercel"

```bash
npm install -g vercel
# o
pnpm add -g vercel
```

### Error: "Port 8080 already in use"

Detén el servidor anterior:

```bash
# Windows PowerShell
Get-Process -Name node | Stop-Process -Force

# O cambiar puerto
vercel dev --listen 3000
```

### API devuelve "Supabase credentials not configured"

Verifica que `.env` tenga todas las variables:

```bash
# Verificar variables
cat .env

# O en Windows
type .env
```

### Error: "Token inválido o expirado"

Primero debes registrarte:

```bash
# 1. Registrar usuario
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123456"}'

# 2. Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123456"}'
```

## 🚀 Workflow Recomendado

### Para Desarrollo de UI

```bash
npm run dev
```

### Para Desarrollo Full (UI + API)

```bash
npm run dev:api
```

### Para Testing de API

```bash
# Terminal 1: Servidor
npm run dev:api

# Terminal 2: Pruebas con cURL
curl -X POST http://localhost:8080/api/auth/login ...

# O usa Postman/Insomnia
```

## 📚 Documentación Adicional

- **API Completa**: [api/README.md](./README.md)
- **Guía Rápida**: [../API_QUICK_START.md](../API_QUICK_START.md)
- **Cliente TypeScript**: [../src/lib/api-client.ts](../src/lib/api-client.ts)
- **Vercel CLI**: https://vercel.com/docs/cli
