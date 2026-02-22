import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/languages";
import { ArrowLeft } from "lucide-react";

const ScanPage = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
      setAnalyzing(true);
      // Simulate AI analysis - will be replaced with real AI later
      setTimeout(() => {
        navigate("/result", { state: { image: reader.result } });
      }, 2500);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-8">
      {/* Back button */}
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
        className="text-elder-2xl font-extrabold text-foreground mb-2"
      >
        {t(lang, "uploadTitle")}
      </motion.h1>
      <p className="text-elder-base text-muted-foreground mb-8 text-center">
        {t(lang, "uploadDesc")}
      </p>

      {analyzing && preview ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <img
            src={preview}
            alt="Scanned item"
            className="w-64 h-64 object-cover rounded-2xl shadow-medium"
          />
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-primary animate-pulse-gentle" />
            <span className="text-elder-lg font-bold text-foreground">
              {t(lang, "analyzing")}
            </span>
          </div>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-4 w-full max-w-sm">
          {/* Camera button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => cameraInputRef.current?.click()}
            className="w-full bg-accent text-accent-foreground rounded-2xl p-6 shadow-medium text-elder-xl font-extrabold text-center"
          >
            {t(lang, "takePhoto")}
          </motion.button>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFile}
          />

          {/* Gallery button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-card text-card-foreground rounded-2xl p-6 shadow-soft text-elder-xl font-bold text-center border border-border"
          >
            {t(lang, "chooseGallery")}
          </motion.button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
        </div>
      )}
    </div>
  );
};

export default ScanPage;
