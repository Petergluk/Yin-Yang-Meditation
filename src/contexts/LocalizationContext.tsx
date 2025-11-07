import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

type Translations = Record<string, string>;

interface LocalizationContextType {
    language: string;
    setLanguage: (lang: string) => void;
    t: (key: string, replacements?: Record<string, string | number>) => string;
    isLoaded: boolean;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

const translations: Record<string, Translations> = {};

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<string>(localStorage.getItem('language') || 'en');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadTranslations = async () => {
            try {
                const enResponse = await fetch('/locales/en.json');
                translations.en = await enResponse.json();
                const ruResponse = await fetch('/locales/ru.json');
                translations.ru = await ruResponse.json();
                setIsLoaded(true);
            } catch (error) {
                console.error("Failed to load translations:", error);
            }
        };
        loadTranslations();
    }, []);

    const setLanguage = (lang: string) => {
        localStorage.setItem('language', lang);
        setLanguageState(lang);
    };

    const t = useCallback((key: string, replacements?: Record<string, string | number>): string => {
        if (!isLoaded) return key;
        let translation = translations[language]?.[key] || translations['en']?.[key] || key;
        
        if (replacements) {
            Object.keys(replacements).forEach(placeholder => {
                translation = translation.replace(`{${placeholder}}`, String(replacements[placeholder]));
            });
        }
        
        return translation;
    }, [language, isLoaded]);

    if (!isLoaded) {
        return null; // Don't render app until translations are loaded
    }

    return (
        <LocalizationContext.Provider value={{ language, setLanguage, t, isLoaded }}>
            {children}
        </LocalizationContext.Provider>
    );
};

export const useLocalization = (): LocalizationContextType => {
    const context = useContext(LocalizationContext);
    if (context === undefined) {
        throw new Error('useLocalization must be used within a LocalizationProvider');
    }
    return context;
};