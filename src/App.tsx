import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Ventas from "@/pages/Ventas";
import Gastos from "@/pages/Gastos";
import Inventario from "@/pages/Inventario";
import Analisis from "@/pages/Analisis";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/ingresos" element={<Ventas />} />
              <Route path="/gastos" element={<Gastos />} />
              <Route path="/inventario" element={<Inventario />} />
              <Route path="/servicios" element={<Servicios />} />
              <Route path="/analisis" element={<Analisis />} />
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
