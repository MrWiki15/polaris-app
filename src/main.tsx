import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// ============================================
// REGISTRO DEL SERVICE WORKER
// ============================================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("✅ Service Worker registrado:", registration.scope);

        // Escuchar actualizaciones del SW
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          console.log("🔄 Nueva versión del Service Worker encontrada");

          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                console.log(
                  "🆕 Nueva versión disponible. Recarga para actualizar.",
                );
                // Aquí podrías mostrar un toast al usuario
                if (
                  confirm("Nueva versión disponible. ¿Deseas actualizar ahora?")
                ) {
                  newWorker.postMessage({ type: "SKIP_WAITING" });
                  window.location.reload();
                }
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error("❌ Error al registrar Service Worker:", error);
      });

    // Escuchar mensajes del Service Worker
    navigator.serviceWorker.addEventListener("message", (event) => {
      console.log("📨 Mensaje del Service Worker:", event.data);

      switch (event.data.type) {
        case "NAVIGATE":
          // Navegar a la URL especificada
          window.location.href = event.data.url;
          break;

        case "SYNC_NOTIFICATIONS":
          // Disparar evento personalizado para que AppContext sincronice
          window.dispatchEvent(new CustomEvent("sw-sync-notifications"));
          break;

        case "SYNC_DATA":
          // Disparar evento personalizado para sincronización general
          window.dispatchEvent(new CustomEvent("sw-sync-data"));
          break;

        case "NOTIFICATION_CLOSED":
          // Manejar cierre de notificación si es necesario
          window.dispatchEvent(
            new CustomEvent("sw-notification-closed", {
              detail: { id: event.data.id },
            }),
          );
          break;
      }
    });

    // Recargar cuando el SW toma control
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  });
}
