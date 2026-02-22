import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { languages, otherLanguages, t } from "@/lib/languages";
import { useLanguage } from "@/lib/language-context";

const LanguagePicker = () => {
  const { lang, setLang } = useLanguage();
  const [showOthers, setShowOthers] = useState(false);

  const allMainLanguages = languages;
  const isOtherLang = otherLanguages.some((l) => l.code === lang);

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <h2 className="text-elder-xl font-bold text-center mb-6 text-foreground">
        {t(lang, "languageTitle")}
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {allMainLanguages.map((language, i) => (
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
            <span
              className={`block text-elder-sm ${
                lang === language.code ? "text-primary-foreground/80" : "text-muted-foreground"
              }`}
            >
              {language.label}
            </span>
          </motion.button>
        ))}

        {/* Others button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: allMainLanguages.length * 0.05 }}
          onClick={() => setShowOthers(!showOthers)}
          className={`p-4 rounded-xl text-left transition-all duration-200 col-span-2 ${
            isOtherLang
              ? "bg-primary text-primary-foreground shadow-glow"
              : "bg-card text-card-foreground shadow-soft hover:shadow-medium"
          }`}
        >
          <span className="block text-elder-base font-bold text-center">
            🌏 Others / Lain-lain
          </span>
          <span
            className={`block text-elder-sm text-center ${
              isOtherLang ? "text-primary-foreground/80" : "text-muted-foreground"
            }`}
          >
            Vietnamese, Thai, Korean, Japanese, Hindi
          </span>
        </motion.button>
      </div>

      {/* Others expanded */}
      <AnimatePresence>
        {showOthers && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-3"
          >
            <div className="grid grid-cols-2 gap-3">
              {otherLanguages.map((language, i) => (
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
                  <span
                    className={`block text-elder-sm ${
                      lang === language.code
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground"
                    }`}
                  >
                    {language.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguagePicker;
