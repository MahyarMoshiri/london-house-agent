import { ensureSupabaseClient, isSupabaseConfigured } from './supabaseClient'
import { canonicalizeLocationValue } from '@/constants/locations'

const SUPABASE_PROPERTIES_TABLE = import.meta.env.VITE_SUPABASE_PROPERTIES_TABLE || 'properties'
const SUPABASE_ALBUMS_TABLE = 'albums'

export const normalizeAlbum = (record) => {
  if (!record) return null

  return {
    id: record.id ?? '',
    name: record.name ?? '',
    slug: record.slug ?? '',
    displayOrder: typeof record.display_order === 'number'
      ? record.display_order
      : Number(record.display_order) || 0,
    createdAt: record.created_at ?? record.createdAt ?? null,
    updatedAt: record.updated_at ?? record.updatedAt ?? null,
    isHidden: Boolean(record.is_hidden) || false,
  }
}

export const isSupabaseDataConfigured = isSupabaseConfigured

const normalizeProperty = (record) => {
  if (!record) return null

  const albumRecord = record.album ?? record.albums ?? null
  const normalizedAlbum = normalizeAlbum(albumRecord)

  return {
    id: record.id?.toString() ?? '',
    title: record.title ?? '',
    description: record.description ?? '',
    price: typeof record.price === 'number' ? record.price : Number(record.price) || 0,
    address: record.address ?? '',
    bedrooms: typeof record.bedrooms === 'number' ? record.bedrooms : Number(record.bedrooms) || 0,
    bathrooms: typeof record.bathrooms === 'number' ? record.bathrooms : Number(record.bathrooms) || 0,
    availability: record.availability ?? '',
    location: canonicalizeLocationValue(record.location) || '',
    images: Array.isArray(record.images) ? record.images : [],
    features: Array.isArray(record.features) ? record.features : [],
    createdAt: record.created_at ?? record.createdAt ?? null,
    updatedAt: record.updated_at ?? record.updatedAt ?? null,
    albumId: record.album_id ?? normalizedAlbum?.id ?? null,
    album: normalizedAlbum,
    isHidden: Boolean(record.is_hidden) || false,
  }
}

const mapToDatabase = (property) => {
  const payload = {}

  if ('title' in property) payload.title = property.title ?? ''
  if ('description' in property) payload.description = property.description ?? ''
  if ('price' in property) payload.price = typeof property.price === 'number' ? property.price : Number(property.price) || 0
  if ('address' in property) payload.address = property.address ?? ''
  if ('bedrooms' in property) payload.bedrooms = typeof property.bedrooms === 'number' ? property.bedrooms : Number(property.bedrooms) || 0
  if ('bathrooms' in property) payload.bathrooms = typeof property.bathrooms === 'number' ? property.bathrooms : Number(property.bathrooms) || 0
  if ('availability' in property) payload.availability = property.availability ?? ''
  if ('location' in property) {
    const locationValue = canonicalizeLocationValue(property.location)
    payload.location = locationValue || null
  }
  if ('images' in property) payload.images = property.images ?? []
  if ('features' in property) payload.features = property.features ?? []
  if ('albumId' in property || ('album' in property && property.album)) {
    payload.album_id = property.albumId ?? property.album?.id ?? null
  }
  if ('isHidden' in property) payload.is_hidden = property.isHidden ?? false

  return payload
}

export async function fetchProperties() {
  if (!isSupabaseDataConfigured) {
    return []
  }

  const supabase = ensureSupabaseClient()
  const { data, error } = await supabase
    .from(SUPABASE_PROPERTIES_TABLE)
    .select(`
      *,
      album:albums (
        id,
        name,
        slug,
        display_order,
        created_at,
        updated_at
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []).map(normalizeProperty)
}

export async function fetchAlbums() {
  if (!isSupabaseDataConfigured) {
    return []
  }

  const supabase = ensureSupabaseClient()
  const { data, error } = await supabase
    .from(SUPABASE_ALBUMS_TABLE)
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []).map(normalizeAlbum)
}

const mapAlbumToDatabase = (album) => {
  const payload = {}

  if ('name' in album) payload.name = album.name ?? ''
  if ('slug' in album) payload.slug = album.slug ?? ''
  if ('displayOrder' in album) {
    const order = album.displayOrder
    payload.display_order = typeof order === 'number' ? order : Number(order) || 0
  }
  if ('isHidden' in album) payload.is_hidden = album.isHidden ?? false

  return payload
}

export async function createAlbum(album) {
  const supabase = ensureSupabaseClient()
  const payload = mapAlbumToDatabase(album)
  const { data, error } = await supabase
    .from(SUPABASE_ALBUMS_TABLE)
    .insert(payload)
    .select()
    .single()

  if (error) {
    throw error
  }

  return normalizeAlbum(data)
}

export async function updateAlbum(id, album) {
  const supabase = ensureSupabaseClient()
  const payload = mapAlbumToDatabase(album)
  const { data, error } = await supabase
    .from(SUPABASE_ALBUMS_TABLE)
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return normalizeAlbum(data)
}

export async function removeAlbum(id) {
  const supabase = ensureSupabaseClient()
  const { error } = await supabase
    .from(SUPABASE_ALBUMS_TABLE)
    .delete()
    .eq('id', id)

  if (error) {
    throw error
  }
}

export async function createProperty(property) {
  const supabase = ensureSupabaseClient()
  const payload = mapToDatabase(property)
  const { data, error } = await supabase
    .from(SUPABASE_PROPERTIES_TABLE)
    .insert(payload)
    .select(`
      *,
      album:albums (
        id,
        name,
        slug,
        display_order,
        created_at,
        updated_at
      )
    `)
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
    .select(`
      *,
      album:albums (
        id,
        name,
        slug,
        display_order,
        created_at,
        updated_at
      )
    `)
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

export const propertiesGroupedByAlbum = (properties = []) => {
  return properties.reduce((acc, property) => {
    const albumId = property?.album?.id || property?.albumId
    if (!albumId) return acc

    if (!acc[albumId]) {
      acc[albumId] = []
    }

    acc[albumId].push(property)
    return acc
  }, {})
}

export const albumsWithProperties = (albums = [], properties = []) => {
  if (!Array.isArray(albums) || !Array.isArray(properties)) {
    return []
  }

  const grouped = propertiesGroupedByAlbum(properties)

  return albums.map(album => ({
    album,
    properties: grouped[album.id] ?? [],
  }))
}

export const getUngroupedProperties = (properties = []) => {
  if (!Array.isArray(properties)) {
    return []
  }

  return properties.filter(property => {
    const albumId = property?.album?.id || property?.albumId
    return !albumId
  })
}
