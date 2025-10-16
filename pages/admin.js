import { useState } from 'react'
import { useRouter } from 'next/router'

export default function AdminUploadPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    date: '',
    subject: '',
    language: '',
    title: '',
    adminKey: '',
  })
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState(null)

  // Handle form field changes
  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Handle file selection via input
  function handleFileSelect(e) {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type === 'text/html') {
      setFile(selectedFile)
      setMessage(null)
    } else {
      setMessage({ type: 'error', text: 'Please select an HTML file' })
    }
  }

  // Drag and drop handlers
  function handleDragOver(e) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === 'text/html') {
      setFile(droppedFile)
      setMessage(null)
    } else {
      setMessage({ type: 'error', text: 'Please drop an HTML file' })
    }
  }

  // Handle form submission
  async function handleSubmit(e) {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.date || !formData.subject || !formData.language || !formData.adminKey || !file) {
      setMessage({ type: 'error', text: 'Please fill all required fields and select a file' })
      return
    }

    setUploading(true)
    setMessage(null)

    try {
      // Create FormData object to send multipart/form-data
      const uploadData = new FormData()
      uploadData.append('file', file)
      uploadData.append('date', formData.date)
      uploadData.append('subject', formData.subject)
      uploadData.append('language', formData.language)
      if (formData.title) {
        uploadData.append('title', formData.title)
      }

      // Send request to our upload API with admin key in header
      const response = await fetch('/api/admin/upload-lesson', {
        method: 'POST',
        headers: {
          'x-admin-key': formData.adminKey,
        },
        body: uploadData,
      })

      const result = await response.json()

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `Lesson uploaded successfully! ID: ${result.lesson.id}` 
        })
        // Reset form
        setFormData({
          date: '',
          subject: '',
          language: '',
          title: '',
          adminKey: formData.adminKey, // Keep admin key for convenience
        })
        setFile(null)
      } else {
        setMessage({ 
          type: 'error', 
          text: `Upload failed: ${result.error}` 
        })
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `Upload error: ${error.message}` 
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with back button */}
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center">
        <button
          onClick={() => router.push('/')}
          className="text-blue-600 dark:text-blue-400 mr-4"
          aria-label="Back to calendar"
        >
          ← Back
        </button>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Admin: Upload Lesson</h1>
      </header>

      <main className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Admin Key Field */}
          <div>
            <label htmlFor="adminKey" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Admin API Key *
            </label>
            <input
              type="password"
              id="adminKey"
              name="adminKey"
              value={formData.adminKey}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              placeholder="Enter your admin API key"
              required
            />
          </div>

          {/* Date Field */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Lesson Date *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
          </div>

          {/* Subject Field */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Subject *
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              placeholder="e.g., historia, matematyka"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Lowercase, used in storage path</p>
          </div>

          {/* Language Field */}
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Language *
            </label>
            <select
              id="language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            >
              <option value="">Select language</option>
              <option value="en">English (en)</option>
              <option value="pl">Polish (pl)</option>
              <option value="fr">French (fr)</option>
            </select>
          </div>

          {/* Title Field (Optional) */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Lesson Title (Optional)
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              placeholder="e.g., World War II Overview"
            />
          </div>

          {/* Drag and Drop File Upload Zone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Lesson HTML File *
            </label>
            
            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              {file ? (
                <div className="space-y-2">
                  <div className="text-green-600 dark:text-green-400 text-4xl">✓</div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{file.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-gray-400 text-4xl">📄</div>
                  <p className="text-gray-700">
                    Drag and drop your HTML file here
                  </p>
                  <p className="text-sm text-gray-500">or</p>
                  <label className="inline-block px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600">
                    Browse Files
                    <input
                      type="file"
                      accept=".html"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div
              className={`p-4 rounded ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading}
            className={`w-full py-3 rounded font-semibold transition-colors ${
              uploading
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {uploading ? 'Uploading...' : 'Upload Lesson'}
          </button>
        </form>

        {/* Helper Info */}
        <div className="mt-8 p-4 bg-blue-50 rounded border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• File will be stored at: lessons/{`{subject}`}/{`{date}`}/{`{language}`}.html</li>
            <li>• Make sure your HTML file is complete and self-contained</li>
            <li>• The lesson will appear in the calendar on the specified date</li>
            <li>• Uploading the same subject/date/language will overwrite the existing lesson</li>
          </ul>
        </div>
      </main>
    </div>
  )
}