import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import WeekPager from '../components/WeekPager'
import DayModal from '../components/DayModal'
import { useLanguage } from '../context/LanguageContext'

// Helper: get Monday of the week containing a date
function getMonday(d) {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(date.setDate(diff))
}

// Helper: format date as YYYY-MM-DD
function formatDate(d) {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function Home({ initialWeekStart, initialLessons }) {
  const [weekStart, setWeekStart] = useState(new Date(initialWeekStart))
  const [lessons, setLessons] = useState(initialLessons)
  const [selectedDate, setSelectedDate] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Fetch lessons for current week
  useEffect(() => {
    fetchWeekLessons(weekStart)
  }, [weekStart])

  async function fetchWeekLessons(start) {
    const startStr = formatDate(start)
    const res = await fetch(`/api/public/weeks?start=${startStr}`)
    const data = await res.json()
    setLessons(data)
  }

  function goToPrevWeek() {
    const prev = new Date(weekStart)
    prev.setDate(prev.getDate() - 7)
    setWeekStart(prev)
  }

  function goToNextWeek() {
    const next = new Date(weekStart)
    next.setDate(next.getDate() + 7)
    setWeekStart(next)
  }

  function handleDayClick(date) {
    setSelectedDate(date)
  }

  function closeModal() {
    setSelectedDate(null)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4">
        <h1 className="text-xl font-semibold text-center text-gray-900 dark:text-gray-100">{t('lessonCalendar')}</h1>
      </header>
      <main className="flex-1 p-4">
        <WeekPager
          weekStart={weekStart}
          lessons={lessons}
          onDayClick={handleDayClick}
          onPrev={goToPrevWeek}
          onNext={goToNextWeek}
        />
      </main>
      {selectedDate && (
        <DayModal date={selectedDate} lessons={lessons} onClose={closeModal} />
      )}
    </div>
  )
}

export async function getServerSideProps() {
  // Server-side render the current week for SEO and performance
  const today = new Date()
  const monday = getMonday(today)
  const startStr = formatDate(monday)

  // Fetch lessons for the week (7 days)
  const endDate = new Date(monday)
  endDate.setDate(endDate.getDate() + 6)
  const endStr = formatDate(endDate)

  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .gte('date', startStr)
    .lte('date', endStr)
    .order('date', { ascending: true })

  if (error) {
    console.error('Error fetching lessons:', error)
  }

  return {
    props: {
      initialWeekStart: startStr,
      initialLessons: data || [],
    },
  }
}