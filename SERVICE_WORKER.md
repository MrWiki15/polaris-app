# Service Worker - PolarisHub

## 📋 Descripción

El Service Worker de PolarisHub proporciona capacidades avanzadas de PWA (Progressive Web App), incluyendo:

- ✅ Funcionamiento offline
- 🔔 Notificaciones push
- 📦 Caché inteligente de recursos
- 🔄 Sincronización en background
- ⚡ Mejora de rendimiento

## 🚀 Características

### 1. Caché Estratégico

El SW implementa dos estrategias de caché:

**Cache First (Activos estáticos)**

- CSS, JavaScript, fuentes, imágenes
- Ideales para recursos que no cambian frecuentemente

**Network First (API y datos dinámicos)**

- Llamadas a `/api/`
- Peticiones a Supabase
- Prioriza datos frescos pero funciona offline

### 2. Notificaciones Push

#### Tipos de Notificaciones Soportadas

```typescript
type NotificationType = "info" | "success" | "warning" | "error";

type NotificationCategory =
  | "inventario"
  | "calendario"
  | "metas"
  | "deudas"
  | "recurrencia"
  | "ventas"
  | "gastos"
  | "general";
```

#### Características de las Notificaciones

- **Vibración personalizada** según el tipo
- **Interacción diferenciada**: Las notificaciones de error requieren interacción manual
- **Navegación automática**: Click en notificación navega a la página relevante
- **Badges por categoría**: Emojis visuales según la categoría

#### Ejemplo de Uso

```typescript
import { sendSWNotification } from "@/lib/serviceWorker";

// Notificación simple
await sendSWNotification({
  title: "Stock Bajo",
  message: "El producto X tiene solo 2 unidades",
  type: "warning",
  category: "inventario",
  action: {
    label: "Ver producto",
    path: "/inventario/123",
  },
});

// Notificación de error
await sendSWNotification({
  title: "Error en sincronización",
  message: "No se pudo guardar el registro",
  type: "error",
  requireInteraction: true,
});
```

### 3. Sincronización en Background

El SW soporta sincronización automática cuando se recupera la conexión:

```typescript
import { requestBackgroundSync } from "@/lib/serviceWorker";

// Solicitar sincronización de notificaciones
await requestBackgroundSync("sync-notifications");

// Solicitar sincronización de datos
await requestBackgroundSync("sync-data");
```

#### Tags de Sincronización

- `sync-notifications`: Sincroniza las notificaciones del sistema
- `sync-data`: Sincroniza los datos de la aplicación

### 4. Gestión de Caché

#### Limpiar Caché

```typescript
import { clearServiceWorkerCache } from "@/lib/serviceWorker";

await clearServiceWorkerCache();
```

#### Actualizar Service Worker

```typescript
import { updateServiceWorker } from "@/lib/serviceWorker";

await updateServiceWorker();
```

### 5. Mensajería Bidireccional

#### Enviar Mensajes al SW

```typescript
import { sendMessageToSW } from "@/lib/serviceWorker";

sendMessageToSW({
  type: "CUSTOM_ACTION",
  payload: {
    /* datos */
  },
});
```

#### Escuchar Mensajes del SW

```typescript
import { onSWMessage } from "@/lib/serviceWorker";

const unsubscribe = onSWMessage((data) => {
  if (data.type === "NAVIGATE") {
    // Manejar navegación
    router.push(data.url);
  }
});

// Limpiar listener cuando ya no se necesite
unsubscribe();
```

#### Escuchar Eventos Personalizados

```typescript
import { onSWCustomEvent } from "@/lib/serviceWorker";

const unsubscribe = onSWCustomEvent("sync-notifications", (detail) => {
  console.log("Sincronizar notificaciones");
  // Recargar notificaciones
});

// Limpiar
unsubscribe();
```

## 📱 Integración con el Sistema de Notificaciones

El Service Worker está completamente integrado con el sistema de notificaciones existente:

### Flujo de Notificaciones

1. **Generación**: `buildSystemNotifications()` crea notificaciones basadas en:
   - Stock bajo de productos
   - Productos por vencer
   - Eventos próximos
   - Metas por cumplir
   - Deudas pendientes
   - Pagos recurrentes

2. **Almacenamiento**: Las notificaciones se guardan en `localStorage` vía `AppContext`

3. **Visualización**:
   - **In-app**: Componente `Notificaciones.tsx`
   - **Push**: Service Worker muestra notificaciones nativas

4. **Interacción**:
   - Click → Navega a la página relevante
   - Close → Registra el cierre

### Sincronización Automática

```typescript
// En AppContext.tsx
useEffect(() => {
  const handleSyncNotifications = () => {
    // Regenerar notificaciones del sistema
    const systemNotifs = buildSystemNotifications(data);
    const merged = mergeSystemNotifications(data.notifications, systemNotifs);

    updateData({ notifications: merged });
  };

  const cleanup = onSWCustomEvent(
    "sync-notifications",
    handleSyncNotifications,
  );

  return cleanup;
}, [data]);
```

## 🔧 Configuración

### Variables del SW

```javascript
// En sw.js
const CACHE_NAME = "polarishub-v1";
const RUNTIME_CACHE = "polarishub-runtime-v1";

// Actualizar versión para forzar nueva instalación
```

### Recursos Precacheados

Los siguientes recursos se cachean durante la instalación:

- `/` - Página principal
- `/index.html` - HTML base
- `/manifest.json` - Manifest PWA
- `/icon.svg` - Icono de la app

### Patrones de Caché

**Incluir en caché:**

```javascript
const CACHE_PATTERNS = [
  /\.js$/,
  /\.css$/,
  /\.woff2?$/,
  /\.png$/,
  /\.jpg$/,
  /\.jpeg$/,
  /\.svg$/,
  /\.webp$/,
];
```

**Excluir del caché:**

```javascript
const SKIP_CACHE_PATTERNS = [/\/api\//, /supabase\.co/, /chrome-extension/];
```

## 🎯 Eventos del Service Worker

### `install`

- Se ejecuta cuando el SW se instala por primera vez
- Cachea recursos críticos
- Llama a `skipWaiting()` para activarse inmediatamente

### `activate`

- Se ejecuta cuando el SW se activa
- Limpia cachés antiguos
- Toma control de todas las páginas

### `fetch`

- Intercepta todas las peticiones de red
- Aplica estrategias de caché según el tipo de recurso

### `push`

- Recibe notificaciones push del servidor
- Muestra notificaciones nativas
- Añade vibración según el tipo

### `notificationclick`

- Maneja clicks en notificaciones
- Navega a la URL especificada
- Enfoca o abre ventana de la app

### `notificationclose`

- Se ejecuta cuando se cierra una notificación
- Envía evento a clientes activos

### `sync`

- Maneja sincronización en background
- Soporta tags personalizados

### `message`

- Recibe mensajes de los clientes
- Permite comunicación bidireccional

## 📊 Estado del Service Worker

```typescript
import { getServiceWorkerState } from "@/lib/serviceWorker";

const state = await getServiceWorkerState();
console.log(state);
// {
//   isAvailable: true,
//   isControlling: true,
//   state: 'activated',
//   scope: 'http://localhost:5173/'
// }
```

## 🐛 Debugging

### Herramientas de desarrollo

1. **Chrome DevTools**
   - Application → Service Workers
   - Ver estado, scope y eventos
   - Forzar actualización o desregistrar

2. **Console del SW**
   - Todos los logs tienen prefijo `[SW]`
   - Útil para debugging

3. **Network Tab**
   - Ver qué peticiones vienen del caché
   - Identificar problemas de caché

### Comandos útiles

```javascript
// En la consola del navegador

// Desregistrar SW
navigator.serviceWorker.getRegistrations().then((registrations) => {
  registrations.forEach((reg) => reg.unregister());
});

// Limpiar todo el caché
caches.keys().then((names) => {
  names.forEach((name) => caches.delete(name));
});

// Estado del SW
navigator.serviceWorker.controller;

// Forzar actualización
navigator.serviceWorker.getRegistration().then((reg) => reg.update());
```

## 🔄 Ciclo de Actualización

1. Usuario visita la app
2. SW detecta nueva versión
3. Instala nueva versión en background
4. Usuario ve prompt: "Nueva versión disponible"
5. Usuario acepta → `skipWaiting()` → Recarga
6. Nueva versión activa

## ⚠️ Consideraciones

### Permisos

Las notificaciones push requieren:

```typescript
const permission = await Notification.requestPermission();
// 'granted', 'denied', 'default'
```

### HTTPS Requerido

Los Service Workers solo funcionan en:

- `https://` (producción)
- `localhost` (desarrollo)

### Caché y Tamaño

- El caché tiene límite de almacenamiento del navegador
- Implementar estrategia de limpieza periódica
- Monitorear tamaño del caché

## 📚 Recursos

- [MDN Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web.dev PWA](https://web.dev/progressive-web-apps/)
- [Notification API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)

## 🤝 Contribuir

Para modificar el Service Worker:

1. Editar `public/sw.js`
2. Actualizar `CACHE_NAME` para nueva versión
3. Probar localmente
4. Verificar que funciona offline
5. Commit y deploy

---

**Versión actual:** 1.0.0  
**Última actualización:** 2026-02-09
