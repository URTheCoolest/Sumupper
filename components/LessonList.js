import Link from 'next/link'
import { useLanguage } from '../context/LanguageContext'

export default function LessonList({ lessons }) {
  const { selectedLanguage, t } = useLanguage()
  
  // Filter lessons by selected language
  const filteredLessons = lessons.filter(lesson => 
    lesson.language && lesson.language.toLowerCase() === selectedLanguage
  )

  if (filteredLessons.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400">{t('noLessons')}</p>
  }

  // Subject color mapping
  const subjectColors = {
    historia: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      hover: 'hover:bg-amber-100 dark:hover:bg-amber-900/30',
      border: 'border-amber-200 dark:border-amber-700',
      text: 'text-amber-800 dark:text-amber-200',
    },
    matematyka: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/30',
      border: 'border-blue-200 dark:border-blue-700',
      text: 'text-blue-800 dark:text-blue-200',
    },
    fizyka: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/30',
      border: 'border-purple-200 dark:border-purple-700',
      text: 'text-purple-800 dark:text-purple-200',
    },
    chemia: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      hover: 'hover:bg-green-100 dark:hover:bg-green-900/30',
      border: 'border-green-200 dark:border-green-700',
      text: 'text-green-800 dark:text-green-200',
    },
    biologia: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      hover: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/30',
      border: 'border-emerald-200 dark:border-emerald-700',
      text: 'text-emerald-800 dark:text-emerald-200',
    },
    geografia: {
      bg: 'bg-cyan-50 dark:bg-cyan-900/20',
      hover: 'hover:bg-cyan-100 dark:hover:bg-cyan-900/30',
      border: 'border-cyan-200 dark:border-cyan-700',
      text: 'text-cyan-800 dark:text-cyan-200',
    },
    polski: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      hover: 'hover:bg-red-100 dark:hover:bg-red-900/30',
      border: 'border-red-200 dark:border-red-700',
      text: 'text-red-800 dark:text-red-200',
    },
    // Default colors for other subjects
    default: {
      bg: 'bg-gray-50 dark:bg-gray-800',
      hover: 'hover:bg-gray-100 dark:hover:bg-gray-700',
      border: 'border-gray-200 dark:border-gray-700',
      text: 'text-gray-800 dark:text-gray-200',
    }
  };

  // Sort by subject
  const sorted = [...filteredLessons].sort((a, b) => a.subject.localeCompare(b.subject))

  return (
    <div className="space-y-3 bg-white dark:bg-gray-900">
      {sorted.map((lesson) => {
        const colors = subjectColors[lesson.subject.toLowerCase()] || subjectColors.default;
        return (
          <Link
            key={lesson.id}
            href={`/lesson/${lesson.id}`}
            className={`block p-4 rounded border ${colors.bg} ${colors.hover} ${colors.border} focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`font-semibold text-lg ${colors.text}`}>
                  {lesson.title || lesson.subject}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Language: {lesson.language.toUpperCase()}
                </p>
              </div>
              <div className={colors.text}>→</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}