import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/languages";

// Mock AI explanations per language
const mockExplanations: Record<string, string> = {
  en: "This looks like a product label or manual. Here's what it says in simple words:\n\n🔹 This item needs to be kept in a cool, dry place.\n🔹 Do not use after the expiry date.\n🔹 If you feel unwell after using it, please see a doctor.\n\nWould you like me to explain anything else?",
  zh: "这看起来是一个产品标签或说明书。简单来说：\n\n🔹 这个东西要放在阴凉干燥的地方。\n🔹 过期了就不要用了。\n🔹 用了以后如果不舒服，就去看医生。\n\n还有什么需要我帮你解释的吗？",
  ms: "Ini kelihatan seperti label produk atau manual. Dalam kata mudah:\n\n🔹 Simpan di tempat yang sejuk dan kering.\n🔹 Jangan guna selepas tarikh luput.\n🔹 Jika rasa tak sihat selepas guna, jumpa doktor.\n\nNak saya terangkan apa-apa lagi?",
  ta: "இது ஒரு பொருளின் லேபிள் அல்லது கையேடு போல் தெரிகிறது. எளிமையாக:\n\n🔹 குளிர்ச்சியான, உலர்ந்த இடத்தில் வைக்கவும்.\n🔹 காலாவதி தேதிக்குப் பிறகு பயன்படுத்த வேண்டாம்.\n🔹 பயன்படுத்திய பிறகு உடல்நிலை சரியில்லை என்றால், மருத்துவரைப் பாருங்கள்.\n\nவேறு எதாவது விளக்க வேண்டுமா?",
  hk: "这看起来是一个产品标签或说明书。简单来说：\n\n🔹 这个东西要放在阴凉干燥的地方。\n🔹 过期了就不要用了。\n🔹 用了以后如果不舒服，就去看医生。\n\n还有什么需要我帮你解释的吗？",
  ct: "呢个睇落系产品标签或者说明书。简单嚟讲：\n\n🔹 呢样嘢要摆喺阴凉干燥嘅地方。\n🔹 过咗期就唔好用喇。\n🔹 用完之后如果唔舒服，就去睇医生。\n\n仲有咩需要我帮你解释？",
  tc: "这看起来是一个产品标签或说明书。简单讲：\n\n🔹 这个物件爱放在阴凉干燥的所在。\n🔹 过期了就莫用了。\n🔹 用了后若是无爽快，就去看医生。\n\n还有啥物需要我共汝解释？",
};

const ResultPage = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const image = (location.state as { image?: string })?.image;

  const explanation = mockExplanations[lang] || mockExplanations.en;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-8 pb-16">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-elder-2xl font-extrabold text-foreground mb-6"
      >
        {t(lang, "resultTitle")}
      </motion.h1>

      {image && (
        <motion.img
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          src={image}
          alt="Scanned item"
          className="w-48 h-48 object-cover rounded-2xl shadow-soft mb-6"
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-md bg-card rounded-2xl p-6 shadow-soft mb-8"
      >
        <p className="text-elder-base text-card-foreground whitespace-pre-line leading-relaxed">
          {explanation}
        </p>
      </motion.div>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/scan")}
          className="w-full bg-accent text-accent-foreground rounded-2xl p-5 shadow-medium text-elder-lg font-extrabold text-center"
        >
          {t(lang, "scanAgain")}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/")}
          className="w-full bg-card text-card-foreground rounded-2xl p-5 shadow-soft text-elder-lg font-bold text-center border border-border"
        >
          {t(lang, "backHome")}
        </motion.button>
      </div>
    </div>
  );
};

export default ResultPage;
