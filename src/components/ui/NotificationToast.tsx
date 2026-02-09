import React, { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/lib/storage";

interface NotificationToastProps {
  notification: AppNotification;
  onClose: () => void;
  onClick?: () => void;
}

const typeStyles = {
  info: "bg-blue-500 border-blue-600",
  warning: "bg-amber-500 border-amber-600",
  success: "bg-green-500 border-green-600",
  error: "bg-red-500 border-red-600",
};

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
  onClick,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = setTimeout(() => setIsVisible(true), 10);

    // Auto-dismiss after 5 seconds for non-error notifications
    const dismissTimer =
      notification.type !== "error"
        ? setTimeout(() => {
            handleClose();
          }, 5000)
        : null;

    return () => {
      clearTimeout(enterTimer);
      if (dismissTimer) clearTimeout(dismissTimer);
    };
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div
      className={cn(
        "fixed top-20 right-4 z-[100] w-80 max-w-[calc(100vw-2rem)]",
        "transform transition-all duration-300 ease-out",
        isVisible && !isLeaving
          ? "translate-x-0 opacity-100"
          : "translate-x-[120%] opacity-0",
      )}
      style={{
        animation: isVisible && !isLeaving ? "slideInRight 0.3s ease-out" : "",
      }}
    >
      <div
        className={cn(
          "rounded-lg shadow-2xl border-2 text-white p-4 cursor-pointer",
          "backdrop-blur-sm bg-opacity-95",
          typeStyles[notification.type],
          "animate-in fade-in slide-in-from-right-5",
        )}
        onClick={() => {
          onClick?.();
          handleClose();
        }}
        role="button"
        tabIndex={0}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <Bell className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="font-semibold text-sm">{notification.title}</h4>
            {notification.message && (
              <p className="text-xs opacity-90 line-clamp-2">
                {notification.message}
              </p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="p-1 rounded-md hover:bg-white/20 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface NotificationToastContainerProps {
  notifications: AppNotification[];
  onDismiss: (id: string) => void;
  onNotificationClick?: (notification: AppNotification) => void;
}

export const NotificationToastContainer: React.FC<
  NotificationToastContainerProps
> = ({ notifications, onDismiss, onNotificationClick }) => {
  return (
    <>
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{ top: `${80 + index * 100}px` }}
          className="fixed right-4 z-[100]"
        >
          <NotificationToast
            notification={notification}
            onClose={() => onDismiss(notification.id)}
            onClick={() => onNotificationClick?.(notification)}
          />
        </div>
      ))}
    </>
  );
};
