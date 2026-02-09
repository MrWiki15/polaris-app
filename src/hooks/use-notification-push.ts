import { useEffect, useRef, useState } from "react";
import type { AppNotification } from "@/lib/storage";

export type NotificationPermissionState = "default" | "granted" | "denied";

export const useNotificationPush = () => {
  const [permission, setPermission] = useState<NotificationPermissionState>(
    typeof window !== "undefined" && "Notification" in window
      ? (Notification.permission as NotificationPermissionState)
      : "denied",
  );
  const [isSupported] = useState(
    typeof window !== "undefined" && "Notification" in window,
  );

  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "AudioContext" in window) {
      audioContextRef.current = new AudioContext();
    }
  }, []);

  const requestPermission = async (): Promise<NotificationPermissionState> => {
    if (!isSupported) {
      return "denied";
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result as NotificationPermissionState);
      return result as NotificationPermissionState;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return "denied";
    }
  };

  const playNotificationSound = () => {
    if (!audioContextRef.current) return;

    try {
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.setValueAtTime(600, ctx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (err) {
      console.warn("Could not play notification sound:", err);
    }
  };

  const showNotification = (
    notification: AppNotification,
    options?: {
      playSound?: boolean;
      onClick?: () => void;
    },
  ) => {
    if (!isSupported || permission !== "granted") {
      return;
    }

    const notif = new Notification(notification.title, {
      body: notification.message || "",
      icon: "/icon.svg",
      badge: "/icon.svg",
      tag: notification.id,
      requireInteraction: notification.type === "error",
      silent: !options?.playSound,
    });

    if (options?.onClick) {
      notif.onclick = () => {
        window.focus();
        options.onClick?.();
        notif.close();
      };
    }

    if (options?.playSound) {
      playNotificationSound();
    }

    // Auto-close after 5 seconds for non-error notifications
    if (notification.type !== "error") {
      setTimeout(() => {
        notif.close();
      }, 5000);
    }

    return notif;
  };

  return {
    permission,
    isSupported,
    requestPermission,
    showNotification,
    playNotificationSound,
  };
};
