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
  Users,
  FileText,
  Target,
  RefreshCw,
  Tag,
  CreditCard,
  Pencil,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { AutoSyncIndicator } from "@/components/ui/AutoSyncIndicator";
import { cn } from "@/lib/utils";
import { BottomTabbar } from "@/components/ui/BottomTabbar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const MENU_ITEMS = [
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

const EXTRA_MENU_ITEMS = {
  crm: { path: "/herramientas/crm", icon: Users, label: "Mini CRM" },
  facturador: {
    path: "/herramientas/facturador",
    icon: FileText,
    label: "Facturador",
  },
  metas: {
    path: "/herramientas/metas",
    icon: Target,
    label: "Metas",
  },
  pagosRecurrentes: {
    path: "/herramientas/pagos-recurrentes",
    icon: RefreshCw,
    label: "Recurrencia",
  },
  preciosDinamicos: {
    path: "/herramientas/precios",
    icon: Tag,
    label: "Precios dinámicos",
  },
  deudas: {
    path: "/herramientas/deudas",
    icon: CreditCard,
    label: "Control de deudas",
  },
  postas: {
    path: "/herramientas/posts",
    icon: Pencil,
    label: "Redes Sociales",
  },
};

type DepartmentConfig = {
  [key: string]: ("all" | string)[];
};

export const DEPARTMENT_PERMISSIONS: DepartmentConfig = {
  direccion: ["all"],
  ventas: ["/ingresos", "/herramientas/crm"],
  recursos_humanos: ["/herramientas/crm", "/herramientas/agenda"],
  logistica: ["/inventario"],
  marketing: ["/herramientas/posts"],
  economia: [
    "/servicios",
    "/gastos",
    "/analisis",
    "/proyecciones",
    "/herramientas/facturador",
    "/herramientas/metas",
    "/herramientas/pagos-recurrentes",
    "/herramientas/precios",
    "/herramientas/deudas",
    "/herramientas/crm",
  ],
  // Add other departments here
};

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    theme,
    toggleTheme,
    data,
    supabaseSyncState,
    supabaseAuth,
    currentProject,
    currentProjectMember,
    setCurrentProject,
  } = useApp();
  const location = useLocation();
  const isPremium = data.settings.isPremium || false;

  const getFilteredMenuItems = () => {
    // 1. Personal Workspace (No project selected)
    if (!currentProject) {
      return MENU_ITEMS;
    }

    // 2. Project Workspace
    const dept = currentProjectMember?.departament;
    if (!dept) return MENU_ITEMS; // Fallback

    const permissions = DEPARTMENT_PERMISSIONS[dept];
    if (!permissions) return MENU_ITEMS; // Fallback if dept not defined

    if (permissions.includes("all")) {
      return MENU_ITEMS;
    }

    // Build specific menu
    const items: any[] = [];
    permissions.forEach((path) => {
      if (path === "all") return;

      // Check in standard items
      const standardItem = MENU_ITEMS.find((i) => i.path === path);
      if (standardItem) {
        items.push(standardItem);
        return;
      }

      // Check in extra items
      const extraItem = Object.values(EXTRA_MENU_ITEMS).find(
        (i) => i.path === path,
      );
      if (extraItem) {
        items.push(extraItem);
        return;
      }
    });

    return items;
  };

  const menuItems = getFilteredMenuItems();

  const userEmail = supabaseAuth.user?.email || "";

  const { data: projectOptions } = useQuery({
    queryKey: ["projects-selector", userEmail],
    enabled: !!userEmail,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id,name,members")
        .contains("members", JSON.stringify([{ email: userEmail }]));
      if (error) throw error;
      return (data || []) as {
        id: number;
        name: string;
        members: { email: string; departament: string; role: string }[];
      }[];
    },
  });

  const handleProjectChange = (value: string) => {
    if (!projectOptions) return;
    if (value === "personal") {
      setCurrentProject(null, null);
      return;
    }
    const id = Number(value);
    const project = projectOptions.find((p) => p.id === id);
    if (!project) return;
    const member = project.members?.find((m) => m.email === userEmail) || null;
    setCurrentProject(
      {
        id: project.id,
        name: project.name,
        members: project.members || [],
      },
      member,
    );
  };

  const currentPage =
    [...MENU_ITEMS, ...Object.values(EXTRA_MENU_ITEMS)].find(
      (item) => item.path === location.pathname,
    )?.label || "Polaris  |  Gestion";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-sidebar border-r border-sidebar-border",
          "transform transition-transform duration-300 ease-material",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-material">
              <img src="/icon.svg" className="w-10 h-10" />
            </div>
            <div>
              <h1 className="font-semibold text-sidebar-foreground">Polaris</h1>
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
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50",
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
                        : "text-muted-foreground group-hover:text-sidebar-primary",
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

          {supabaseAuth?.isAuthenticated && (
            <div className="px-3 pb-3">
              <div className="text-xs text-muted-foreground mb-2">
                Proyecto actual
              </div>
              <div className="relative">
                <select
                  className={cn(
                    "w-full appearance-none px-4 py-2.5 rounded-xl",
                    "border border-sidebar-border bg-sidebar",
                    "text-sidebar-foreground text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-sidebar-primary/40 focus:border-sidebar-primary",
                    "transition-all duration-200 ease-material",
                    "cursor-pointer hover:bg-sidebar-accent/30",
                  )}
                  value={
                    currentProject ? String(currentProject.id) : "personal"
                  }
                  onChange={(e) => handleProjectChange(e.target.value)}
                >
                  <option value="personal">Personal</option>
                  {(projectOptions || []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                      {p.id === currentProject?.id && currentProjectMember
                        ? ` (${currentProjectMember.departament})`
                        : ""}
                    </option>
                  ))}
                </select>
                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          )}
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
        {supabaseAuth?.isAuthenticated && <BottomTabbar />}
      </div>
    </div>
  );
};
