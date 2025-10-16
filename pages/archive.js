import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabaseClient';

export default function Archive() {
  const { t, selectedLanguage } = useLanguage();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch lessons when component mounts or language changes
  useEffect(() => {
    fetchLessons();
  }, [selectedLanguage]);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('lessons')
        .select('id, date, title, subject, language, lesson_key')
        .order('date', { ascending: false });

      if (error) throw error;

      // Filter lessons by the language field
      const languageFilteredData = data.filter(lesson => 
        lesson.language?.toLowerCase() === selectedLanguage
      );

      setLessons(languageFilteredData);

      // Get unique subjects from all lessons in current language
      const uniqueSubjects = [...new Set(languageFilteredData.map(lesson => lesson.subject))].filter(Boolean);
      setSubjects(uniqueSubjects);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter lessons based on selected subject and search query
  const filteredLessons = lessons.filter(lesson => {
    const matchesSubject = selectedSubject === 'all' || lesson.subject === selectedSubject;
    const matchesSearch = !searchQuery || lesson.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          {t('archive')}
        </h1>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <select
            className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="all">{t('allSubjects')}</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder={t('searchLessons')}
            className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">{t('loading')}</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredLessons.map(lesson => (
              <div
                key={lesson.id}
                className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow
                         bg-white dark:bg-gray-800 dark:border-gray-700 flex flex-col"
              >
                <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                  {new Date(lesson.date).toLocaleDateString()}
                </div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  {lesson.title}
                </h3>
                <div className="flex flex-col space-y-3 mt-auto">
                  {lesson.subject && (
                    <span className="inline-block px-2 py-1 text-sm rounded-full w-fit
                                 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {lesson.subject}
                    </span>
                  )}
                  <a
                    href={`/lesson/${lesson.id}`}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium
                             text-white bg-blue-600 rounded-md hover:bg-blue-700 
                             dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
                  >
                    {t('viewLesson')} →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredLessons.length === 0 && (
          <p className="text-gray-600 dark:text-gray-400">
            {t('noLessonsFound')}
          </p>
        )}
      </main>
    </div>
  );
}