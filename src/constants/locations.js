export const PROPERTY_LOCATIONS = [
  { value: 'N', label: 'North', slug: 'north' },
  { value: 'NE', label: 'Northeast', slug: 'northeast' },
  { value: 'E', label: 'East', slug: 'east' },
  { value: 'SE', label: 'Southeast', slug: 'southeast' },
  { value: 'S', label: 'South', slug: 'south' },
  { value: 'SW', label: 'Southwest', slug: 'southwest' },
  { value: 'W', label: 'West', slug: 'west' },
  { value: 'NW', label: 'Northwest', slug: 'northwest' },
]

export const PROPERTY_LOCATION_VALUES = PROPERTY_LOCATIONS.map((location) => location.value)

const normalizeInput = (input) => {
  if (typeof input !== 'string') {
    return ''
  }

  return input.trim()
}

const toLookupKey = (input) => normalizeInput(input).toUpperCase()

const slugLookup = PROPERTY_LOCATIONS.reduce((acc, location) => {
  acc[location.slug] = location
  return acc
}, {})

const valueLookup = PROPERTY_LOCATIONS.reduce((acc, location) => {
  const key = toLookupKey(location.value)
  acc[key] = location
  acc[toLookupKey(location.label)] = location
  acc[toLookupKey(location.slug)] = location
  return acc
}, {})

export const findLocationByValue = (value) => {
  if (!value) {
    return undefined
  }

  return valueLookup[toLookupKey(value)]
}

export const findLocationBySlug = (slug) => {
  if (!slug) {
    return undefined
  }

  return slugLookup[normalizeInput(slug).toLowerCase()]
}

export const getLocationDisplayName = (value) => {
  const location = findLocationByValue(value)
  if (!location) {
    return ''
  }

  return `${location.label} (${location.value})`
}

export const canonicalizeLocationValue = (value) => {
  const location = findLocationByValue(value)
  return location?.value ?? ''
}

export const isValidLocationValue = (value) => {
  return Boolean(findLocationByValue(value))
}
