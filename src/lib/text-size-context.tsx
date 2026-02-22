import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type TextSize = "large" | "x-large" | "xx-large";

interface TextSizeContextType {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
}

const TextSizeContext = createContext<TextSizeContextType>({
  textSize: "x-large",
  setTextSize: () => {},
});

const scaleMap: Record<TextSize, number> = {
  large: 1,
  "x-large": 1.2,
  "xx-large": 1.45,
};

export const TextSizeProvider = ({ children }: { children: ReactNode }) => {
  const [textSize, setTextSize] = useState<TextSize>(() => {
    return (localStorage.getItem("textSize") as TextSize) || "x-large";
  });

  useEffect(() => {
    localStorage.setItem("textSize", textSize);
    document.documentElement.style.setProperty("--text-scale", String(scaleMap[textSize]));
  }, [textSize]);

  return (
    <TextSizeContext.Provider value={{ textSize, setTextSize }}>
      {children}
    </TextSizeContext.Provider>
  );
};

export const useTextSize = () => useContext(TextSizeContext);
