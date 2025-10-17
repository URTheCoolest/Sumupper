import '../styles/globals.css'
import NavigationBar from '../components/NavigationBar'
import { LanguageProvider } from '../context/LanguageContext'
import { Analytics } from '@vercel/analytics/react'

function MyApp({ Component, pageProps }) {
  return (
    <LanguageProvider>
      <NavigationBar />
      <Component {...pageProps} />
      <Analytics />
    </LanguageProvider>
  )
}

export default MyApp