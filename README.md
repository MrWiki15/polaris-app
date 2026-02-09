Polaris (polarisHub)

Resumen

- Polaris es la aplicación web administrativa (ERP) completa del ecosistema. Está construida con React + TypeScript sobre Vite y TailwindCSS. Provee vistas de gestión (ventas, inventario, facturación, análisis, CRM, configuración, etc.) y se integra con Supabase para persistencia y con una REST API completa para operaciones programáticas.

## 🛠️ Tecnologías Principales

### Frontend

- **Framework:** Vite + React 18 + TypeScript
- **Estilos:** TailwindCSS + Radix UI
- **UI:** Lucide, Sonner, Recharts
- **Autenticación:** Supabase Auth
- **Forms:** react-hook-form + zod

### Backend / API

- **API REST:** Vercel Serverless Functions
- **Autenticación:** JWT (Access + Refresh tokens)
- **Base de Datos:** Supabase (PostgreSQL + RLS)
- **Validación:** Zod
- **CORS:** Habilitado

### Integraciones

- **Supabase:** Auth, Database, Real-time Sync
- **IA:** Google Gemini API
- **Web3:** ethers, viem, wagmi, Hedera SDK
- **Exportación:** jsPDF, CSV
- **Almacenamiento:** Pinata (IPFS)

Estructura relevante

## 📁 Estructura del Proyecto

```
polarisHub/
├── src/
│   ├── pages/              # Páginas principales del ERP
│   ├── components/         # Componentes reutilizables
│   ├── lib/                # Utilidades (supabase, crypto, api-client)
│   ├── hooks/              # Hooks personalizados
│   ├── contexts/           # React Context (AppContext)
│   ├── database/           # Scripts SQL y guías Supabase
│   └── main.tsx            # Punto de entrada
├── api/                    # REST API (Vercel Serverless)
│   ├── _utils/             # JWT, Supabase, validación
│   ├── _middleware/        # Autenticación JWT
│   ├── auth/               # Login, register, refresh
│   ├── data/               # Backup/restore de datos
│   ├── settings/           # Configuración de empresa
│   ├── sales/              # CRUD de ventas
│   ├── expenses/           # CRUD de gastos
│   ├── products/           # CRUD de productos
│   ├── clients/            # CRUD de clientes
│   ├── services/           # CRUD de servicios
│   ├── README.md           # Documentación completa de API
│   └── .env.example        # Variables de entorno
├── public/                 # Assets estáticos
├── package.json            # Dependencias
├── vite.config.ts          # Configuración de Vite
├── vercel.json             # Configuración de Vercel
├── API_QUICK_START.md      # Guía rápida de la API
└── README.md               # Este archivo
```

**Frontend (React):**

- `src/pages/` : vistas principales del panel (Dashboard, Analisis, Facturador, Inventario, Gastos, Ingreso, Deudas, Configuracion, Agenda, etc.).
- `src/components/` : componentes reutilizables y layout.
- `src/lib/` : utilidades (supabase, crypto, storage, api-client, helpers).
- `src/hooks/` : hooks personalizados (`use-supabase-auth`, `use-supabase-sync`, `use-toast`, `use-mobile`).
- `src/database/` : scripts y guías para Supabase (setup, esquemas y queries).

**API REST (Vercel Serverless):**

- `api/_utils/` : utilidades (JWT, Supabase, validación, respuestas).
- `api/_middleware/` : middleware de autenticación.
- `api/auth/` : endpoints de autenticación (login, register, refresh, me).
- `api/data/` : endpoints de datos (backup/restore).
- `api/settings/` : configuración de empresa.
- `api/sales/` : CRUD de ventas.
- `api/expenses/` : CRUD de gastos.
- `api/products/` : CRUD de productos.
- `api/clients/` : CRUD de clientes.
- `api/services/` : CRUD de servicios.

## 🚀 Inicio Rápido

### 1. Clonar e Instalar

```bash
git clone <repo-url>
cd polarisHub
npm install
```

### 2. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar con tus credenciales
nano .env
```

**Variables necesarias:**

```env
# Supabase
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# JWT
JWT_SECRET=your-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars

# Encryption
VITE_ENCRIPTED_KEY=your-encryption-key

# IA (opcional)
VITE_GOOGLE_AI_API_KEY=your-gemini-key
```

**Generar secrets seguros:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Ejecutar en Desarrollo

```bash
npm run dev
```

- **Frontend:** http://localhost:5173
- **API:** http://localhost:5173/api/\*

### 4. Build para Producción

```bash
npm run build
```

## 📚 Documentación de la API

La aplicación incluye una **REST API completa** para operaciones programáticas.

### Documentación

- **Referencia Completa:** [api/README.md](api/README.md)
- **Guía Rápida:** [API_QUICK_START.md](API_QUICK_START.md)
- **Cliente TypeScript:** [src/lib/api-client.ts](src/lib/api-client.ts)

### Endpoints Principales

```
POST   /api/auth/login              # Iniciar sesión
POST   /api/auth/register           # Registrarse
POST   /api/auth/refresh            # Renovar token
GET    /api/auth/me                 # Usuario actual

GET    /api/data                    # Obtener todos los datos
PUT    /api/data                    # Actualizar datos

GET    /api/settings                # Obtener configuración
PUT    /api/settings                # Actualizar configuración

GET    /api/sales                   # Listar ventas
POST   /api/sales                   # Crear venta
GET    /api/sales/:id               # Obtener venta
PUT    /api/sales/:id               # Actualizar venta
DELETE /api/sales/:id               # Eliminar venta

# Mismos patrones para:
# /api/expenses, /api/products, /api/clients, /api/services
```

### Ejemplo de Uso (TypeScript)

```typescript
import { authApi, salesApi, settingsApi } from "@/lib/api-client";

// Login
await authApi.login("user@example.com", "password123");

// Listar ventas
const { data } = await salesApi.list({
  category: "Alimentos",
  startDate: "2026-01-01",
});

// Crear venta
await salesApi.create({
  date: "2026-02-09",
  amount: 150.5,
  category: "Alimentos",
  description: "Venta de productos",
});

// Actualizar configuración
await settingsApi.update({
  businessName: "Mi Empresa",
  currency: "USD",
});
```

### Sistemas de Autenticación

- **Access Token:** Válido 24 horas (Bearer token)
- **Refresh Token:** Válido 30 días
- **Almacenamiento:** localStorage (en cliente)
- **Headers:** `Authorization: Bearer {token}`

## 🌐 Deploy en Vercel

### 1. Conectar Repositorio

```bash
vercel
```

### 2. Configurar Variables de Entorno

```bash
vercel env add JWT_SECRET
vercel env add JWT_REFRESH_SECRET
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

O manualmente en: **Vercel Dashboard → Settings → Environment Variables**

### 3. Deploy

```bash
vercel deploy --prod
```

**Resultado:**

- API automáticamente disponible en: `https://your-domain.vercel.app/api/*`
- Serverless Functions creadas automáticamente

## 💻 Estructura de Páginas

| Página            | Descripción                        |
| ----------------- | ---------------------------------- |
| **Dashboard**     | Resumen general y métricas         |
| **Ventas**        | Registrar y analizar ingresos      |
| **Gastos**        | Control de gastos                  |
| **Inventario**    | Gestión de productos y stock       |
| **Servicios**     | Catalog y facturación de servicios |
| **Análisis**      | Gráficas y reportes                |
| **CRM**           | Gestión de clientes y contactos    |
| **Facturador**    | Generación de facturas             |
| **Agenda**        | Calendario y eventos               |
| **Configuración** | Ajustes de empresa y perfil        |
| **Wallet**        | Gestión de wallets blockchain      |
| **Proyecciones**  | Pronósticos de ventas (IA)         |
| **Premium**       | Suscripción y features Premium     |

## 🔐 Seguridad

✅ **Implementado:**

- Autenticación JWT con expiración
- Refresh tokens (sin almacenar en servidor)
- CORS configurado
- Validación de datos con Zod
- Row Level Security (RLS) en Supabase
- Service Role Key solo en servidor
- Encriptación de claves privadas (wallets)
- Rate limiting en próximas versiones

## 📝 Scripts Disponibles

```bash
npm run dev          # Desarrollar (Vite + API)
npm run build        # Build de producción
npm run build:dev    # Build con modo development
npm run lint         # Verificar código (ESLint)
npm run preview      # Preview del build
```

## 🗄️ Base de Datos (Supabase)

Scripts de setup disponibles en `src/database/`:

- `SUPABASE_QUICK_SETUP.sql` - Setup rápido
- `SUPABASE_PROJECTS_SCHEMA.sql` - Esquema de proyectos
- `SUPABASE_QUERIES_REFERENCE.sql` - Queries útiles
- `SUPABASE_VISUAL_GUIDE.txt` - Guía visual

## 📦 Dependencias Principales

```json
{
  "react": "^18.3.1",
  "typescript": "^5.8.3",
  "vite": "^5.4.19",
  "@supabase/supabase-js": "^2.89.0",
  "zod": "^3.25.76",
  "jsonwebtoken": "^9.0.3",
  "@vercel/node": "^5.5.33",
  "tailwindcss": "^3.4.17"
}
```

## 🐛 Troubleshooting

### Error: "Token inválido"

- Verifica que `JWT_SECRET` esté configurado
- Verifica que el token no haya expirado (24 horas)
- Usa el refresh token para obtener uno nuevo

### Error: "No autorizado"

- Asegúrate de enviar el header `Authorization`
- Formato correcto: `Authorization: Bearer {token}`
- Verifica que el token sea válido

### Error: "Supabase credentials not configured"

- Verifica `VITE_SUPABASE_URL` en `.env`
- Verifica `SUPABASE_SERVICE_ROLE_KEY` en variables de servidor
- Reinicia el servidor de desarrollo

### API devuelve 404 en Producción

- Verifica que `vercel.json` esté correctamente configurado
- Verifica que la carpeta `api/` esté en el repositorio
- Redeploy: `vercel rebuild`

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la **GNU General Public License v3.0** ([LICENSE](LICENSE.md))

**Puedes:**

- ✅ Usar, modificar y distribuir el código
- ✅ Crear versiones privadas

**Debes:**

- 🔗 Mantener la licencia GPLv3
- 📝 Documentar modificaciones
- 📢 Dar crédito a autores originales
- 📤 Compartir el código fuente

Para más detalles: https://www.gnu.org/licenses/gpl-3.0.en.html

## 📞 Soporte

- **Documentación:** [docs/](docs/) (próximamente)
- **Issues:** GitHub Issues
- **Discussiones:** GitHub Discussions
- **Email:** info@example.com

---

**Last Updated:** Febrero 2026  
**Version:** 1.0.3

- 📢 Dar crédito a los autores originales
- 📤 Compartir el código fuente con usuarios

Para más detalles: https://www.gnu.org/licenses/gpl-3.0.en.html.
