import { useEffect, useState } from 'react'
import '../styles/globals.css'
import NavigationBar from '../components/NavigationBar'
import { LanguageProvider } from '../context/LanguageContext'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

function MyApp({ Component, pageProps }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration)
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })
    }

    // Handle install prompt
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the default browser install prompt
      e.preventDefault()
      // Save the event for later use
      setDeferredPrompt(e)
      // Show our custom install prompt
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Hide install prompt if already installed
    window.addEventListener('appinstalled', () => {
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
      console.log('PWA installed successfully')
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the browser's install prompt
    deferredPrompt.prompt()

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response: ${outcome}`)

    // Clear the prompt
    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const handleDismissInstall = () => {
    setShowInstallPrompt(false)
    // Remember dismissal for 7 days
    localStorage.setItem('installPromptDismissed', Date.now().toString())
  }

  useEffect(() => {
    // Check if user dismissed the prompt recently
    const dismissed = localStorage.getItem('installPromptDismissed')
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10)
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)
      if (daysSinceDismissed < 7) {
        setShowInstallPrompt(false)
      }
    }
  }, [])

  return (
    <LanguageProvider>
      <NavigationBar />
      
      {/* Install PWA Prompt */}
      {showInstallPrompt && (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4 z-50 animate-slide-up">
          <button
            onClick={handleDismissInstall}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Dismiss"
          >
            ×
          </button>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Install Sumupper
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Install our app for quick access, offline support, and notifications about new lessons!
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={handleInstallClick}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition-colors"
                >
                  Install
                </button>
                <button
                  onClick={handleDismissInstall}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm transition-colors"
                >
                  Not now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Component {...pageProps} />
      <Analytics />
      <SpeedInsights />
    </LanguageProvider>
  )
}

export default MyApp