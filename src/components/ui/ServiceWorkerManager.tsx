import React, { useEffect, useState } from "react";
import { RefreshCw, Download, X, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  getServiceWorkerState,
  updateServiceWorker,
  clearServiceWorkerCache,
} from "@/lib/serviceWorker";

interface ServiceWorkerManagerProps {
  showDetails?: boolean;
  showUpdatePrompt?: boolean;
  className?: string;
}

export const ServiceWorkerManager: React.FC<ServiceWorkerManagerProps> = ({
  showDetails = false,
  showUpdatePrompt = true,
  className,
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [swState, setSwState] = useState<{
    isAvailable: boolean;
    isControlling: boolean;
    state?: string;
    scope?: string;
  }>({ isAvailable: false, isControlling: false });
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  // Monitorear estado de conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Obtener estado del SW
  useEffect(() => {
    const updateState = async () => {
      const state = await getServiceWorkerState();
      setSwState(state);
    };

    updateState();
    const interval = setInterval(updateState, 30000); // Actualizar cada 30s

    return () => clearInterval(interval);
  }, []);

  // Detectar actualizaciones disponibles
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const handleUpdateFound = () => {
      setUpdateAvailable(true);
      if (showUpdatePrompt) {
        setShowPrompt(true);
      }
    };

    navigator.serviceWorker.addEventListener("updatefound", handleUpdateFound);

    // Verificar al cargar
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration?.waiting) {
        setUpdateAvailable(true);
        if (showUpdatePrompt) {
          setShowPrompt(true);
        }
      }
    });

    return () => {
      navigator.serviceWorker.removeEventListener(
        "updatefound",
        handleUpdateFound,
      );
    };
  }, [showUpdatePrompt]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateServiceWorker();
      window.location.reload();
    } catch (error) {
      console.error("Error al actualizar:", error);
      setIsUpdating(false);
    }
  };

  const handleClearCache = async () => {
    try {
      await clearServiceWorkerCache();
      window.location.reload();
    } catch (error) {
      console.error("Error al limpiar caché:", error);
    }
  };

  if (!swState.isAvailable && !showDetails) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Prompt de actualización */}
      {showPrompt && updateAvailable && (
        <Card className="p-4 border-primary bg-primary/5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Download className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm mb-1">
                  Nueva versión disponible
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Actualiza ahora para obtener las últimas mejoras y
                  correcciones.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleUpdate}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <Download className="w-3 h-3 mr-1" />
                        Actualizar
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowPrompt(false)}
                  >
                    Más tarde
                  </Button>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setShowPrompt(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Detalles del SW */}
      {showDetails && (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">Service Worker</h3>
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Badge variant="default" className="gap-1">
                    <Wifi className="w-3 h-3" />
                    En línea
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <WifiOff className="w-3 h-3" />
                    Sin conexión
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs mb-1">Estado</p>
                <Badge
                  variant={
                    swState.isAvailable && swState.isControlling
                      ? "default"
                      : "secondary"
                  }
                >
                  {swState.isAvailable && swState.isControlling
                    ? "Activo"
                    : "Inactivo"}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Control</p>
                <p className="font-medium text-xs">
                  {swState.isControlling ? "Controlando" : "Sin control"}
                </p>
              </div>
              {swState.state && (
                <div>
                  <p className="text-muted-foreground text-xs mb-1">
                    Estado SW
                  </p>
                  <p className="font-medium text-xs capitalize">
                    {swState.state}
                  </p>
                </div>
              )}
              {updateAvailable && (
                <div>
                  <p className="text-muted-foreground text-xs mb-1">
                    Actualización
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    Disponible
                  </Badge>
                </div>
              )}
            </div>

            {swState.scope && (
              <div className="text-xs">
                <p className="text-muted-foreground mb-1">Scope</p>
                <code className="bg-muted px-2 py-1 rounded text-xs break-all">
                  {swState.scope}
                </code>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t">
              {updateAvailable && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="flex-1"
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <Download className="w-3 h-3 mr-1" />
                      Actualizar
                    </>
                  )}
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={handleClearCache}
                className="flex-1"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Limpiar caché
              </Button>
            </div>

            <div className="text-xs text-muted-foreground pt-2 border-t">
              <p className="mb-1">
                💡{" "}
                <strong>
                  El Service Worker permite que la app funcione sin conexión
                </strong>
              </p>
              <ul className="list-disc list-inside space-y-0.5 ml-2">
                <li>Cachea recursos para acceso rápido</li>
                <li>Sincroniza datos cuando vuelve la conexión</li>
                <li>Gestiona notificaciones push</li>
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ServiceWorkerManager;
