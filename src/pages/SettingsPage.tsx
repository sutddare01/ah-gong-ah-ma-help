import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import LanguagePicker from "@/components/LanguagePicker";
import TextSizeControl from "@/components/TextSizeControl";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/languages";

const SettingsPage = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-8 pb-16">
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => navigate("/")}
        className="self-start mb-6 flex items-center gap-2 text-elder-base text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={24} />
        <span>{t(lang, "backHome")}</span>
      </motion.button>

      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-elder-2xl font-extrabold text-foreground mb-8"
      >
        ⚙️ {lang === "en" ? "Settings" : lang === "zh" || lang === "hk" ? "设置" : lang === "ms" ? "Tetapan" : lang === "ta" ? "அமைப்புகள்" : lang === "ct" ? "设置" : lang === "tc" ? "设置" : lang === "vi" ? "Cài đặt" : lang === "th" ? "การตั้งค่า" : "Settings"}
      </motion.h1>

      {/* Text Size */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-10"
      >
        <TextSizeControl />
      </motion.div>

      {/* Language */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full"
      >
        <LanguagePicker />
      </motion.div>
    </div>
  );
};

export default SettingsPage;
