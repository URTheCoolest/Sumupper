import '../styles/globals.css'
import NavigationBar from '../components/NavigationBar'
import { LanguageProvider } from '../context/LanguageContext'

function MyApp({ Component, pageProps }) {
  return (
    <LanguageProvider>
      <NavigationBar />
      <Component {...pageProps} />
    </LanguageProvider>
  )
}

export default MyApp