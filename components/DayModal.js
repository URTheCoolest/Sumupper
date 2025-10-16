import { useEffect, useState } from 'react'
import LessonList from './LessonList'
import { useLanguage } from '../context/LanguageContext'

export default function DayModal({ date, lessons, onClose }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
  }, [])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  const { selectedLanguage, t } = useLanguage()
  
  // Format date as YYYY-MM-DD for comparison
  const formattedDate = date.toISOString().split('T')[0]
  const dayLessons = lessons.filter((l) => 
    l.date === formattedDate && 
    l.language && 
    l.language.toLowerCase() === selectedLanguage
  )

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-black transition-opacity duration-300 ${
        visible ? 'bg-opacity-50' : 'bg-opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white dark:bg-gray-900 w-full max-w-2xl rounded-t-2xl shadow-2xl transform transition-transform duration-300 ${
          visible ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '80vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {date.toLocaleDateString(selectedLanguage, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 64px)' }}>
          <LessonList lessons={dayLessons} />
        </div>
      </div>
    </div>
  )
}