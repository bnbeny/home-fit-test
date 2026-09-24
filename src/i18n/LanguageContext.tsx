import { createContext, useContext, useMemo, useState, type PropsWithChildren } from "react";
import { en } from "./en";
import { th } from "./th";
import type { Language, Translations } from "./types";

const DICTIONARIES: Record<Language, Translations> = { en, th };

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguage] = useState<Language>("th");
  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, t: DICTIONARIES[language] }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
