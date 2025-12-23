import React from 'react';
import { 
  FileText, 
  Calendar, 
  Users, 
  Target, 
  Tag, 
  CreditCard, 
  Share2, 
  Database,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const tools = [
  {
    icon: FileText,
    title: 'Facturador Offline',
    description: 'Genera facturas PDF con tu logo y datos',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    status: 'Próximamente',
  },
  {
    icon: Calendar,
    title: 'Agenda / Calendario',
    description: 'Recordatorios y citas para tu negocio',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    status: 'Próximamente',
  },
  {
    icon: Users,
    title: 'Mini CRM',
    description: 'Gestiona clientes y proveedores',
    color: 'text-success',
    bgColor: 'bg-success/10',
    status: 'Próximamente',
  },
  {
    icon: Target,
    title: 'Metas Financieras',
    description: 'Define y sigue el progreso de tus objetivos',
    color: 'text-info',
    bgColor: 'bg-info/10',
    status: 'Próximamente',
  },
  {
    icon: Tag,
    title: 'Precios Dinámicos',
    description: 'Calcula precios óptimos de venta',
    color: 'text-chart-5',
    bgColor: 'bg-chart-5/10',
    status: 'Próximamente',
  },
  {
    icon: CreditCard,
    title: 'Control de Deudas',
    description: 'Registra créditos y deudas pendientes',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    status: 'Próximamente',
  },
  {
    icon: Share2,
    title: 'Posts para Redes',
    description: 'Genera contenido para promocionar tu negocio',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    status: 'Próximamente',
  },
  {
    icon: Database,
    title: 'Respaldo y Restauración',
    description: 'Exporta e importa todos tus datos',
    color: 'text-success',
    bgColor: 'bg-success/10',
    status: 'Disponible',
    link: '/configuracion',
  },
];

export const Herramientas: React.FC = () => {
  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
        <h2 className="text-xl font-bold mb-2">Herramientas Adicionales</h2>
        <p className="text-muted-foreground">
          Funciones extra para potenciar tu gestión empresarial
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <div
            key={tool.title}
            className={cn(
              'bg-card rounded-2xl p-5 shadow-soft border border-border',
              'transition-all duration-300 hover:shadow-material-md',
              tool.status === 'Próximamente' ? 'opacity-75' : 'cursor-pointer hover:border-primary/50'
            )}
          >
            <div className="flex items-start gap-4">
              <div className={cn('p-3 rounded-xl', tool.bgColor)}>
                <tool.icon className={cn('w-6 h-6', tool.color)} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold">{tool.title}</h3>
                  {tool.status === 'Próximamente' ? (
                    <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full">
                      Próximamente
                    </span>
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{tool.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Coming Soon Notice */}
      <div className="bg-muted/50 rounded-2xl p-6 text-center">
        <h3 className="font-semibold mb-2">¿Tienes sugerencias?</h3>
        <p className="text-sm text-muted-foreground">
          Estamos trabajando en nuevas herramientas. Las funciones marcadas como "Próximamente" 
          estarán disponibles en futuras actualizaciones.
        </p>
      </div>
    </div>
  );
};

export default Herramientas;
