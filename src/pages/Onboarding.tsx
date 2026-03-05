import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/contexts/AppContext";
import {
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  Mail,
  Lock,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  UserPlus,
  LogIn,
} from "lucide-react";

const BUSINESS_POINTS = [
  "Controla ingresos, gastos e inventario en un solo lugar",
  "Mide utilidades con reportes y proyecciones en tiempo real",
  "Sincroniza tus datos y mantén respaldo en la nube",
];

const KPI_CARDS = [
  {
    title: "Crecimiento",
    value: "+27%",
    caption: "Promedio mensual",
    icon: TrendingUp,
    gradient: "from-emerald-400 to-cyan-400",
  },
  {
    title: "Seguridad",
    value: "24/7",
    caption: "Protección de datos",
    icon: ShieldCheck,
    gradient: "from-blue-400 to-indigo-400",
  },
  {
    title: "Flujo de caja",
    value: "En vivo",
    caption: "Métricas actualizadas",
    icon: CircleDollarSign,
    gradient: "from-amber-400 to-orange-400",
  },
];

export default function Onboarding() {
  const { supabaseAuth } = useApp();
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const result =
        authMode === "login"
          ? await supabaseAuth.login(email, password)
          : await supabaseAuth.register(email, password);

      if (result.success) {
        localStorage.setItem("negocio360_onboarding_completed", "true");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = authMode === "login" ? "Bienvenido de nuevo" : "Crea tu cuenta";
  const subtitle =
    authMode === "login"
      ? "Inicia sesión para continuar con tu panel empresarial"
      : "Empieza gratis y organiza todas tus operaciones desde hoy";

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-6 h-72 w-72 rounded-full bg-blue-300/35 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-80px] h-80 w-80 rounded-full bg-cyan-300/30 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-300/20 blur-3xl" />
      </div>

      <section className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1400px] grid-cols-1 gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-2 lg:gap-10 lg:px-8 lg:py-10">
        {/* Columna izquierda - Formulario */}
        <div className="flex items-center justify-center py-2 sm:py-4 lg:py-0">
          <div className="max-w-[660px] rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-xl backdrop-blur-sm sm:p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium tracking-wide text-slate-500">
                  My Business Studio
                </p>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {title}
                </h1>
              </div>
            </div>

            <p className="mb-6 text-sm leading-relaxed text-slate-600">
              {subtitle}
            </p>

            <div className="relative mb-6 flex rounded-2xl bg-slate-100 p-1">
              <div
                className={`absolute left-1 top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-xl bg-white shadow-sm transition-transform duration-300 ${
                  authMode === "register" ? "translate-x-full" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  authMode === "login"
                    ? "text-slate-900"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <LogIn className="h-4 w-4" />
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("register")}
                className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  authMode === "register"
                    ? "text-slate-900"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <UserPlus className="h-4 w-4" />
                Registrarme
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2.5">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-600"
                >
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-10 border-slate-200 bg-white pl-10 text-slate-900 placeholder:text-slate-400 focus:border-blue-400/70 focus:ring-2 focus:ring-blue-400/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-600"
                >
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-10 border-slate-200 bg-white pl-10 text-slate-900 placeholder:text-slate-400 focus:border-blue-400/70 focus:ring-2 focus:ring-blue-400/20"
                    required
                  />
                </div>
              </div>

              {supabaseAuth.error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700">
                    !
                  </span>
                  {supabaseAuth.error}
                </div>
              )}

              {supabaseAuth.verificationPending && (
                <div className="flex items-center gap-2 rounded-lg  border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  Revisa tu correo ({supabaseAuth.registeredEmail ?? email})
                  para verificar tu cuenta.
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="group relative h-10 w-full overflow-hidden rounded-xl bg-primary font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Procesando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {authMode === "login" ? "Continuar" : "Crear cuenta"}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500">
              {authMode === "login"
                ? "¿No tienes cuenta?"
                : "¿Ya tienes cuenta?"}{" "}
              <button
                type="button"
                className="font-semibold text-primary transition-colors hover:text-primary/80"
                onClick={() =>
                  setAuthMode(authMode === "login" ? "register" : "login")
                }
              >
                {authMode === "login" ? "Crearla ahora" : "Iniciar sesión"}
              </button>
            </p>
          </div>
        </div>

        {/* Columna derecha - Hero/Beneficios */}
        <div className="flex items-center justify-center py-2 sm:py-4 lg:py-0">
          <div className="relative w-full overflow-hidden rounded-3xl  border-blue-200/80 bg-gradient-to-br from-blue-100 via-indigo-100 to-cyan-100 p-7  sm:p-9 lg:h-[86vh] lg:max-h-[820px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.45),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.15),transparent_45%)]" />

            <div className="relative z-10 flex h-full flex-col justify-between gap-8">
              <div className="space-y-5">
                <p className="inline-flex items-center rounded-full bg-white/70 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-blue-700">
                  <Sparkles className="mr-2 h-3 w-3" />
                  Plataforma empresarial
                </p>
                <h2 className="max-w-lg text-3xl font-bold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
                  Gestiona ventas, gastos e inventario desde un solo panel.
                </h2>
                <p className="max-w-xl text-sm leading-relaxed text-slate-700 sm:text-base">
                  Convierte tus datos en decisiones: reportes accionables,
                  control financiero y colaboración para tu equipo en tiempo
                  real.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {KPI_CARDS.map((card) => {
                  const Icon = card.icon;
                  return (
                    <article
                      key={card.title}
                      className="rounded-2xl bg-white/75 p-4 shadow-sm"
                    >
                      <div
                        className={`mb-3 inline-flex rounded-xl bg-gradient-to-br ${card.gradient} p-2.5 text-white shadow-sm`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        {card.title}
                      </p>
                      <p className="text-2xl font-bold text-slate-900">
                        {card.value}
                      </p>
                      <p className="text-xs text-slate-500">{card.caption}</p>
                    </article>
                  );
                })}
              </div>

              <div className="rounded-2xl bg-white/75 p-6 shadow-sm">
                <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-600">
                  Lo que obtienes al entrar
                </p>
                <ul className="space-y-4">
                  {BUSINESS_POINTS.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-3 text-sm text-slate-700"
                    >
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" />
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
