import React, { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Package,
  BarChart3,
  TrendingUp,
  Wrench,
  Settings,
  Menu,
  X,
  Sun,
  Moon,
  ChevronRight,
  ClipboardList,
  Crown,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { AutoSyncIndicator } from "@/components/ui/AutoSyncIndicator";
import { cn } from "@/lib/utils";

const menuItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/ingresos", icon: ShoppingCart, label: "Ingresos" },
  { path: "/gastos", icon: Receipt, label: "Gastos" },
  { path: "/inventario", icon: Package, label: "Inventario" },
  { path: "/servicios", icon: ClipboardList, label: "Servicios" },
  { path: "/analisis", icon: BarChart3, label: "Análisis" },
  { path: "/proyecciones", icon: TrendingUp, label: "Proyecciones" },
  { path: "/herramientas", icon: Wrench, label: "Herramientas" },
  { path: "/premium", icon: Crown, label: "Premium" },
  { path: "/configuracion", icon: Settings, label: "Configuración" },
];

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme, data, supabaseSyncState } = useApp();
  const location = useLocation();
  const isPremium = data.settings.isPremium || false;

  const currentPage =
    menuItems.find((item) => item.path === location.pathname)?.label ||
    "UP  |  Gestion";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-sidebar border-r border-sidebar-border",
          "transform transition-transform duration-300 ease-material",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-material">
              <img src="/icon.svg" className="w-10 h-10" />
            </div>
            <div>
              <h1 className="font-semibold text-sidebar-foreground">UP</h1>
              <p className="text-xs text-muted-foreground">Panel de control</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  "group relative overflow-hidden",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-soft"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      "w-5 h-5 transition-colors",
                      isActive
                        ? "text-sidebar-primary"
                        : "text-muted-foreground group-hover:text-sidebar-primary"
                    )}
                  />
                  <span className="flex-1">{item.label}</span>
                  {item.path === "/premium" && isPremium && (
                    <span className="px-2 py-0.5 bg-success/20 text-success rounded-full text-xs font-medium">
                      ✓
                    </span>
                  )}
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-sidebar-primary" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-sidebar-border bg-sidebar">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            {theme === "light" ? (
              <>
                <Moon className="w-5 h-5 text-muted-foreground" />
                <span>Modo oscuro</span>
              </>
            ) : (
              <>
                <Sun className="w-5 h-5 text-warning" />
                <span>Modo claro</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-lg border-b border-border flex items-center px-4 gap-4 justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="font-semibold text-lg">{currentPage}</h2>
          </div>
          {isPremium && supabaseSyncState && (
            <AutoSyncIndicator
              isSyncing={supabaseSyncState.isSyncing}
              isOnline={supabaseSyncState.isOnline}
              lastSyncTime={supabaseSyncState.lastSyncTime}
            />
          )}
        </header>

        {/* Page content */}
        <main
          className=" 
      w-[100vw] sm:w-full p-4 lg:p-6 overflow-auto"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
