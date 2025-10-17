import '../styles/globals.css'
import NavigationBar from '../components/NavigationBar'
import { LanguageProvider } from '../context/LanguageContext'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

function MyApp({ Component, pageProps }) {
  return (
    <LanguageProvider>
      <NavigationBar />
      <Component {...pageProps} />
      <Analytics />
      <SpeedInsights />
    </LanguageProvider>
  )
}

export default MyApp