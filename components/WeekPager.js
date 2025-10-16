import { useState } from 'react'
import DayCell from './DayCell'
import { useLanguage } from '../context/LanguageContext'

// Helper: format date as YYYY-MM-DD
function formatDate(d) {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function WeekPager({ weekStart, lessons, onDayClick, onPrev, onNext }) {
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const { selectedLanguage, t } = useLanguage()

  // Generate 7 days starting from weekStart
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    days.push(d)
  }

  // Group lessons by date
  const lessonsByDate = {}
  lessons.forEach((lesson) => {
    if (!lessonsByDate[lesson.date]) {
      lessonsByDate[lesson.date] = []
    }
    lessonsByDate[lesson.date].push(lesson)
  })

  function handleTouchStart(e) {
    if (e.target.tagName.toLowerCase() === 'button') {
      return; // Don't handle touch events on buttons
    }
    setTouchStart(e.targetTouches[0].clientX)
    setTouchEnd(e.targetTouches[0].clientX) // Initialize touchEnd
  }

  function handleTouchMove(e) {
    if (e.target.tagName.toLowerCase() === 'button') {
      return; // Don't handle touch events on buttons
    }
    setTouchEnd(e.targetTouches[0].clientX)
  }

  function handleTouchEnd() {
    if (touchStart === 0 || touchEnd === 0) return; // Don't handle if touch wasn't started properly

    if (touchStart - touchEnd > 75) {
      // Swipe left -> next week
      onNext()
    } else if (touchStart - touchEnd < -75) {
      // Swipe right -> prev week
      onPrev()
    }

    // Reset touch values
    setTouchStart(0)
    setTouchEnd(0)
  }

  return (
    <div 
      className="space-y-4"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4 mb-4">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onPrev();
          }}
          className="hidden md:block px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded font-medium text-base border border-gray-200 dark:border-gray-700"
        >
          {t('previousWeek')}
        </button>
        <div className="text-gray-900 dark:text-gray-100 font-bold text-center w-full md:w-auto">
          {new Date(weekStart).toLocaleDateString(selectedLanguage, { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          })} 
          <span className="mx-2">—</span> 
          {new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString(selectedLanguage, {
            month: 'short',
            day: 'numeric', 
            year: 'numeric'
          })}
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onNext();
          }}
          className="hidden md:block px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded font-medium text-base border border-gray-200 dark:border-gray-700"
        >
          {t('nextWeek')}
        </button>
      </div>
      <div className="md:grid md:grid-cols-7 md:gap-4 md:auto-rows-fr flex flex-col space-y-4 md:space-y-0">
        {days.map((date) => (
          <div key={date.toISOString()} className="md:h-[500px] h-auto">
            <DayCell
              date={date}
              lessons={lessonsByDate[formatDate(date)] || []}
              onClick={() => onDayClick(date)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}