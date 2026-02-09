import { useEffect, useCallback, useRef } from "react";
import { useNotificationPush } from "./use-notification-push";
import {
  sendSWNotification,
  onSWCustomEvent,
  syncNotifications as syncNotificationsAPI,
  type SWNotificationOptions,
} from "@/lib/serviceWorker";
import type { AppNotification } from "@/lib/storage";

export interface UseServiceWorkerNotificationsOptions {
  autoSync?: boolean;
  syncInterval?: number;
  onSyncRequested?: () => void;
  onNotificationClosed?: (id: string) => void;
}

export const useServiceWorkerNotifications = (
  options: UseServiceWorkerNotificationsOptions = {},
) => {
  const {
    autoSync = true,
    syncInterval = 60000, // 1 minuto
    onSyncRequested,
    onNotificationClosed,
  } = options;

  const {
    permission,
    isSupported,
    requestPermission,
    showNotification: showBrowserNotification,
    playNotificationSound,
  } = useNotificationPush();

  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Enviar notificación (browser o push según disponibilidad)
  const sendNotification = useCallback(
    async (
      notification: AppNotification,
      options?: {
        playSound?: boolean;
        onClick?: () => void;
        usePush?: boolean;
      },
    ) => {
      const usePush = options?.usePush ?? true;

      // Intentar con Service Worker primero si está habilitado
      if (usePush && permission === "granted") {
        const swOptions: SWNotificationOptions = {
          title: notification.title,
          message: notification.message || "",
          type: notification.type,
          category: notification.category,
          action: notification.action,
          tag: notification.id,
          metadata: notification.metadata,
        };

        const success = await sendSWNotification(swOptions);

        if (success) {
          if (options?.playSound) {
            playNotificationSound();
          }
          return true;
        }
      }

      // Fallback a notificación browser estándar
      if (isSupported && permission === "granted") {
        showBrowserNotification(notification, {
          playSound: options?.playSound,
          onClick: options?.onClick,
        });
        return true;
      }

      return false;
    },
    [permission, isSupported, showBrowserNotification, playNotificationSound],
  );

  // Enviar múltiples notificaciones
  const sendBulkNotifications = useCallback(
    async (
      notifications: AppNotification[],
      options?: {
        playSound?: boolean;
        delay?: number;
      },
    ) => {
      const delay = options?.delay ?? 500; // 500ms entre notificaciones

      for (let i = 0; i < notifications.length; i++) {
        await sendNotification(notifications[i], {
          playSound: options?.playSound && i === 0, // Solo sonar la primera
          usePush: true,
        });

        if (i < notifications.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    },
    [sendNotification],
  );

  // Sincronizar notificaciones manualmente
  const syncNotifications = useCallback(async () => {
    try {
      const success = await syncNotificationsAPI();
      if (success && onSyncRequested) {
        onSyncRequested();
      }
      return success;
    } catch (error) {
      console.error("Error syncing notifications:", error);
      return false;
    }
  }, [onSyncRequested]);

  // Configurar sincronización automática
  useEffect(() => {
    if (!autoSync) return;

    const sync = async () => {
      await syncNotifications();
    };

    // Sincronizar inmediatamente
    sync();

    // Configurar intervalo
    syncIntervalRef.current = setInterval(sync, syncInterval);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [autoSync, syncInterval, syncNotifications]);

  // Escuchar eventos del Service Worker
  useEffect(() => {
    const unsubscribeSyncNotifications = onSWCustomEvent(
      "sync-notifications",
      () => {
        console.log("[Hook] Sync notifications requested by SW");
        if (onSyncRequested) {
          onSyncRequested();
        }
      },
    );

    const unsubscribeNotificationClosed = onSWCustomEvent(
      "notification-closed",
      (detail: any) => {
        console.log("[Hook] Notification closed:", detail?.id);
        if (onNotificationClosed && detail?.id) {
          onNotificationClosed(detail.id);
        }
      },
    );

    return () => {
      unsubscribeSyncNotifications();
      unsubscribeNotificationClosed();
    };
  }, [onSyncRequested, onNotificationClosed]);

  // Notificar sobre cambios de conexión
  useEffect(() => {
    const handleOnline = () => {
      console.log("[Hook] Connection restored, syncing...");
      syncNotifications();
    };

    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [syncNotifications]);

  return {
    // Estado
    permission,
    isSupported,

    // Acciones
    requestPermission,
    sendNotification,
    sendBulkNotifications,
    syncNotifications,
    playNotificationSound,
  };
};

export default useServiceWorkerNotifications;
