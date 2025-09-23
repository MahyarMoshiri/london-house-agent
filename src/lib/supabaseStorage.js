import { ensureSupabaseClient, isSupabaseConfigured as isSupabaseClientConfigured } from './supabaseClient'

const SUPABASE_STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET

const missingConfig = []
if (!isSupabaseClientConfigured) missingConfig.push('VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY')
if (!SUPABASE_STORAGE_BUCKET) missingConfig.push('VITE_SUPABASE_STORAGE_BUCKET')

export const isSupabaseConfigured = isSupabaseClientConfigured && Boolean(SUPABASE_STORAGE_BUCKET)

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.warn(
    'Supabase storage is not fully configured. Missing env vars:',
    missingConfig.join(', ')
  )
}

const ensureConfigured = () => {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase storage is not configured. Please set VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and VITE_SUPABASE_STORAGE_BUCKET.'
    )
  }

  return ensureSupabaseClient()
}

const makeObjectPath = (file) => {
  const extension = file.name?.split('.')?.pop()?.toLowerCase() || 'jpg'
  const timestamp = Date.now()
  const randomSegment = Math.random().toString(36).slice(2, 10)
  return `properties/${timestamp}-${randomSegment}.${extension}`
}

export async function uploadPropertyImages(files) {
  const supabase = ensureConfigured()
  const bucket = supabase.storage.from(SUPABASE_STORAGE_BUCKET)

  const uploads = files.map(async (file) => {
    const objectPath = makeObjectPath(file)
    const { error } = await bucket.upload(objectPath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'application/octet-stream',
    })

    if (error) {
      throw new Error(`Upload failed for ${file.name || 'file'}: ${error.message}`)
    }

    const { data } = bucket.getPublicUrl(objectPath)
    return data.publicUrl
  })

  return Promise.all(uploads)
}
