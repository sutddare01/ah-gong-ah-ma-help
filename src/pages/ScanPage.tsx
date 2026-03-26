import { useRef, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/languages";
import { ArrowLeft, Camera, Image, ZoomIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const tips: Record<string, string[]> = {
  en: [
    "💡 Hold your phone steady and close to the item",
    "💡 Make sure there's good lighting",
    "💡 Try to capture any text or labels clearly",
  ],
  zh: [
    "💡 拿稳手机，靠近物品",
    "💡 确保光线充足",
    "💡 尽量拍清楚文字或标签",
  ],
  ms: [
    "💡 Pegang telefon dengan stabil dan dekat dengan barang",
    "💡 Pastikan pencahayaan baik",
    "💡 Cuba tangkap teks atau label dengan jelas",
  ],
  ta: [
    "💡 உங்கள் தொலைபேசியை நிலையாகப் பிடிக்கவும்",
    "💡 நல்ல வெளிச்சம் இருப்பதை உறுதிப்படுத்தவும்",
    "💡 எழுத்துக்களை தெளிவாகப் படம் எடுக்கவும்",
  ],
};

const loadingMessages: Record<string, string[]> = {
  en: [
    "🔍 Looking at your photo...",
    "🤔 Understanding what this is...",
    "📝 Preparing a simple explanation for you...",
  ],
  zh: ["🔍 正在看你的照片...", "🤔 正在理解这是什么...", "📝 正在为你准备简单的解释..."],
  ms: ["🔍 Melihat foto anda...", "🤔 Memahami apa ini...", "📝 Menyediakan penjelasan mudah..."],
  ta: ["🔍 உங்கள் படத்தைப் பார்க்கிறேன்...", "🤔 இது என்னவென்று புரிந்துகொள்கிறேன்...", "📝 எளிய விளக்கம் தயாரிக்கிறேன்..."],
};

const ScanPage = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Cycle through loading messages
  useEffect(() => {
    if (!analyzing) {
      setLoadingStep(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        const msgs = loadingMessages[lang] || loadingMessages.en;
        return prev < msgs.length - 1 ? prev + 1 : prev;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [analyzing, lang]);

  const openCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch {
      setCameraError(
        lang === "en"
          ? "Could not access camera. Please allow camera permission in your phone settings."
          : lang === "ms"
            ? "Tidak dapat akses kamera. Sila benarkan kebenaran kamera."
            : lang === "ta"
              ? "கேமராவை அணுக முடியவில்லை. அனுமதி அளிக்கவும்."
              : "无法访问相机，请在手机设置中允许相机权限。"
      );
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    stopCamera();
    processImage(dataUrl);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => processImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const processImage = async (imageData: string) => {
    setPreview(imageData);
    setAnalyzing(true);
    setLoadingStep(0);

    try {
      const { data, error } = await supabase.functions.invoke("scan-explain", {
        body: { image: imageData, lang },
      });

      if (error) {
        const context = (error as { context?: Response }).context;
        if (context) {
          const status = context.status;
          const payload = await context.json().catch(() => null);
          const backendMessage = payload?.error as string | undefined;

          if (status === 402) {
            throw new Error(
              backendMessage ||
                (lang === "en"
                  ? "AI credits are exhausted. Please top up and try again."
                  : "AI额度不足，请充值后再试。")
            );
          }
          if (status === 429) {
            throw new Error(
              backendMessage ||
                (lang === "en"
                  ? "Too many requests. Please wait a moment and try again."
                  : "请求过多，请稍后再试。")
            );
          }
          if (backendMessage) throw new Error(backendMessage);
        }
        throw error;
      }

      if (data?.error) throw new Error(data.error);

      navigate("/result", {
        state: { image: imageData, explanation: data.explanation },
      });
    } catch (err: unknown) {
      console.error("Scan error:", err);
      const description =
        err instanceof Error && err.message
          ? err.message
          : lang === "en"
            ? "Could not analyze the image. Please try again."
            : "无法分析图片，请再试一次。";

      toast({
        title: lang === "en" ? "Something went wrong" : "出了点问题",
        description,
        variant: "destructive",
      });
      setAnalyzing(false);
      setPreview(null);
    }
  };

  const currentTips = tips[lang] || tips.en;
  const currentLoadingMsgs = loadingMessages[lang] || loadingMessages.en;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-6 pb-20">
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => { stopCamera(); navigate("/"); }}
        className="self-start mb-4 flex items-center gap-2 text-elder-lg text-muted-foreground hover:text-foreground transition-colors p-2 -ml-2 rounded-xl"
      >
        <ArrowLeft size={28} />
        <span className="font-bold">{t(lang, "backHome")}</span>
      </motion.button>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-elder-2xl font-extrabold text-foreground mb-1 text-center"
      >
        {t(lang, "uploadTitle")}
      </motion.h1>
      <p className="text-elder-lg text-muted-foreground mb-6 text-center max-w-sm">
        {t(lang, "uploadDesc")}
      </p>

      {/* Camera view */}
      {cameraOpen && !analyzing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 w-full max-w-md mb-6"
        >
          <div className="relative w-full rounded-2xl overflow-hidden shadow-medium bg-foreground/5 border-4 border-primary/30">
            <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-xl" />
            {/* Scan guide overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-3/4 h-3/4 border-2 border-dashed border-primary/40 rounded-2xl flex items-center justify-center">
                <ZoomIn className="text-primary/30" size={48} />
              </div>
            </div>
          </div>
          <p className="text-elder-base text-muted-foreground text-center font-medium">
            {lang === "en"
              ? "Point your camera at the item and tap the button below"
              : lang === "ms"
                ? "Halakan kamera ke barang dan tekan butang di bawah"
                : lang === "ta"
                  ? "பொருளை நோக்கி கேமராவை வைத்து கீழே உள்ள பொத்தானை அழுத்தவும்"
                  : "将相机对准物品，然后点击下方按钮"}
          </p>
          <div className="flex gap-3 w-full">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={capturePhoto}
              className="flex-1 bg-accent text-accent-foreground rounded-2xl p-6 shadow-medium text-elder-xl font-extrabold text-center flex items-center justify-center gap-3"
            >
              <Camera size={32} />
              {lang === "en" ? "📸 Take Photo" : lang === "ms" ? "📸 Tangkap" : lang === "ta" ? "📸 படம் எடு" : "📸 拍照"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={stopCamera}
              className="bg-card text-card-foreground rounded-2xl p-6 shadow-soft text-elder-xl font-bold text-center border border-border min-w-[70px]"
            >
              ✕
            </motion.button>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </motion.div>
      )}

      {/* Camera error */}
      {cameraError && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-5 mb-4 max-w-sm">
          <p className="text-destructive text-elder-lg font-bold text-center">{cameraError}</p>
        </div>
      )}

      {/* Analyzing state */}
      <AnimatePresence>
        {analyzing && preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6 w-full max-w-sm"
          >
            <img
              src={preview}
              alt="Scanned item"
              className="w-72 h-72 object-cover rounded-2xl shadow-medium border-4 border-primary/20"
            />
            <div className="flex flex-col items-center gap-3 bg-card rounded-2xl p-6 shadow-soft w-full">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary animate-pulse-gentle" />
                <div className="w-6 h-6 rounded-full bg-primary animate-pulse-gentle" style={{ animationDelay: "0.3s" }} />
                <div className="w-6 h-6 rounded-full bg-primary animate-pulse-gentle" style={{ animationDelay: "0.6s" }} />
              </div>
              <motion.p
                key={loadingStep}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-elder-lg font-bold text-foreground text-center"
              >
                {currentLoadingMsgs[loadingStep]}
              </motion.p>
              <p className="text-elder-base text-muted-foreground text-center">
                {lang === "en"
                  ? "This may take a few seconds — hang tight! 😊"
                  : lang === "ms"
                    ? "Ini mungkin mengambil beberapa saat — tunggu ya! 😊"
                    : lang === "ta"
                      ? "இது சில வினாடிகள் ஆகலாம் — பொறுங்கள்! 😊"
                      : "可能需要几秒钟 — 请稍等！😊"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main buttons */}
      {!cameraOpen && !analyzing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-5 w-full max-w-sm"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={openCamera}
            className="w-full bg-accent text-accent-foreground rounded-2xl p-7 shadow-medium text-elder-xl font-extrabold text-center flex items-center justify-center gap-4"
          >
            <Camera size={36} />
            {t(lang, "takePhoto")}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-card text-card-foreground rounded-2xl p-7 shadow-soft text-elder-xl font-bold text-center border-2 border-border flex items-center justify-center gap-4"
          >
            <Image size={36} />
            {t(lang, "chooseGallery")}
          </motion.button>

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

          {/* Tips section */}
          <div className="bg-card rounded-2xl p-5 shadow-soft border border-border mt-2">
            <h3 className="text-elder-lg font-extrabold text-foreground mb-3">
              {lang === "en" ? "📋 Tips for a good scan:" : lang === "ms" ? "📋 Tips untuk imbasan yang baik:" : lang === "ta" ? "📋 நல்ல ஸ்கேன் குறிப்புகள்:" : "📋 拍照小贴士："}
            </h3>
            <ul className="space-y-2">
              {currentTips.map((tip, i) => (
                <li key={i} className="text-elder-base text-muted-foreground font-medium">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ScanPage;
