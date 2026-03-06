import React, { useEffect, useRef, useState } from "react";
import { useChatbot } from "@/hooks/use-chatbot";
import { Bot, RefreshCcw, SendHorizontal, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export const ChatbotUI: React.FC = () => {
  const { messages, send, loading, reset, contextSummary, loadingContext } =
    useChatbot();
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    const current = textareaRef.current;
    if (!current) return;

    current.style.height = "auto";
    current.style.height = `${Math.min(current.scrollHeight, 160)}px`;
  }, [text]);

  const handleSend = async () => {
    if (!text.trim()) return;
    try {
      await send(text);
      setText("");
    } catch (err) {
      console.error(err);
    }
  };

  const quickPrompts = [
    "¿Cómo puedo aumentar ventas este mes?",
    "Recomiéndame 3 productos para promocionar",
    "Análisis rápido de mis ventas recientes",
    "¿Qué decisiones tomarías hoy con mis datos?",
  ];

  const [MDRenderer, setMDRenderer] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    // Try to dynamically import react-markdown + rehype-sanitize. If not installed, silently fallback.
    (async () => {
      try {
        const rm = await import("react-markdown");
        const rehype = await import("rehype-sanitize");
        if (mounted) {
          setMDRenderer(() => (props: any) => {
            // react-markdown default export
            const ReactMarkdown = rm.default || rm;
            const rehypeSanitize = rehype.default || rehype;
            return React.createElement(ReactMarkdown, {
              rehypePlugins: [rehypeSanitize],
              ...props,
            });
          });
        }
      } catch (err) {
        console.log(err);
        // Module not available; keep null to use fallback rendering
        if (mounted) setMDRenderer(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 lg:grid-cols-12">
      <section className="lg:col-span-8 xl:col-span-9">
        <div className="flex h-[calc(100dvh-8.5rem)] min-h-[560px] flex-col overflow-hidden rounded-2xl">
          <header className="border-b  px-4 py-3  sm:px-5">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-primary/10 p-1.5 text-primary">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h2 className="text-base font-semibold sm:text-lg">
                    Polo AI
                  </h2>
                </div>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  Asistente financiero para decisiones de ventas, inventario y
                  crecimiento.
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="shrink-0"
                onClick={reset}
              >
                <RefreshCcw className="h-4 w-4" />
                Limpiar
              </Button>
            </div>
          </header>

          <div
            ref={listRef}
            className="flex-1 space-y-6 overflow-y-auto bg-muted/20 px-3 py-4 sm:px-5 sm:py-5"
          >
            {messages.length === 0 && !loading && (
              <div className="mx-auto mt-10 flex max-w-2xl flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card p-6 text-center sm:mt-16">
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                  <Bot className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold">
                  Empieza una conversación con Polo
                </h3>
                <p className="text-sm text-muted-foreground">
                  Pide análisis, recomendaciones o próximos pasos accionables
                  para tu negocio.
                </p>
              </div>
            )}

            {messages.map((m) => {
              const isUser = m.role === "user";

              return (
                <article
                  key={m.id}
                  className={`mx-auto flex w-full max-w-3xl ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex w-full max-w-[95%] gap-3 sm:max-w-[90%] ${isUser ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${isUser ? "border-primary/20 bg-primary/10 text-primary" : "border-border bg-secondary text-secondary-foreground"}`}
                    >
                      {isUser ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>

                    <div
                      className={`min-w-0 space-y-1 ${isUser ? "items-end text-right" : "items-start text-left"}`}
                    >
                      <p className="text-xs font-medium text-muted-foreground">
                        {isUser ? "Tú" : "Polo"}
                      </p>

                      <div
                        className={`rounded-2xl border px-4 py-3 text-sm leading-relaxed shadow-sm ${isUser ? "border-primary/20 bg-primary text-primary-foreground rounded-tr-md" : "border-border bg-card text-foreground rounded-tl-md"}`}
                      >
                        {m.role === "assistant" && MDRenderer ? (
                          <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-ul:my-2 prose-ol:my-2">
                            <MDRenderer children={m.text} />
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap break-words">
                            {m.text}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}

            {loading && (
              <article className="mx-auto flex w-full max-w-3xl justify-start">
                <div className="flex w-full max-w-[95%] gap-3 sm:max-w-[90%]">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-secondary-foreground">
                    <Bot className="h-4 w-4" />
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      Polo
                    </p>
                    <div className="inline-flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-border bg-card px-4 py-3 shadow-sm">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-pulse" />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-pulse [animation-delay:120ms]" />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-pulse [animation-delay:240ms]" />
                    </div>
                  </div>
                </div>
              </article>
            )}
          </div>

          <footer className=" px-3 py-3 sm:px-5">
            <div className="mx-auto w-full max-w-3xl space-y-3">
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setText(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>

              <div className="rounded-2xl border border-border bg-background p-2 shadow-inner-glow">
                <div className="flex items-end gap-2">
                  <Textarea
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void handleSend();
                      }
                    }}
                    placeholder="Pregúntale a Polo sobre ventas, márgenes, inventario o estrategia..."
                    rows={1}
                    className="max-h-40 min-h-[44px] resize-none border-0 bg-transparent px-2 py-2 text-sm shadow-none focus-visible:ring-0"
                  />

                  <Button
                    type="button"
                    onClick={() => void handleSend()}
                    disabled={loading || !text.trim()}
                    size="icon"
                    className="h-10 w-10 rounded-xl"
                    aria-label="Enviar mensaje"
                  >
                    <SendHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between px-1">
                <p className="text-xs text-muted-foreground">
                  Enter para enviar • Shift + Enter para salto de línea
                </p>
                {loading && (
                  <Badge variant="secondary" className="text-[11px]">
                    Polo está escribiendo...
                  </Badge>
                )}
              </div>
            </div>
          </footer>
        </div>
      </section>

      <aside className="hidden lg:col-span-4 lg:block xl:col-span-3">
        <div className="sticky top-20 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Contexto activo</h3>
            </div>

            {loadingContext ? (
              <p className="text-sm text-muted-foreground">
                Preparando datos de negocio...
              </p>
            ) : (
              <p className="max-h-60 overflow-y-auto text-sm leading-relaxed text-muted-foreground">
                {contextSummary || "No hay datos disponibles."}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <h4 className="mb-2 text-sm font-semibold">
              Cómo aprovechar mejor a Polo
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                • Pide recomendaciones con periodos concretos (semana/mes).
              </li>
              <li>
                • Incluye objetivo: ventas, margen, stock o flujo de caja.
              </li>
              <li>• Solicita acciones priorizadas para ejecutar hoy.</li>
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
};
