import { motion } from "framer-motion";
import heroImage from "@/assets/hero-illustration.png";
import ScanButton from "@/components/ScanButton";
import LanguagePicker from "@/components/LanguagePicker";
import TextSizeControl from "@/components/TextSizeControl";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/languages";

const Index = () => {
  const { lang } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-8 pb-16">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-6"
      >
        <img
          src={heroImage}
          alt="SteadyLA helper"
          className="w-36 h-36 mx-auto mb-4 rounded-full shadow-soft object-cover"
        />
        <h1 className="text-elder-2xl font-extrabold text-foreground">
          {t(lang, "appName")}
        </h1>
        <p className="text-elder-base text-muted-foreground mt-2">
          {t(lang, "tagline")}
        </p>
      </motion.div>

      {/* Scan Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="w-full flex justify-center mb-8"
      >
        <ScanButton />
      </motion.div>

      {/* Text Size Control */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="mb-8"
      >
        <TextSizeControl />
      </motion.div>

      {/* Language Picker */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="w-full"
      >
        <LanguagePicker />
      </motion.div>
    </div>
  );
};

export default Index;
