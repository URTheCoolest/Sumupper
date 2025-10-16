import { useRouter } from 'next/router'
import { useEffect, useState, useRef } from 'react'
import useSWR from 'swr'
import LessonIframeFooter from '../../components/LessonIframeFooter'
import { useLanguage } from '../../context/LanguageContext'

const fetcher = (url) => fetch(url).then((r) => r.json())

export default function LessonPage() {
  const router = useRouter()
  const { id } = router.query
  const iframeRef = useRef(null)

  // Listen for messages from the iframe
  useEffect(() => {
    function handleMessage(e) {
      if (e.data?.type === 'LESSON_LOADED' && iframeRef.current) {
        // Initial dark mode sync when iframe loads
        const isDark = document.documentElement.classList.contains('dark')
        iframeRef.current.contentWindow.postMessage({ darkMode: isDark }, '*')
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Watch for dark mode changes and notify iframe
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class' && iframeRef.current) {
          const isDark = document.documentElement.classList.contains('dark')
          iframeRef.current.contentWindow.postMessage({ darkMode: isDark }, '*')
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  // Subject color mapping
  const subjectColors = {
    historia: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-700',
      text: 'text-amber-800 dark:text-amber-200',
    },
    matematyka: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-700',
      text: 'text-blue-800 dark:text-blue-200',
    },
    fizyka: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-700',
      text: 'text-purple-800 dark:text-purple-200',
    },
    chemia: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-700',
      text: 'text-green-800 dark:text-green-200',
    },
    biologia: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-200 dark:border-emerald-700',
      text: 'text-emerald-800 dark:text-emerald-200',
    },
    geografia: {
      bg: 'bg-cyan-50 dark:bg-cyan-900/20',
      border: 'border-cyan-200 dark:border-cyan-700',
      text: 'text-cyan-800 dark:text-cyan-200',
    },
    polski: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-700',
      text: 'text-red-800 dark:text-red-200',
    },
    default: {
      bg: 'bg-gray-50 dark:bg-gray-800',
      border: 'border-gray-200 dark:border-gray-700',
      text: 'text-gray-800 dark:text-gray-200',
    }
  };

  const { data: lesson, error } = useSWR(
    id ? `/api/public/lesson?id=${id}` : null,
    fetcher
  )

  const { t } = useLanguage();

  if (error) return <div className="p-4">{t('failedToLoad')}</div>
  if (!lesson) return <div className="p-4">{t('loading')}</div>

  // Construct proxy URL for the HTML to avoid CSP headers from the storage service
  // The API will fetch the file from Supabase storage and strip restrictive headers
  const publicUrl = `/api/public/lesson-file?path=${encodeURIComponent(lesson.html_path)}`
  const colors = subjectColors[lesson.subject.toLowerCase()] || subjectColors.default;

  return (
    <div className="flex flex-col h-screen">
      <header className={`p-3 flex items-center shadow-sm border-b ${colors.bg} ${colors.border}`}>
        <button
          onClick={() => router.back()}
          className={`mr-3 hover:opacity-80 transition-colors ${colors.text}`}
          aria-label="Go back"
        >
          ← Back
        </button>
        <h1 className={`text-md font-semibold truncate ${colors.text}`}>
          {lesson.title || lesson.subject}
        </h1>
      </header>
      <iframe
        ref={iframeRef}
        src={publicUrl}
        className="flex-1 w-full border-0"
        sandbox="allow-scripts allow-forms allow-popups allow-modals"
        title={`Lesson: ${lesson.title || lesson.subject}`}
      />
      <LessonIframeFooter lessonKey={lesson.lesson_key} />
    </div>
  )
}