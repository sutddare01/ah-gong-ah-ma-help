import { useTextSize } from "@/lib/text-size-context";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/languages";

const sizes = [
  { key: "large" as const, label: "A" },
  { key: "x-large" as const, label: "A" },
  { key: "xx-large" as const, label: "A" },
] as const;

const TextSizeControl = () => {
  const { textSize, setTextSize } = useTextSize();
  const { lang } = useLanguage();

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-elder-sm font-bold text-foreground">{t(lang, "textSize")}</span>
      <div className="flex items-end gap-2 bg-card rounded-2xl p-3 shadow-soft">
        {sizes.map((s, i) => (
          <button
            key={s.key}
            onClick={() => setTextSize(s.key)}
            className={`rounded-xl px-4 py-2 font-extrabold transition-all ${
              textSize === s.key
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-transparent text-foreground hover:bg-muted/30"
            }`}
            style={{ fontSize: `${1 + i * 0.5}rem` }}
            aria-label={`Text size ${s.key}`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TextSizeControl;
