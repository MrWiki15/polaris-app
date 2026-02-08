import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Ventas from "@/pages/Ventas";
import Gastos from "@/pages/Gastos";
import Inventario from "@/pages/Inventario";
import Analisis from "@/pages/Analisis";
import Comparador from "@/pages/Comparador";
import Proyecciones from "@/pages/Proyecciones";
import Herramientas from "@/pages/Herramientas";
import Configuracion from "@/pages/Configuracion";
import Facturador from "@/pages/Facturador";
import Agenda from "@/pages/Agenda";
import MiniCRM from "@/pages/MiniCRM";
import Metas from "@/pages/Metas";
import PreciosDinamicos from "@/pages/PreciosDinamicos";
import Deudas from "@/pages/Deudas";
import PostsRedes from "@/pages/PostsRedes";
import PagosRecurrentes from "@/pages/PagosRecurrentes";
import Servicios from "@/pages/Servicios";
import Premium from "@/pages/Premium";
import NotFound from "@/pages/NotFound";
import Teams from "./pages/Teams";
import History from "./pages/History";
import Wallet from "./pages/Wallet";
import Onboarding from "./pages/Onboarding";
import Ingreso from "./pages/Ingreso";
import Gasto from "./pages/Gasto";
import Item from "./pages/Item";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { supabaseAuth } = useApp();

  if (supabaseAuth.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  if (supabaseAuth.user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { supabaseAuth } = useApp();

  if (supabaseAuth.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  if (!supabaseAuth.user) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

import { SyncConflictModal } from "@/components/ui/SyncConflictModal";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <SyncConflictModal />
        <BrowserRouter>
          <Routes>
            <Route
              path="/onboarding"
              element={
                <PublicRoute>
                  <Onboarding />
                </PublicRoute>
              }
            />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/ingresos" element={<Ventas />} />
              <Route path="/ingresos/:id" element={<Ingreso />} />
              <Route path="/gastos" element={<Gastos />} />
              <Route path="/gastos/:id" element={<Gasto />} />
              <Route path="/inventario" element={<Inventario />} />
              <Route path="/inventario/:id" element={<Item />} />
              <Route path="/servicios" element={<Servicios />} />
              <Route path="/analisis" element={<Analisis />} />
              <Route path="/compar/:pair" element={<Comparador />} />
              <Route path="/proyecciones" element={<Proyecciones />} />
              <Route path="/herramientas" element={<Herramientas />} />
              <Route path="/herramientas/facturador" element={<Facturador />} />
              <Route path="/herramientas/agenda" element={<Agenda />} />
              <Route path="/herramientas/crm" element={<MiniCRM />} />
              <Route path="/herramientas/metas" element={<Metas />} />
              <Route
                path="/herramientas/precios"
                element={<PreciosDinamicos />}
              />
              <Route path="/herramientas/deudas" element={<Deudas />} />
              <Route path="/herramientas/posts" element={<PostsRedes />} />
              <Route
                path="/herramientas/pagos-recurrentes"
                element={<PagosRecurrentes />}
              />
              <Route path="/premium" element={<Premium />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/history" element={<History />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/configuracion" element={<Configuracion />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
