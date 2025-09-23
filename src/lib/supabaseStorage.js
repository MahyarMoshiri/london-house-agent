const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const SUPABASE_STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET

const missingConfig = []
if (!SUPABASE_URL) missingConfig.push('VITE_SUPABASE_URL')
if (!SUPABASE_ANON_KEY) missingConfig.push('VITE_SUPABASE_ANON_KEY')
if (!SUPABASE_STORAGE_BUCKET) missingConfig.push('VITE_SUPABASE_STORAGE_BUCKET')

export const isSupabaseConfigured = missingConfig.length === 0

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.warn(
    'Supabase storage is not fully configured. Missing env vars:',
    missingConfig.join(', ')
  )
}

const ensureConfigured = () => {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Please set VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and VITE_SUPABASE_STORAGE_BUCKET.'
    )
  }
}

const buildPublicUrl = (path) => {
  return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_STORAGE_BUCKET}/${path}`
}

const makeObjectPath = (file) => {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const timestamp = Date.now()
  const randomSegment = Math.random().toString(36).slice(2, 10)
  return `properties/${timestamp}-${randomSegment}.${extension}`
}

export async function uploadPropertyImages(files) {
  ensureConfigured()

  const uploads = files.map(async (file) => {
    const objectPath = makeObjectPath(file)
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${SUPABASE_STORAGE_BUCKET}/${objectPath}`

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY
      },
      body: file
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `Upload failed for ${file.name || 'file'}: ${response.status} ${errorText}`
      )
    }

    return buildPublicUrl(objectPath)
  })

  return Promise.all(uploads)
}
