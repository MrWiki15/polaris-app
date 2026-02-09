import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, AlertTriangle, CheckCircle2, Info, Trash2 } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/lib/storage";

const typeIcon = (type: AppNotification["type"]) => {
  if (type === "warning") return AlertTriangle;
  if (type === "success") return CheckCircle2;
  if (type === "error") return AlertTriangle;
  return Info;
};

const typeStyles = (type: AppNotification["type"]) => {
  if (type === "warning") return "text-warning";
  if (type === "success") return "text-success";
  if (type === "error") return "text-destructive";
  return "text-info";
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  const clean = dateStr.split("T")[0];
  const [y, m, d] = clean.split("-").map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1, 12, 0, 0);
  return dt.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const Notificaciones: React.FC = () => {
  const navigate = useNavigate();
  const {
    data,
    markNotificationRead,
    markAllNotificationsRead,
    clearReadNotifications,
    removeNotification,
  } = useApp();

  const [filter, setFilter] = useState<"all" | "unread">("all");

  const notifications = data.notifications || [];
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const filtered = useMemo(() => {
    const list =
      filter === "unread"
        ? notifications.filter((n) => !n.readAt)
        : notifications;
    return [...list].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [filter, notifications]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Notificaciones</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} sin leer` : "Todo al dia"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilter("all")}
            className={cn(filter === "all" && "bg-accent")}
          >
            Todas
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilter("unread")}
            className={cn(filter === "unread" && "bg-accent")}
          >
            Sin leer
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={markAllNotificationsRead}
            disabled={notifications.length === 0 || unreadCount === 0}
          >
            Marcar todo como leido
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearReadNotifications}
            disabled={notifications.length === 0}
          >
            Limpiar leidas
          </Button>
        </div>
      </div>

      <Card className="p-4">
        {filtered.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">
            No hay notificaciones para mostrar.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((notification, idx) => {
              const Icon = typeIcon(notification.type);
              return (
                <div key={notification.id}>
                  <div
                    className={cn(
                      "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
                      "rounded-xl border border-border px-4 py-3",
                      notification.readAt ? "bg-muted/30" : "bg-background",
                    )}
                    onClick={() => markNotificationRead(notification.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "mt-0.5 w-9 h-9 rounded-lg flex items-center justify-center",
                          notification.readAt ? "bg-muted" : "bg-primary/10",
                        )}
                      >
                        <Icon
                          className={cn(
                            "w-4 h-4",
                            typeStyles(notification.type),
                          )}
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{notification.title}</h3>
                          {!notification.readAt && (
                            <Badge variant="secondary">Nuevo</Badge>
                          )}
                          <Badge variant="outline" className="capitalize">
                            {notification.category}
                          </Badge>
                        </div>
                        {notification.message && (
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                        )}
                        <div className="text-xs text-muted-foreground">
                          {formatDate(notification.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {notification.action && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            markNotificationRead(notification.id);
                            navigate(notification.action.path);
                          }}
                        >
                          {notification.action.label}
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                        aria-label="Eliminar notificacion"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {idx < filtered.length - 1 && <Separator className="my-3" />}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Notificaciones;
