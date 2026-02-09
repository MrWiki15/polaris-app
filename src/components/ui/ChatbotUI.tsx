import React, { useState, useRef, useEffect } from "react";
import { useChatbot } from "@/hooks/use-chatbot";
import { User, Server } from "lucide-react";

export const ChatbotUI: React.FC = () => {
  const { messages, send, loading, reset, contextSummary, loadingContext } =
    useChatbot();
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Chat column */}
      <div className="md:col-span-2 flex flex-col h-[70vh] bg-card border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Chatbot Financiero</h2>
            <div className="text-sm text-muted-foreground">
              Pregúntale sobre tu negocio y productos.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-sm btn-ghost" onClick={reset}>
              Limpiar
            </button>
          </div>
        </div>

        <div ref={listRef} className="p-4 overflow-auto flex-1 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground">
              Escribe una pregunta para recibir consejos sobre tu negocio.
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"} max-w-[80%]`}
              >
                <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground">
                  {m.role === "assistant" ? (
                    <>
                      <Server className="w-4 h-4" />
                      <span>Polo</span>
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4" />
                      <span>Tú</span>
                    </>
                  )}
                </div>

                <div
                  className={`px-4 py-2 rounded-xl shadow-sm ${m.role === "user" ? "bg-primary text-white rounded-br-none" : "bg-surface-2 text-foreground rounded-bl-none"}`}
                >
                  {m.role === "assistant" && MDRenderer ? (
                    <div className="prose max-w-none text-sm">
                      <MDRenderer children={m.text} />
                    </div>
                  ) : (
                    <div className="text-sm whitespace-pre-wrap">{m.text}</div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator for Polo */}
          {loading && (
            <div className="flex justify-start">
              <div className="flex flex-col items-start max-w-[60%]">
                <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground">
                  <Server className="w-4 h-4" />
                  <span>Polo</span>
                </div>
                <div className="px-4 py-2 rounded-xl shadow-sm bg-surface-2 text-foreground rounded-bl-none inline-flex items-center">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-muted rounded-full animate-pulse" />
                    <span
                      className="w-2 h-2 bg-muted rounded-full animate-pulse"
                      style={{ animationDelay: "0.12s" }}
                    />
                    <span
                      className="w-2 h-2 bg-muted rounded-full animate-pulse"
                      style={{ animationDelay: "0.24s" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-3 border-t bg-surface-1">
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-md border bg-white/5 px-3 py-2 focus:outline-none"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              placeholder="Pregunta sobre ventas, productos, tendencias..."
            />
            <button className="btn" onClick={handleSend} disabled={loading}>
              {loading ? "Enviando..." : "Enviar"}
            </button>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {quickPrompts.map((q) => (
              <button
                key={q}
                className="px-3 py-1 text-sm rounded-full bg-muted/40"
                onClick={() => {
                  setText(q);
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Context column */}
      <aside className="hidden md:block">
        <div className="sticky top-20 space-y-4">
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Server className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-sm font-medium">Contexto del negocio</h3>
            </div>
            {loadingContext ? (
              <div className="text-sm text-muted-foreground">
                Cargando contexto...
              </div>
            ) : (
              <div className="text-sm text-foreground break-words">
                {contextSummary || "No hay datos disponibles."}
              </div>
            )}
          </div>

          <div className="bg-card border rounded-lg p-4">
            <h4 className="text-sm font-medium mb-2">Sugerencias rápidas</h4>
            <div className="flex flex-col gap-2">
              {quickPrompts.map((q) => (
                <button
                  key={q}
                  className="text-left px-3 py-2 rounded-md bg-muted/30 text-sm"
                  onClick={() => setText(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
