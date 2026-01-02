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
  Share2,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const WHATSAPP_NUMBER = "+5363813075";

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

export const Premium: React.FC = () => {
  const { data, updateSettings } = useApp();
  const { settings } = data;
  const isPremium = settings.isPremium || false;

  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemCode, setRedeemCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [validPremiumCodes, setValidPremiumCodes] = useState([
    "PREMIUM2024",
    "UPGRADE2024",
    "BUSINESS2024",
    "PRO2024",
    "LIFETIME2024",
  ]);
  const auth = useSupabaseAuth();
  const navigate = useNavigate();

  const searshPremiumCodes = async () => {
    //buscar codigos que se pueden cangear
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

    setValidPremiumCodes(premiumData.map((c) => c.value));
  };

  useEffect(() => {
    searshPremiumCodes();
  }, []);

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

    // validacion
    setTimeout(async () => {
      const code = redeemCode.trim().toUpperCase();
      if (validPremiumCodes.includes(code)) {
        //asignar premium en local
        updateSettings({ isPremium: true });

        //verificar el user existe en database
        const { error: errorDataSupabase } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", auth.user.id)
          .single();

        if (errorDataSupabase) {
          setShowRedeemModal(false);
          setRedeemCode("");
          toast({
            title: "Error en el perfil",
            description: "Encontramos un error al buscar tu perfil.",
          });
        }

        //si el usuario si existe hacer el update
        const { error: errorUpdatingSupabase } = await supabase
          .from("profiles")
          .update({
            isPremium: true,
          })
          .eq("id", auth.user.id)
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
      "Hola, me interesa obtener un código premium para UP, cual es el precio ?"
    );
    const url = `https://wa.me/${WHATSAPP_NUMBER.replace(
      /[^0-9]/g,
      ""
    )}?text=${message}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
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
                {isPremium && (
                  <span className="px-3 py-1 bg-success/20 text-success rounded-full text-xs sm:text-sm font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Activo
                  </span>
                )}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isPremium
                  ? "Disfruta de todas las funcionalidades premium"
                  : "Desbloquea el poder completo de UP"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {isPremium ? (
        /* Premium Activo */
        <div className="bg-success/5 border border-success/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-success/20 rounded-xl">
              <Check className="w-6 h-6 text-success" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-success">
                ¡Premium Activado!
              </h3>
              <p className="text-sm text-muted-foreground">
                Tienes acceso a todas las funcionalidades premium de por vida
              </p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              • Acceso ilimitado a todas las herramientas avanzadas
            </p>
            <p className="text-muted-foreground">• Exportaciones sin límites</p>
            <p className="text-muted-foreground">• Sincronización en la nube</p>
            <p className="text-muted-foreground">• Soporte prioritario</p>
          </div>
        </div>
      ) : (
        /* Plan Premium - No activo */
        <>
          {/* Pricing Card */}
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

            {/* Features Grid */}
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

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleWhatsAppContact}
                variant="outline"
                className="flex-1 h-12 gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Contactar por WhatsApp
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

          {/* Benefits Section */}
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

      {/* Redeem Code Modal */}
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
                      if (auth.isAuthenticated) {
                        handleRedeemCode();
                      } else {
                        navigate("/configuracion");
                      }
                    }}
                    className="flex-1 gradient-primary"
                    disabled={isRedeeming || !redeemCode.trim()}
                  >
                    {isRedeeming
                      ? "Validando..."
                      : !auth.isAuthenticated
                      ? "Login necesario"
                      : "Canjear"}
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
