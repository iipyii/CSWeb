import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('cis_lang') || 'TH';
  });

  const setLang = (newLang) => {
    const valid = newLang === 'EN' ? 'EN' : 'TH';
    setLangState(valid);
    localStorage.setItem('cis_lang', valid);
    // Dispatch custom event if external components need notification
    window.dispatchEvent(new CustomEvent('language_changed', { detail: { lang: valid } }));
  };

  const t = (key, fallback = '') => {
    const dict = translations[lang] || translations.TH;
    return dict[key] !== undefined ? dict[key] : (fallback || key);
  };

  useEffect(() => {
    document.documentElement.lang = lang === 'EN' ? 'en' : 'th';
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
