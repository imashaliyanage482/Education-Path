import React, { createContext, useContext, useState, ReactNode } from 'react';
import { en } from '../localization/en';
import { si } from '../localization/si';
import { LanguageCode } from '../types';

type TranslationKey = keyof typeof en;

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
  isSinhala: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<LanguageCode>('en');

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'si' : 'en'));
  };

  const t = (key: TranslationKey): string => {
    const dictionary = language === 'si' ? si : en;
    return dictionary[key] || en[key] || String(key);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isSinhala: language === 'si',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
