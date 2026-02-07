Polaris (polarisHub)

Resumen

- Polaris es la aplicación web administrativa (panel) del ecosistema. Está construida con React + TypeScript sobre Vite y TailwindCSS. Provee vistas de gestión (ventas, inventario, facturación, análisis, CRM mínimo, configuración, etc.) y se integra con servicios como Supabase para persistencia y con librerías para gráficas, UI y web3 cuando aplica.

Tecnologías principales

- **Framework:** Vite + React + TypeScript
- **Estilos:** TailwindCSS (+ plugins como typography, animate)
- **Autenticación / DB:** Supabase (referencias y scripts en `src/database`)
- **UI & utilidades:** Radix UI, Lucide, Sonner, class-variance-authority, clsx
- **Datos & gráficas:** Recharts, date-fns
- **Forms & validación:** react-hook-form, zod
- **Web3 / cripto:** ethers, viem, wagmi y otras utilidades (opcionales según features)

Estructura relevante

- `src/pages/` : vistas principales del panel (Dashboard, Analisis, Facturador, Inventario, Gastos, Ingreso, Deudas, Configuracion, Agenda, etc.).
- `src/components/` : componentes reutilizables y layout.
- `src/lib/` : utilidades (supabase, crypto, storage, helpers).
- `src/hooks/` : hooks personalizados (`use-supabase-auth`, `use-supabase-sync`, `use-toast`, `use-mobile`).
- `src/database/` : scripts y guías para Supabase (setup, esquemas y queries).

Listado de páginas (resumen)

- Index, Dashboard, Analisis, Agenda, Configuracion, Deudas, Facturador, Gasto(s), Ingreso, Inventario, Item, History, Herramientas, Metas, MiniCRM, Onboarding, PagosRecurrentes, PostsRedes, PreciosDinamicos, Premium, Proveedores, Proyecciones, Servicios, Teams, Ventas, Wallet, NotFound.

Cómo ejecutar (desarrollo)

1. Instalar dependencias:

```bash
cd polarisHub
npm install
```

2. Levantar el servidor de desarrollo:

```bash
npm run dev
```

3. Build de producción:

```bash
npm run build
```

Notas de configuración

- Si usas Supabase, revisa `src/database` para los scripts y guías de conexión. Añade variables de entorno (URL y KEY) en `.env` según `src/lib/supabase.ts`.
- El proyecto incluye muchas dependencias opcionales (web3, pwa, pinata, etc.) que dependen de features específicos.

polarisAppWrapper (wrapper móvil)

- Hay una app wrapper en `polarisAppWrapper/` usando Expo / React Native + NativeWind / Gluestack UI. Sirve como frontend móvil para algunos endpoints y comparte ideas de diseño y lógica con el panel.

Contribuciones y próximos pasos

- Este README reemplaza la lista antigua de features a implementar. Para añadir tareas concretas, use el `README`, issues o el `PLAN_PREMIUM.md`.
- Si quieres, puedo:
  - Añadir secciones de configuración de `.env` más detalladas.
  - Extraer un mapa de rutas reales desde `src/pages` y generar un índice con enlaces.

Contacto

- Repositorio local: este README describe el estado actual del workspace (polarisHub + polarisAppWrapper).
