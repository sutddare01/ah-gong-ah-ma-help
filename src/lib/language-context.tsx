import React, { createContext, useContext, useState } from "react";

interface LanguageContextType {
  lang: string;
  setLang: (lang: string) => void;
  hasChosenLang: boolean;
  setHasChosenLang: (v: boolean) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  hasChosenLang: false,
  setHasChosenLang: () => {},
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem("ahgong-lang") || "en");
  const [hasChosenLang, setHasChosenLang] = useState(() => localStorage.getItem("ahgong-lang-chosen") === "true");

  const handleSetLang = (newLang: string) => {
    setLang(newLang);
    localStorage.setItem("ahgong-lang", newLang);
  };

  const handleSetChosen = (v: boolean) => {
    setHasChosenLang(v);
    localStorage.setItem("ahgong-lang-chosen", String(v));
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, hasChosenLang, setHasChosenLang: handleSetChosen }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
