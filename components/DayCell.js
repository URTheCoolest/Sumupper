// Subject color mapping
const subjectColors = {
  historia: {
    bg: 'bg-amber-500 dark:bg-amber-600',
    hover: 'hover:bg-amber-600 dark:hover:bg-amber-700',
    border: 'border-amber-500 dark:border-amber-400',
    text: 'text-amber-600 dark:text-amber-400',
  },
  matematyka: {
    bg: 'bg-blue-500 dark:bg-blue-600',
    hover: 'hover:bg-blue-600 dark:hover:bg-blue-700',
    border: 'border-blue-500 dark:border-blue-400',
    text: 'text-blue-600 dark:text-blue-400',
  },
  fizyka: {
    bg: 'bg-purple-500 dark:bg-purple-600',
    hover: 'hover:bg-purple-600 dark:hover:bg-purple-700',
    border: 'border-purple-500 dark:border-purple-400',
    text: 'text-purple-600 dark:text-purple-400',
  },
  chemia: {
    bg: 'bg-green-500 dark:bg-green-600',
    hover: 'hover:bg-green-600 dark:hover:bg-green-700',
    border: 'border-green-500 dark:border-green-400',
    text: 'text-green-600 dark:text-green-400',
  },
  biologia: {
    bg: 'bg-emerald-500 dark:bg-emerald-600',
    hover: 'hover:bg-emerald-600 dark:hover:bg-emerald-700',
    border: 'border-emerald-500 dark:border-emerald-400',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  geografia: {
    bg: 'bg-cyan-500 dark:bg-cyan-600',
    hover: 'hover:bg-cyan-600 dark:hover:bg-cyan-700',
    border: 'border-cyan-500 dark:border-cyan-400',
    text: 'text-cyan-600 dark:text-cyan-400',
  },
  polski: {
    bg: 'bg-red-500 dark:bg-red-600',
    hover: 'hover:bg-red-600 dark:hover:bg-red-700',
    border: 'border-red-500 dark:border-red-400',
    text: 'text-red-600 dark:text-red-400',
  }
}

import { useLanguage } from '../context/LanguageContext';
import { useState } from 'react';

export default function DayCell({ date, lessons = [], onClick }) {
  const dayNum = date.getDate()
  const { selectedLanguage, t } = useLanguage()
  const weekday = t('weekdays')[date.getDay()]
  const [expandedLesson, setExpandedLesson] = useState(null)
  
  // Filter lessons based on selected language
  const filteredLessons = lessons.filter(lesson => {
    return lesson.language && lesson.language.toLowerCase() === selectedLanguage;
  });

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded shadow overflow-hidden">
      <div
        onClick={onClick}
        className="flex flex-col h-full hover:bg-gray-100/50 dark:hover:bg-gray-700/50 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        aria-label={`${weekday}, ${date.toLocaleDateString()}, ${lessons.length} lessons`}
      >
        {/* Desktop View */}
        <div className="md:flex md:flex-col md:items-center p-4 hidden border-b border-gray-100 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{weekday}</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{dayNum}</div>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            {filteredLessons.length} {filteredLessons.length === 1 ? t('lesson') : t('lessons')}
          </div>
        </div>
        <div className="flex-1 p-3 space-y-2 md:block hidden">
          {filteredLessons.length > 0 ? (
            filteredLessons.map((lesson) => (
              <div
                key={lesson.id}
                className={`group relative transition-all duration-200 hover:scale-[1.02] border-2 bg-white dark:bg-gray-800 rounded-xl hover:shadow-md ${
                  lesson.subject && subjectColors[lesson.subject.toLowerCase()]
                    ? `${subjectColors[lesson.subject.toLowerCase()].border} ${subjectColors[lesson.subject.toLowerCase()].text}`
                    : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="absolute inset-0 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
                <div className="relative py-2.5 px-3 flex items-center gap-3">
                  {lesson.subject && (
                    <div className="text-sm font-semibold shrink-0">
                      {lesson.subject}
                    </div>
                  )}
                  <div className="text-sm truncate">
                    {lesson.title}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-gray-400 dark:text-gray-500 text-sm text-center">
                <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {t('noLessonsScheduled')}
              </div>
            </div>
          )}
        </div>

        {/* Mobile View */}
        <div className={`md:hidden flex p-2 ${filteredLessons.length > 0 ? 'min-h-[80px]' : 'min-h-[60px]'}`}>
          <div className="flex flex-col justify-center min-w-[45px] pl-1">
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{weekday}</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{dayNum}</div>
          </div>
          <div className="flex-1 flex flex-col gap-2 pl-2 pr-2 overflow-hidden">
            {filteredLessons.length > 0 ? (
              filteredLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id);
                  }}
                  className={`group flex items-start gap-2 p-2 rounded-lg transition-all duration-200 w-full min-w-0 text-left lesson-button ${
                    lesson.subject && subjectColors[lesson.subject.toLowerCase()]
                      ? `${subjectColors[lesson.subject.toLowerCase()].border} border-2 bg-white dark:bg-gray-800 ${subjectColors[lesson.subject.toLowerCase()].text}`
                      : 'border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {/* Subject Circle */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                    lesson.subject && subjectColors[lesson.subject.toLowerCase()]
                      ? subjectColors[lesson.subject.toLowerCase()].bg
                      : 'bg-gray-400 dark:bg-gray-600'
                  }`}>
                    {lesson.subject ? lesson.subject.charAt(0).toUpperCase() : '?'}
                  </div>
                  {/* Lesson Title */}
                  <div className="flex flex-1 min-w-0 max-w-full">
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium break-words ${expandedLesson === lesson.id ? 'whitespace-normal' : 'truncate'}`}>
                        {lesson.title}
                      </div>
                      {lesson.subject && (
                        <div className="text-xs opacity-75 truncate">
                          {lesson.subject}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onClick(e);
                      }}
                      className={`md:hidden ml-2 p-1 rounded-full opacity-60 hover:opacity-100 ${
                        lesson.subject && subjectColors[lesson.subject.toLowerCase()]
                          ? subjectColors[lesson.subject.toLowerCase()].text
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                      aria-label="Open lesson"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
                No lessons
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}