import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function LessonIframeFooter({ lessonKey }) {
  const [assets, setAssets] = useState([])

  useEffect(() => {
    fetchAssets()
  }, [lessonKey])

  async function fetchAssets() {
    const { data, error } = await supabase
      .from('lesson_assets')
      .select('*')
      .eq('lesson_key', lessonKey)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching assets:', error)
    } else {
      setAssets(data || [])
    }
  }

  if (assets.length === 0) return null

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  return (
    <footer className="bg-gray-100 p-3 border-t flex gap-2 overflow-x-auto">
      {assets.map((asset) => {
        const url = `${supabaseUrl}/storage/v1/object/public/lessons/${asset.path}`
        return (
          <a
            key={asset.id}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm whitespace-nowrap hover:bg-blue-600"
          >
            {asset.type.toUpperCase()}
          </a>
        )
      })}
    </footer>
  )
}