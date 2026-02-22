import { motion } from "framer-motion";
import { languages, t } from "@/lib/languages";
import { useLanguage } from "@/lib/language-context";

const LanguagePicker = () => {
  const { lang, setLang } = useLanguage();

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <h2 className="text-elder-xl font-bold text-center mb-6 text-foreground">
        {t(lang, "languageTitle")}
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {languages.map((language, i) => (
          <motion.button
            key={language.code}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setLang(language.code)}
            className={`p-4 rounded-xl text-left transition-all duration-200 ${
              lang === language.code
                ? "bg-primary text-primary-foreground shadow-glow"
                : "bg-card text-card-foreground shadow-soft hover:shadow-medium"
            }`}
          >
            <span className="block text-elder-base font-bold">{language.nativeLabel}</span>
            <span className={`block text-elder-sm ${
              lang === language.code ? "text-primary-foreground/80" : "text-muted-foreground"
            }`}>
              {language.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default LanguagePicker;
