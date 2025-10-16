import { createContext, useContext, useState, useEffect } from 'react';

export const LanguageContext = createContext();

// Translation object for the supported languages
const translations = {
  en: {
    calendar: "Calendar",
    upload: "Upload",
    archive: "Archive",
    search: "Search",
    profile: "Profile",
    settings: "Settings",
    theme: "Theme",
    language: "Language",
    dark: "Dark",
    light: "Light",
    logOut: "Log Out",
    menu: "Menu",
    noLessons: "No lessons for this day.",
    loading: "Loading...",
    failedToLoad: "Failed to load lesson",
    selectLanguage: "Select language",
    lessonCalendar: "Lesson Calendar",
    previousWeek: "← Previous Week",
    nextWeek: "Next Week →",
    noLessonsScheduled: "No lessons scheduled",
    lesson: "lesson",
    lessons: "lessons",
    back: "← Back",
    // Archive page translations
    allSubjects: "All Subjects",
    searchLessons: "Search lessons...",
    noLessonsFound: "No lessons found",
    viewLesson: "View lesson",
    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  },
  pl: {
    calendar: "Kalendarz",
    upload: "Wgraj",
    archive: "Archiwum",
    search: "Szukaj",
    profile: "Profil",
    settings: "Ustawienia",
    theme: "Motyw",
    language: "Język",
    dark: "Ciemny",
    light: "Jasny",
    logOut: "Wyloguj się",
    menu: "Menu",
    noLessons: "Brak lekcji na ten dzień.",
    loading: "Ładowanie...",
    failedToLoad: "Nie udało się załadować lekcji",
    selectLanguage: "Wybierz język",
    lessonCalendar: "Kalendarz Lekcji",
    previousWeek: "← Poprzedni Tydzień",
    nextWeek: "Następny Tydzień →",
    noLessonsScheduled: "Brak zaplanowanych lekcji",
    lesson: "lekcja",
    lessons: "lekcji",
    back: "← Wstecz",
    allSubjects: "Wszystkie Przedmioty",
    searchLessons: "Szukaj lekcji...",
    noLessonsFound: "Nie znaleziono lekcji",
    viewLesson: "Zobacz lekcję",
    weekdays: ['Nie', 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob']
  },
  fr: {
    calendar: "Calendrier",
    upload: "Télécharger",
    archive: "Archive",
    search: "Rechercher",
    profile: "Profil",
    settings: "Paramètres",
    theme: "Thème",
    language: "Langue",
    dark: "Sombre",
    light: "Clair",
    logOut: "Déconnexion",
    menu: "Menu",
    noLessons: "Pas de leçons pour ce jour.",
    loading: "Chargement...",
    failedToLoad: "Échec du chargement de la leçon",
    selectLanguage: "Sélectionner la langue",
    lessonCalendar: "Calendrier des Cours",
    previousWeek: "← Semaine Précédente",
    nextWeek: "Semaine Suivante →",
    noLessonsScheduled: "Aucun cours prévu",
    lesson: "cours",
    lessons: "cours",
    back: "← Retour",
    allSubjects: "Toutes les Matières",
    searchLessons: "Rechercher des leçons...",
    noLessonsFound: "Aucune leçon trouvée",
    viewLesson: "Voir la leçon",
    weekdays: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
  }
};

export function LanguageProvider({ children }) {
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  useEffect(() => {
    // Load language preference from localStorage
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
      setSelectedLanguage(savedLanguage);
    }
  }, []);

  const updateLanguage = (lang) => {
    setSelectedLanguage(lang);
    localStorage.setItem('selectedLanguage', lang);
  };

  const t = (key) => {
    return translations[selectedLanguage]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ selectedLanguage, updateLanguage, t }}>
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