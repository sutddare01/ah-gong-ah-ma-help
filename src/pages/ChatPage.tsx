import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Volume2, VolumeX } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/languages";

type Msg = { role: "user" | "assistant"; content: string };

const langToSpeech: Record<string, string> = {
  en: "en-SG", zh: "zh-CN", ms: "ms-MY", ta: "ta-IN",
  hk: "zh-CN", ct: "zh-HK", tc: "zh-CN", vi: "vi-VN",
  th: "th-TH", ko: "ko-KR", ja: "ja-JP", hi: "hi-IN",
};

const chatPlaceholders: Record<string, string> = {
  en: "Ask me anything...",
  zh: "问我任何问题...",
  ms: "Tanya saya apa sahaja...",
  ta: "எதையும் கேளுங்கள்...",
  hk: "问我什么都可以...",
  ct: "问我乜都得...",
  tc: "问我什么拢好...",
  vi: "Hỏi tôi bất cứ điều gì...",
  th: "ถามอะไรก็ได้...",
  ko: "무엇이든 물어보세요...",
  ja: "何でも聞いてください...",
  hi: "कुछ भी पूछें...",
};

const chatTitle: Record<string, string> = {
  en: "💬 Ask Me",
  zh: "💬 问我",
  ms: "💬 Tanya Saya",
  ta: "💬 கேளுங்கள்",
  hk: "💬 问我",
  ct: "💬 问我",
  tc: "💬 问我",
  vi: "💬 Hỏi Tôi",
  th: "💬 ถามฉัน",
  ko: "💬 물어보세요",
  ja: "💬 聞いて",
  hi: "💬 पूछें",
};

const ChatPage = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  const handleSpeak = useCallback((text: string, idx: number) => {
    if (speakingIdx === idx) {
      window.speechSynthesis.cancel();
      setSpeakingIdx(null);
      return;
    }
    window.speechSynthesis.cancel();
    const clean = text.replace(/[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]|[#*_~`>-]/gu, "");
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = langToSpeech[lang] || "en-SG";
    utterance.rate = 0.85;
    utterance.onend = () => setSpeakingIdx(null);
    utterance.onerror = () => setSpeakingIdx(null);
    setSpeakingIdx(idx);
    window.speechSynthesis.speak(utterance);
  }, [speakingIdx, lang]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Msg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: newMessages, lang }),
        }
      );

      if (!resp.ok || !resp.body) {
        throw new Error("Failed to get response");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
                  );
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: lang === "en" ? "Sorry, something went wrong. Please try again." : "抱歉，出了点问题。请再试一次。" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border bg-card shadow-soft">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/")}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={28} />
        </motion.button>
        <h1 className="text-elder-xl font-extrabold text-foreground">
          {chatTitle[lang] || chatTitle.en}
        </h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-16"
          >
            <p className="text-6xl mb-4">🤖</p>
            <p className="text-elder-lg font-bold text-muted-foreground">
              {lang === "en" && "Hi! Ask me anything. I'll explain simply."}
              {lang === "zh" && "你好！问我任何问题，我会简单解释。"}
              {lang === "ms" && "Hai! Tanya saya apa sahaja. Saya akan terangkan dengan mudah."}
              {lang === "ta" && "வணக்கம்! எதையும் கேளுங்கள். எளிமையாக விளக்குவேன்."}
              {(lang === "hk" || lang === "ct" || lang === "tc") && "你好！问我什么都可以，我会简单解释。"}
              {lang === "vi" && "Xin chào! Hỏi tôi bất cứ điều gì. Tôi sẽ giải thích đơn giản."}
              {lang === "th" && "สวัสดี! ถามอะไรก็ได้ ฉันจะอธิบายง่ายๆ"}
              {lang === "ko" && "안녕하세요! 무엇이든 물어보세요. 쉽게 설명해 드릴게요."}
              {lang === "ja" && "こんにちは！何でも聞いてください。簡単に説明します。"}
              {lang === "hi" && "नमस्ते! कुछ भी पूछें। मैं आसानी से समझाऊंगा।"}
            </p>
          </motion.div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-soft ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-card-foreground border border-border"
              }`}
            >
              {msg.role === "assistant" ? (
                <div>
                  <div className="prose prose-sm max-w-none text-elder-base leading-relaxed">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                  <button
                    onClick={() => handleSpeak(msg.content, i)}
                    className={`mt-3 flex items-center gap-2 rounded-xl px-4 py-2 text-elder-sm font-bold transition-colors ${
                      speakingIdx === i
                        ? "bg-destructive/10 text-destructive"
                        : "bg-primary/10 text-primary hover:bg-primary/20"
                    }`}
                  >
                    {speakingIdx === i ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    {speakingIdx === i ? t(lang, "stopButton") : t(lang, "listenButton")}
                  </button>
                </div>
              ) : (
                <p className="text-elder-base font-bold">{msg.content}</p>
              )}
            </div>
          </motion.div>
        ))}

        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-card rounded-2xl px-5 py-4 shadow-soft border border-border">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-3 h-3 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-3 h-3 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card px-4 py-4">
        <div className="flex gap-3 max-w-2xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={chatPlaceholders[lang] || chatPlaceholders.en}
            className="flex-1 bg-background border border-border rounded-2xl px-5 py-4 text-elder-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={send}
            disabled={isLoading || !input.trim()}
            className="bg-primary text-primary-foreground rounded-2xl px-6 py-4 shadow-medium disabled:opacity-50"
          >
            <Send size={24} />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
