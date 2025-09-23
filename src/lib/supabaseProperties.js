import { ensureSupabaseClient, isSupabaseConfigured } from './supabaseClient'

const SUPABASE_PROPERTIES_TABLE = import.meta.env.VITE_SUPABASE_PROPERTIES_TABLE || 'properties'

export const isSupabaseDataConfigured = isSupabaseConfigured

const normalizeProperty = (record) => {
  if (!record) return null

  return {
    id: record.id?.toString() ?? '',
    title: record.title ?? '',
    description: record.description ?? '',
    price: typeof record.price === 'number' ? record.price : Number(record.price) || 0,
    address: record.address ?? '',
    bedrooms: typeof record.bedrooms === 'number' ? record.bedrooms : Number(record.bedrooms) || 0,
    bathrooms: typeof record.bathrooms === 'number' ? record.bathrooms : Number(record.bathrooms) || 0,
    availability: record.availability ?? '',
    images: Array.isArray(record.images) ? record.images : [],
    features: Array.isArray(record.features) ? record.features : [],
    createdAt: record.created_at ?? record.createdAt ?? null,
    updatedAt: record.updated_at ?? record.updatedAt ?? null,
  }
}

const mapToDatabase = (property) => ({
  title: property.title ?? '',
  description: property.description ?? '',
  price: property.price ?? 0,
  address: property.address ?? '',
  bedrooms: property.bedrooms ?? 0,
  bathrooms: property.bathrooms ?? 0,
  availability: property.availability ?? '',
  images: property.images ?? [],
  features: property.features ?? [],
})

export async function fetchProperties() {
  if (!isSupabaseDataConfigured) {
    return []
  }

  const supabase = ensureSupabaseClient()
  const { data, error } = await supabase
    .from(SUPABASE_PROPERTIES_TABLE)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []).map(normalizeProperty)
}

export async function createProperty(property) {
  const supabase = ensureSupabaseClient()
  const payload = mapToDatabase(property)
  const { data, error } = await supabase
    .from(SUPABASE_PROPERTIES_TABLE)
    .insert(payload)
    .select()
    .single()

  if (error) {
    throw error
  }

  return normalizeProperty(data)
}

export async function updatePropertyRecord(id, property) {
  const supabase = ensureSupabaseClient()
  const payload = mapToDatabase(property)
  const { data, error } = await supabase
    .from(SUPABASE_PROPERTIES_TABLE)
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return normalizeProperty(data)
}

export async function removeProperty(id) {
  const supabase = ensureSupabaseClient()
  const { error } = await supabase
    .from(SUPABASE_PROPERTIES_TABLE)
    .delete()
    .eq('id', id)

  if (error) {
    throw error
  }
}
