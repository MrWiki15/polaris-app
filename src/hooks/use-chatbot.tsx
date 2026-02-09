import { useState, useCallback, useEffect } from "react";
import { sendChatMessage } from "@/lib/ai/chatbot";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/lib/supabase";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
}

export function useChatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [contextSummary, setContextSummary] = useState<string>("");
  const [loadingContext, setLoadingContext] = useState<boolean>(false);

  const { data: appData, supabaseAuth } = useApp();

  useEffect(() => {
    let mounted = true;
    const buildContext = async () => {
      setLoadingContext(true);
      try {
        // Local summary
        const salesCount = appData.sales?.length || 0;
        const recentSales = (appData.sales || [])
          .slice(0, 10)
          .map((s) => `${s.date}:${s.amount}`)
          .join(", ");
        const productsCount = appData.products?.length || 0;
        const clientsCount = appData.clients?.length || 0;

        let remoteSummary = "";
        const userId = supabaseAuth.user?.id;
        if (userId) {
          try {
            const { data } = await supabase
              .from("backups")
              .select("data, updated_at")
              .eq("user_id", userId)
              .single();

            if (data && data.data) {
              const remote = JSON.parse(data.data);
              remoteSummary = `Copia en nube: productos=${remote.products?.length || 0}, ventas=${remote.sales?.length || 0}, clientes=${remote.clients?.length || 0}, updated_at=${data.updated_at}`;
            }
          } catch (err) {
            console.log(err);
            // ignore remote errors
            remoteSummary = "(no se pudo cargar copia en la nube)";
          }
        }

        const summary = `Local: productos=${productsCount}, ventas=${salesCount}, clientes=${clientsCount}. Ventas recientes: ${recentSales}. ${remoteSummary}`;
        if (mounted) setContextSummary(summary);
      } catch (err) {
        console.error("Error building chatbot context:", err);
      } finally {
        if (mounted) setLoadingContext(false);
      }
    };

    buildContext();
    return () => {
      mounted = false;
    };
  }, [appData, supabaseAuth]);

  const send = useCallback(
    async (text: string, context = "") => {
      const effectiveContext = context || contextSummary;
      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        text,
      };
      setMessages((m) => [...m, userMsg]);
      setLoading(true);

      // Build conversation for the model: include system context and last messages
      const conv = [
        {
          role: "system",
          content: `Eres un asistente financiero. Usa el contexto: ${effectiveContext}`,
        },
        ...messages.map((msg) => ({
          role: msg.role as any,
          content: msg.text,
        })),
        { role: "user", content: text },
      ];

      try {
        const reply = await sendChatMessage(conv);

        // Simulate real-time typing by Polo
        const assistantId = Date.now().toString() + "-r";
        setMessages((m) => [
          ...m,
          { id: assistantId, role: "assistant", text: "" },
        ]);

        const typingDelay = Math.max(6, Math.floor(12));
        for (let i = 1; i <= reply.length; i++) {
          // small await to create typing effect
          // eslint-disable-next-line no-await-in-loop
          await new Promise((res) => setTimeout(res, typingDelay));
          setMessages((cur) =>
            cur.map((msg) =>
              msg.id === assistantId
                ? { ...msg, text: reply.slice(0, i) }
                : msg,
            ),
          );
        }

        setLoading(false);
        return reply;
      } catch (err) {
        console.log(err);
        setLoading(false);
        const errMsg: Message = {
          id: Date.now().toString() + "-err",
          role: "assistant",
          text: "Error: no se pudo obtener respuesta del modelo.",
        };
        setMessages((m) => [...m, errMsg]);
        throw err;
      }
    },
    [messages],
  );

  const reset = useCallback(() => setMessages([]), []);

  return { messages, send, loading, reset, contextSummary, loadingContext };
}
