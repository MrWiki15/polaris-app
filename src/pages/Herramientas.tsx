import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Calendar, 
  Users, 
  Target, 
  Tag, 
  CreditCard, 
  Share2, 
  Database,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const tools = [
  { icon: FileText, title: 'Facturador Offline', description: 'Genera facturas PDF con tu logo y datos', color: 'text-primary', bgColor: 'bg-primary/10', link: '/herramientas/facturador' },
  { icon: Calendar, title: 'Agenda / Calendario', description: 'Recordatorios y citas para tu negocio', color: 'text-warning', bgColor: 'bg-warning/10', link: '/herramientas/agenda' },
  { icon: Users, title: 'Mini CRM', description: 'Gestiona clientes y proveedores', color: 'text-success', bgColor: 'bg-success/10', link: '/herramientas/crm' },
  { icon: Target, title: 'Metas Financieras', description: 'Define y sigue el progreso de tus objetivos', color: 'text-info', bgColor: 'bg-info/10', link: '/herramientas/metas' },
  { icon: RefreshCw, title: 'Pagos Recurrentes', description: 'Controla gastos fijos mensuales', color: 'text-chart-3', bgColor: 'bg-chart-3/10', link: '/herramientas/pagos-recurrentes' },
  { icon: Tag, title: 'Precios Dinámicos', description: 'Calcula precios óptimos de venta', color: 'text-chart-5', bgColor: 'bg-chart-5/10', link: '/herramientas/precios' },
  { icon: CreditCard, title: 'Control de Deudas', description: 'Registra créditos y deudas pendientes', color: 'text-destructive', bgColor: 'bg-destructive/10', link: '/herramientas/deudas' },
  { icon: Share2, title: 'Posts para Redes', description: 'Genera contenido para promocionar tu negocio', color: 'text-primary', bgColor: 'bg-primary/10', link: '/herramientas/posts' },
  { icon: Database, title: 'Respaldo y Restauración', description: 'Exporta e importa todos tus datos', color: 'text-success', bgColor: 'bg-success/10', link: '/configuracion' },
];

export const Herramientas: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-4 sm:p-6 border border-primary/20">
        <h2 className="text-lg sm:text-xl font-bold mb-2">Herramientas Adicionales</h2>
        <p className="text-sm text-muted-foreground">Funciones extra para potenciar tu gestión</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {tools.map((tool) => (
          <div
            key={tool.title}
            onClick={() => navigate(tool.link)}
            className={cn(
              'bg-card rounded-2xl p-4 sm:p-5 shadow-soft border border-border cursor-pointer',
              'transition-all duration-300 hover:shadow-material-md hover:border-primary/50'
            )}
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div className={cn('p-2.5 sm:p-3 rounded-xl', tool.bgColor)}>
                <tool.icon className={cn('w-5 h-5 sm:w-6 sm:h-6', tool.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-sm sm:text-base">{tool.title}</h3>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">{tool.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Herramientas;
