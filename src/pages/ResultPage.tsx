import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/languages";

// Language code to BCP-47 speech synthesis mapping
const langToSpeech: Record<string, string> = {
  en: "en-SG",
  zh: "zh-CN",
  ms: "ms-MY",
  ta: "ta-IN",
  hk: "zh-CN",
  ct: "zh-HK",
  tc: "zh-CN",
  vi: "vi-VN",
  th: "th-TH",
  ko: "ko-KR",
  ja: "ja-JP",
  hi: "hi-IN",
};

const ResultPage = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { image?: string; explanation?: string } | null;
  const image = state?.image;
  const explanation = state?.explanation || "No explanation available. Please try scanning again.";
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Strip emojis for cleaner speech
    const cleanText = explanation.replace(/[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]|🔹/gu, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = langToSpeech[lang] || "en-SG";
    utterance.rate = 0.85;
    utterance.pitch = 1;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
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
        className={`w-full max-w-md rounded-2xl p-5 shadow-medium text-elder-lg font-extrabold text-center mb-6 transition-colors ${
          isSpeaking
            ? "bg-destructive text-destructive-foreground"
            : "bg-primary text-primary-foreground"
        }`}
      >
        {isSpeaking ? t(lang, "stopButton") : t(lang, "listenButton")}
      </motion.button>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/scan")}
          className="w-full bg-accent text-accent-foreground rounded-2xl p-5 shadow-medium text-elder-lg font-extrabold text-center"
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
