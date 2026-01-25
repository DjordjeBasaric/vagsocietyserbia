"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { Language } from "./translations";

const LanguageContext = createContext<{
  language: Language;
  setLanguage: (lang: Language) => void;
}>({
  language: "sr",
  setLanguage: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("sr");

  useEffect(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem("vss-language");
    if (stored === "en" || stored === "sr") {
      setLanguageState(stored);
      document.cookie = `vss-language=${stored}; Path=/; Max-Age=31536000; SameSite=Lax`;
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("vss-language", lang);
    // Also persist as a cookie so server-rendered metadata can match.
    // 1 year.
    document.cookie = `vss-language=${lang}; Path=/; Max-Age=31536000; SameSite=Lax`;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
