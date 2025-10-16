// Admin API: upload lesson file and create lesson row
// SECURITY: Uses SUPABASE_SERVICE_ROLE_KEY (server-only) and requires ADMIN_API_KEY header
import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import Busboy from 'busboy'

export const config = {
  api: {
    bodyParser: false, // Disable body parsing for multipart/form-data
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Check admin key
  const adminKey = req.headers['x-admin-key']
  if (adminKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Wrap everything in a Promise to ensure proper async handling
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers })
    let fileBuffer = null
    let fileName = null
    let mimeType = null
    const fields = {}

    busboy.on('file', (fieldname, file, info) => {
      const { filename, mimeType: mime } = info
      fileName = filename
      mimeType = mime
      const chunks = []
      file.on('data', (data) => chunks.push(data))
      file.on('end', () => {
        fileBuffer = Buffer.concat(chunks)
      })
    })

    busboy.on('field', (fieldname, val) => {
      fields[fieldname] = val
    })

    busboy.on('finish', async () => {
      try {
        // Extract fields: date, subject, language, title (optional)
        const { date, subject, language, title } = fields

        if (!date || !subject || !language || !fileBuffer) {
          res.status(400).json({ 
            error: 'Missing required fields or file',
            received: { date, subject, language, hasFile: !!fileBuffer }
          })
          return resolve()
        }

        // Build storage path: lessons/{subject}/{yyyy-mm-dd}/{language}.html
        const storagePath = `${subject}/${date}/${language}.html`
        const lessonKey = `${subject}_${date}`

        // Upload file to Supabase storage
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from('lessons')
          .upload(storagePath, fileBuffer, {
            contentType: 'text/html; charset=utf-8',
            upsert: true, // Overwrite if exists
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          res.status(500).json({ error: uploadError.message })
          return resolve()
        }

        // Insert lesson row
        const { data: lesson, error: insertError } = await supabaseAdmin
          .from('lessons')
          .insert({
            date,
            subject: subject.toLowerCase(),
            language,
            html_path: storagePath,
            lesson_key: lessonKey,
            title: title || null,
            created_by: 'admin',
          })
          .select()
          .single()

        if (insertError) {
          console.error('Insert error:', insertError)
          res.status(500).json({ error: insertError.message })
          return resolve()
        }

        res.status(200).json({ lesson })
        resolve()
      } catch (err) {
        console.error('Unexpected error:', err)
        res.status(500).json({ error: err.message })
        resolve()
      }
    })

    busboy.on('error', (error) => {
      console.error('Busboy error:', error)
      res.status(500).json({ error: error.message })
      resolve()
    })

    req.pipe(busboy)
  })
}