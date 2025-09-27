import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'pl' | 'uk';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translations
const translations = {
  pl: {
    // Chat translations
    chatWelcome: 'Cześć! Jestem Mentavo AI. Mogę pomóc Ci z matematyką, wytłumaczyć pojęcia i rozwiązać zadania. W czym mogę Ci dzisiaj pomóc?',
    chatPlaceholder: 'Zadaj pytanie o matematykę...',
    chatSend: 'Wyślij',
    chatLoading: 'Myślę...',
    chatError: 'Wystąpił błąd podczas przetwarzania wiadomości',
    chatSettings: 'Ustawienia',
    chatNewSession: 'Nowa sesja',
    chatSessionEnded: 'Sesja zakończona',
    
    // Auth translations
    authWelcome: 'Witaj w Mentavo AI',
    authSubtitle: 'Zaloguj się, aby kontynuować naukę',
    authEmail: 'Adres email',
    authSendLink: 'Wyślij link logowania',
    authCheckEmail: 'Sprawdź swoją skrzynkę email',
    authEmailSent: 'Wysłaliśmy link do logowania na Twój adres email',
    
    // Navigation
    navHome: 'Strona główna',
    navChat: 'Chat',
    navDashboard: 'Panel',
    navProgress: 'Postępy',
    navAccount: 'Konto',
    navLogout: 'Wyloguj się',
    
    // Common
    loading: 'Ładowanie...',
    error: 'Błąd',
    success: 'Sukces',
    cancel: 'Anuluj',
    confirm: 'Potwierdź',
    save: 'Zapisz',
  },
  uk: {
    // Chat translations
    chatWelcome: 'Привіт! Я Mentavo AI. Я можу допомогти тобі з математикою, пояснити поняття та розв\'язати задачі. Чим можу допомогти сьогодні?',
    chatPlaceholder: 'Задай питання про математику...',
    chatSend: 'Надіслати',
    chatLoading: 'Думаю...',
    chatError: 'Сталася помилка під час обробки повідомлення',
    chatSettings: 'Налаштування',
    chatNewSession: 'Нова сесія',
    chatSessionEnded: 'Сесія завершена',
    
    // Auth translations
    authWelcome: 'Ласкаво просимо до Mentavo AI',
    authSubtitle: 'Увійдіть, щоб продовжити навчання',
    authEmail: 'Адреса електронної пошти',
    authSendLink: 'Надіслати посилання для входу',
    authCheckEmail: 'Перевірте свою електронну пошту',
    authEmailSent: 'Ми надіслали посилання для входу на вашу адресу електронної пошти',
    
    // Navigation
    navHome: 'Головна',
    navChat: 'Чат',
    navDashboard: 'Панель',
    navProgress: 'Прогрес',
    navAccount: 'Акаунт',
    navLogout: 'Вийти',
    
    // Common
    loading: 'Завантаження...',
    error: 'Помилка',
    success: 'Успіх',
    cancel: 'Скасувати',
    confirm: 'Підтвердити',
    save: 'Зберегти',
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Get language from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang') as Language;
    const savedLang = localStorage.getItem('mentavo-language') as Language;
    
    if (urlLang && (urlLang === 'pl' || urlLang === 'uk')) {
      return urlLang;
    }
    
    return savedLang || 'pl';
  });

  useEffect(() => {
    // Save language to localStorage
    localStorage.setItem('mentavo-language', language);
  }, [language]);

  const value = {
    language,
    setLanguage,
    t: translations[language]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};