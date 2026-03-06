/* eslint-disable no-restricted-globals */
// My Business Studio Service Worker
// Versión: 1.0.0

const CACHE_NAME = "mybusiness-v1";
const RUNTIME_CACHE = "mybusiness-runtime-v1";

// Recursos críticos para cachear durante la instalación
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon.svg",
  "/SVG/",
];

// URLs que deben ser cacheadas dinámicamente
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

// URLs que NO deben ser cacheadas
const SKIP_CACHE_PATTERNS = [/\/api\//, /supabase\.co/, /chrome-extension/];

// ============================================
// INSTALACIÓN DEL SERVICE WORKER
// ============================================
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Precaching resources");
        return cache.addAll(
          PRECACHE_URLS.map((url) => new Request(url, { cache: "reload" })),
        );
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error("[SW] Precaching failed:", error);
      }),
  );
});

// ============================================
// ACTIVACIÓN DEL SERVICE WORKER
// ============================================
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
            .map((name) => {
              console.log("[SW] Deleting old cache:", name);
              return caches.delete(name);
            }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// ============================================
// ESTRATEGIA DE CACHÉ
// ============================================
const shouldCache = (url) => {
  // No cachear si coincide con patrones de exclusión
  if (SKIP_CACHE_PATTERNS.some((pattern) => pattern.test(url))) {
    return false;
  }

  // Cachear si coincide con patrones de inclusión
  return CACHE_PATTERNS.some((pattern) => pattern.test(url));
};

const networkFirst = async (request) => {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok && shouldCache(request.url)) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return (
      cachedResponse ||
      new Response("Offline", {
        status: 503,
        statusText: "Service Unavailable",
        headers: new Headers({ "Content-Type": "text/plain" }),
      })
    );
  }
};

const cacheFirst = async (request) => {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok && shouldCache(request.url)) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    return new Response("Offline", {
      status: 503,
      statusText: "Service Unavailable",
      headers: new Headers({ "Content-Type": "text/plain" }),
    });
  }
};

// ============================================
// INTERCEPTAR PETICIONES
// ============================================
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo manejar peticiones HTTP/HTTPS
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // API requests: Network first
  if (
    url.pathname.startsWith("/api/") ||
    url.hostname.includes("supabase.co")
  ) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Assets estáticos: Cache first
  if (shouldCache(request.url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Todo lo demás: Network first
  event.respondWith(networkFirst(request));
});

// ============================================
// NOTIFICACIONES PUSH
// ============================================
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received");

  let notificationData = {
    title: "My Business Studio",
    body: "Tienes una nueva notificación",
    icon: "/icon.svg",
    badge: "/icon.svg",
    tag: "default",
    requireInteraction: false,
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.message || data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        tag: data.id || data.tag || notificationData.tag,
        requireInteraction: data.type === "error" || data.requireInteraction,
        data: {
          url: data.action?.path || data.url || "/",
          type: data.type || "info",
          category: data.category || "general",
          id: data.id,
          metadata: data.metadata,
        },
      };

      // Agregar vibración según el tipo
      if (data.type === "error") {
        notificationData.vibrate = [200, 100, 200, 100, 200];
      } else if (data.type === "warning") {
        notificationData.vibrate = [200, 100, 200];
      } else {
        notificationData.vibrate = [200];
      }

      // Agregar badge según la categoría
      if (data.category) {
        const badges = {
          inventario: "📦",
          calendario: "📅",
          metas: "🎯",
          deudas: "💰",
          recurrencia: "🔄",
          ventas: "💵",
          gastos: "📊",
        };
        notificationData.badge =
          badges[data.category] || notificationData.badge;
      }
    } catch (error) {
      console.error("[SW] Error parsing push data:", error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(
      notificationData.title,
      notificationData,
    ),
  );
});

// ============================================
// CLICK EN NOTIFICACIÓN
// ============================================
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.notification.tag);

  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Buscar si ya hay una ventana abierta
        for (const client of clientList) {
          if (
            client.url.includes(self.registration.scope) &&
            "focus" in client
          ) {
            return client.focus().then(() => {
              // Enviar mensaje al cliente para navegar
              if (urlToOpen !== "/") {
                client.postMessage({
                  type: "NAVIGATE",
                  url: urlToOpen,
                });
              }
              return client;
            });
          }
        }

        // Si no hay ventana abierta, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      }),
  );
});

// ============================================
// CIERRE DE NOTIFICACIÓN
// ============================================
self.addEventListener("notificationclose", (event) => {
  console.log("[SW] Notification closed:", event.notification.tag);

  // Aquí podrías enviar analytics sobre notificaciones cerradas
  const notificationData = event.notification.data;

  if (notificationData?.id) {
    // Enviar mensaje a los clientes activos
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        clientList.forEach((client) => {
          client.postMessage({
            type: "NOTIFICATION_CLOSED",
            id: notificationData.id,
          });
        });
      }),
    );
  }
});

// ============================================
// SINCRONIZACIÓN EN BACKGROUND
// ============================================
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync:", event.tag);

  if (event.tag === "sync-notifications") {
    event.waitUntil(syncNotifications());
  }

  if (event.tag === "sync-data") {
    event.waitUntil(syncData());
  }
});

async function syncNotifications() {
  try {
    // Obtener clientes activos y pedirles que sincronicen
    const clients = await self.clients.matchAll({ type: "window" });

    clients.forEach((client) => {
      client.postMessage({
        type: "SYNC_NOTIFICATIONS",
      });
    });

    return Promise.resolve();
  } catch (error) {
    console.error("[SW] Error syncing notifications:", error);
    return Promise.reject(error);
  }
}

async function syncData() {
  try {
    // Obtener clientes activos y pedirles que sincronicen
    const clients = await self.clients.matchAll({ type: "window" });

    clients.forEach((client) => {
      client.postMessage({
        type: "SYNC_DATA",
      });
    });

    return Promise.resolve();
  } catch (error) {
    console.error("[SW] Error syncing data:", error);
    return Promise.reject(error);
  }
}

// ============================================
// MENSAJES DEL CLIENTE
// ============================================
self.addEventListener("message", (event) => {
  console.log("[SW] Message received:", event.data);

  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data?.type === "CLEAR_CACHE") {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map((name) => caches.delete(name)));
      }),
    );
  }

  if (event.data?.type === "SHOW_NOTIFICATION") {
    const { title, options } = event.data;
    event.waitUntil(self.registration.showNotification(title, options));
  }
});

// ============================================
// MANEJO DE ERRORES
// ============================================
self.addEventListener("error", (event) => {
  console.error("[SW] Error:", event.error);
});

self.addEventListener("unhandledrejection", (event) => {
  console.error("[SW] Unhandled rejection:", event.reason);
});

console.log("[SW] Service worker loaded successfully");
