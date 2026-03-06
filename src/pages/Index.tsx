import { motion } from "framer-motion";
import heroImage from "@/assets/hero-illustration.png";
import ScanButton from "@/components/ScanButton";
import { useLanguage } from "@/lib/language-context";
import { t, languages, otherLanguages } from "@/lib/languages";
import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";

const Index = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const allLangs = [...languages, ...otherLanguages];
  const currentLang = allLangs.find((l) => l.code === lang);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-8 pb-0">
      {/* Settings button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => navigate("/settings")}
        className="self-end mb-2 flex items-center gap-2 bg-card rounded-2xl px-5 py-3 shadow-soft text-elder-sm font-bold text-foreground hover:shadow-medium transition-shadow"
      >
        <Settings size={22} />
        <span>⚙️</span>
      </motion.button>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-6"
      >
        <img
          src={heroImage}
          alt="SteadyLah! helper"
          className="w-36 h-36 mx-auto mb-4 rounded-full shadow-soft object-cover"
        />
        <h1 className="text-elder-2xl font-extrabold text-foreground">
          {t(lang, "appName")}
        </h1>
        <p className="text-elder-base text-muted-foreground mt-2">
          {t(lang, "tagline")}
        </p>
      </motion.div>

      {/* Current language indicator */}
      {currentLang && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 bg-primary/10 rounded-2xl px-6 py-3 text-center"
        >
          <span className="text-elder-sm text-primary font-bold">
            🌐 {currentLang.nativeLabel} ({currentLang.label})
          </span>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="w-full flex flex-col items-center gap-4 mb-10 max-w-sm"
      >
        <ScanButton />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/chat")}
          className="w-full bg-accent text-accent-foreground rounded-2xl p-6 shadow-medium text-elder-xl font-extrabold text-center"
        >
          {t(lang, "chatButton")}
        </motion.button>
      </motion.div>

      {/* Decorative Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="w-full mt-auto"
      >
        <div className="text-center mb-6 px-4">
          <p className="text-elder-base text-muted-foreground italic">
            {lang === "en" && "\"Technology is easier than you think! 💛\""}
            {lang === "zh" && "\"科技比你想象的更简单！💛\""}
            {lang === "ms" && "\"Teknologi lebih mudah dari yang anda sangka! 💛\""}
            {lang === "ta" && "\"தொழில்நுட்பம் நீங்கள் நினைப்பதை விட எளிது! 💛\""}
            {lang === "hk" && "\"科技比你想的更简单！💛\""}
            {lang === "ct" && "\"科技比你谂嘅更加简单！💛\""}
            {lang === "tc" && "\"科技比汝想的更简单！💛\""}
            {lang === "vi" && "\"Công nghệ dễ hơn bạn nghĩ! 💛\""}
            {lang === "th" && "\"เทคโนโลยีง่ายกว่าที่คุณคิด! 💛\""}
            {(lang === "ko" || lang === "ja" || lang === "hi") && "\"Technology is easier than you think! 💛\""}
          </p>
        </div>

        <div className="relative overflow-hidden">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16">
            <path d="M0,60 C200,100 400,20 600,60 C800,100 1000,20 1200,60 L1200,120 L0,120 Z" className="fill-primary/10" />
            <path d="M0,80 C200,110 400,50 600,80 C800,110 1000,50 1200,80 L1200,120 L0,120 Z" className="fill-primary/5" />
          </svg>
        </div>

        <div className="bg-primary/10 py-5 text-center">
          <div className="flex justify-center gap-4 text-2xl mb-2">
            <span>🌸</span><span>🌿</span><span>☀️</span><span>🌿</span><span>🌸</span>
          </div>
          <p className="text-elder-sm text-muted-foreground font-bold">
            Made with ❤️ for our elders
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Index;
