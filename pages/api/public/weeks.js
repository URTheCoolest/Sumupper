// Public API: fetch lessons for a week starting from `start` date
import { supabase } from '../../../lib/supabaseClient'

export default async function handler(req, res) {
  const { start } = req.query

  if (!start) {
    return res.status(400).json({ error: 'Missing start date' })
  }

  // Calculate end date (6 days later)
  const startDate = new Date(start)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 6)
  const endStr = endDate.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .gte('date', start)
    .lte('date', endStr)
    .order('date', { ascending: true })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json(data)
}
