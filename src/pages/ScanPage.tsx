import { useRef, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/languages";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
    } catch (err) {
      setCameraError(
        lang === "en"
          ? "Could not access camera. Please allow camera permission."
          : "无法访问相机，请允许相机权限。"
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
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
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

    try {
      const { data, error } = await supabase.functions.invoke("scan-explain", {
        body: { image: imageData, lang },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      navigate("/result", {
        state: { image: imageData, explanation: data.explanation },
      });
    } catch (err: any) {
      console.error("Scan error:", err);
      toast({
        title: lang === "en" ? "Something went wrong" : "出了点问题",
        description: lang === "en"
          ? "Could not analyze the image. Please try again."
          : "无法分析图片，请再试一次。",
        variant: "destructive",
      });
      setAnalyzing(false);
      setPreview(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-8 pb-16">
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => { stopCamera(); navigate("/"); }}
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

      {cameraOpen && !analyzing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 w-full max-w-md mb-6"
        >
          <div className="relative w-full rounded-2xl overflow-hidden shadow-medium bg-foreground/5">
            <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-2xl" style={{ transform: "scaleX(-1)" }} />
          </div>
          <div className="flex gap-3 w-full">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={capturePhoto}
              className="flex-1 bg-accent text-accent-foreground rounded-2xl p-5 shadow-medium text-elder-lg font-extrabold text-center"
            >
              📸 {lang === "en" ? "Capture" : lang === "ms" ? "Tangkap" : lang === "ta" ? "படம் எடு" : "拍照"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={stopCamera}
              className="bg-card text-card-foreground rounded-2xl p-5 shadow-soft text-elder-lg font-bold text-center border border-border"
            >
              ✕
            </motion.button>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </motion.div>
      )}

      {cameraError && (
        <p className="text-destructive text-elder-base font-bold mb-4 text-center">{cameraError}</p>
      )}

      {analyzing && preview ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6">
          <img src={preview} alt="Scanned item" className="w-64 h-64 object-cover rounded-2xl shadow-medium" />
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-primary animate-pulse-gentle" />
            <span className="text-elder-lg font-bold text-foreground">{t(lang, "analyzing")}</span>
          </div>
        </motion.div>
      ) : !cameraOpen && (
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={openCamera}
            className="w-full bg-accent text-accent-foreground rounded-2xl p-6 shadow-medium text-elder-xl font-extrabold text-center"
          >
            {t(lang, "takePhoto")}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-card text-card-foreground rounded-2xl p-6 shadow-soft text-elder-xl font-bold text-center border border-border"
          >
            {t(lang, "chooseGallery")}
          </motion.button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
      )}
    </div>
  );
};

export default ScanPage;
