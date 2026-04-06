import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Pause, Play, MessageCircle } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/languages";

const langToSpeech: Record<string, string> = {
  en: "en-SG", zh: "zh-CN", ms: "ms-MY", ta: "ta-IN",
  hk: "zh-CN", ct: "zh-HK", tc: "zh-CN", vi: "vi-VN",
  th: "th-TH", ko: "ko-KR", ja: "ja-JP", hi: "hi-IN",
};

const followUpLabels: Record<string, string> = {
  en: "❓ Ask Follow-Up Questions",
  zh: "❓ 继续提问",
  ms: "❓ Tanya Soalan Lanjutan",
  ta: "❓ மேலும் கேளுங்கள்",
  hk: "❓ 继续问",
  ct: "❓ 继续问",
  tc: "❓ 继续问",
  vi: "❓ Hỏi Thêm",
  th: "❓ ถามต่อ",
  ko: "❓ 후속 질문",
  ja: "❓ もっと聞く",
  hi: "❓ और पूछें",
};

const ResultPage = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { image?: string; explanation?: string } | null;
  const image = state?.image;
  const explanation = state?.explanation || "No explanation available. Please try scanning again.";
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      return;
    }
    const cleanText = explanation.replace(/[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]|🔹/gu, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = langToSpeech[lang] || "en-SG";
    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.onend = () => { setIsSpeaking(false); setIsPaused(false); };
    utterance.onerror = () => { setIsSpeaking(false); setIsPaused(false); };
    utteranceRef.current = utterance;
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handlePauseResume = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const handleFollowUp = () => {
    window.speechSynthesis.cancel();
    navigate("/chat", {
      state: {
        scanImage: image,
        scanExplanation: explanation + "\n\n---\n\n" + (lang === "en"
          ? "I just scanned this item for you! 😊 Do you have any questions about it? You can also send me another photo!"
          : "我刚帮你扫描了这个东西！😊 有什么问题吗？你也可以再发一张照片给我！"),
      },
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-8 pb-16">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-elder-2xl font-extrabold text-foreground mb-6"
      >
        {t(lang, "resultTitle")}
      </motion.h1>

      {image && (
        <motion.img
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          src={image}
          alt="Scanned item"
          className="w-48 h-48 object-cover rounded-2xl shadow-soft mb-6"
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-md bg-card rounded-2xl p-6 shadow-soft mb-4"
      >
        <p className="text-elder-base text-card-foreground whitespace-pre-line leading-relaxed">
          {explanation}
        </p>
      </motion.div>

      {/* Listen button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleSpeak}
        className={`w-full max-w-md rounded-2xl p-5 shadow-medium text-elder-lg font-extrabold text-center mb-4 transition-colors ${
          isSpeaking
            ? "bg-destructive text-destructive-foreground"
            : "bg-primary text-primary-foreground"
        }`}
      >
        {isSpeaking ? t(lang, "stopButton") : t(lang, "listenButton")}
      </motion.button>

      {isSpeaking && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileTap={{ scale: 0.97 }}
          onClick={handlePauseResume}
          className="w-full max-w-md rounded-2xl p-4 shadow-soft text-elder-lg font-bold text-center mb-4 bg-muted text-muted-foreground border border-border"
        >
          {isPaused ? <Play size={20} className="inline mr-2" /> : <Pause size={20} className="inline mr-2" />}
          {isPaused ? (lang === "en" ? "Resume" : "继续") : (lang === "en" ? "Pause" : "暂停")}
        </motion.button>
      )}

      {/* Follow-up questions button - prominent */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleFollowUp}
        className="w-full max-w-md bg-accent text-accent-foreground rounded-2xl p-6 shadow-medium text-elder-xl font-extrabold text-center mb-4 flex items-center justify-center gap-3"
      >
        <MessageCircle size={28} />
        {followUpLabels[lang] || followUpLabels.en}
      </motion.button>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/scan")}
          className="w-full bg-card text-card-foreground rounded-2xl p-5 shadow-soft text-elder-lg font-bold text-center border border-border"
        >
          {t(lang, "scanAgain")}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/")}
          className="w-full bg-card text-card-foreground rounded-2xl p-5 shadow-soft text-elder-lg font-bold text-center border border-border"
        >
          {t(lang, "backHome")}
        </motion.button>
      </div>
    </div>
  );
};

export default ResultPage;
