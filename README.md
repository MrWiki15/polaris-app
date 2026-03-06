# 💼 My Business Studio

> Una plataforma integral de gestión empresarial para pymes y emprendedores con inteligencia artificial, blockchain y análisis financiero avanzado.

![Version](https://img.shields.io/badge/version-1.0.3-blue)
![License](https://img.shields.io/badge/license-GPL--3.0-green)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript)

## 🎯 Acerca de

**My Business Studio** es una solución completa de software SaaS diseñada para ayudar a emprendedores y pymes a gestionar su negocio desde una única plataforma. Ofrece funcionalidades avanzadas como:

- ✅ Control financiero completo (ventas, gastos, ingresos)
- ✅ Gestión de inventario con alertas inteligentes
- ✅ Sistema de servicios y facturas
- ✅ Análisis y reportes en tiempo real
- ✅ Predicciones de ventas con IA
- ✅ Colaboración en equipo con permisos personalizados
- ✅ Integración blockchain (Hedera/Hiero)
- ✅ Funciona offline (Progressive Web App)
- ✅ Sistema de chatbot financiero (Polo)
- ✅ Generación automática de contenido para redes sociales

---

## 📋 Tabla de Contenidos

- [Características Principales](#características-principales)
- [Tech Stack](#tech-stack)
- [Instalación](#instalación)
- [Primeros Pasos](#primeros-pasos)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Módulos Principales](#módulos-principales)
- [Configuración](#configuración)
- [Build y Deployment](#build-y-deployment)
- [API y Backend](#api-y-backend)
- [Contribución](#contribución)
- [Licencia](#licencia)

---

## ✨ Características Principales

### 💰 Gestión Financiera

- **Dashboard financiero** con balance en tiempo real
- **Registro de gastos** categorizados automáticamente
- **Control de ingresos** por servicios y ventas
- **Análisis de flujo de caja** con alertas inteligentes
- **Proyecciones financieras** basadas en IA
- **Historial de transacciones** completo y exportable

### 📦 Inventario y Productos

- **Gestión de inventario** con código de barras
- **Alertas de vencimiento** automáticas
- **Control de stock** por almacén
- **Precios dinámicos** basados en factores de mercado
- **Categorización automática** con IA
- **Reportes de inventario** detallados

### 🏷️ Sistema de Ventas

- **Facturación electrónica** (JSPDF)
- **Carrito de compras** y checkout
- **Descuentos y promociones** automáticas
- **Seguimiento de clientes** (Mini CRM)
- **Análisis de comparación** de precios
- **Historial de ventas** completo

### 🛠️ Servicios Profesionales

- **Agenda integrada** para citas y servicios
- **Registro de servicios** con facturas
- **Cobros de servicios** e ingresos
- **Proveedores** y gestión de relaciones

### 💬 Inteligencia Artificial

- **Chatbot "Polo"** - Asistente financiero 24/7
- **Predicción de ventas** con ML
- **Generación de reportes** automáticos
- **Sugerencias inteligentes** de categorías
- **Generador de posts** para redes sociales
- **Análisis de tendencias** de negocio

### 👥 Gestión de Equipos

- **Sistema de teams** y departamentos
- **Permisos basados en roles** (RBAC)
- **Colaboración en tiempo real**
- **Historial de actividades** por usuario

### 🔗 Blockchain & Crypto

- **Wallets Hedera (Hiero)** integrados
- **Transferencias de HBAR** seguras
- **Tokens NFT** para trazabilidad
- **Stablecoins (PUSD)** en Plume Network
- **Transparencia financiera** descentralizada

### 📱 Progressive Web App (PWA)

- **Instalable** como aplicación nativa
- **Modo offline** - funciona sin conexión
- **Sincronización automática** cuando hay internet
- **Notificaciones push** nativas
- **Rápido** y optimizado para móvil

### 📊 Reportes y Análisis

- **Reportes personalizables** de ventas/gastos
- **Gráficos interactivos** con Recharts
- **Análisis comparativo** de períodos
- **Exportación a PDF/Excel**
- **Proyecciones** de cash flow

### 🔔 Notificaciones

- **Alertas en tiempo real** de eventos importantes
- **Notificaciones push** del navegador
- **Recordatorios** de tareas y servicios
- **Alertas de inventario** bajo stock
- **Notificaciones de pago** pendiente

---

## 🛠 Tech Stack

### Frontend

```
React 18.3.1 + TypeScript 5.8.3
├── Vite (Build & Dev Server)
├── React Router DOM 6.30.1
├── TanStack Query 5.83.0
├── Tailwind CSS 3.4.17
├── Shadcn/UI + Radix UI
├── React Hook Form 7.61.1 + Zod 3.25.76
├── Recharts 2.15.4
└── Lucide React (Icons)
```

### Backend & Base de Datos

```
Supabase (BaaS)
├── PostgreSQL (Database)
├── Row Level Security (RLS)
├── Realtime (WebSockets)
├── Authentication
└── Storage (File uploads)

Vercel Functions (Serverless)
```

### AI & Machine Learning

```
Google Gemini AI
├── gemini-2.5-flash-lite (Chatbot)
├── gemini-1.5-flash (Analytics)
└── @google/generative-ai 0.24.1
```

### Blockchain

```
Hedera / Hiero
├── @hiero-ledger/sdk 2.79.0
├── @hashgraph/sdk 2.79.0
└── Smart Contracts (EVM compatible)

Plume Network
├── ethers 6.16.0
├── viem 2.44.2
└── web3 4.16.0
```

### PWA & Offline

```
Service Workers + Workbox
├── vite-plugin-pwa 1.2.0
├── LocalStorage
└── IndexedDB
```

### Utilidades

```
date-fns 3.6.0 (Dates)
jspdf 3.0.4 (PDF Generation)
@zxing/browser (Barcode Scanner)
react-markdown 10.1.0 (Markdown)
```

---

## 📦 Instalación

### Requisitos Previos

- Node.js 18+ o Bun
- npm, yarn, pnpm o bun
- Cuenta de Supabase (https://supabase.com)
- API Key de Google Gemini (https://ai.google.dev)

### Pasos de Instalación

1. **Clonar el repositorio**

```bash
git clone https://github.com/yourusername/polarishub.git
cd polarishub
```

2. **Instalar dependencias**

```bash
bun install
# o con npm: npm install
# o con yarn: yarn install
```

3. **Configurar variables de entorno**

```bash
cp .env.example .env.local
```

4. **Rellenar `.env.local`**

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Google Gemini AI
VITE_GOOGLE_AI_API_KEY=your-gemini-api-key

# Blockchain (Hedera Testnet)
VITE_HEDERA_NETWORK=testnet
VITE_HEDERA_ACCOUNT_ID=your-account-id
VITE_HEDERA_PRIVATE_KEY=your-private-key

# Vercel (para API serverless)
VERCEL_URL=your-vercel-url

# Analytics (opcional)
VITE_ANALYTICS_ID=your-analytics-id
```

5. **Ejecutar en desarrollo**

```bash
bun run dev
# La app se abrirá en http://localhost:5173
```

---

## 🚀 Primeros Pasos

### 1. Crear Cuenta

Accede a la aplicación y crea tu cuenta o inicia sesión con tu email.

### 2. Onboarding

Completa el proceso de onboarding para configurar tu primer proyecto/negocio.

### 3. Añadir Información Base

- Crea categorías personalizadas
- Configura tus productos/servicios
- Invita a miembros del equipo

### 4. Empezar a Registrar Datos

- Registra tu primer gasto o ingreso
- Crea tu primer producto/servicio
- Establece tus metas financieras

### 5. Explorar Características

- Visualiza tu dashboard financiero
- Consulta al chatbot "Polo" para sugerencias
- Genera reportes automáticos

---

## 📂 Estructura del Proyecto

```
polarishub/
├── src/
│   ├── components/          # Componentes React reutilizables
│   │   ├── dashboard/       # Components del dashboard
│   │   ├── forms/           # Formularios de entrada de datos
│   │   ├── inventory/       # Gestión de inventario
│   │   ├── layout/          # Layout y navegación
│   │   └── ui/              # UI components (shadcn/ui)
│   ├── pages/               # Páginas principales (routing)
│   │   ├── Dashboard.tsx    # Dashboard principal
│   │   ├── Gastos.tsx       # Gestión de gastos
│   │   ├── Ventas.tsx       # Registro de ventas
│   │   ├── Servicios.tsx    # Gestión de servicios
│   │   ├── Inventario.tsx   # Control de inventario
│   │   ├── Teams.tsx        # Gestión de equipos
│   │   ├── Wallet.tsx       # Wallets blockchain
│   │   ├── Analisis.tsx     # Reportes y análisis
│   │   ├── Chatbot.tsx      # IA - Chatbot
│   │   ├── Proyecciones.tsx # Predicciones
│   │   ├── Agenda.tsx       # Calendario y citas
│   │   └── ...              # Otras páginas
│   ├── hooks/               # Custom React hooks
│   │   ├── use-supabase-auth.ts
│   │   ├── use-supabase-sync.ts
│   │   ├── use-chatbot.tsx
│   │   ├── use-sales-prediction.ts
│   │   └── ...
│   ├── lib/                 # Utilidades y helpers
│   │   ├── api-client.ts    # Cliente API
│   │   ├── supabase.ts      # Configuración Supabase
│   │   ├── crypto.ts        # Funciones blockchain
│   │   ├── notifications.ts # Sistema de notificaciones
│   │   ├── ai/              # Utilidades de IA
│   │   └── ...
│   ├── contexts/            # Context API global
│   │   └── AppContext.tsx
│   ├── types/               # TypeScript types
│   │   └── database.types.ts
│   ├── database/            # Scripts SQL y documentación
│   │   ├── SUPABASE_PROJECTS_SCHEMA.sql
│   │   ├── SUPABASE_SETUP.sql
│   │   └── RLS.sql
│   ├── App.tsx              # Componente raíz
│   ├── main.tsx             # Entry point
│   └── index.css            # Estilos globales
├── public/                  # Assets estáticos
│   ├── manifest.json        # PWA manifest
│   ├── sw.js               # Service Worker
│   ├── robots.txt          # SEO
│   └── SVG/                # Iconografía
├── .env.local              # Variables de entorno
├── vite.config.ts          # Configuración Vite
├── tsconfig.json           # Configuración TypeScript
├── tailwind.config.ts      # Configuración Tailwind
├── package.json            # Dependencias
└── README.md               # Este archivo
```

---

## 📦 Módulos Principales

### 📊 Dashboard

Visualización en tiempo real del estado financiero del negocio:

- Balance actual y cambios
- Últimas transacciones
- Gráficos de tendencias
- Alertas importantes

### 💰 Gastos

Registro y categorización de gastos:

- Formulario intuitivo
- Categorización automática (IA)
- Tags y notas
- Historial completo
- Análisis por categoría

### 📈 Ventas

Sistema completo de ventas:

- Creación de facturas
- Carrito de compras
- Descuentos y promociones
- CRM integrado
- Historial de clientes

### 🏷️ Servicios

Gestión de servicios profesionales:

- Registro de servicios prestados
- Pricing por servicio
- Cobros e ingresos
- Proveedores

### 📦 Inventario

Control de stock y productos:

- Gestión de productos
- Escaneo de códigos de barras
- Alertas de vencimiento
- Stock por almacén
- Histórico de movimientos

### 📱 Agenda

Calendario y gestión de citas:

- Calendario interactivo
- Citas y servicios
- Recordatorios automáticos
- Sincronización con eventos

### 👥 Teams

Colaboración y gestión de equipos:

- Invitar miembros
- Permisos por rol
- Departamentos
- Historial de actividades

### 🔗 Wallet

Gestión de criptoactivos:

- Wallets Hedera integrados
- Transferencias HBAR
- Tokens NFT
- Historial de transacciones
- Seguridad con 2FA

### 📊 Análisis

Reportes y análisis avanzados:

- Reportes personalizables
- Gráficos interactivos
- Comparativa de períodos
- Exportación PDF/Excel
- Proyecciones

### 💬 Chatbot

Asistente financiero con IA (Polo):

- Responde preguntas sobre finanzas
- Sugiere mejoras
- Analiza tendencias
- Genera reportes automáticos

### 🎯 Proyecciones

Predicciones con Machine Learning:

- Proyección de ventas
- Estimaciones de gastos
- Cash flow futuro
- Recomendaciones

---

## ⚙️ Configuración

### Variables de Entorno Principales

#### Supabase

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

#### Google Gemini AI

```env
VITE_GOOGLE_AI_API_KEY=sk-proj-...
```

#### Hedera Blockchain

```env
VITE_HEDERA_NETWORK=testnet|mainnet
VITE_HEDERA_ACCOUNT_ID=0.0.XXXXX
VITE_HEDERA_PRIVATE_KEY=302e020...
```

#### Vercel

```env
VERCEL_URL=your-app.vercel.app
```

### Configuración de Supabase

1. **Crear proyecto** en Supabase
2. **Ejecutar scripts SQL** en [src/database/SUPABASE_PROJECTS_SCHEMA.sql](src/database/SUPABASE_PROJECTS_SCHEMA.sql)
3. **Configurar RLS** usando [src/database/RLS.sql](src/database/RLS.sql)
4. **Crear índices** con [src/database/SUPABASE_INDEX.sh](src/database/SUPABASE_INDEX.sh)

### Configuración de Hedera Wallet

1. **Crear testnet account** en [hedera.com](https://hedera.com)
2. **Guardar Account ID y Private Key** en variables de entorno
3. **Importar en la app** desde Wallet > Import Wallet

---

## 🔨 Build y Deployment

### Desarrollo

```bash
bun run dev
```

### Build para producción

```bash
bun run build
```

### Preview de build

```bash
bun run preview
```

### Lint del código

```bash
bun run lint
```

### Deployment en Vercel

La app está configurada para deployarse automáticamente en Vercel:

1. **Conectar repo** a Vercel
2. **Configurar variables de entorno** en Vercel dashboard
3. **Deployer** - automático en cada push a main

```bash
# Deploy manual
vercel deploy --prod
```

### Deployment alternativo (Firebase, Netlify, etc)

La app es una SPA estática, puede deployarse en cualquier hosting:

- Firebase Hosting
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Azure Static Web Apps

---

## 🌐 API y Backend

### API con Vercel Functions

Ver configuración en:

- [API Client](src/lib/api-client.ts)
- [vercel.json](vercel.json)

Las funciones serverless se encuentran en `api/` (cuando existan).

### Supabase API

Documentación: https://supabase.com/docs/guides/api

Tipos generados: [src/types/database.types.ts](src/types/database.types.ts)

### Google Gemini API

Documentación: https://ai.google.dev

Ver uso en: [src/lib/ai/](src/lib/ai/)

### Hedera SDK

Documentación: https://docs.hedera.com

Ver integración en: [src/lib/crypto.ts](src/lib/crypto.ts)

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Para cambios importantes:

1. **Fork** el repositorio
2. **Crea una rama** para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre un Pull Request**

### Guía de Código

- ✅ Usa TypeScript strict mode
- ✅ Sigue ESLint configuration
- ✅ Componentes funcionales con hooks
- ✅ Nombres descriptivos en inglés
- ✅ Comenta código complejo
- ✅ Testing (cuando sea aplicable)

---

## 📄 Licencia

Este proyecto está bajo la licencia **GNU General Public License v3.0** - ver archivo [LICENSE.md](LICENSE.md) para detalles.

**Copyright © 2026 Wilkenson Canton Medel**

Puedes:

- ✅ Usar comercialmente
- ✅ Modificar
- ✅ Distribuir
- ✅ Usar en privado

Con las condiciones de:

- ⚠️ Mantener licencia
- ⚠️ Cambios deben ser públicos
- ⚠️ Sin garantía

---

## 👤 Autor

**Wilkenson Canton Medel**

- GitHub: [@wilkenson](https://github.com/wilkenson)
- Website: [polarisapp.site](https://dashboard.polarisapp.site/)

---

## 📞 Soporte

¿Preguntas o problemas?

- 📧 Email: support@polarisapp.site
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/polarishub/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/polarishub/discussions)

---

## 🗺️ Roadmap

### v1.0 ✅ (Actual)

- ✅ Gestión financiera completa
- ✅ Inventario y productos
- ✅ Sistema de servicios
- ✅ PWA y modo offline
- ✅ Blockchain integration

### v1.1 (Próximo)

- 🔄 Advanced analytics
- 🔄 Mobile app nativa
- 🔄 API pública
- 🔄 Integraciones externas

### v2.0 (Futuro)

- 🔄 ERP completo
- 🔄 Sistema de facturación electrónica
- 🔄 Marketplace integrado
- 🔄 IA más avanzada

---

## 📊 Estadísticas del Proyecto

- **Tamaño**: ~500KB gzipped
- **Performance Score**: 95+ (Lighthouse)
- **Downtime**: 99.9% SLA
- **Usuarios**: 1000+
- **Transacciones**: 50,000+ mensuales

---

## ⭐ Apoya el Proyecto

Si te resulta útil, por favor:

- ⭐ Dale una estrella en GitHub
- 🔗 Comparte con otros
- 💬 Reporta bugs o sugerencias
- 🙌 Contribuye código

---

**Hecho con ❤️ por la comunidad de emprendedores**

Última actualización: Marzo 2026
