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
    
    // Landing Page - Header
    startTrial: 'Rozpocznij 7-dniowy trial',
    login: 'Zaloguj się',
    
    // Landing Page - Hero Section
    heroTitle: 'Inteligentna nauka matematyki z AI',
    heroSubtitle: 'Spersonalizowany tutor matematyczny, który dostosowuje się do Twojego tempa nauki i stylu uczenia się',
    heroFeature1: '✓ 7 dni za darmo',
    heroFeature2: '✓ Spersonalizowany plan nauki',
    heroFeature3: '✓ Dostępny 24/7',
    startFreeTrial: 'Rozpocznij darmowy trial',
    learnMore: 'Dowiedz się więcej',
    
    // Landing Page - Problem Section
    problemTitle: 'Tradycyjne korepetycje mają swoje ograniczenia',
    problemHigh: 'Wysokie koszty',
    problemHighDesc: 'Średnio 80-120 zł za godzinę',
    problemTime: 'Ograniczone godziny',
    problemTimeDesc: 'Tylko w wyznaczonych terminach',
    problemPersonal: 'Brak personalizacji',
    problemPersonalDesc: 'Jeden styl nauczania dla wszystkich',
    
    // Landing Page - Solution Section  
    solutionTitle: 'Mentavo AI: Inteligentne rozwiązanie',
    solutionAvailable: '24/7 Dostępność',
    solutionAvailableDesc: 'Ucz się kiedy chcesz',
    solutionPersonalized: 'Spersonalizowane',
    solutionPersonalizedDesc: 'Dostosowane do Twojego stylu',
    solutionAffordable: 'Przystępna cena',
    solutionAffordableDesc: 'Mniej niż koszt jednej korepetycji',
    
    // Landing Page - Features Section
    featuresTitle: 'Funkcje, które przyspieszą Twoją naukę',
    featureAI: 'AI Tutor',
    featureAIDesc: 'Inteligentny asystent, który rozumie Twoje potrzeby',
    featureProgress: 'Śledzenie postępów',
    featureProgressDesc: 'Monitoruj swoje osiągnięcia w czasie rzeczywistym',
    featureExercises: 'Interaktywne ćwiczenia',
    featureExercisesDesc: 'Praktyczne zadania dostosowane do Twojego poziomu',
    
    // Landing Page - Testimonials Section
    testimonialsTitle: 'Co mówią nasi uczniowie',
    testimonial1: 'Dzięki Mentavo poprawiłem ocenę z matematyki z 3 na 5!',
    testimonial1Author: 'Michał, klasa II LO',
    testimonial2: 'Najlepsza aplikacja do nauki matematyki. Wreszcie rozumiem równania!',
    testimonial2Author: 'Anna, klasa III gimnazjum',
    testimonial3: 'AI tutor wyjaśnia mi wszystko w sposób, który rozumiem.',
    testimonial3Author: 'Jakub, klasa I LO',
    
    // Landing Page - Pricing Section
    pricingTitle: 'Prosty plan cenowy',
    pricingFree: 'Darmowy trial',
    pricingFreeDays: '7 dni',
    pricingFreeDesc: 'Pełny dostęp do wszystkich funkcji',
    pricingPaid: 'Plan miesięczny',
    pricingPaidPrice: '49,99 zł',
    pricingPaidDesc: 'Nielimitowany dostęp do AI tutora',
    pricingFeature1: 'AI Tutor 24/7',
    pricingFeature2: 'Spersonalizowane ćwiczenia',
    pricingFeature3: 'Śledzenie postępów',
    pricingFeature4: 'Materiały edukacyjne',
    startNow: 'Zacznij teraz',
    
    // Landing Page - FAQ Section
    faqTitle: 'Często zadawane pytania',
    faq1Q: 'Czy aplikacja jest darmowa?',
    faq1A: 'Tak! Oferujemy 7-dniowy darmowy trial z pełnym dostępem do wszystkich funkcji. Po tym okresie koszt wynosi 49,99 zł miesięcznie.',
    faq2Q: 'Na jakim poziomie nauczania działa aplikacja?',
    faq2A: 'Mentavo AI obsługuje materiał od szkoły podstawowej do liceum, automatycznie dostosowując się do Twojego poziomu.',
    faq3Q: 'Czy mogę anulować subskrypcję w każdej chwili?',
    faq3A: 'Tak, możesz anulować subskrypcję w każdej chwili bez dodatkowych opłat.',
    faq4Q: 'Jak działa AI tutor?',
    faq4A: 'Nasz AI analizuje Twój styl nauki, mocne i słabe strony, a następnie tworzy spersonalizowany plan nauki i dostosowuje wyjaśnienia do Twoich potrzeb.',
    
    // Landing Page - Footer
    footerPrivacy: 'Polityka prywatności',
    footerTerms: 'Regulamin',
    footerContact: 'Kontakt',
    footerRights: '© 2024 Mentavo AI. Wszystkie prawa zastrzeżone.',
    
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
    
    // Landing Page - Header
    startTrial: 'Почати 7-денний пробний період',
    login: 'Увійти',
    
    // Landing Page - Hero Section
    heroTitle: 'Розумне вивчення математики з AI',
    heroSubtitle: 'Персоналізований репетитор з математики, який адаптується до вашого темпу та стилю навчання',
    heroFeature1: '✓ 7 днів безкоштовно',
    heroFeature2: '✓ Персоналізований план навчання',
    heroFeature3: '✓ Доступний 24/7',
    startFreeTrial: 'Почати безкоштовний пробний період',
    learnMore: 'Дізнатися більше',
    
    // Landing Page - Problem Section
    problemTitle: 'Традиційні репетиторства мають свої обмеження',
    problemHigh: 'Високі витрати',
    problemHighDesc: 'В середньому 80-120 грн за годину',
    problemTime: 'Обмежені години',
    problemTimeDesc: 'Тільки у призначений час',
    problemPersonal: 'Відсутність персоналізації',
    problemPersonalDesc: 'Один стиль навчання для всіх',
    
    // Landing Page - Solution Section
    solutionTitle: 'Mentavo AI: Розумне рішення',
    solutionAvailable: '24/7 Доступність',
    solutionAvailableDesc: 'Вчіться коли хочете',
    solutionPersonalized: 'Персоналізовано',
    solutionPersonalizedDesc: 'Адаптовано до вашого стилю',
    solutionAffordable: 'Доступна ціна',
    solutionAffordableDesc: 'Менше ніж вартість одного уроку',
    
    // Landing Page - Features Section
    featuresTitle: 'Функції, які прискорять ваше навчання',
    featureAI: 'AI Репетитор',
    featureAIDesc: 'Розумний асистент, який розуміє ваші потреби',
    featureProgress: 'Відстеження прогресу',
    featureProgressDesc: 'Моніторте свої досягнення в реальному часі',
    featureExercises: 'Інтерактивні вправи',
    featureExercisesDesc: 'Практичні завдання, адаптовані до вашого рівня',
    
    // Landing Page - Testimonials Section
    testimonialsTitle: 'Що кажуть наші учні',
    testimonial1: 'Завдяки Mentavo я покращив оцінку з математики з 3 на 5!',
    testimonial1Author: 'Михайло, 11 клас',
    testimonial2: 'Найкраща програма для вивчення математики. Нарешті розумію рівняння!',
    testimonial2Author: 'Анна, 9 клас',
    testimonial3: 'AI репетитор пояснює мені все так, що я розумію.',
    testimonial3Author: 'Яків, 10 клас',
    
    // Landing Page - Pricing Section
    pricingTitle: 'Простий ціновий план',
    pricingFree: 'Безкоштовний пробний',
    pricingFreeDays: '7 днів',
    pricingFreeDesc: 'Повний доступ до всіх функцій',
    pricingPaid: 'Місячний план',
    pricingPaidPrice: '49,99 грн',
    pricingPaidDesc: 'Необмежений доступ до AI репетитора',
    pricingFeature1: 'AI Репетитор 24/7',
    pricingFeature2: 'Персоналізовані вправи',
    pricingFeature3: 'Відстеження прогресу',
    pricingFeature4: 'Навчальні матеріали',
    startNow: 'Почати зараз',
    
    // Landing Page - FAQ Section
    faqTitle: 'Часті запитання',
    faq1Q: 'Чи є програма безкоштовною?',
    faq1A: 'Так! Ми пропонуємо 7-денний безкоштовний пробний період з повним доступом до всіх функцій. Після цього періоду вартість становить 49,99 грн на місяць.',
    faq2Q: 'На якому рівні навчання працює програма?',
    faq2A: 'Mentavo AI підтримує матеріал від початкової школи до випускного класу, автоматично адаптуючись до вашого рівня.',
    faq3Q: 'Чи можу я скасувати підписку в будь-який час?',
    faq3A: 'Так, ви можете скасувати підписку в будь-який час без додаткових платежів.',
    faq4Q: 'Як працює AI репетитор?',
    faq4A: 'Наш AI аналізує ваш стиль навчання, сильні та слабкі сторони, а потім створює персоналізований план навчання та адаптує пояснення до ваших потреб.',
    
    // Landing Page - Footer
    footerPrivacy: 'Політика конфіденційності',
    footerTerms: 'Умови використання',
    footerContact: 'Контакт',
    footerRights: '© 2024 Mentavo AI. Всі права захищені.',
    
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