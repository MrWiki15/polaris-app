import React, { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import {
  Crown,
  Check,
  X,
  Sparkles,
  Zap,
  BarChart3,
  Download,
  Cloud,
  Users,
  Shield,
  MessageCircle,
  Gift,
  TrendingUp,
  FileText,
  Calendar,
  Tag,
  CreditCard,
  History,
  Wallet,
  Share2,
  Database,
  Target,
  Building,
  Rocket,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const WHATSAPP_NUMBER = "+5359783697";

const premiumFeatures = [
  {
    category: "Análisis y Reportes",
    features: [
      { icon: BarChart3, text: "Gráficos extendidos (30, 90, 365 días)" },
      {
        icon: Download,
        text: "Exportación PDF/Excel en todas las herramientas",
      },
      { icon: TrendingUp, text: "Análisis predictivo" },
      { icon: FileText, text: "Reportes personalizados avanzados" },
    ],
  },
  {
    category: "Automatización",
    features: [
      { icon: Zap, text: "Recordatorios automáticos" },
      { icon: Cloud, text: "Sincronización en la nube" },
      { icon: Calendar, text: "Tareas programadas" },
      { icon: Gift, text: "Integraciones con otros sistemas" },
    ],
  },
  {
    category: "Colaboración",
    features: [
      { icon: Users, text: "Múltiples usuarios con roles" },
      { icon: Share2, text: "Compartir eventos y metas" },
      { icon: Database, text: "Trabajo en equipo" },
    ],
  },
];

// Planes disponibles
const plans = [
  {
    id: "emprendedor",
    name: "Plan Emprendedor",
    description: "Perfecto para emprendedores individuales",
    price: "$2/mes",
    features: [
      "Hasta 3 proyectos activos",
      "5 GB de almacenamiento en la nube",
      "Exportaciones básicas",
      "Soporte por email",
      "Análisis básico",
    ],
    icon: Rocket,
    color: "from-blue-500 to-cyan-500",
    disabled: true,
  },
  {
    id: "pequeno",
    name: "Plan Proyectos Pequeños",
    description: "Ideal para equipos pequeños",
    price: "$15/mes",
    features: [
      "Hasta 10 proyectos activos",
      "20 GB de almacenamiento",
      "Exportaciones avanzadas",
      "Soporte prioritario",
      "Análisis predictivo básico",
      "Hasta 5 miembros de equipo",
    ],
    icon: Target,
    color: "from-purple-500 to-pink-500",
    disabled: true,
  },
  {
    id: "empresa",
    name: "Plan Empresas",
    description: "Para organizaciones grandes",
    price: "$350/mes",
    features: [
      "Proyectos ilimitados",
      "100 GB de almacenamiento",
      "Todas las exportaciones",
      "Soporte 24/7",
      "Análisis predictivo avanzado",
      "Miembros de equipo ilimitados",
      "API personalizada",
      "Integraciones empresariales",
    ],
    icon: Building,
    color: "from-orange-500 to-red-500",
    disabled: true,
  },
];

export const Premium: React.FC = () => {
  const { data, updateSettings, currentProject } = useApp();
  const { settings } = data;
  const isPremium = settings.isPremium || false;

  // Promoción activa hasta el 3 de octubre
  const promotionActive = true;
  const promotionEndDate = "3 de octubre";

  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemCode, setRedeemCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [validPremiumCodes, setValidPremiumCodes] = useState(["UPPREMIUM2026"]);
  const auth = useSupabaseAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<
    "equipos" | "historial" | "wallet"
  >("equipos");

  const searshPremiumCodes = async () => {
    const { data: premiumData, error: premiumError } = await supabase
      .from("verify_codes")
      .select("*")
      .eq("used", false);

    if (premiumError) {
      toast({
        title: "Error en codigos",
        description: "Problema al buscar los codigos de verificacion premium",
        variant: "destructive",
      });
      console.log(premiumError);
    }

    setValidPremiumCodes(premiumData?.map((c) => c.value) || []);
  };

  useEffect(() => {
    searshPremiumCodes();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab") as "equipos" | "historial" | "wallet" | null;
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  const handleRedeemCode = () => {
    if (!redeemCode.trim()) {
      toast({
        title: "Código requerido",
        description: "Por favor ingresa un código de canjeo",
        variant: "destructive",
      });
      return;
    }

    setIsRedeeming(true);

    setTimeout(async () => {
      const code = redeemCode.trim().toUpperCase();
      if (validPremiumCodes.includes(code)) {
        updateSettings({ isPremium: true });

        const { error: errorDataSupabase } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", auth.user?.id)
          .single();

        if (errorDataSupabase) {
          setShowRedeemModal(false);
          setRedeemCode("");
          toast({
            title: "Error en el perfil",
            description: "Encontramos un error al buscar tu perfil.",
          });
        }

        const { error: errorUpdatingSupabase } = await supabase
          .from("profiles")
          .update({
            isPremium: true,
          })
          .eq("id", auth.user?.id)
          .single();

        if (errorUpdatingSupabase) {
          setShowRedeemModal(false);
          setRedeemCode("");
          toast({
            title: "Error actualizando el perfil",
            description: "Encontramos un error al actualizar tu perfil.",
          });
        }

        setShowRedeemModal(false);
        setRedeemCode("");
        toast({
          title: "¡Premium Activado! 🎉",
          description: "Tu suscripción premium de por vida ha sido activada",
        });
      } else {
        toast({
          title: "Código inválido",
          description:
            "El código ingresado no es válido. Verifica e intenta nuevamente.",
          variant: "destructive",
        });
      }
      setIsRedeeming(false);
    }, 1000);
  };

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(
      "Hola, me interesa obtener un código premium para My Business Studio, cual es el precio ?",
    );
    const url = `https://wa.me/${WHATSAPP_NUMBER.replace(
      /[^0-9]/g,
      "",
    )}?text=${message}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Banner de promoción */}
      {promotionActive && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-8 translate-x-8" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">¡Promoción Especial!</h3>
                <p className="text-sm opacity-90">
                  Hasta el {promotionEndDate} todas las cuentas tienen Premium
                  activado
                </p>
              </div>
            </div>
            <div className="px-4 py-2 bg-white/20 rounded-full text-sm font-medium">
              ¡Gratis para todos!
            </div>
          </div>
        </div>
      )}

      {!!currentProject && (
        <div className="mb-4 rounded-xl border border-border p-3 bg-muted/40 text-sm">
          <div className="font-medium">
            Modo proyecto: {currentProject?.name} (Premium)
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-success/5 rounded-2xl p-6 sm:p-8 border border-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-material">
              <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                Plan Premium
                {(isPremium || promotionActive) && (
                  <span className="px-3 py-1 bg-success/20 text-success rounded-full text-xs sm:text-sm font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    {promotionActive ? "Gratis Temporal" : "Activo"}
                  </span>
                )}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isPremium || promotionActive
                  ? "Disfruta de todas las funcionalidades premium"
                  : "Desbloquea el poder completo de My Business Studio"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {isPremium || promotionActive ? (
        <div className="space-y-6">
          <div className="bg-success/5 border border-success/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-success/20 rounded-xl">
                <Check className="w-6 h-6 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-success">
                  {promotionActive && !isPremium
                    ? "¡Premium Gratuito Temporal!"
                    : "¡Premium Activado!"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {promotionActive && !isPremium
                    ? `Disfruta de todas las funcionalidades premium gratis hasta el ${promotionEndDate}`
                    : "Tienes acceso a todas las funcionalidades premium de por vida"}
                </p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                • Acceso ilimitado a todas las herramientas avanzadas
              </p>
              <p className="text-muted-foreground">
                • Exportaciones sin límites
              </p>
              <p className="text-muted-foreground">
                • Sincronización en la nube
              </p>
              <p className="text-muted-foreground">• Soporte prioritario</p>
            </div>
          </div>

          {/* Mostrar planes pero deshabilitados */}
          {promotionActive && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">Planes Futuros</h3>
                <p className="text-muted-foreground">
                  Estos planes estarán disponibles después del{" "}
                  {promotionEndDate}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`bg-card rounded-2xl p-6 shadow-soft border border-border relative overflow-hidden ${plan.disabled ? "opacity-80" : ""}`}
                  >
                    {plan.disabled && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px] flex items-center justify-center z-10">
                        <div className="text-center px-4">
                          <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="font-semibold">Disponible pronto</p>
                          <p className="text-sm text-muted-foreground">
                            A partir del {promotionEndDate}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="relative z-0">
                      <div
                        className={`p-3 bg-gradient-to-br ${plan.color} rounded-xl w-fit mb-4`}
                      >
                        <plan.icon className="w-6 h-6 text-white" />
                      </div>

                      <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {plan.description}
                      </p>

                      <div className="text-3xl font-bold mb-6">
                        {plan.price}
                      </div>

                      <div className="space-y-3 mb-6">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <Button
                        className="w-full"
                        disabled={true}
                        variant={plan.disabled ? "outline" : "default"}
                      >
                        {plan.disabled ? "Próximamente" : "Seleccionar Plan"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="bg-card rounded-2xl p-6 shadow-soft border border-border">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Pago único
                </span>
              </div>
              <h3 className="text-3xl font-bold mb-2">Premium de por vida</h3>
              <p className="text-muted-foreground">
                Acceso completo a todas las funcionalidades avanzadas
              </p>
            </div>

            <div className="space-y-6 mb-8">
              {premiumFeatures.map((category, idx) => (
                <div key={idx}>
                  <h4 className="font-semibold mb-3 text-primary">
                    {category.category}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {category.features.map((feature, fIdx) => (
                      <div
                        key={fIdx}
                        className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl"
                      >
                        <feature.icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleWhatsAppContact}
                variant="outline"
                className="flex-1 h-12 gap-2"
                disabled={true}
              >
                <MessageCircle className="w-5 h-5" />
                Disponible a partir del {promotionEndDate}
              </Button>
              <Button
                onClick={() => setShowRedeemModal(true)}
                className="flex-1 h-12 gradient-primary gap-2"
              >
                <Gift className="w-5 h-5" />
                Canjear Código
              </Button>
            </div>
          </div>

          {/* Sección de planes futuros */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Planes Futuros</h3>
              <p className="text-muted-foreground">
                Estos planes estarán disponibles después del {promotionEndDate}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-card rounded-2xl p-6 shadow-soft border border-border relative overflow-hidden ${plan.disabled ? "opacity-80" : ""}`}
                >
                  {plan.disabled && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px] flex items-center justify-center z-10">
                      <div className="text-center px-4">
                        <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="font-semibold">Disponible pronto</p>
                        <p className="text-sm text-muted-foreground">
                          A partir del {promotionEndDate}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="relative z-0">
                    <div
                      className={`p-3 bg-gradient-to-br ${plan.color} rounded-xl w-fit mb-4`}
                    >
                      <plan.icon className="w-6 h-6 text-white" />
                    </div>

                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {plan.description}
                    </p>

                    <div className="text-3xl font-bold mb-6">{plan.price}</div>

                    <div className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      className="w-full"
                      disabled={true}
                      variant={plan.disabled ? "outline" : "default"}
                    >
                      {plan.disabled ? "Próximamente" : "Seleccionar Plan"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card rounded-2xl p-5 shadow-soft border border-border">
              <div className="p-2 bg-primary/10 rounded-xl w-fit mb-3">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Soporte Prioritario</h4>
              <p className="text-sm text-muted-foreground">
                Atención prioritaria y respuesta rápida a tus consultas
              </p>
            </div>
            <div className="bg-card rounded-2xl p-5 shadow-soft border border-border">
              <div className="p-2 bg-success/10 rounded-xl w-fit mb-3">
                <Cloud className="w-5 h-5 text-success" />
              </div>
              <h4 className="font-semibold mb-2">Sincronización en la Nube</h4>
              <p className="text-sm text-muted-foreground">
                Accede a tus datos desde cualquier dispositivo
              </p>
            </div>
            <div className="bg-card rounded-2xl p-5 shadow-soft border border-border">
              <div className="p-2 bg-warning/10 rounded-xl w-fit mb-3">
                <Zap className="w-5 h-5 text-warning" />
              </div>
              <h4 className="font-semibold mb-2">Actualizaciones Gratuitas</h4>
              <p className="text-sm text-muted-foreground">
                Recibe todas las nuevas funcionalidades sin costo adicional
              </p>
            </div>
          </div>
        </>
      )}

      {showRedeemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={() => {
              setShowRedeemModal(false);
              setRedeemCode("");
            }}
          />
          <div className="relative w-full max-w-md bg-card rounded-2xl shadow-material-xl border border-border">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Gift className="w-5 h-5 text-primary" />
                  Canjear Código Premium
                </h3>
                <button
                  onClick={() => {
                    setShowRedeemModal(false);
                    setRedeemCode("");
                  }}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="redeemCode">Código de canjeo</Label>
                  <Input
                    id="redeemCode"
                    placeholder="Ingresa tu código aquí"
                    value={redeemCode}
                    onChange={(e) =>
                      setRedeemCode(e.target.value.toUpperCase())
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleRedeemCode();
                      }
                    }}
                    className="text-center text-lg font-mono tracking-wider"
                    autoFocus
                  />
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Ingresa el código que recibiste para activar tu suscripción
                  premium de por vida
                </p>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowRedeemModal(false);
                      setRedeemCode("");
                    }}
                    disabled={isRedeeming}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => {
                      handleRedeemCode();
                    }}
                    className="flex-1 gradient-primary"
                    disabled={isRedeeming || !redeemCode.trim()}
                  >
                    {isRedeeming ? "Validando..." : "Canjear"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Premium;
