/**
 * Service Worker Helper
 * Funciones para interactuar con el Service Worker
 */

export interface SWNotificationOptions {
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  category?:
    | "inventario"
    | "calendario"
    | "metas"
    | "deudas"
    | "recurrencia"
    | "ventas"
    | "gastos"
    | "general";
  action?: {
    label: string;
    path: string;
  };
  icon?: string;
  badge?: string;
  requireInteraction?: boolean;
  tag?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Verifica si el Service Worker está disponible y registrado
 */
export const isServiceWorkerAvailable = (): boolean => {
  return "serviceWorker" in navigator && !!navigator.serviceWorker.controller;
};

/**
 * Obtiene el registro del Service Worker
 */
export const getServiceWorkerRegistration =
  async (): Promise<ServiceWorkerRegistration | null> => {
    if (!("serviceWorker" in navigator)) {
      return null;
    }

    try {
      return await navigator.serviceWorker.ready;
    } catch (error) {
      console.error("Error getting service worker registration:", error);
      return null;
    }
  };

/**
 * Envía una notificación mediante el Service Worker
 */
export const sendSWNotification = async (
  options: SWNotificationOptions,
): Promise<boolean> => {
  const registration = await getServiceWorkerRegistration();

  if (!registration) {
    console.warn("Service Worker not available for notifications");
    return false;
  }

  try {
    const notificationOptions = {
      body: options.message,
      icon: options.icon || "/icon.svg",
      badge: options.badge || "/icon.svg",
      tag: options.tag || `notification-${Date.now()}`,
      requireInteraction:
        options.requireInteraction || options.type === "error",
      data: {
        url: options.action?.path || "/",
        type: options.type || "info",
        category: options.category || "general",
        metadata: options.metadata,
      },
      vibrate:
        options.type === "error"
          ? [200, 100, 200, 100, 200]
          : options.type === "warning"
            ? [200, 100, 200]
            : [200],
    };

    await registration.showNotification(options.title, notificationOptions);
    return true;
  } catch (error) {
    console.error("Error showing notification:", error);
    return false;
  }
};

/**
 * Solicita sincronización en background
 */
export const requestBackgroundSync = async (tag: string): Promise<boolean> => {
  const registration = await getServiceWorkerRegistration();

  if (!registration || !("sync" in registration)) {
    console.warn("Background Sync not supported");
    return false;
  }

  try {
    await (registration as any).sync.register(tag);
    console.log(`Background sync requested: ${tag}`);
    return true;
  } catch (error) {
    console.error("Error requesting background sync:", error);
    return false;
  }
};

/**
 * Limpia el caché del Service Worker
 */
export const clearServiceWorkerCache = async (): Promise<boolean> => {
  if (!isServiceWorkerAvailable()) {
    return false;
  }

  try {
    navigator.serviceWorker.controller?.postMessage({
      type: "CLEAR_CACHE",
    });
    return true;
  } catch (error) {
    console.error("Error clearing cache:", error);
    return false;
  }
};

/**
 * Actualiza el Service Worker inmediatamente
 */
export const updateServiceWorker = async (): Promise<boolean> => {
  const registration = await getServiceWorkerRegistration();

  if (!registration) {
    return false;
  }

  try {
    await registration.update();

    if (registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }

    return true;
  } catch (error) {
    console.error("Error updating service worker:", error);
    return false;
  }
};

/**
 * Envía un mensaje al Service Worker
 */
export const sendMessageToSW = (message: {
  type: string;
  [key: string]: unknown;
}): boolean => {
  if (!isServiceWorkerAvailable()) {
    console.warn("Service Worker not available");
    return false;
  }

  try {
    navigator.serviceWorker.controller?.postMessage(message);
    return true;
  } catch (error) {
    console.error("Error sending message to SW:", error);
    return false;
  }
};

/**
 * Registra un listener para mensajes del Service Worker
 */
export const onSWMessage = (
  callback: (data: { type: string; [key: string]: unknown }) => void,
): (() => void) => {
  if (!("serviceWorker" in navigator)) {
    return () => {};
  }

  const handler = (event: MessageEvent) => {
    callback(event.data);
  };

  navigator.serviceWorker.addEventListener("message", handler);

  // Retorna función para limpiar el listener
  return () => {
    navigator.serviceWorker.removeEventListener("message", handler);
  };
};

/**
 * Escucha eventos personalizados del Service Worker
 */
export const onSWCustomEvent = (
  eventName: string,
  callback: (detail?: unknown) => void,
): (() => void) => {
  const handler = (event: Event) => {
    callback((event as CustomEvent).detail);
  };

  window.addEventListener(`sw-${eventName}`, handler);

  // Retorna función para limpiar el listener
  return () => {
    window.removeEventListener(`sw-${eventName}`, handler);
  };
};

/**
 * Sincroniza las notificaciones
 */
export const syncNotifications = async (): Promise<boolean> => {
  return await requestBackgroundSync("sync-notifications");
};

/**
 * Sincroniza los datos
 */
export const syncData = async (): Promise<boolean> => {
  return await requestBackgroundSync("sync-data");
};

/**
 * Obtiene el estado del Service Worker
 */
export const getServiceWorkerState = async (): Promise<{
  isAvailable: boolean;
  isControlling: boolean;
  state?: string;
  scope?: string;
}> => {
  if (!("serviceWorker" in navigator)) {
    return {
      isAvailable: false,
      isControlling: false,
    };
  }

  const registration = await getServiceWorkerRegistration();

  return {
    isAvailable: !!registration,
    isControlling: !!navigator.serviceWorker.controller,
    state: registration?.active?.state,
    scope: registration?.scope,
  };
};
