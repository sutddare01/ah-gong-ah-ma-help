import { motion } from "framer-motion";
import { t } from "@/lib/languages";
import { useLanguage } from "@/lib/language-context";
import { useNavigate } from "react-router-dom";

const ScanButton = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate("/scan")}
      className="w-full max-w-sm mx-auto block bg-accent text-accent-foreground rounded-2xl p-6 shadow-medium hover:shadow-glow transition-shadow duration-300"
    >
      <span className="block text-elder-xl font-extrabold">{t(lang, "scanButton")}</span>
      <span className="block text-elder-sm mt-1 opacity-90">{t(lang, "scanSubtext")}</span>
    </motion.button>
  );
};

export default ScanButton;
