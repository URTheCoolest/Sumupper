import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import LessonList from '../../components/LessonList'
import { useLanguage } from '../../context/LanguageContext'

export default function DayPage() {
  const router = useRouter()
  const { date } = router.query
  const [lessons, setLessons] = useState([])
  const { t } = useLanguage()

  useEffect(() => {
    if (date) {
      fetchLessons(date)
    }
  }, [date])

  async function fetchLessons(d) {
    const res = await fetch(`/api/public/weeks?start=${d}`)
    const data = await res.json()
    const filtered = data.filter((l) => l.date === d)
    setLessons(filtered)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="bg-gray-100 dark:bg-gray-800 p-4 flex items-center">
        <button
          onClick={() => router.back()}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mr-4"
          aria-label="Go back"
        >
          {t('back')}
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{date}</h1>
      </header>
      <main className="p-4">
        <LessonList lessons={lessons} />
      </main>
    </div>
  )
}