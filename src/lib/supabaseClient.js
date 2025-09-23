import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const missingConfig = []
if (!SUPABASE_URL) missingConfig.push('VITE_SUPABASE_URL')
if (!SUPABASE_ANON_KEY) missingConfig.push('VITE_SUPABASE_ANON_KEY')

export const isSupabaseConfigured = missingConfig.length === 0

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.warn(
    'Supabase client is not fully configured. Missing env vars:',
    missingConfig.join(', ')
  )
}

export const supabaseClient = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
      },
    })
  : null

export const ensureSupabaseClient = () => {
  if (!supabaseClient) {
    throw new Error(
      'Supabase client is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    )
  }

  return supabaseClient
}
