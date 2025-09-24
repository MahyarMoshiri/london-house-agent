import { ensureSupabaseClient, isSupabaseConfigured } from './supabaseClient'

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
    images: Array.isArray(record.images) ? record.images : [],
    features: Array.isArray(record.features) ? record.features : [],
    createdAt: record.created_at ?? record.createdAt ?? null,
    updatedAt: record.updated_at ?? record.updatedAt ?? null,
    albumId: record.album_id ?? normalizedAlbum?.id ?? null,
    album: normalizedAlbum,
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
  album_id: property.albumId ?? property.album?.id ?? null,
})

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

const mapAlbumToDatabase = (album) => ({
  name: album.name ?? '',
  slug: album.slug ?? '',
  display_order: typeof album.displayOrder === 'number'
    ? album.displayOrder
    : Number(album.displayOrder) || 0,
})

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
