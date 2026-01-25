"use client";

import { useLanguage } from "@/lib/language-context";
import { FiGlobe } from "react-icons/fi";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => setLanguage(language === "sr" ? "en" : "sr")}
      className="button-ghost inline-flex items-center gap-2"
      aria-label={language === "sr" ? "Switch to English" : "Prebaci na srpski"}
      title={language === "sr" ? "English" : "Srpski"}
    >
      <FiGlobe className="h-5 w-5" aria-hidden />
      <span className="hidden text-sm md:inline">
        <span className={language === "en" ? "font-bold" : ""}>EN</span>
        <span className="mx-1">/</span>
        <span className={language === "sr" ? "font-bold" : ""}>SRB</span>
      </span>
    </button>
  );
}
