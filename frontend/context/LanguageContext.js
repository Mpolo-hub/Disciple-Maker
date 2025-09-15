'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { translations } from '../lib/translations';

const LanguageContext = createContext({ locale: 'fr', t: (key) => key, setLocale: () => {} });

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState('fr');

  const value = useMemo(() => ({
    locale,
    t: (key) => translations[locale]?.[key] || translations.fr[key] || key,
    setLocale
  }), [locale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
