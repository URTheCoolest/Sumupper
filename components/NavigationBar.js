import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { X, Menu, Sun, Moon, Globe, LogOut, Settings } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// Toast notification component
function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg animate-slide-up z-50">
      {message}
    </div>
  );
}

export default function NavigationBar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { selectedLanguage, updateLanguage, t } = useLanguage();
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);

  // Navigation links configuration
  const navLinks = [
    { href: '/admin', label: t('upload'), icon: '|->' },
    { href: '/', label: t('calendar'), icon: '📅' },
    { href: '/archive', label: t('archive'), icon: '📚' },
  ];

  // Language options
  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'pl', label: 'Polski', flag: '🇵🇱' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
  ];

  // Initialize theme and user on mount
  useEffect(() => {
    // Load dark mode preference from localStorage
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    applyTheme(savedDarkMode);

    // Get current user and their language preference
    loadUserPreferences();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        loadUserPreferences();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Load user's language preference from Supabase
  async function loadUserPreferences() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('language')
        .eq('id', user.id)
        .single();

      if (data?.language) {
        updateLanguage(data.language);
      }
    }
  }

  // Apply theme to document
  function applyTheme(isDark) {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  // Toggle dark mode
  function toggleDarkMode() {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    applyTheme(newDarkMode);
  }

  // Change language and update in Supabase
  async function changeLanguage(newLang) {
    updateLanguage(newLang);

    if (user) {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          language: newLang,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error updating language:', error);
        setToast('Failed to update language');
      } else {
        const selectedLang = languages.find(l => l.code === newLang);
        setToast(`Language updated to ${selectedLang.label}`);
      }
    }
  }

  // Handle logout
  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
    setSettingsOpen(false);
    setMobileMenuOpen(false);
  }

  // Check if link is active
  function isActive(href) {
    return router.pathname === href;
  }

  // Close settings when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (settingsOpen && !event.target.closest('.settings-dropdown')) {
        setSettingsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [settingsOpen]);

  return (
    <>
      {/* Main Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                Sumupper
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Settings & Profile */}
            <div className="hidden md:flex items-center space-x-2 relative">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Open settings"
              >
                <Settings size={20} />
              </button>

              {user && (
                <Link
                  href="/profile"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/profile')
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {t('profile')}
                </Link>
              )}

              {/* Desktop Settings Dropdown */}
              {settingsOpen && (
                <div className="settings-dropdown absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{t('settings')}</h3>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Theme Toggle */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{t('theme')}</span>
                      <button
                        onClick={toggleDarkMode}
                        className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm"
                      >
                        {darkMode ? (
                          <>
                            <Moon size={16} />
                            <span>{t('dark')}</span>
                          </>
                        ) : (
                          <>
                            <Sun size={16} />
                            <span>{t('light')}</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Language Selector */}
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                        <Globe size={16} className="inline mr-2" />
                        {t('language')}
                      </label>
                      <div className="space-y-1">
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                              selectedLanguage === lang.code
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <span className="mr-2">{lang.flag}</span>
                            {lang.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Logout Button */}
                    {user && (
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                      >
                        <LogOut size={16} />
                        <span>Log Out</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Sidebar */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Sidebar */}
        <div
          className={`absolute top-0 right-0 h-full w-80 max-w-full bg-white dark:bg-gray-900 shadow-xl transform transition-transform ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('menu')}</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={24} />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    isActive(link.href)
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="mr-3">{link.icon}</span>
                  {link.label}
                </Link>
              ))}

              {user && (
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    isActive('/profile')
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  👤 Profile
                </Link>
              )}

              {/* Settings Section */}
              <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
                <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                  Settings
                </h3>

                {/* Theme Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <span>Theme</span>
                  <span className="flex items-center space-x-2">
                    {darkMode ? <Moon size={18} /> : <Sun size={18} />}
                    <span className="text-sm">{darkMode ? 'Dark' : 'Light'}</span>
                  </span>
                </button>

                {/* Language Selector */}
                <div className="mt-2">
                  <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                    <Globe size={16} className="inline mr-2" />
                    Language
                  </div>
                  <div className="space-y-1">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`w-full text-left px-4 py-2 transition-colors ${
                          selectedLanguage === lang.code
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <span className="mr-2">{lang.flag}</span>
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Logout Button (Mobile) */}
            {user && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  <LogOut size={18} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast message={toast} onClose={() => setToast(null)} />
      )}
    </>
  );
}