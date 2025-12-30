import React from "react";
import { Cloud, CloudOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface AutoSyncIndicatorProps {
  isSyncing?: boolean;
  isOnline?: boolean;
  lastSyncTime?: string | null;
}

export const AutoSyncIndicator: React.FC<AutoSyncIndicatorProps> = ({
  isSyncing = false,
  isOnline = true,
  lastSyncTime,
}) => {
  if (!isOnline) {
    return (
      <div
        className="flex items-center gap-2 px-3 py-1 rounded-lg bg-warning/10 border border-warning/20"
        title="Sin conexión. Los datos se sincronizarán cuando regreses a estar en línea."
      >
        <CloudOff className="w-4 h-4 text-warning animate-pulse" />
        <span className="text-xs text-warning font-medium">Sin conexión</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1 rounded-lg transition-all",
        isSyncing
          ? "bg-primary/10 border border-primary/20"
          : "bg-success/10 border border-success/20"
      )}
      title={
        isSyncing
          ? "Guardando datos..."
          : lastSyncTime
          ? `Último guardado: ${new Date(lastSyncTime).toLocaleTimeString(
              "es-ES"
            )}`
          : "Sincronizado"
      }
    >
      <Cloud
        className={cn(
          "w-4 h-4 transition-all",
          isSyncing ? "text-primary animate-spin" : "text-success animate-none"
        )}
      />
      <span className="text-xs font-medium text-muted-foreground">
        {isSyncing ? "Guardando..." : "Sincronizado"}
      </span>
    </div>
  );
};
