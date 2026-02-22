import { motion } from "framer-motion";
import LanguagePicker from "@/components/LanguagePicker";
import { useLanguage } from "@/lib/language-context";
import { useNavigate } from "react-router-dom";
import { t } from "@/lib/languages";

const WelcomePage = () => {
  const { lang, setHasChosenLang } = useLanguage();
  const navigate = useNavigate();

  const handleContinue = () => {
    setHasChosenLang(true);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="text-6xl mb-4">👋</div>
        <h1 className="text-elder-2xl font-extrabold text-foreground mb-2">
          Welcome! 欢迎! Selamat!
        </h1>
        <p className="text-elder-base text-muted-foreground">
          {t(lang, "languageTitle")}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full mb-8"
      >
        <LanguagePicker />
      </motion.div>

      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleContinue}
        className="w-full max-w-sm bg-accent text-accent-foreground rounded-2xl p-6 shadow-medium text-elder-xl font-extrabold text-center"
      >
        ✅ {lang === "en" ? "Continue" : lang === "zh" || lang === "hk" ? "继续" : lang === "ms" ? "Teruskan" : lang === "ta" ? "தொடரவும்" : lang === "ct" ? "继续" : lang === "tc" ? "继续" : lang === "vi" ? "Tiếp tục" : lang === "th" ? "ดำเนินการต่อ" : "Continue"}
      </motion.button>
    </div>
  );
};

export default WelcomePage;
