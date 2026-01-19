import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Receipt,
  Package,
  BarChart3,
  TrendingUp,
  Wrench,
  Users,
  CreditCard,
  Target,
  Zap,
  Lock,
  Cloud,
  ChevronRight,
  Check,
} from "lucide-react";

type Feature = {
  icon: React.ReactNode;
  title: string;
  description: string;
  details: string[];
  color: string;
};

const FEATURES: Feature[] = [
  {
    icon: <ShoppingCart className="w-8 h-8" />,
    title: "Gestión de Ingresos",
    description: "Registra y controla todos tus ingresos",
    details: [
      "Registra ingresos manuales o desde inventario",
      "Categorización automática de ventas",
      "Historial completo de transacciones",
      "Exporta reportes de ingresos",
    ],
    color: "from-green-500 to-emerald-600",
  },
  {
    icon: <Receipt className="w-8 h-8" />,
    title: "Control de Gastos",
    description: "Administra y monitorea tus gastos",
    details: [
      "Registra gastos con categorías personalizadas",
      "Pagos recurrentes automáticos",
      "Análisis de gastos por categoría",
      "Alertas de presupuesto",
    ],
    color: "from-red-500 to-orange-600",
  },
  {
    icon: <Package className="w-8 h-8" />,
    title: "Inventario",
    description: "Gestiona tu stock de productos",
    details: [
      "Control en tiempo real del inventario",
      "Códigos de barras para escaneo rápido",
      "Alertas de stock bajo",
      "Costos y precios por producto",
      "Historial de movimientos",
    ],
    color: "from-blue-500 to-cyan-600",
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "CRM Integrado",
    description: "Gestiona clientes y relaciones",
    details: [
      "Base de datos de clientes",
      "Historial de compras por cliente",
      "Contactos y información de negocio",
      "Seguimiento de interacciones",
    ],
    color: "from-purple-500 to-pink-600",
  },
  {
    icon: <BarChart3 className="w-8 h-8" />,
    title: "Análisis y Reportes",
    description: "Visualiza tu desempeño comercial",
    details: [
      "Gráficos interactivos en tiempo real",
      "Análisis de tendencias de ventas",
      "Comparación de períodos",
      "Exportación a PDF y Excel",
    ],
    color: "from-indigo-500 to-blue-600",
  },
  {
    icon: <TrendingUp className="w-8 h-8" />,
    title: "Proyecciones",
    description: "Planifica el futuro de tu negocio",
    details: [
      "Proyecciones de ingresos",
      "Análisis de rentabilidad",
      "Metas y objetivos",
      "Alertas automáticas",
    ],
    color: "from-yellow-500 to-orange-600",
  },
  {
    icon: <Target className="w-8 h-8" />,
    title: "Metas y Objetivos",
    description: "Establece y alcanza tus metas",
    details: [
      "Crear metas financieras",
      "Seguimiento de progreso",
      "Reinversión automática",
      "Objetivos por período",
    ],
    color: "from-rose-500 to-pink-600",
  },
  {
    icon: <CreditCard className="w-8 h-8" />,
    title: "Control de Deudas",
    description: "Gestiona deudas y obligaciones",
    details: [
      "Registro de deudas pendientes",
      "Seguimiento de pagos",
      "Alertas de vencimiento",
      "Historial de transacciones",
    ],
    color: "from-orange-500 to-red-600",
  },
  {
    icon: <Wrench className="w-8 h-8" />,
    title: "Herramientas Avanzadas",
    description: "Potencia tu negocio con herramientas profesionales",
    details: [
      "Facturador digital integrado",
      "Precios dinámicos según demanda",
      "Gestión de proveedores",
      "Redes sociales y marketing",
    ],
    color: "from-slate-500 to-gray-600",
  },
  {
    icon: <Lock className="w-8 h-8" />,
    title: "Seguridad Premium",
    description: "Protege tus datos con la versión premium",
    details: [
      "Sincronización en la nube",
      "Backups automáticos",
      "Encriptación de datos",
      "Acceso desde cualquier dispositivo",
    ],
    color: "from-teal-500 to-cyan-600",
  },
];

const PREMIUM_FEATURES = [
  { icon: <Cloud className="w-6 h-6" />, text: "Sincronización en la nube" },
  {
    icon: <Users className="w-6 h-6" />,
    text: "Gestión de proyectos en equipo",
  },
  { icon: <BarChart3 className="w-6 h-6" />, text: "Reportes avanzados" },
  { icon: <Zap className="w-6 h-6" />, text: "Automatización de procesos" },
  { icon: <Lock className="w-6 h-6" />, text: "Encriptación de datos" },
  { icon: <TrendingUp className="w-6 h-6" />, text: "Análisis predictivo" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentFeature, setCurrentFeature] = useState(0);

  const handleNext = () => {
    if (currentFeature < FEATURES.length - 1) {
      setCurrentFeature(currentFeature + 1);
    }
  };

  const handlePrev = () => {
    if (currentFeature > 0) {
      setCurrentFeature(currentFeature - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("negocio360_onboarding_completed", "true");
    navigate("/");
  };

  const feature = FEATURES[currentFeature];
  const progress = ((currentFeature + 1) / FEATURES.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <img src="/icon.svg" className="w-10 h-10" alt="Polaris" />
            </div>
            <h1 className="text-2xl font-bold">Polaris</h1>
          </div>
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-sm text-muted-foreground hover:text-white"
          >
            Saltar
          </Button>
        </div>

        {/* Main content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[calc(100vh-80px)] flex flex-col">
          <div className="flex-1 flex flex-col gap-8">
            {/* Progress bar */}
            <div className="w-full bg-slate-700 rounded-full h-1 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            {/* Feature showcase */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Feature card */}
              <div className="order-2 lg:order-1">
                <div
                  className={`bg-gradient-to-br ${feature.color} rounded-2xl p-1 shadow-2xl`}
                >
                  <div className="bg-slate-800 rounded-2xl p-8 sm:p-12 h-full flex flex-col justify-between">
                    <div className="mb-6 text-6xl text-white opacity-80">
                      {feature.icon}
                    </div>
                    <div>
                      <h2 className="text-3xl sm:text-4xl font-bold mb-3">
                        {feature.title}
                      </h2>
                      <p className="text-lg text-slate-300 mb-8">
                        {feature.description}
                      </p>
                      <ul className="space-y-3">
                        {feature.details.map((detail, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3 animate-fade-in"
                            style={{ animationDelay: `${idx * 100}ms` }}
                          >
                            <div className="mt-1">
                              <Check className="w-5 h-5 text-green-400" />
                            </div>
                            <span className="text-slate-300">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features grid */}
              <div className="order-1 lg:order-2">
                <h3 className="text-2xl font-bold mb-6">
                  Más herramientas disponibles
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {FEATURES.map((f, idx) => (
                    <div
                      key={idx}
                      onClick={() => setCurrentFeature(idx)}
                      className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                        currentFeature === idx
                          ? "bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg"
                          : "bg-slate-700/50 hover:bg-slate-700 border border-slate-600"
                      }`}
                    >
                      <div className="text-3xl mb-2 opacity-90">{f.icon}</div>
                      <h4 className="text-sm font-semibold leading-tight">
                        {f.title}
                      </h4>
                    </div>
                  ))}
                </div>

                {/* Feature counter */}
                <div className="text-sm text-slate-400">
                  Característica {currentFeature + 1} de {FEATURES.length}
                </div>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-4 mt-auto pt-8">
              <Button
                onClick={handlePrev}
                disabled={currentFeature === 0}
                variant="outline"
                className="flex-1 sm:flex-none"
              >
                Anterior
              </Button>

              <div className="flex gap-2">
                {Array.from({ length: Math.min(5, FEATURES.length) }).map(
                  (_, idx) => (
                    <div
                      key={idx}
                      className={`h-2 rounded-full transition-all ${
                        idx < Math.ceil((currentFeature + 1) / 2)
                          ? "bg-purple-500 w-8"
                          : "bg-slate-600 w-2"
                      }`}
                    ></div>
                  ),
                )}
              </div>

              <Button
                onClick={
                  currentFeature === FEATURES.length - 1
                    ? handleSkip
                    : handleNext
                }
                className="flex-1 sm:flex-none bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {currentFeature === FEATURES.length - 1 ? (
                  <>
                    Comenzar <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Siguiente <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Premium section */}
          {currentFeature === Math.floor(FEATURES.length / 2) && (
            <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-6 h-6 text-yellow-400" />
                <h3 className="text-xl font-bold">Versión Premium</h3>
              </div>
              <p className="text-slate-300 mb-4">
                Desbloquea todas las características premium y lleva tu negocio
                al siguiente nivel
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PREMIUM_FEATURES.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="text-purple-400">{feat.icon}</div>
                    <span className="text-sm text-slate-300">{feat.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }

        .gradient-primary {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
        }
      `}</style>
    </div>
  );
}
