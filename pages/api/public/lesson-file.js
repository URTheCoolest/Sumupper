export default async function handler(req, res) {
  const { path } = req.query

  if (!path) {
    return res.status(400).send('Missing path')
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!supabaseUrl) {
    return res.status(500).send('Server misconfigured: missing SUPABASE URL')
  }

  const fileUrl = `${supabaseUrl}/storage/v1/object/public/lessons/${path}`

  try {
    const r = await fetch(fileUrl)

    if (!r.ok) {
      return res.status(r.status).send(`Failed to fetch file: ${r.statusText}`)
    }

    // Always force text/html for HTML files
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    
    // Allow everything needed for the lesson content
    res.setHeader('Content-Security-Policy', "default-src *; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'")
    
    // Get the text content
    let text = await r.text()
    
    // Remove the dark mode toggle button
    text = text.replace(/<button[^>]*class="dark-toggle"[^>]*>.*?<\/button>/i, '')
    
    // Inject our dark mode sync script before the closing body tag
    const darkModeSync = `
    <script>
      // Listen for dark mode messages from parent
      window.addEventListener('message', function(e) {
        if (e.data && typeof e.data === 'object' && 'darkMode' in e.data) {
          document.body.classList.toggle('dark-mode', e.data.darkMode);
        }
      });
      
      // Tell parent we're ready for dark mode sync
      window.parent.postMessage({ type: 'LESSON_LOADED' }, '*');
    </script>
    `
    
    text = text.replace('</body>', darkModeSync + '</body>')
    res.status(200).send(text)
  } catch (err) {
    console.error('Error proxying lesson file:', err)
    res.status(500).send('Error fetching lesson file')
  }
}
