import { createContext, useContext, useState, ReactNode } from "react";

export type Language = "en-US" | "hi-IN" | "mr-IN" | "bn-IN" | "kn-IN";

interface VoiceLanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const VoiceLanguageContext = createContext<VoiceLanguageContextProps | undefined>(undefined);

export const VoiceLanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("en-US");

  return (
    <VoiceLanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </VoiceLanguageContext.Provider>
  );
};

export const useVoiceLanguage = () => {
  const context = useContext(VoiceLanguageContext);
  if (!context) throw new Error("useVoiceLanguage must be used within VoiceLanguageProvider");
  return context;
};
