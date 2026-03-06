# Especificaciones Técnicas de My Business Studio

## 📋 Índice

1. [Visión General](#visión-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura del Sistema](#arquitectura-del-sistema)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Funcionalidades Principales](#funcionalidades-principales)
6. [Módulos y Páginas](#módulos-y-páginas)
7. [Sistema de Datos](#sistema-de-datos)
8. [Integración con Base de Datos](#integración-con-base-de-datos)
9. [Sistema de Autenticación](#sistema-de-autenticación)
10. [Sistema de Sincronización](#sistema-de-sincronización)
11. [Funcionalidades de Inteligencia Artificial](#funcionalidades-de-inteligencia-artificial)
12. [Sistema de Blockchain y Wallets](#sistema-de-blockchain-y-wallets)
13. [Sistema de Equipos y Proyectos](#sistema-de-equipos-y-proyectos)
14. [Progressive Web App (PWA)](#progressive-web-app-pwa)
15. [Sistema de Notificaciones](#sistema-de-notificaciones)
16. [Componentes de UI](#componentes-de-ui)
17. [Hooks Personalizados](#hooks-personalizados)
18. [Seguridad y Permisos](#seguridad-y-permisos)
19. [Deployment y Build](#deployment-y-build)
20. [Roadmap de Features Premium](#roadmap-de-features-premium)

---

## 1. Visión General

**My Business Studio** es una plataforma integral de gestión empresarial diseñada para pymes y emprendedores. Proporciona herramientas completas para la gestión de ventas, gastos, inventario, servicios, análisis financiero, proyecciones, reportes y colaboración en equipo.

### 🎯 Propósito

- Control financiero completo en una sola plataforma
- Análisis de negocio con datos en tiempo real
- Gestión de inventario con alertas inteligentes
- Proyecciones y predicciones con IA
- Colaboración en equipo con permisos por departamento
- Integración blockchain para transparencia y trazabilidad

### 👥 Usuarios Objetivo

- Emprendedores individuales
- Pequeñas y medianas empresas
- Equipos de trabajo organizados por departamentos
- Negocios que requieren trazabilidad blockchain

### 🔑 Características Clave

- **Offline-First**: Funciona sin conexión, sincroniza cuando hay internet
- **PWA**: Instalable como aplicación nativa
- **Multinegocio**: Gestión de múltiples proyectos/negocios
- **Inteligencia Artificial**: Predicciones, sugerencias y automatización
- **Blockchain**: Wallets Hedera para transparencia financiera
- **Colaborativo**: Sistema de equipos con permisos por departamento

---

## 2. Stack Tecnológico

### Frontend

#### Framework Principal

- **React 18.3.1**: Biblioteca principal para construir la UI
- **TypeScript 5.8.3**: Tipado estático para mayor robustez
- **Vite**: Build tool y dev server ultrarrápido

#### UI y Estilos

- **Tailwind CSS 3.4.17**: Framework CSS utility-first
- **shadcn/ui**: Colección de componentes basados en Radix UI
- **Radix UI**: Componentes primitivos accesibles y sin estilos
- **Lucide React**: Iconografía moderna
- **next-themes**: Sistema de temas light/dark
- **tailwindcss-animate**: Animaciones CSS

#### Routing y Estado

- **React Router DOM 6.30.1**: Navegación SPA
- **TanStack Query (React Query) 5.83.0**: Gestión de estado servidor
- **Context API**: Estado global de la aplicación

#### Gráficos y Visualización

- **Recharts 2.15.4**: Librería de gráficos para análisis
- **react-resizable-panels**: Paneles redimensionables

#### Formularios y Validación

- **React Hook Form 7.61.1**: Gestión de formularios
- **Zod 3.25.76**: Validación de esquemas
- **@hookform/resolvers**: Integración entre React Hook Form y Zod

### Backend y Base de Datos

#### BaaS (Backend as a Service)

- **Supabase**:
  - **PostgreSQL**: Base de datos relacional
  - **Authentication**: Sistema de autenticación integrado
  - **Storage**: Almacenamiento de archivos (logos de proyectos)
  - **Realtime**: Suscripciones en tiempo real
  - **Row Level Security (RLS)**: Seguridad a nivel de fila

#### API y Serverless

- **Vercel Functions**: Serverless functions para lógica backend
- **@vercel/node**: Runtime de Node.js en Vercel

#### Almacenamiento Local

- **LocalStorage**: Persistencia offline-first
- **IndexedDB** (a través de Service Worker): Cache de assets

### Inteligencia Artificial

#### Modelos de IA

- **Google Gemini AI**:
  - **gemini-2.5-flash-lite**: Chatbot asistente financiero
  - **gemini-1.5-flash**: Análisis y generación de contenido
  - **@google/generative-ai 0.24.1**: SDK de Google AI

#### Capacidades de IA

- Predicción de ventas
- Generación de reportes
- Sugerencias de categorías
- Generación de posts para redes sociales
- Análisis de tendencias
- Chatbot financiero (Polo)
- Planificación de agenda

### Blockchain y Crypto

#### Redes Blockchain

- **Hedera (Hiero) Testnet**: Red principal para wallets y NFTs
  - Creación de cuentas
  - Transferencias de HBAR
  - Creación de tokens NFT
  - Colecciones NFT para historial de proyectos

- **Plume Main Network**: Red para stablecoins
  - Token PUSD (Plume USD)
  - Transferencias de stablecoins

#### Librerías Blockchain

- **@hiero-ledger/sdk 2.79.0**: SDK de Hedera (Hiero)
- **@hashgraph/sdk 2.79.0**: SDK alternativo de Hedera
- **ethers 6.16.0**: Interacción con contratos EVM
- **wagmi 3.3.2**: Hooks de React para Web3
- **viem 2.44.2**: Librería TypeScript para Ethereum
- **web3 4.16.0**: Librería Web3.js

### PWA y Almacenamiento

#### Progressive Web App

- **vite-plugin-pwa 1.2.0**: Plugin de PWA para Vite
- **Workbox**: Estrategias de caché
- **Service Worker**: Offline caching y notificaciones push

#### Otras Utilidades

- **date-fns 3.6.0**: Manipulación de fechas
- **jspdf 3.0.4**: Generación de PDFs (facturas)
- **react-markdown 10.1.0**: Renderizado de Markdown
- **@zxing/library**: Lectura de códigos de barras
- **jsonwebtoken 9.0.3**: Manejo de tokens JWT
- **class-variance-authority**: Variantes de componentes
- **clsx + tailwind-merge**: Gestión de clases CSS

### DevOps y Tooling

#### Desarrollo

- **ESLint 9.32.0**: Linting de código
- **PostCSS 8.5.6**: Procesamiento de CSS
- **Autoprefixer 10.4.21**: Prefijos CSS automáticos
- **@vitejs/plugin-react-swc**: Fast Refresh con SWC

#### Testing y Quality

- **TypeScript Strict Mode**: Configuración estricta
- **lovable-tagger**: Etiquetado de componentes en desarrollo

---

## 3. Arquitectura del Sistema

### Patrón Arquitectónico

La aplicación sigue una arquitectura **Offline-First con sincronización en la nube**:

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (React)                  │
├─────────────────────────────────────────────────────┤
│  UI Components (shadcn/ui + custom)                 │
│  ├─ Pages                                           │
│  ├─ Forms                                           │
│  ├─ Charts & Visualizations                        │
│  └─ Layout Components                               │
├─────────────────────────────────────────────────────┤
│  State Management                                   │
│  ├─ AppContext (Global State)                      │
│  ├─ React Query (Server State)                     │
│  └─ Local Component State                          │
├─────────────────────────────────────────────────────┤
│  Business Logic                                     │
│  ├─ Custom Hooks                                    │
│  ├─ Utility Functions                               │
│  └─ AI Integration Layer                            │
├─────────────────────────────────────────────────────┤
│  Data Layer                                         │
│  ├─ LocalStorage (Offline-First)                   │
│  ├─ Supabase Client                                 │
│  └─ Blockchain Clients (Hedera, Ethers)            │
└─────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────┐
│              SERVICE WORKER (PWA)                   │
│  ├─ Asset Caching                                   │
│  ├─ API Response Caching                            │
│  └─ Push Notifications                              │
└─────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────┐
│                 BACKEND SERVICES                    │
├─────────────────────────────────────────────────────┤
│  Supabase                                           │
│  ├─ PostgreSQL Database                             │
│  ├─ Authentication                                  │
│  ├─ Storage (Files)                                 │
│  └─ Realtime Subscriptions                          │
├─────────────────────────────────────────────────────┤
│  Vercel Serverless Functions                        │
│  └─ Custom API Endpoints                            │
├─────────────────────────────────────────────────────┤
│  External APIs                                      │
│  ├─ Google Gemini AI                                │
│  ├─ Hedera Network                                  │
│  └─ Plume Network                                   │
└─────────────────────────────────────────────────────┘
```

### Flujo de Datos

#### 1. **Modo Offline (Sin conexión)**

```
User Action → Component → Hook → LocalStorage → UI Update
```

#### 2. **Modo Online con Sincronización**

```
User Action → Component → Hook → LocalStorage + Supabase → UI Update
                                        ↓
                                  Conflict Detection → Modal → User Decision
```

#### 3. **Consulta de Datos**

```
Component Mount → React Query → Check Cache →
  Cache Hit: Return cached data ↓
  Cache Miss: Fetch from Supabase → Update Cache → UI Update
```

### Principios de Diseño

1. **Offline-First**: Todos los datos se guardan primero en LocalStorage
2. **Sincronización Inteligente**: Detección de conflictos entre datos locales y remotos
3. **Optimistic UI**: Actualizaciones inmediatas en la UI, sincronización en background
4. **Mobile-First**: Diseño responsive con enfoque mobile
5. **Progressive Enhancement**: Funcionalidades avanzadas disponibles según capacidades
6. **Component Composition**: Componentes reutilizables y composables

---

## 4. Estructura del Proyecto

```
polarisHub/
├── public/                      # Assets públicos
│   ├── llms.txt                 # Documentación para LLMs
│   ├── manifest.json            # Manifest PWA
│   ├── robots.txt               # SEO
│   ├── sitemap.xml              # SEO
│   ├── sw.js                    # Service Worker
│   └── SVG/                     # Iconos SVG
│
├── src/
│   ├── components/              # Componentes React
│   │   ├── dashboard/           # Componentes específicos del dashboard
│   │   │   ├── BalanceHistory.tsx
│   │   │   ├── CashFlowAlerts.tsx
│   │   │   ├── GoalsState.tsx
│   │   │   └── RecurringPaymentsCard.tsx
│   │   │
│   │   ├── forms/               # Formularios
│   │   │   ├── ExpenseForm.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   ├── SaleForm.tsx
│   │   │   ├── ServiceForm.tsx
│   │   │   ├── ServiceIncomeForm.tsx
│   │   │   └── TagSelector.tsx
│   │   │
│   │   ├── inventory/           # Componentes de inventario
│   │   │   ├── BarcodeScanner.tsx
│   │   │   └── ExpirationAlerts.tsx
│   │   │
│   │   ├── layout/              # Layout principal
│   │   │   └── AppLayout.tsx    # Sidebar y estructura
│   │   │
│   │   └── ui/                  # Componentes UI reutilizables
│   │       ├── accordion.tsx
│   │       ├── AISalesForecast.tsx
│   │       ├── alert.tsx
│   │       ├── AutoSyncIndicator.tsx
│   │       ├── badge.tsx
│   │       ├── BottomTabbar.tsx
│   │       ├── button.tsx
│   │       ├── calendar.tsx
│   │       ├── card.tsx
│   │       ├── ChatbotUI.tsx
│   │       ├── DataComparisonModal.tsx
│   │       ├── DataTable.tsx
│   │       ├── dialog.tsx
│   │       ├── ExportButtons.tsx
│   │       ├── FloatingButton.tsx
│   │       ├── form.tsx
│   │       ├── input.tsx
│   │       ├── MetricCard.tsx
│   │       ├── select.tsx
│   │       ├── SyncConflictModal.tsx
│   │       ├── tabs.tsx
│   │       ├── toast.tsx
│   │       └── ... (30+ componentes más)
│   │
│   ├── contexts/                # Contextos de React
│   │   └── AppContext.tsx       # Contexto global de la app
│   │
│   ├── database/                # Scripts y documentación de DB
│   │   ├── PERSONAL_WALLETS_GUIDE.md
│   │   ├── search_users_rpc.sql
│   │   ├── SUPABASE_INDEX.sh
│   │   ├── SUPABASE_PROJECTS_SCHEMA.sql
│   │   ├── SUPABASE_QUERIES_REFERENCE.sql
│   │   ├── SUPABASE_QUICK_SETUP.sql
│   │   ├── supabase_setup.sql
│   │   └── USDC_TRANSFERS_GUIDE.md
│   │
│   ├── hooks/                   # Custom hooks
│   │   ├── use-chatbot.tsx
│   │   ├── use-mobile.tsx
│   │   ├── use-notification-push.ts
│   │   ├── use-sales-prediction.ts
│   │   ├── use-service-worker-notifications.ts
│   │   ├── use-supabase-auth.ts
│   │   ├── use-supabase-sync.ts
│   │   └── use-toast.ts
│   │
│   ├── lib/                     # Utilidades y librerías
│   │   ├── ai/                  # Módulos de IA
│   │   │   ├── agendaPlanner.ts
│   │   │   ├── categorySuggester.ts
│   │   │   ├── chatbot.ts
│   │   │   ├── goalGenerator.ts
│   │   │   ├── invoiceGenerator.ts
│   │   │   ├── postGenerator.ts
│   │   │   ├── reportGenerator.ts
│   │   │   └── salesPredictor.ts
│   │   │
│   │   ├── api-client.ts        # Cliente de API
│   │   ├── crypto.ts            # Encriptación/Desencriptación
│   │   ├── exportUtils.ts       # Exportación de datos
│   │   ├── notifications.ts     # Sistema de notificaciones
│   │   ├── personalWallets.ts   # Gestión de wallets personales
│   │   ├── serviceWorker.ts     # Configuración del SW
│   │   ├── storage.ts           # LocalStorage y tipos de datos
│   │   ├── supabase.ts          # Cliente de Supabase
│   │   ├── utils.ts             # Utilidades generales
│   │   └── wallet.ts            # Integración blockchain
│   │
│   ├── pages/                   # Páginas de la aplicación
│   │   ├── Agenda.tsx           # Calendario y eventos
│   │   ├── Analisis.tsx         # Análisis y gráficos
│   │   ├── Chatbot.tsx          # Asistente IA
│   │   ├── Comparador.tsx       # Comparación de datos
│   │   ├── Configuracion.tsx    # Configuración de la app
│   │   ├── Dashboard.tsx        # Panel principal
│   │   ├── Deudas.tsx           # Control de deudas
│   │   ├── Facturador.tsx       # Generación de facturas
│   │   ├── Gasto.tsx            # Detalle de gasto
│   │   ├── Gastos.tsx           # Lista de gastos
│   │   ├── Herramientas.tsx     # Hub de herramientas
│   │   ├── History.tsx          # Historial blockchain
│   │   ├── Index.tsx            # Página de inicio
│   │   ├── Ingreso.tsx          # Detalle de ingreso
│   │   ├── Inventario.tsx       # Gestión de inventario
│   │   ├── Item.tsx             # Detalle de producto
│   │   ├── Metas.tsx            # Metas financieras
│   │   ├── MiniCRM.tsx          # CRM simple
│   │   ├── NotFound.tsx         # Página 404
│   │   ├── Notificaciones.tsx   # Centro de notificaciones
│   │   ├── Onboarding.tsx       # Registro/Login
│   │   ├── PagosRecurrentes.tsx # Pagos recurrentes
│   │   ├── PostsRedes.tsx       # Generación de posts
│   │   ├── PreciosDinamicos.tsx # Calculadora de precios
│   │   ├── Premium.tsx          # Planes premium
│   │   ├── Proveedores.tsx      # Gestión de proveedores
│   │   ├── Proyecciones.tsx     # Proyecciones financieras
│   │   ├── Reportes.tsx         # Reportes y exportación
│   │   ├── Servicios.tsx        # Catálogo de servicios
│   │   ├── Teams.tsx            # Equipos (en construcción)
│   │   ├── Ventas.tsx           # Lista de ingresos
│   │   └── Wallet.tsx           # Billetera blockchain
│   │
│   ├── scripts/                 # Scripts de utilidad
│   │   └── clean-env-history.cjs
│   │
│   ├── App.css                  # Estilos de la app
│   ├── App.tsx                  # Componente raíz
│   ├── index.css                # Estilos globales
│   ├── main.tsx                 # Punto de entrada
│   ├── README_LOCAL_SETUP.md    # Guía de setup local
│   └── vite-env.d.ts            # Tipos de Vite
│
├── components.json              # Configuración de shadcn/ui
├── eslint.config.js             # Configuración ESLint
├── index.html                   # HTML principal
├── LICENSE.md                   # Licencia GPL-3.0
├── package.json                 # Dependencias
├── postcss.config.js            # Configuración PostCSS
├── tailwind.config.ts           # Configuración Tailwind
├── tsconfig.json                # Configuración TypeScript
├── tsconfig.app.json            # TS config para app
├── tsconfig.node.json           # TS config para Node
├── vercel.json                  # Configuración Vercel
└── vite.config.ts               # Configuración Vite
```

---

## 5. Funcionalidades Principales

### 5.1 Gestión Financiera

#### **Ingresos/Ventas**

- Registro de ventas individuales con múltiples campos:
  - Monto, fecha, categoría, descripción
  - Vinculación con productos (con descuento automático de inventario)
  - Vinculación con clientes
  - Sistema de tags personalizables
- Registro de ingresos por servicios:
  - Precio fijo o variable
  - Cantidad de servicios realizados
  - Descuento automático de items del inventario vinculados al servicio
  - Creación automática de gastos asociados (ej: comisión de inversor)
- Filtros avanzados:
  - Por período (hoy, semana, mes, todo)
  - Por rango de montos (mín/máx)
  - Por rango de fechas
  - Por tipo (producto/servicio)
  - Por categoría
- Métricas en tiempo real:
  - Total del período seleccionado
  - Ingresos de hoy vs ayer (con % de cambio)
  - Ingresos de la semana
  - Ingresos del mes
- Gráfico de tendencia de ingresos
- Vista detallada de cada ingreso con edición/eliminación
- **Modo Proyecto**: Los miembros del departamento de ventas pueden registrar ventas directamente en el proyecto compartido

#### **Gastos/Egresos**

- Registro de gastos con campos:
  - Monto, fecha, categoría, descripción
  - Sistema de tags personalizables
  - Vinculación opcional con clientes/proveedores
  - Marcado como recurrente
- Filtros similares a ingresos
- Métricas:
  - Total de gastos del período
  - Gastos de hoy
  - Comparativa semanal/mensual
- Gráficos de distribución por categoría
- Control de gastos recurrentes automáticos

#### **Balance y Flujo de Caja**

- Balance en tiempo real: Ingresos - Gastos
- Historial de balance día a día
- Gráfico de flujo de caja con múltiples períodos (7, 30, 90, 365 días)
- Alertas de flujo de caja:
  - Días con balance negativo
  - Tendencias preocupantes
  - Predicciones de problemas futuros

### 5.2 Gestión de Inventario

#### **Productos**

- Catálogo completo de productos con:
  - Nombre, cantidad, costo, precio de venta
  - Categoría, stock mínimo
  - Código de barras (con escaneo QR/barcode)
  - Fecha de vencimiento
  - Imagen del producto
  - Proveedor asociado
  - Precios adicionales (mayorista, distribuidor, etc.)
  - Productos NFT (opción de registrar en blockchain)
- **Productos compuestos**:
  - Posibilidad de crear productos que se ensamblan de otros
  - Control automático de componentes necesarios
  - Alertas de componentes faltantes para ensamblar
- Scanner de códigos de barras integrado
- Alertas de stock bajo
- Alertas de productos próximos a vencer
- Métricas:
  - Valor total del inventario (al costo)
  - Valor potencial de venta
  - Total de productos
  - Total de unidades
  - Productos con stock bajo
- Filtros:
  - Por stock (bajo stock / en stock)
  - Por búsqueda de texto (nombre, categoría, código de barras)
  - Por rango de precios
  - Por fecha de vencimiento
- Vista detallada de cada producto con historial de movimientos

#### **Proveedores**

- Catálogo de proveedores con:
  - Nombre, teléfono, email, dirección
  - Notas adicionales
- Órdenes de compra a proveedores:
  - Lista de productos ordenados
  - Estado (pendiente, ordenado, recibido, cancelado)
  - Monto total
  - Fecha esperada de entrega
- Al recibir una orden, actualiza automáticamente el inventario

### 5.3 Gestión de Servicios

#### **Catálogo de Servicios**

- Definición de servicios con:
  - Nombre y descripción
  - Tipo de precio (fijo o variable)
  - Precio base (si es fijo)
  - Items del inventario utilizados por servicio (con cantidad)
  - Gasto asociado automático (ej: % para inversor)

#### **Ingresos por Servicios**

- Registro de prestación de servicios
- Descuento automático del inventario según items vinculados
- Creación automática del gasto asociado si está configurado
- Integración completa con el sistema de ingresos

### 5.4 CRM Básico (Mini CRM)

#### **Clientes**

- Base de datos de clientes con:
  - Nombre, teléfono, email, dirección
  - Tipo: cliente o proveedor
  - Notas adicionales
- Vinculación de ventas con clientes
- Historial de compras por cliente
- Análisis de clientes más valiosos

#### **Trabajadores**

- Registro de empleados con:
  - Nombre, rol, salario
  - Teléfono, email
- Control de nómina

### 5.5 Análisis Financiero

#### **Dashboard Principal**

- Vista general del negocio con:
  - Balance del día
  - Ventas de hoy vs ayer (% de cambio)
  - Gastos del día
  - Ventas de la semana
  - Valor del inventario
  - Productos con stock bajo
  - Alertas de flujo de caja
  - Pagos recurrentes próximos
  - Estado de metas financieras
- Gráficos interactivos:
  - Flujo de caja (línea temporal)
  - Distribución de ventas vs gastos (barras)
- Períodos configurables: 7, 30, 90, 365 días
- **Modo Proyecto**: Dashboard específico del proyecto con datos del equipo

#### **Análisis Avanzado**

- Página dedicada a análisis con:
  - Tendencias de ventas por categoría
  - Comparativa de períodos
  - Distribución de gastos
  - Productos más vendidos
  - Análisis de rentabilidad por producto
  - Estacionalidad de ventas

#### **Comparador**

- Comparación visual de datos entre dos períodos
- Métricas de crecimiento/decrecimiento
- Identificación de patrones

#### **Proyecciones**

- Predicciones de ventas con IA (Google Gemini)
- Proyecciones de flujo de caja
- Escenarios optimista/pesimista/realista
- Recomendaciones basadas en tendencias históricas

### 5.6 Reportes y Exportación

#### **Generación de Reportes**

- Reportes personalizables con selección de datos:
  - Ventas por período
  - Gastos por categoría
  - Estado de inventario
  - Balance financiero
- Asistente IA para generar reportes narrativos
- Visualización de datos con gráficos

#### **Exportación de Datos**

- Formatos disponibles:
  - JSON (backup completo)
  - CSV (ventas, gastos, inventario)
  - PDF (reportes formateados)
  - Excel (datos tabulares)
- Backup completo de todos los datos
- Restauración desde backup JSON

### 5.7 Herramientas Adicionales

#### **Facturador Offline**

- Generación de facturas PDF personalizadas
- Configuración de datos de negocio:
  - Logo, nombre, teléfono, dirección
- Inclusión automática de productos del inventario
- Cálculo automático de subtotales, impuestos y totales

#### **Agenda/Calendario**

- Gestión de eventos con:
  - Título, fecha, hora
  - Tipo (recordatorio, cita, pago, otro)
  - Descripción
  - Estado (completado/pendiente)
- Vista calendario mensual
- Notificaciones de eventos próximos
- Asistente IA para planificar agenda

#### **Metas Financieras**

- Definición de objetivos con:
  - Título, monto objetivo
  - Monto actual acumulado
  - Fecha límite
  - Categoría (ventas, ahorro, reducción de gastos, otro)
- Seguimiento de progreso con barra visual
- Metas de reinversión automática:
  - Porcentaje a reinvertir
  - Día del mes para ejecución
  - Vinculación con wallet blockchain
- Historial de reinversiones ejecutadas

#### **Pagos Recurrentes**

- Gestión de gastos fijos mensuales:
  - Nombre, monto, categoría
  - Frecuencia (diaria, semanal, mensual, anual)
  - Día del mes para pago
  - Estado activo/inactivo
- Creación automática de gastos al cumplirse la fecha
- Alertas de pagos próximos
- Historial de pagos realizados

#### **Precios Dinámicos**

- Calculadora de precios de venta con:
  - Costo del producto
  - Margen de ganancia deseado
  - Impuestos aplicables
  - Descuentos
- Sugerencias de precio por categoría
- Comparación con precios históricos

#### **Control de Deudas**

- Registro de deudas con:
  - Nombre de la persona
  - Monto
  - Tipo (me deben / debo)
  - Descripción y fecha límite
  - Estado (pagado/pendiente)
- Lista de deudas pendientes vs pagadas
- Recordatorios de vencimiento

#### **Posts para Redes Sociales**

- Generador de contenido con IA para promocionar el negocio
- Plantillas predefinidas
- Personalización con datos del negocio
- Generación automática de texto persuasivo

### 5.8 Chatbot Asistente (Polo)

- Asistente financiero con IA (Google Gemini)
- Conversaciones contextuales sobre finanzas del negocio
- Respuestas en formato Markdown
- Consejos accionables basados en los datos
- Análisis de situación financiera
- Recomendaciones personalizadas

---

## 6. Módulos y Páginas

### Estructura de Navegación

#### **Páginas Principales (Acceso desde Sidebar)**

1. **Dashboard** (`/`)
   - Vista general del negocio
   - Métricas clave
   - Gráficos de flujo de caja
   - Alertas importantes

2. **Ingresos** (`/ingresos`)
   - Lista de ventas e ingresos por servicios
   - Formulario de registro
   - Filtros avanzados
   - Métricas de ingresos

3. **Gastos** (`/gastos`)
   - Lista de gastos
   - Formulario de registro
   - Filtros y categorización
   - Análisis de gastos

4. **Inventario** (`/inventario`)
   - Catálogo de productos
   - Scanner de códigos de barras
   - Alertas de stock y vencimiento
   - Gestión de productos compuestos

5. **Servicios** (`/servicios`)
   - Catálogo de servicios
   - Registro de ingresos por servicios
   - Configuración de servicios
   - Análisis de servicios

6. **Análisis** (`/analisis`)
   - Gráficos avanzados
   - Tendencias
   - Análisis por categorías
   - Productos más vendidos

7. **Proyecciones** (`/proyecciones`)
   - Predicciones de ventas con IA
   - Escenarios financieros
   - Recomendaciones estratégicas

8. **Reportes** (`/reportes`)
   - Generación de reportes personalizados
   - Exportación de datos
   - Reportes con IA

9. **Herramientas** (`/herramientas`)
   - Hub de herramientas adicionales
   - Acceso a:
     - Facturador
     - Agenda
     - Mini CRM
     - Metas
     - Pagos Recurrentes
     - Precios Dinámicos
     - Control de Deudas
     - Posts para Redes

10. **Premium** (`/premium`)
    - Planes de suscripción
    - Features premium
    - Activación con código
    - Gestión de suscripción

11. **Configuración** (`/configuracion`)
    - Datos del negocio
    - Categorías y tags personalizados
    - Tema (light/dark)
    - Moneda y lenguaje
    - Backup y restauración
    - Sincronización en la nube

#### **Páginas de Herramientas**

12. **Facturador** (`/herramientas/facturador`)
    - Generación de facturas PDF

13. **Agenda** (`/herramientas/agenda`)
    - Calendario de eventos

14. **Mini CRM** (`/herramientas/crm`)
    - Gestión de clientes y trabajadores

15. **Metas** (`/herramientas/metas`)
    - Objetivos financieros

16. **Pagos Recurrentes** (`/herramientas/pagos-recurrentes`)
    - Gastos fijos mensuales

17. **Precios Dinámicos** (`/herramientas/precios`)
    - Calculadora de precios

18. **Deudas** (`/herramientas/deudas`)
    - Control de créditos y deudas

19. **Posts para Redes** (`/herramientas/posts`)
    - Generador de contenido

#### **Páginas Especiales**

20. **Onboarding** (`/onboarding`)
    - Registro e inicio de sesión
    - Creación de cuenta
    - Verificación de email

21. **Chatbot** (`/chatbot`)
    - Asistente financiero con IA

22. **Wallet** (`/wallet`)
    - Gestión de wallets blockchain
    - Wallets personales
    - Wallets de proyectos
    - Transferencias y balance

23. **History** (`/history`)
    - Historial blockchain de proyectos
    - NFTs de períodos cerrados

24. **Teams** (`/teams`)
    - Gestión de equipos (en construcción)
    - Proyectos colaborativos

25. **Detalle de Ingreso** (`/ingresos/:id`)
    - Vista detallada de un ingreso específico

26. **Detalle de Gasto** (`/gastos/:id`)
    - Vista detallada de un gasto específico

27. **Detalle de Producto** (`/inventario/:id`)
    - Vista detallada de un producto

28. **Comparador** (`/compar/:pair`)
    - Comparación de datos entre períodos

29. **404 Not Found** (`*`)
    - Página de error para rutas no encontradas

### Sistema de Permisos por Departamento

Los proyectos colaborativos tienen permisos específicos según departamento:

```typescript
DEPARTMENT_PERMISSIONS = {
  direccion: ["all"], // Acceso total
  economia: ["all"], // Acceso total
  recursos_humanos: ["/herramientas/crm", "/configuracion"],
  marketing: ["/analisis", "/proyecciones", "/herramientas/posts"],
  ventas: ["/ingresos", "/inventario", "/herramientas/crm"],
  logistica: ["/inventario", "/gastos"],
};
```

Las rutas no permitidas muestran una alerta indicando la restricción.

---

## 7. Sistema de Datos

### Modelo de Datos

#### **AppData: Estructura Principal**

```typescript
interface AppData {
  // Transacciones financieras
  sales: Sale[];
  expenses: Expense[];
  serviceIncomes: ServiceIncome[];

  // Inventario y catálogos
  products: Product[];
  services: Service[];
  suppliers: Supplier[];
  supplierOrders: SupplierOrder[];

  // CRM
  clients: Client[];
  workers: Worker[];

  // Planificación
  events: CalendarEvent[];
  goals: FinancialGoal[];
  reinvestmentGoals: ReinvestmentGoal[];
  reinvestmentExecutions: ReinvestmentExecution[];

  // Finanzas
  debts: Debt[];
  recurringPayments: RecurringPayment[];
  walletFunds: WalletFund[];
  departmentBudgetTransactions: DepartmentBudgetTransaction[];

  // Personalización
  customTags: string[];
  customCategories: string[];

  // Configuración
  settings: AppSettings;
}
```

#### **Sale (Venta)**

```typescript
interface Sale {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  category: string;
  description?: string;
  productId?: string; // Vinculación con producto
  quantity?: number;
  tags?: string[];
  clientId?: string; // Vinculación con cliente
}
```

#### **Expense (Gasto)**

```typescript
interface Expense {
  id: string;
  date: string;
  amount: number;
  category: string;
  description?: string;
  tags?: string[];
  isRecurring?: boolean | string;
  recurringId?: string; // ID del pago recurrente que lo generó
  recurringTime?: string;
  clientId?: string;
}
```

#### **Product (Producto)**

```typescript
interface Product {
  id: string;
  name: string;
  quantity: number;
  cost: number; // Costo de adquisición
  price: number; // Precio de venta
  category?: string;
  minStock?: number;
  expirationDate?: string;
  barcode?: string;
  supplierId?: string;
  additionalPrices?: {
    id: string;
    name: string;
    price: number;
  }[];
  isNft?: boolean;
  nftAddress?: string;
  nftMarketplace?: string;
  type?: "simple" | "compound"; // Producto simple o compuesto
  components?: {
    productId: string;
    quantity: number;
  }[];
}
```

#### **Service (Servicio)**

```typescript
interface Service {
  id: string;
  name: string;
  priceType: "fixed" | "variable";
  price?: number; // Para precio fijo
  description?: string;
  items?: {
    productId: string;
    quantity: number; // Cantidad utilizada por servicio
  }[];
  associatedExpense?: {
    category: string;
    percent: number; // % del ingreso bruto
  };
  createdAt: string;
}
```

#### **ServiceIncome (Ingreso por Servicio)**

```typescript
interface ServiceIncome {
  id: string;
  date: string;
  serviceId: string;
  amount: number;
  quantity?: number;
  description?: string;
  tags?: string[];
  clientId?: string;
}
```

#### **Client (Cliente/Proveedor)**

```typescript
interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  type: "cliente" | "proveedor";
  notes?: string;
  createdAt: string;
}
```

#### **Supplier (Proveedor de Inventario)**

```typescript
interface Supplier {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  createdAt: string;
}
```

#### **SupplierOrder (Orden de Compra)**

```typescript
interface SupplierOrder {
  id: string;
  supplierId: string;
  items: {
    productId?: string;
    productName: string;
    quantity: number;
    cost: number;
  }[];
  status: "pending" | "ordered" | "received" | "cancelled";
  totalAmount: number;
  expectedDate?: string;
  notes?: string;
  createdAt: string;
}
```

#### **Worker (Trabajador)**

```typescript
interface Worker {
  id: string;
  name: string;
  role?: string;
  salary: number;
  phone?: string;
  email?: string;
  createdAt: string;
}
```

#### **CalendarEvent (Evento de Agenda)**

```typescript
interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: "recordatorio" | "cita" | "pago" | "otro";
  description?: string;
  completed: boolean;
}
```

#### **FinancialGoal (Meta Financiera)**

```typescript
interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: "ventas" | "ahorro" | "reduccion_gastos" | "otro";
  createdAt: string;
}
```

#### **ReinvestmentGoal (Meta de Reinversión Automática)**

```typescript
interface ReinvestmentGoal {
  id: string;
  name: string;
  percentage: number; // % de ganancias a reinvertir
  dayOfMonth: number; // Día del mes para ejecutar
  isActive: boolean;
  walletId?: string; // Wallet desde la cual se descuenta
  createdAt: string;
}
```

#### **Debt (Deuda)**

```typescript
interface Debt {
  id: string;
  personName: string;
  amount: number;
  type: "me_deben" | "debo";
  description?: string;
  dueDate?: string;
  paid: boolean;
  createdAt: string;
}
```

#### **RecurringPayment (Pago Recurrente)**

```typescript
interface RecurringPayment {
  id: string;
  name: string;
  amount: number;
  category: string;
  frequency: "diaria" | "semanal" | "mensual" | "anual";
  dayOfMonth?: number;
  isActive: boolean;
  lastPaidDate?: string;
  createdAt: string;
}
```

#### **AppSettings (Configuración)**

```typescript
interface AppSettings {
  currency: string;
  currencySymbol: string;
  language: string;
  theme: "light" | "dark" | "system";
  businessName?: string;
  businessLogo?: string;
  businessPhone?: string;
  businessAddress?: string;
  businessEmail?: string;
  businessTaxId?: string;
  isPremium?: boolean;
  notificationsEnabled?: boolean;
  autoSyncEnabled?: boolean;
  defaultProductCategory?: string;
  defaultExpenseCategory?: string;
}
```

### Flujo de Actualización de Datos

1. **Acción del Usuario** → Form Submit
2. **Validación** → Zod Schema
3. **Actualización del Estado Local** → Context API
4. **Persistencia Inmediata** → LocalStorage
5. **Sincronización en Background** (si está online y es premium):
   - Verificación de conflictos
   - Merge inteligente o modal de decisión
   - Actualización en Supabase
6. **Actualización de UI** → React Query invalida cache
7. **Confirmación Visual** → Toast notification

---

## 8. Integración con Base de Datos

### Supabase: Arquitectura de Base de Datos

#### **Tablas Principales**

##### 1. **`backups`** - Respaldo de Datos de Usuario

```sql
CREATE TABLE backups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL, -- AppData completo
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

- Almacena el snapshot completo de `AppData` en formato JSON
- Un registro por usuario
- Se actualiza en cada sincronización

##### 2. **`wallets`** - Wallets Hedera de Usuarios

```sql
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL, -- Account ID de Hedera
  privateKey TEXT NOT NULL, -- Encriptado
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

##### 3. **`personal_wallets`** - Wallets Personales para Múltiples Monedas

```sql
CREATE TABLE personal_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  balance NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

- Permite crear múltiples wallets (Principal, USDC, Bitcoin, etc.)
- Balance controlado localmente

##### 4. **`personal_wallet_transfers`** - Historial de Transferencias entre Wallets

```sql
CREATE TABLE personal_wallet_transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  fromWalletId UUID REFERENCES personal_wallets(id),
  toWalletId UUID REFERENCES personal_wallets(id),
  amount NUMERIC NOT NULL,
  description TEXT,
  date TIMESTAMPTZ DEFAULT NOW()
);
```

##### 5. **`projects`** - Proyectos Colaborativos

```sql
CREATE TABLE projects (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT, -- URL del logo
  type TEXT CHECK (type IN ('tradicional', 'digital')),
  members JSONB DEFAULT '[]', -- Array de {email, role, departament}
  departaments TEXT[] DEFAULT '{}',
  wallets JSONB DEFAULT '[]', -- Array de {name, address, privateKey}
  nft_collection TEXT, -- Token ID de la colección NFT del proyecto
  initial_balance NUMERIC,
  data JSONB DEFAULT '{}', -- AppData específico del proyecto
  history JSONB DEFAULT '[]', -- Historial de períodos cerrados
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

- Almacena proyectos de equipos
- `members`: Lista de miembros con su rol y departamento
- `wallets`: Una wallet Hedera por departamento
- `data`: Estado compartido del proyecto (ventas, gastos, inventario, etc.)
- `history`: Array de períodos cerrados con sus NFTs asociados

##### 6. **Tablas Específicas de Proyectos** (opcional, para estructura relacional)

- `project_sales`
- `project_expenses`
- `project_products`
- `project_clients`
- `project_workers`
- `project_events`
- ... (uno por cada entidad)

Estas tablas permiten una estructura más relacional en lugar de guardar todo en el campo `data` JSONB.

#### **Row Level Security (RLS)**

Todas las tablas tienen políticas RLS habilitadas:

```sql
-- Ejemplo para backups
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own backups" ON backups
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own backups" ON backups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own backups" ON backups
  FOR UPDATE USING (auth.uid() = user_id);
```

Para proyectos, se usa una función helper:

```sql
CREATE FUNCTION is_project_member(_project_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM projects p, jsonb_array_elements(p.members) m
    WHERE p.id = _project_id
      AND m->>'email' = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Members can view project" ON projects
  FOR SELECT USING (is_project_member(id));
```

### Sistema de Sincronización

#### **Hook: `useSupabaseSync`**

Funcionalidades:

- **Auto-sincronización**: Guarda en Supabase cada vez que cambian los datos locales
- **Detección de conflictos**: Compara estadísticas (productos, ventas, clientes) entre local y nube
- **Modal de resolución**: Si hay conflicto, muestra modal para que el usuario decida
- **Indicador de estado**: Muestra si está sincronizando, última hora de sync, si está online

#### **Flujo de Sincronización**

```
1. Usuario modifica datos locales
   ↓
2. AppContext actualiza localStorage
   ↓
3. useSupabaseSync detecta cambio
   ↓
4. Verifica si hay inicialización completa
   ↓
5. Compara con datos en la nube
   ↓
6a. No hay conflicto → Sube datos
6b. Conflicto detectado → Muestra modal → Usuario decide:
    - Restaurar desde nube → Sobrescribe local
    - Mantener local → Sube forzadamente
   ↓
7. Actualiza timestamp de última sincronización
```

#### **Detección de Conflictos**

Se considera conflicto cuando:

- Local está vacío pero la nube tiene datos (nuevo dispositivo)
- La nube tiene más datos que local (posible pérdida de datos)

Prevención de sobrescritura:

- No se sincroniza durante la carga inicial
- Flag `isInitialCheckDone` previene sincronizaciones prematuras

#### **Modal de Conflicto**

Cuando se detecta un conflicto, aparece un modal mostrando:

- Estadísticas de la nube (productos, ventas, clientes)
- Estadísticas locales
- Opciones:
  - **Restaurar desde nube**: Reemplaza los datos locales con los de la nube
  - **Mantener local**: Sube forzadamente los datos locales
  - **Cancelar**: No hacer nada

---

## 9. Sistema de Autenticación

### Supabase Auth

#### **Registro de Usuarios**

```typescript
const register = async (email: string, password: string) => {
  // 1. Crear usuario en Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  // 2. Enviar email de verificación (automático)

  // 3. Crear wallet Hedera (testnet) para el usuario
  const wallet = await createHederaWallet();
  const encryptedKey = encrypt(wallet.privateKey, passphrase);

  // 4. Guardar wallet en tabla `wallets`
  await supabase.from("wallets").insert({
    userId: data.user.id,
    address: wallet.accountId,
    privateKey: encryptedKey,
  });

  // 5. Crear wallets personales por defecto
  await createPersonalWallet(data.user.id, "Principal", 0);
  await createPersonalWallet(data.user.id, "USDC", 0);
};
```

#### **Inicio de Sesión**

```typescript
const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // Usuario autenticado automáticamente
  // Context API detecta cambio y actualiza estado
};
```

#### **Verificación de Email**

- Supabase envía automáticamente un email de verificación al registrarse
- El usuario debe verificar su email antes de usar ciertas funcionalidades premium
- Se muestra mensaje de verificación pendiente en la UI

#### **Cierre de Sesión**

```typescript
const logout = async () => {
  await supabase.auth.signOut();
  // Context API limpia el estado del usuario
};
```

#### **Sesiones Persistentes**

- Supabase mantiene la sesión del usuario en cookies
- Al recargar la página, se verifica la sesión automáticamente
- Hook `useSupabaseAuth` inicializa con la sesión activa

### Protección de Rutas

#### **ProtectedRoute Component**

```typescript
const ProtectedRoute = ({ children }) => {
  const { supabaseAuth } = useApp()

  if (supabaseAuth.loading) {
    return <LoadingSpinner />
  }

  if (!supabaseAuth.user) {
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}
```

Todas las rutas de la aplicación están envueltas en `ProtectedRoute` excepto `/onboarding`.

#### **PublicRoute Component**

```typescript
const PublicRoute = ({ children }) => {
  const { supabaseAuth } = useApp()

  if (supabaseAuth.user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
```

Redirige al dashboard si el usuario ya está autenticado.

---

## 10. Sistema de Sincronización

### Offline-First Architecture

La aplicación sigue el patrón **Offline-First**:

1. **Todos los datos se guardan primero en LocalStorage**
2. **La app funciona completamente offline**
3. **La sincronización con Supabase es opcional (solo para premium)**
4. **Los datos locales son la fuente de verdad hasta sincronización exitosa**

### LocalStorage como Fuente de Verdad

```typescript
// src/lib/storage.ts

export const loadData = (): AppData => {
  const stored = localStorage.getItem("negocio360_data");
  if (!stored) return defaultData;
  return JSON.parse(stored);
};

export const saveData = (data: AppData) => {
  localStorage.setItem("negocio360_data", JSON.stringify(data));
  localStorage.setItem("negocio360_data_updated", Date.now().toString());
};
```

### AppContext: Gestión de Estado Global

El `AppContext` centraliza todo el estado de la aplicación:

```typescript
export const AppProvider = ({ children }) => {
  const [data, setData] = useState<AppData>(() => loadData());

  // Auto-save en localStorage cada vez que cambia el estado
  useEffect(() => {
    saveData(data);
  }, [data]);

  // Sincronización con Supabase (si premium)
  useEffect(() => {
    if (isPremium && isOnline && user) {
      supabaseSync.saveToSupabase(data);
    }
  }, [data, isPremium, isOnline]);

  // ... métodos CRUD para cada entidad
};
```

### React Query para Proyectos Colaborativos

Para proyectos de equipo, se usa **TanStack Query** (React Query):

```typescript
const { data: projectData } = useQuery({
  queryKey: ["project-data", projectId],
  enabled: !!projectId,
  queryFn: async () => {
    const { data } = await supabase
      .from("projects")
      .select("data")
      .eq("id", projectId)
      .single();
    return data?.data as AppData;
  },
});
```

### Estrategias de Sincronización

#### **1. Sincronización Manual**

- Botón de sincronización en configuración
- Útil para forzar sincronización después de resolver conflictos

#### **2. Sincronización Automática**

- Cada vez que se modifica un dato local (si hay conexión)
- Intervalo configurable (por defecto: inmediato)

#### **3. Sincronización al Reconectar**

- Listener de evento `online` del navegador
- Al volver a tener conexión, verifica y sincroniza

#### **4. Sincronización al Cerrar**

- Hook `beforeunload` para sincronizar antes de cerrar la pestaña

### Indicador de Estado de Sincronización

```typescript
<AutoSyncIndicator
  isSyncing={supabaseSync.isSyncing}
  isOnline={supabaseSync.isOnline}
  lastSyncTime={supabaseSync.lastSyncTime}
/>
```

Muestra:

- Icono de nube sincronizando
- Estado online/offline
- Última hora de sincronización exitosa
- Errores de sincronización

---

## 11. Funcionalidades de Inteligencia Artificial

### Google Gemini Integration

La aplicación integra **Google Gemini AI** para múltiples funcionalidades inteligentes.

#### **API Key y Configuración**

```typescript
// .env
VITE_GOOGLE_AI_API_KEY = tu_api_key_aqui;

// src/lib/ai/*.ts
function getGeminiClient() {
  const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
  return new GoogleGenerativeAI(apiKey);
}
```

### Módulos de IA

#### **1. Chatbot Financiero (Polo)**

**Archivo**: `src/lib/ai/chatbot.ts`  
**Modelo**: `gemini-2.5-flash-lite`

```typescript
export async function sendChatMessage(
  conversation: ChatMessage[],
  modelName = "gemini-2.5-flash-lite",
): Promise<string>;
```

**Funcionalidades**:

- Asistente conversacional sobre finanzas del negocio
- Análisis contextual de situación financiera
- Consejos accionables basados en datos
- Respuestas en formato Markdown estructurado
- Persona definida: "Polo, asistente financiero profesional"

**Configuración del Prompt**:

```typescript
const systemIntro = `
SYSTEM: Eres Polo, un asistente financiero extremadamente profesional, 
objetivo y conciso. Responde en castellano y ofrece consejos accionables 
basados en el contexto proporcionado. Responde utilizando formato Markdown 
para todas las respuestas.
`;
```

#### **2. Predicción de Ventas**

**Archivo**: `src/lib/ai/salesPredictor.ts`  
**Modelo**: `gemini-1.5-flash`

```typescript
export async function predictSales(
  sales: SalesData[],
  daysAhead: number = 30,
): Promise<PredictionResult>;
```

**Funcionalidades**:

- Análisis de series temporales
- Predicción de ventas para los próximos N días
- Cálculo de tendencias (creciente, estable, decreciente)
- Detección de estacionalidad
- Nivel de confianza de predicciones
- Recomendaciones estratégicas personalizadas

**Métricas Calculadas**:

- Promedio diario, semanal, mensual
- Volatilidad (desviación estándar)
- Tendencia porcentual
- Análisis de estacionalidad

**Output**:

```typescript
{
  dates: string[], // Fechas futuras
  predicted: number[], // Ventas predichas
  confidence: number, // 0-100
  analysis: string, // Análisis contextual
  trend: "growing" | "stable" | "declining",
  recommendations: string[] // Recomendaciones accionables
}
```

#### **3. Generador de Reportes**

**Archivo**: `src/lib/ai/reportGenerator.ts`  
**Modelo**: `gemini-1.5-flash`

```typescript
export async function generateReport(
  reportType: string,
  data: any,
  options?: ReportOptions,
): Promise<string>;
```

**Tipos de Reportes**:

- Reporte de ventas
- Reporte de gastos
- Análisis de inventario
- Balance financiero
- Reportes personalizados

**Funcionalidades**:

- Narrativa inteligente de datos
- Identificación de insights clave
- Formato Markdown estructurado
- Gráficos y tablas sugeridas
- Conclusiones y recomendaciones

#### **4. Sugeridor de Categorías**

**Archivo**: `src/lib/ai/categorySuggester.ts`  
**Modelo**: `gemini-1.5-flash`

```typescript
export async function suggestCategory(
  description: string,
  type: "expense" | "sale",
): Promise<string>;
```

**Funcionalidades**:

- Sugerencia automática de categoría basada en descripción
- Aprende de categorías existentes
- Contexto de negocio específico

#### **5. Generador de Posts para Redes**

**Archivo**: `src/lib/ai/postGenerator.ts`  
**Modelo**: `gemini-1.5-flash`

```typescript
export async function generateSocialPost(
  theme: string,
  businessContext: BusinessContext,
): Promise<string>;
```

**Funcionalidades**:

- Generación de texto persuasivo para redes sociales
- Adaptación al tono del negocio
- Incluye hashtags relevantes
- Llamadas a la acción efectivas
- Personalización con datos del negocio

#### **6. Planificador de Agenda**

**Archivo**: `src/lib/ai/agendaPlanner.ts`  
**Modelo**: `gemini-1.5-flash`

```typescript
export async function suggestSchedule(
  events: CalendarEvent[],
  preferences: SchedulePreferences,
): Promise<ScheduleSuggestion>;
```

**Funcionalidades**:

- Sugerencias de organización de eventos
- Detección de conflictos de horario
- Optimización de tiempos
- Recordatorios inteligentes

#### **7. Generador de Facturas con IA**

**Archivo**: `src/lib/ai/invoiceGenerator.ts`  
**Modelo**: `gemini-1.5-flash`

```typescript
export async function enhanceInvoiceText(invoice: InvoiceData): Promise<string>;
```

**Funcionalidades**:

- Mejora de descripciones de items
- Generación de términos y condiciones
- Notas profesionales
- Textos de agradecimiento personalizados

#### **8. Generador de Metas**

**Archivo**: `src/lib/ai/goalGenerator.ts`  
**Modelo**: `gemini-1.5-flash`

```typescript
export async function suggestGoals(
  financialData: FinancialSummary,
): Promise<GoalSuggestion[]>;
```

**Funcionalidades**:

- Sugerencia de metas financieras realistas
- Basado en historial de desempeño
- Objetivos SMART (específicos, medibles, alcanzables, relevantes, temporales)
- Estrategias para alcanzar metas

### Hooks de IA

#### **useChatbot**

```typescript
const { messages, sendMessage, isLoading, error } = useChatbot();
```

Gestiona el estado del chatbot con historial de conversación.

#### **useSalesPrediction**

```typescript
const { prediction, isLoading, error } = useSalesPrediction(sales, daysAhead);
```

Realiza predicciones de ventas automáticamente.

#### **useSalesInsights**

```typescript
const { insights, isLoading } = useSalesInsights(sales);
```

Genera insights automáticos de ventas.

### Límites y Consideraciones

- **Google Gemini API**: Plan gratuito con límites generosos
- **Rate Limiting**: Gestión de límites de tasa
- **Fallbacks**: Si falla la IA, la app sigue funcionando (graceful degradation)
- **Cache**: Resultados de IA se cachean para evitar llamadas repetitivas
- **Privacy**: Los datos no se almacenan en servidores de Google más allá de lo necesario para la generación

---

## 12. Sistema de Blockchain y Wallets

### Hedera (Hiero) Testnet Integration

La aplicación integra **Hedera Testnet** (también conocido como Hiero) para gestión de wallets y NFTs de trazabilidad.

#### **Creación de Wallets Hedera**

```typescript
// src/lib/wallet.ts

export async function createHederaWallet() {
  const client = Client.forTestnet(); // Hiero Testnet

  // Generar nueva clave privada
  const privateKey = PrivateKey.generate();
  const publicKey = privateKey.publicKey;

  // Crear cuenta en Hedera
  const transaction = new AccountCreateTransaction()
    .setKey(publicKey)
    .setInitialBalance(new Hbar(10)); // Balance inicial de testnet

  const response = await transaction.execute(client);
  const receipt = await response.getReceipt(client);

  return {
    accountId: receipt.accountId.toString(),
    privateKey: privateKey.toString(),
    publicKey: publicKey.toString(),
  };
}
```

#### **Transferencias de HBAR**

```typescript
export async function sendHbar(
  fromPrivateKey: string,
  toAccountId: string,
  amount: number, // En HBAR
) {
  const client = Client.forTestnet();
  const privateKey = PrivateKey.fromString(fromPrivateKey);

  const transaction = new TransferTransaction()
    .addHbarTransfer(privateKey.publicKey.toAccountId(), new Hbar(-amount))
    .addHbarTransfer(toAccountId, new Hbar(amount));

  const response = await transaction
    .freezeWith(client)
    .sign(privateKey)
    .execute(client);

  const receipt = await response.getReceipt(client);
  return receipt.status.toString();
}
```

#### **Consulta de Balance**

```typescript
export async function getHederaBalance(accountId: string) {
  const client = Client.forTestnet();
  const balance = await new AccountBalanceQuery()
    .setAccountId(accountId)
    .execute(client);

  return balance.hbars.toBigNumber().toNumber();
}
```

#### **Creación de Colección NFT**

Cada proyecto colaborativo tiene su propia colección NFT para almacenar historial:

```typescript
export async function createHederaNftCollection(
  projectName: string,
  ownerPrivateKey: string,
) {
  const client = Client.forTestnet();
  const privateKey = PrivateKey.fromString(ownerPrivateKey);

  const transaction = new TokenCreateTransaction()
    .setTokenName(`${projectName} History`)
    .setTokenSymbol("HIST")
    .setTokenType(TokenType.NonFungibleUnique)
    .setSupplyType(TokenSupplyType.Infinite)
    .setTreasuryAccountId(privateKey.publicKey.toAccountId());

  const response = await transaction.execute(client);
  const receipt = await response.getReceipt(client);

  return receipt.tokenId.toString();
}
```

#### **Minteo de NFT de Período Cerrado**

Cuando se cierra un período contable en un proyecto, se mintea un NFT:

```typescript
export async function mintNftForCollection(
  tokenId: string,
  metadata: PeriodMetadata,
  ownerPrivateKey: string,
) {
  const client = Client.forTestnet();
  const privateKey = PrivateKey.fromString(ownerPrivateKey);

  // Subir metadata a IPFS (Pinata)
  const ipfsHash = await uploadToIPFS(metadata);

  // Mintear NFT con CID de IPFS
  const transaction = new TokenMintTransaction()
    .setTokenId(tokenId)
    .setMetadata([Buffer.from(ipfsHash)]);

  const response = await transaction.execute(client);
  const receipt = await response.getReceipt(client);

  return {
    serialNumber: receipt.serials[0],
    ipfsHash,
    ipfsUri: `ipfs://${ipfsHash}`,
  };
}
```

### Plume Main Network Integration

**Plume** es una red blockchain para stablecoins. La app integra el token **PUSD** (Plume USD).

#### **Balance de PUSD**

```typescript
export async function getPusdBalance(address: string) {
  const provider = new ethers.JsonRpcProvider(PLUME_RPC_URL);
  const contract = new ethers.Contract(PUSD_ADDRESS, ERC20_ABI, provider);

  const balance = await contract.balanceOf(address);
  const decimals = await contract.decimals();

  return parseFloat(ethers.formatUnits(balance, decimals));
}
```

#### **Transferencias de PUSD**

```typescript
export async function sendPusd(
  fromPrivateKey: string,
  toAddress: string,
  amount: number,
) {
  const provider = new ethers.JsonRpcProvider(PLUME_RPC_URL);
  const signer = new ethers.Wallet(fromPrivateKey, provider);
  const contract = new ethers.Contract(PUSD_ADDRESS, ERC20_ABI, signer);

  const decimals = await contract.decimals();
  const amountBN = ethers.parseUnits(amount.toString(), decimals);

  const tx = await contract.transfer(toAddress, amountBN);
  await tx.wait();

  return tx.hash;
}
```

#### **Historial de Transferencias**

```typescript
export async function getPusdTransfers(address: string) {
  // Consulta al explorador de Plume
  const url = `${PLUME_EXPLORER_API}/api/v2/addresses/${address}/token-transfers?token=${PUSD_ADDRESS}`;
  const response = await fetch(url);
  const data = await response.json();

  return data.items.map((item) => ({
    from: item.from.hash,
    to: item.to.hash,
    value: parseFloat(
      ethers.formatUnits(item.total.value, item.total.decimals),
    ),
    timestamp: item.timestamp,
    txHash: item.tx_hash,
  }));
}
```

### Sistema de Wallets Personales

Los usuarios pueden crear múltiples wallets personales para organizar fondos:

#### **Creación de Wallet Personal**

```typescript
export async function createPersonalWallet(
  userId: string,
  name: string,
  initialBalance: number = 0,
) {
  const { data, error } = await supabase
    .from("personal_wallets")
    .insert({
      userId,
      name,
      balance: initialBalance,
    })
    .select()
    .single();

  return data;
}
```

#### **Transferencia entre Wallets Personales**

```typescript
export async function performTransfer(
  userId: string,
  fromWalletId: string,
  toWalletId: string,
  amount: number,
  description?: string,
) {
  // 1. Verificar balance suficiente
  const fromWallet = await getPersonalWallet(fromWalletId);
  if (fromWallet.balance < amount) {
    throw new Error("Balance insuficiente");
  }

  // 2. Actualizar balances
  await updateWalletBalance(fromWalletId, fromWallet.balance - amount);
  const toWallet = await getPersonalWallet(toWalletId);
  await updateWalletBalance(toWalletId, toWallet.balance + amount);

  // 3. Registrar transferencia
  await supabase.from("personal_wallet_transfers").insert({
    userId,
    fromWalletId,
    toWalletId,
    amount,
    description,
  });
}
```

### Wallets de Proyectos

Cada proyecto colaborativo tiene **una wallet Hedera por departamento**:

```typescript
type ProjectWallet = {
  name: string; // Departamento (ventas, marketing, etc.)
  address: string; // Account ID de Hedera
  privateKey: string; // Encriptado
};
```

#### **Creación de Wallets de Proyecto**

Al crear un proyecto, se generan wallets automáticamente:

```typescript
const wallets: ProjectWallet[] = [];

for (const departamento of departamentos) {
  const wallet = await createHederaWallet();
  const encryptedKey = encrypt(wallet.privateKey, passphrase);

  wallets.push({
    name: departamento,
    address: wallet.accountId,
    privateKey: encryptedKey,
  });
}
```

#### **Transacciones entre Departamentos**

```typescript
type DepartmentBudgetTransaction = {
  id: string;
  projectId: number;
  type: "assignment" | "request" | "emergency_withdrawal";
  fromDepartment: string;
  toDepartment: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  createdBy: string;
  createdByDepartment: string;
  reason?: string;
};
```

**Flujo de Asignación de Presupuesto**:

1. Dirección asigna presupuesto a departamentos
2. Se registra la transacción en `departmentBudgetTransactions`
3. Se ejecuta transferencia en Hedera (si está configurado)

**Flujo de Solicitud de Presupuesto**:

1. Departamento solicita presupuesto adicional
2. Dirección y Economía deben aprobar
3. Una vez aprobado, se ejecuta transferencia

### Historial Blockchain de Proyectos

Cada período cerrado en un proyecto se almacena como NFT:

```typescript
type PeriodHistory = {
  id: string;
  type: "period";
  startDate: string;
  endDate: string;
  totals: {
    ingresos: number;
    gastos: number;
    inventarioCoste: number;
    inventarioPrecio: number;
  };
  ipfsHash: string; // CID de IPFS (Pinata)
  ipfsUri: string; // ipfs://...
  ipfsGatewayUrl: string; // URL pública de Pinata
  tokenId: string; // Token ID de la colección
  serialNumber: number; // Serial del NFT
};
```

**Metadata en IPFS**:

```json
{
  "name": "Proyecto X - Período Q1 2024",
  "description": "Historial financiero del primer trimestre",
  "image": "ipfs://...",
  "attributes": [
    { "trait_type": "Start Date", "value": "2024-01-01" },
    { "trait_type": "End Date", "value": "2024-03-31" },
    { "trait_type": "Total Income", "value": 50000 },
    { "trait_type": "Total Expenses", "value": 30000 },
    { "trait_type": "Inventory Value", "value": 15000 }
  ],
  "data": {
    /* AppData completo del período */
  }
}
```

### Seguridad de Claves Privadas

#### **Encriptación**

```typescript
// src/lib/crypto.ts
import CryptoJS from "crypto-js";

export function encrypt(text: string, passphrase: string): string {
  return CryptoJS.AES.encrypt(text, passphrase).toString();
}

export function decrypt(ciphertext: string, passphrase: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, passphrase);
  return bytes.toString(CryptoJS.enc.Utf8);
}
```

#### **Variables de Entorno**

```env
VITE_ENCRIPTED_KEY=passphrase_super_secreta
```

- Todas las claves privadas se almacenan encriptadas en Supabase
- La passphrase está en variables de entorno (no en código)
- Las claves solo se desencriptan en memoria cuando son necesarias

---

## 13. Sistema de Equipos y Proyectos

### Proyectos Colaborativos

La aplicación permite crear **proyectos colaborativos** donde múltiples usuarios trabajan juntos.

#### **Estructura de un Proyecto**

```typescript
type Project = {
  id: number;
  name: string;
  image?: string; // Logo del proyecto
  type: "tradicional" | "digital";
  members: ProjectMember[];
  departaments: string[];
  wallets: ProjectWallet[];
  nft_collection?: string; // Token ID de la colección NFT
  initial_balance?: number;
  data: AppData; // Estado compartido
  history: PeriodHistory[]; // Períodos cerrados
  created_at: string;
};

type ProjectMember = {
  email: string;
  departament: string;
  role: "direccion" | "jefe" | "empleado";
};
```

#### **Departamentos Disponibles**

```typescript
const DEPARTAMENTS = [
  { id: "direccion", label: "Dirección" },
  { id: "economia", label: "Economía" },
  { id: "recursos_humanos", label: "Recursos Humanos" },
  { id: "marketing", label: "Marketing" },
  { id: "ventas", label: "Ventas" },
  { id: "logistica", label: "Logística" },
];
```

#### **Roles y Permisos**

```typescript
const ROLES = [
  { id: "direccion", label: "Director/CEO" },
  { id: "jefe", label: "Jefe de Departamento" },
  { id: "empleado", label: "Empleado" },
];
```

**Permisos por Departamento**:

| Departamento | Rutas Permitidas                                    |
| ------------ | --------------------------------------------------- |
| Dirección    | Todas (`all`)                                       |
| Economía     | Todas (`all`)                                       |
| RRHH         | `/herramientas/crm`, `/configuracion`               |
| Marketing    | `/analisis`, `/proyecciones`, `/herramientas/posts` |
| Ventas       | `/ingresos`, `/inventario`, `/herramientas/crm`     |
| Logística    | `/inventario`, `/gastos`                            |

### Flujo de Creación de Proyecto

1. **Usuario crea proyecto**:
   - Nombre, logo, tipo (tradicional/digital)
   - Selecciona departamentos activos
   - Define balance inicial (opcional)

2. **Sistema genera wallets automáticamente**:
   - Una wallet Hedera por cada departamento
   - Claves encriptadas y almacenadas

3. **Sistema crea colección NFT**:
   - Para almacenar historial de períodos
   - Token ID guardado en el proyecto

4. **Usuario se agrega como miembro**:
   - Email, departamento, rol
   - El creador inicia como Director

5. **Invitación de miembros adicionales**:
   - Búsqueda de usuarios por email
   - Asignación de departamento y rol

### Gestión de Miembros

#### **Agregar Miembro**

```typescript
const addMember = async (
  projectId: number,
  email: string,
  departament: string,
  role: string,
) => {
  // 1. Verificar que el usuario existe
  const user = await searchUserByEmail(email);
  if (!user) throw new Error("Usuario no encontrado");

  // 2. Obtener proyecto
  const { data: project } = await supabase
    .from("projects")
    .select("members")
    .eq("id", projectId)
    .single();

  // 3. Agregar nuevo miembro
  const newMembers = [...project.members, { email, departament, role }];

  // 4. Actualizar proyecto
  await supabase
    .from("projects")
    .update({ members: newMembers })
    .eq("id", projectId);
};
```

#### **Eliminar Miembro**

```typescript
const removeMember = async (projectId: number, email: string) => {
  const { data: project } = await supabase
    .from("projects")
    .select("members")
    .eq("id", projectId)
    .single();

  const newMembers = project.members.filter((m) => m.email !== email);

  await supabase
    .from("projects")
    .update({ members: newMembers })
    .eq("id", projectId);
};
```

### Modo Proyecto vs Modo Personal

La aplicación tiene dos modos de operación:

#### **Modo Personal** (por defecto)

- Datos almacenados en LocalStorage del usuario
- Sincronización con su propia cuenta de Supabase
- Total privacidad

#### **Modo Proyecto**

- Datos almacenados en el proyecto compartido
- Todos los miembros ven los mismos datos en tiempo real
- Las modificaciones se reflejan para todos

**Selector de Contexto**:

```typescript
const { currentProject, setCurrentProject } = useApp();

// Cambiar a modo proyecto
setCurrentProject(project, member);

// Volver a modo personal
setCurrentProject(null, null);
```

### Transacciones de Presupuesto entre Departamentos

```typescript
type DepartmentBudgetTransaction = {
  id: string;
  projectId: number;
  type: "assignment" | "request" | "emergency_withdrawal";
  fromDepartment: string;
  toDepartment: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  createdBy: string;
  createdByDepartment: string;
  approvedAt?: string;
  approvedBy?: string;
  reason?: string;
};
```

#### **Asignación de Presupuesto** (Dirección → Departamentos)

- Solo Dirección puede asignar
- Se aprueba automáticamente
- Se ejecuta transferencia en Hedera

#### **Solicitud de Presupuesto** (Departamento → Dirección)

- Cualquier departamento puede solicitar
- Requiere aprobación de Dirección Y Economía
- Se ejecuta transferencia al aprobarse

#### **Retiro de Emergencia** (Departamento → Departamento)

- Para situaciones urgentes
- Requiere aprobación de ambos departamentos
- Se ejecuta transferencia al aprobarse

### Historial de Proyectos (NFTs)

#### **Cierre de Período**

Cuando se cierra un período contable:

1. **Recopilar Datos del Período**:
   - Rango de fechas
   - Ventas, gastos, inventario del período
   - Métricas calculadas

2. **Crear Metadata**:
   - Estructura JSON con todos los datos
   - Incluye AppData completo del período

3. **Subir a IPFS** (Pinata):
   - Datos encriptados
   - Retorna CID (Content ID)

4. **Mintear NFT**:
   - En la colección del proyecto
   - Metadata apunta al IPFS CID
   - Serial number único

5. **Guardar en Historial**:
   - Array `history` del proyecto
   - Incluye todos los datos de trazabilidad

6. **Notificar a Miembros**:
   - Todos los miembros reciben notificación
   - Pueden ver el NFT en exploradores públicos

#### **Visualización de Historial**

Página `/history` muestra:

- Lista de períodos cerrados
- Datos resumidos de cada período
- Link al NFT en explorador de Hedera
- Link a metadata en IPFS (Pinata Gateway)
- Descarga de datos completos

---

## 14. Progressive Web App (PWA)

### Configuración de PWA

La aplicación es una **Progressive Web App** completa que se puede instalar como aplicación nativa.

#### **Manifest PWA**

```json
// public/manifest.json
{
  "name": "My Business Studio - Panel de Control",
  "short_name": "My Business",
  "description": "Gestiona tu negocio: ventas, gastos, inventario y más",
  "theme_color": "#2563eb",
  "background_color": "#ffffff",
  "display": "standalone",
  "orientation": "portrait",
  "scope": "/",
  "start_url": "/",
  "icons": [
    {
      "src": "/icon.svg",
      "sizes": "192x192",
      "type": "image/svg+xml"
    },
    {
      "src": "/icon.svg",
      "sizes": "512x512",
      "type": "image/svg+xml"
    },
    {
      "src": "/icon.svg",
      "sizes": "512x512",
      "type": "image/svg+xml",
      "purpose": "maskable"
    }
  ]
}
```

#### **Service Worker**

**Archivo**: `public/sw.js`

```javascript
// Estrategias de caché
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("v1").then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        "/src/main.tsx",
        "/src/index.css",
        // ... assets críticos
      ]);
    }),
  );
});

// Interceptar peticiones
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});
```

#### **Plugin Vite PWA**

```typescript
// vite.config.ts
VitePWA({
  registerType: "autoUpdate",
  includeAssets: ["icon.svg", "robots.txt"],
  manifest: {
    /* ... */
  },
  workbox: {
    globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
    navigateFallback: "/index.html",
    cleanupOutdatedCaches: true,
    maximumFileSizeToCacheInBytes: 7 * 1024 * 1024, // 7 MB
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts-cache",
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365,
          },
        },
      },
    ],
  },
});
```

### Funcionalidades PWA

#### **1. Instalación en Dispositivo**

La app se puede instalar desde el navegador:

- Chrome: Botón "Instalar aplicación"
- Safari (iOS): "Agregar a pantalla de inicio"
- Edge: "Instalar My Business Studio"

#### **2. Funcionamiento Offline**

- Todos los assets se cachean
- La app funciona sin conexión
- Los datos se guardan en LocalStorage
- Al reconectar, sincroniza automáticamente

#### **3. Notificaciones Push**

```typescript
// Solicitar permiso
const permission = await Notification.requestPermission();

// Enviar notificación
if (permission === "granted") {
  registration.showNotification("My Business Studio", {
    body: "Tienes un pago recurrente próximo",
    icon: "/icon.svg",
    badge: "/icon.svg",
    tag: "payment-reminder",
    data: { url: "/herramientas/pagos-recurrentes" },
  });
}
```

#### **4. Actualizaciones Automáticas**

```typescript
// Detectar nueva versión
registration.addEventListener("updatefound", () => {
  const newWorker = registration.installing;

  newWorker.addEventListener("statechange", () => {
    if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
      // Nueva versión disponible
      if (confirm("Nueva versión disponible. ¿Actualizar?")) {
        newWorker.postMessage({ type: "SKIP_WAITING" });
        window.location.reload();
      }
    }
  });
});
```

#### **5. Background Sync**

```typescript
// Registrar sync
registration.sync.register("sync-data");

// En el Service Worker
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-data") {
    event.waitUntil(syncDataWithServer());
  }
});
```

### SEO y Meta Tags

```html
<!-- index.html -->
<title>My Business Studio | Gestión para Pymes y Emprendedores</title>
<meta name="description" content="..." />
<meta name="keywords" content="..." />
<meta name="robots" content="index,follow,..." />
<meta name="author" content="Wilkenson Canton" />

<!-- Open Graph -->
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:type" content="website" />
<meta property="og:url" content="..." />
<meta property="og:image" content="..." />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="..." />
<meta name="twitter:description" content="..." />
<meta name="twitter:image" content="..." />

<!-- Schema.org -->
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "My Business Studio",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    ...
  }
</script>
```

---

## 15. Sistema de Notificaciones

### Notificaciones In-App

#### **Toast Notifications**

```typescript
import { toast } from "@/hooks/use-toast"

// Notificación de éxito
toast({
  title: "Venta registrada",
  description: "La venta se ha guardado correctamente",
})

// Notificación de error
toast({
  title: "Error",
  description: "No se pudo guardar la venta",
  variant: "destructive",
})

// Notificación con acción
toast({
  title: "Sincronización completa",
  description: "Tus datos están actualizados",
  action: <Button onClick={() => {}}>Ver detalles</Button>,
})
```

#### **Alertas de Negocio**

```typescript
// Dashboard muestra alertas automáticas
<CashFlowAlerts data={data} />
```

**Tipos de Alertas**:

- Días con balance negativo
- Stock bajo en productos
- Productos próximos a vencer
- Pagos recurrentes próximos
- Componentes faltantes para productos compuestos
- Metas próximas a vencer

### Notificaciones Push

#### **Solicitar Permiso**

```typescript
// src/hooks/use-notification-push.ts
export const useNotificationPush = () => {
  const requestPermission = async () => {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  };

  return { requestPermission };
};
```

#### **Enviar Notificación Push**

```typescript
const sendPushNotification = async (
  title: string,
  body: string,
  url?: string,
) => {
  if (!("serviceWorker" in navigator)) return;

  const registration = await navigator.serviceWorker.ready;

  await registration.showNotification(title, {
    body,
    icon: "/icon.svg",
    badge: "/icon.svg",
    tag: "notification",
    data: { url },
    actions: [
      { action: "open", title: "Abrir" },
      { action: "close", title: "Cerrar" },
    ],
  });
};
```

#### **Notificaciones Programadas**

La aplicación programa notificaciones automáticas para:

1. **Pagos Recurrentes**:
   - 3 días antes del vencimiento
   - El día del vencimiento

2. **Eventos de Agenda**:
   - 1 hora antes
   - Al momento del evento

3. **Metas Financieras**:
   - Al alcanzar 50%, 75%, 90% de la meta
   - 1 semana antes de la fecha límite

4. **Reinversiones Automáticas**:
   - Al ejecutarse una reinversión
   - Si falla la ejecución

5. **Alertas de Inventario**:
   - Producto llega a stock mínimo
   - Producto próximo a vencer (5 días antes)

### Service Worker para Notificaciones

```javascript
// public/sw.js

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "open") {
    const url = event.notification.data.url || "/";
    event.waitUntil(clients.openWindow(url));
  }
});

self.addEventListener("push", (event) => {
  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || "/icon.svg",
      data: data.data,
    }),
  );
});
```

### Hook de Service Worker para Notificaciones

```typescript
// src/hooks/use-service-worker-notifications.ts

export const useServiceWorkerNotifications = (options) => {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.addEventListener("message", (event) => {
      switch (event.data.type) {
        case "NOTIFICATION_CLOSED":
          // Manejar cierre
          break;
        case "SYNC_NOTIFICATIONS":
          // Sincronizar notificaciones
          break;
      }
    });
  }, []);
};
```

---

## 16. Componentes de UI

La aplicación utiliza **shadcn/ui**, una colección de componentes construidos sobre **Radix UI** con estilos de **Tailwind CSS**.

### Componentes de shadcn/ui Utilizados

#### **Formularios**

- `<Form>`, `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormControl>`, `<FormMessage>`
- `<Input>`, `<Textarea>`, `<Select>`, `<Checkbox>`, `<Switch>`, `<RadioGroup>`
- `<Calendar>`, `<DatePicker>`
- `<Slider>`

#### **Feedback**

- `<Toast>`, `<Toaster>` (notificaciones)
- `<Alert>`, `<AlertDialog>` (alertas y confirmaciones)
- `<Progress>` (barras de progreso)
- `<Skeleton>` (carga de contenido)
- `<Badge>` (etiquetas)

#### **Navegación**

- `<Tabs>`, `<TabsList>`, `<TabsTrigger>`, `<TabsContent>`
- `<NavigationMenu>`
- `<Menubar>`
- `<DropdownMenu>`
- `<ContextMenu>`
- `<Breadcrumb>`

#### **Layout**

- `<Card>`, `<CardHeader>`, `<CardTitle>`, `<CardDescription>`, `<CardContent>`, `<CardFooter>`
- `<Separator>`
- `<ScrollArea>`
- `<ResizablePanelGroup>`, `<ResizablePanel>`, `<ResizableHandle>`
- `<Collapsible>`
- `<Accordion>`

#### **Overlays**

- `<Dialog>`, `<DialogTrigger>`, `<DialogContent>`, `<DialogHeader>`, `<DialogTitle>`, `<DialogDescription>`
- `<Sheet>` (sidebar drawer)
- `<Drawer>` (bottom sheet, usando vaul)
- `<Popover>`
- `<HoverCard>`
- `<Tooltip>`

#### **Data Display**

- `<Table>`, `<TableHeader>`, `<TableBody>`, `<TableRow>`, `<TableCell>`
- `<Avatar>`, `<AvatarImage>`, `<AvatarFallback>`
- `<Carousel>` (usando embla-carousel)

#### **Buttons**

- `<Button>` (con variantes: default, destructive, outline, secondary, ghost, link)
- `<Toggle>`, `<ToggleGroup>`

#### **Comando**

- `<Command>`, `<CommandInput>`, `<CommandList>`, `<CommandItem>` (paleta de comandos con cmdk)

### Componentes Personalizados Principales

#### **1. MetricCard**

```typescript
<MetricCard
  title="Ventas del día"
  value={formatCurrency(todaySalesTotal)}
  icon={ShoppingCart}
  trend={salesTrend}
  description={`${salesTrend > 0 ? "+" : ""}${salesTrend.toFixed(1)}% vs ayer`}
/>
```

Muestra una métrica con:

- Título
- Valor formateado
- Icono representativo
- Tendencia (% de cambio)
- Descripción adicional

#### **2. DataTable**

```typescript
<DataTable
  columns={[
    { header: "Fecha", accessor: "date" },
    { header: "Monto", accessor: "amount", format: formatCurrency },
    { header: "Categoría", accessor: "category" },
  ]}
  data={sales}
  onRowClick={(sale) => navigate(`/ingresos/${sale.id}`)}
  onEdit={(sale) => setEditingSale(sale)}
  onDelete={(sale) => deleteSale(sale.id)}
/>
```

Tabla de datos con:

- Columnas configurables
- Formateo de celdas
- Acciones por fila (editar, eliminar, ver)
- Ordenamiento
- Paginación
- Búsqueda

#### **3. ExportButtons**

```typescript
<ExportButtons
  data={sales}
  filename="ventas"
  formats={["json", "csv", "excel", "pdf"]}
/>
```

Botones para exportar datos en múltiples formatos.

#### **4. FloatingButton**

```typescript
<FloatingButton
  icon={Plus}
  onClick={() => setShowForm(true)}
  label="Agregar venta"
/>
```

Botón flotante en la esquina inferior derecha para acción principal.

#### **5. AutoSyncIndicator**

```typescript
<AutoSyncIndicator
  isSyncing={isSyncing}
  isOnline={isOnline}
  lastSyncTime={lastSyncTime}
/>
```

Indicador de estado de sincronización en la UI.

#### **6. SyncConflictModal**

```typescript
<SyncConflictModal />
```

Modal que aparece cuando hay conflicto de sincronización, mostrando opciones al usuario.

#### **7. ChatbotUI**

```typescript
<ChatbotUI />
```

Interfaz completa del chatbot con:

- Historia de mensajes
- Input de texto
- Botones de sugerencias
- Formateo Markdown de respuestas
- Indicador de "escribiendo..."

#### **8. BarcodeScanner**

```typescript
<BarcodeScanner
  onScan={(code) => {
    const product = products.find(p => p.barcode === code)
    if (product) setEditingProduct(product)
  }}
/>
```

Scanner de códigos de barras/QR usando la cámara del dispositivo.

#### **9. BalanceHistory**

```typescript
<BalanceHistory data={chartData} period={chartPeriod} />
```

Gráfico de línea temporal del balance.

#### **10. CashFlowAlerts**

```typescript
<CashFlowAlerts data={data} />
```

Alertas de flujo de caja con lista de problemas detectados.

#### **11. GoalsState**

```typescript
<GoalsState goals={goals} />
```

Estado visual de metas financieras con barras de progreso.

#### **12. RecurringPaymentsCard**

```typescript
<RecurringPaymentsCard payments={recurringPayments} />
```

Tarjeta con próximos pagos recurrentes.

#### **13. BottomTabbar**

```typescript
<BottomTabbar />
```

Barra de navegación inferior para móviles con iconos principales.

#### **14. AISalesForecast**

```typescript
<AISalesForecast sales={sales} daysAhead={30} />
```

Componente con predicción de ventas usando IA.

### Sistema de Temas

#### **Theme Provider**

```typescript
import { ThemeProvider } from "next-themes"

<ThemeProvider attribute="class" defaultTheme="system">
  <App />
</ThemeProvider>
```

#### **Theme Toggle**

```typescript
const { theme, setTheme } = useTheme()

<Button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
  {theme === "light" ? <Moon /> : <Sun />}
</Button>
```

#### **Variables CSS**

```css
/* src/index.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    /* ... */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    /* ... */
  }
}
```

### Responsive Design

#### **Breakpoints de Tailwind**

```typescript
// tailwind.config.ts
screens: {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1400px",
}
```

#### **Hook useIsMobile**

```typescript
import { useIsMobile } from "@/hooks/use-mobile"

const isMobile = useIsMobile()

return (
  <>
    {isMobile ? <BottomTabbar /> : <Sidebar />}
  </>
)
```

#### **Clases Responsive**

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Contenido */}
</div>
```

---

## 17. Hooks Personalizados

### Hooks de Estado

#### **useApp**

```typescript
const {
  data,
  addSale,
  updateSale,
  deleteSale,
  supabaseAuth,
  supabaseSync,
  currentProject,
  setCurrentProject,
  theme,
  toggleTheme,
  // ... todos los métodos CRUD
} = useApp();
```

Hook principal que expone todo el estado y métodos de la aplicación.

#### **useSupabaseAuth**

```typescript
const { user, loading, error, register, login, logout, verificationPending } =
  useSupabaseAuth();
```

Gestión de autenticación con Supabase.

#### **useSupabaseSync**

```typescript
const {
  isSyncing,
  isOnline,
  lastSyncTime,
  saveToSupabase,
  loadFromSupabase,
  checkSyncStatus,
  restoreFromCloud,
  syncConflict,
  resolveConflict,
  isInitialCheckDone,
} = useSupabaseSync(userId, isPremium);
```

Sistema de sincronización con detección de conflictos.

### Hooks de IA

#### **useChatbot**

```typescript
const { messages, sendMessage, isLoading, error, clearHistory } = useChatbot();
```

Gestión del chatbot conversacional.

#### **useSalesPrediction**

```typescript
const { prediction, isLoading, error, refetch } = useSalesPrediction(
  sales,
  daysAhead,
);
```

Predicción de ventas con IA.

#### **useSalesInsights**

```typescript
const { insights, isLoading } = useSalesInsights(sales);
```

Insights automáticos sobre ventas.

#### **useSalesComparison**

```typescript
const { comparison, isLoading } = useSalesComparison(
  salesPeriod1,
  salesPeriod2,
);
```

Comparación de dos períodos de ventas.

### Hooks de UI

#### **useToast**

```typescript
const { toast, dismiss } = useToast();

toast({
  title: "Título",
  description: "Descripción",
  variant: "default" | "destructive",
  duration: 5000,
});
```

Sistema de notificaciones toast.

#### **useIsMobile**

```typescript
const isMobile = useIsMobile();
```

Detecta si el dispositivo es móvil (< 768px).

### Hooks de Notificaciones

#### **useNotificationPush**

```typescript
const { requestPermission, sendNotification, hasPermission } =
  useNotificationPush();
```

Gestión de notificaciones push.

#### **useServiceWorkerNotifications**

```typescript
useServiceWorkerNotifications({
  onNotificationClick: (data) => {
    navigate(data.url);
  },
});
```

Sincronización de notificaciones con Service Worker.

---

## 18. Seguridad y Permisos

### Seguridad de Datos

#### **1. Row Level Security (RLS) en Supabase**

Todas las tablas tienen políticas RLS activas:

```sql
-- Solo el usuario puede ver sus propios datos
CREATE POLICY "Users can view own data" ON backups
  FOR SELECT USING (auth.uid() = user_id);

-- Solo miembros del proyecto pueden acceder
CREATE POLICY "Members can view project" ON projects
  FOR SELECT USING (is_project_member(id));
```

#### **2. Encriptación de Claves Privadas**

Todas las claves privadas de wallets se almacenan encriptadas:

```typescript
const passphrase = import.meta.env.VITE_ENCRIPTED_KEY;
const encryptedKey = encrypt(privateKey, passphrase);
```

#### **3. Variables de Entorno**

Datos sensibles en `.env`:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=... (solo backend)
JWT_SECRET=...
VITE_GOOGLE_AI_API_KEY=...
VITE_ENCRIPTED_KEY=...
```

#### **4. Validación de Datos**

Todos los formularios usan **Zod** para validación:

```typescript
const saleSchema = z.object({
  amount: z.number().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  category: z.string().min(1),
  description: z.string().optional(),
});
```

#### **5. Protección CSRF**

- Tokens JWT con expiración corta
- Refresh tokens para renovación
- HttpOnly cookies (en desarrollo)

#### **6. Sanitización de Inputs**

```typescript
import DOMPurify from "dompurify";

const sanitized = DOMPurify.sanitize(userInput);
```

### Permisos en Proyectos

#### **Verificación de Permisos**

```typescript
const canAccessRoute = (route: string, department: string): boolean => {
  const permissions = DEPARTMENT_PERMISSIONS[department];

  if (permissions.includes("all")) return true;

  return permissions.some((allowed) => route.startsWith(allowed));
};
```

#### **Componente ProtectedRoute con Permisos**

```typescript
const ProjectProtectedRoute = ({ children, allowedFor }) => {
  const { currentProject, currentProjectMember } = useApp()

  if (!currentProject || !currentProjectMember) {
    return <Navigate to="/" />
  }

  if (allowedFor && !allowedFor.includes(currentProjectMember.departament)) {
    return (
      <Alert variant="warning">
        No tienes permiso para acceder a esta sección
      </Alert>
    )
  }

  return <>{children}</>
}
```

#### **Restricciones por Rol**

```typescript
const canApproveTransaction = (role: string): boolean => {
  return role === "direccion" || role === "jefe";
};

const canDeleteData = (role: string): boolean => {
  return role === "direccion";
};
```

### Auditoría y Logs

#### **Registro de Acciones**

Todas las transacciones importantes se registran:

```typescript
const logAction = async (
  userId: string,
  action: string,
  entity: string,
  entityId: string,
  metadata?: any,
) => {
  await supabase.from("audit_logs").insert({
    user_id: userId,
    action,
    entity,
    entity_id: entityId,
    metadata,
    timestamp: new Date().toISOString(),
  });
};
```

Acciones loggeadas:

- Crear, editar, eliminar ventas/gastos/productos
- Transferencias entre wallets
- Aprobaciones de transacciones
- Cambios en permisos de proyectos
- Cierre de períodos

#### **Historial Inmutable (Blockchain)**

Los períodos cerrados se almacenan como NFTs:

- Metadata inmutable en IPFS
- Trazabilidad completa en Hedera
- Verificable públicamente

---

## 19. Deployment y Build

### Scripts de NPM

```json
{
  "scripts": {
    "dev": "vite",
    "dev:api": "vercel dev --listen 8080",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

### Proceso de Build

#### **1. Build de Producción**

```bash
npm run build
```

Genera:

- Assets optimizados en `/dist`
- HTML, CSS, JS minificados
- Service Worker generado
- Manifest PWA

#### **2. Preview Local**

```bash
npm run preview
```

Sirve el build de producción localmente para testing.

### Deployment en Vercel

#### **Configuración de Vercel**

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

#### **Variables de Entorno en Vercel**

Configurar en Vercel Dashboard:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_GOOGLE_AI_API_KEY`
- `VITE_ENCRIPTED_KEY`
- `VITE_RPC_URL` (Plume)
- `JWT_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`

#### **Deployment Automático**

- Push a `main` → Deploy automático a producción
- Push a otras ramas → Deploy de preview

### Optimizaciones de Build

#### **Code Splitting**

Vite hace code splitting automático por rutas:

```typescript
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Ventas = lazy(() => import("./pages/Ventas"));
// ...
```

#### **Tree Shaking**

Vite elimina código no utilizado automáticamente.

#### **Minificación**

- JavaScript minificado con esbuild
- CSS minificado con cssnano
- HTML minificado

#### **Compresión**

Vercel sirve assets con compresión Gzip/Brotli automáticamente.

#### **Caché**

Headers de caché optimizados:

- Assets estáticos: 1 año
- HTML: sin caché
- Service Worker: sin caché

### Performance

#### **Lighthouse Score Objetivo**

- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100
- PWA: 100

#### **Métricas Web Vitals**

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

#### **Optimizaciones Implementadas**

1. **Lazy loading de imágenes**
2. **Code splitting por ruta**
3. **Carga diferida de gráficos** (solo cuando se ven)
4. **Service Worker con caché inteligente**
5. **Compresión de assets**
6. **Fuentes web optimizadas** (subset de Inter)
7. **Prefetch de rutas críticas**

---

## 20. Roadmap de Features Premium

### Planes de Suscripción

#### **Plan Emprendedor - $2/mes**

- Hasta 3 proyectos activos
- 5 GB de almacenamiento en la nube
- Exportaciones básicas
- Soporte por email
- Análisis básico

#### **Plan Proyectos Pequeños - $15/mes**

- Hasta 10 proyectos activos
- 20 GB de almacenamiento
- Exportaciones avanzadas
- Soporte prioritario
- Análisis predictivo básico
- Hasta 5 miembros de equipo

#### **Plan Empresas - $350/mes**

- Proyectos ilimitados
- 100 GB de almacenamiento
- Todas las exportaciones
- Soporte 24/7
- Análisis predictivo avanzado
- Miembros de equipo ilimitados
- API personalizada
- Integraciones empresariales

### Features Premium Actuales

✅ **Sincronización en la nube**  
✅ **Trabajo en equipo con proyectos**  
✅ **Wallets blockchain (Hedera)**  
✅ **Historial inmutable con NFTs**  
✅ **Chatbot con IA**  
✅ **Predicciones de ventas**  
✅ **Generación de reportes con IA**  
✅ **Exportación en múltiples formatos**  
✅ **Gráficos extendidos (30, 90, 365 días)**

### Features en Desarrollo

🚧 **Sistema de equipos completo** (parcialmente implementado)  
🚧 **Integraciones con otros sistemas**  
🚧 **API pública para desarrolladores**  
🚧 **Análisis predictivo avanzado**  
🚧 **Automatización de tareas repetitivas**  
🚧 **Facturación electrónica legal**

### Roadmap Futuro

#### **Q2 2026**

- [ ] Modo offline mejorado (sync más robusto)
- [ ] Integración con métodos de pago (Stripe, PayPal)
- [ ] Sistema de roles más granular
- [ ] Notificaciones push programadas
- [ ] Dashboard personalizable (widgets arrastrables)

#### **Q3 2026**

- [ ] Integración con bancos (APIs bancarias)
- [ ] Facturación electrónica legal (Sunat, DIAN, SAT)
- [ ] Sistema de nomina completo
- [ ] Punto de venta (POS) integrado
- [ ] App móvil nativa (React Native)

#### **Q4 2026**

- [ ] Marketplace de integraciones
- [ ] API pública documentada
- [ ] Webhooks para eventos
- [ ] BI avanzado (Business Intelligence)
- [ ] Machine Learning personalizado por negocio

#### **2027+**

- [ ] Integración con ERPs grandes (SAP, Oracle)
- [ ] Blockchain en mainnet (migrar de testnet)
- [ ] Pagos con criptomonedas en POS
- [ ] Multiidioma completo
- [ ] Multi-moneda con conversión automática
- [ ] Cumplimiento GDPR y regulaciones internacionales

---

## Conclusión

**My Business Studio** es una plataforma completa y moderna de gestión empresarial que combina:

- 🚀 **Tecnología de vanguardia**: React, TypeScript, TailwindCSS, Supabase
- 🧠 **Inteligencia Artificial**: Google Gemini para predicciones y asistencia
- ⛓️ **Blockchain**: Hedera y Plume para transparencia y trazabilidad
- 📱 **PWA**: Instalable y funciona offline
- 👥 **Colaboración**: Sistema de equipos con permisos
- 🔒 **Seguridad**: RLS, encriptación, auditoría
- 📊 **Análisis**: Gráficos, reportes, proyecciones
- 🎨 **UI Moderna**: shadcn/ui y diseño responsive

La aplicación está diseñada para escalar desde emprendedores individuales hasta empresas grandes, con arquitectura modular y extensible.

---

**Versión**: 1.0.3  
**Licencia**: GPL-3.0-or-later  
**Autor**: Wilkenson Canton  
**Última Actualización**: Marzo 2026
