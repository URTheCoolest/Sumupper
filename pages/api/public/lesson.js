// Public API: fetch a single lesson with related assets
import { supabase } from '../../../lib/supabaseClient'

export default async function handler(req, res) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ error: 'Missing lesson id' })
  }

  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', id)
    .single()

  if (lessonError) {
    return res.status(500).json({ error: lessonError.message })
  }

  const { data: assets, error: assetsError } = await supabase
    .from('lesson_assets')
    .select('*')
    .eq('lesson_key', lesson.lesson_key)
    .order('created_at', { ascending: true })

  if (assetsError) {
    console.error('Error fetching assets:', assetsError)
  }

  res.status(200).json({ ...lesson, assets: assets || [] })
}