// Seed properties into Supabase using the app's normal columns
// Uses values from .env: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_SUPABASE_PROPERTIES_TABLE

import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'
import path from 'node:path'

function loadDotEnv() {
  const envPath = path.resolve(process.cwd(), '.env')
  if (!fs.existsSync(envPath)) return
  const content = fs.readFileSync(envPath, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1)
    // Strip surrounding quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith('\'') && value.endsWith('\''))) {
      value = value.slice(1, -1)
    }
    if (key && !(key in process.env)) {
      process.env[key] = value
    }
  }
}

loadDotEnv()

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY
const SUPABASE_PROPERTIES_TABLE = process.env.VITE_SUPABASE_PROPERTIES_TABLE || 'properties'

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase credentials. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const payload = [
  {
    title: 'Spacious 2/3 Bed Flat in Willesden – DSS Considered',
    description: 'Large 2/3 bed flat in Willesden, suitable for families or sharers. Fully self-contained with living area, kitchen, bathroom, and flexible bedroom use.',
    price: 2300,
    address: 'Willesden, London',
    bedrooms: 3,
    bathrooms: 1,
    availability: 'Immediate',
    features: ['DSS considered', 'close to transport', 'family/sharer friendly'],
  },
  {
    title: 'Large Self-contained Studio Flat in Dollis Hill / Brent Cross',
    description: 'Bright and fully self-contained studio with private bathroom (shower, toilet, sink, mirror cabinet). Fully equipped kitchenette. Furnished with bed, wardrobe, desk, chairs, armchair. Wooden flooring, double glazing, good natural light.',
    price: 1436,
    address: 'Dollis Hill / Brent Cross, NW2',
    bedrooms: 0,
    bathrooms: 1,
    availability: 'Immediate',
    features: ['bills included except electricity', 'near Brent Cross West', 'double glazing', 'wooden flooring'],
  },
  {
    title: 'Self-contained/Garden Studio in Hounslow – DSS Considered',
    description: 'Compact studio with its own entrance and small garden access. Includes kitchenette and private shower/WC. Suitable for single person or couple.',
    price: 1000,
    address: 'Hounslow, London',
    bedrooms: 0,
    bathrooms: 1,
    availability: 'Immediate',
    features: ['DSS considered', 'private garden access', 'self-contained unit'],
  },
  {
    title: 'Self-contained Studio Flat in Catford, SE6 – DSS Welcome',
    description: 'Self-contained studio with private bathroom and kitchenette. Furnished, suitable for single person or couple.',
    price: 1300,
    address: 'Catford, SE6',
    bedrooms: 0,
    bathrooms: 1,
    availability: 'Immediate',
    features: ['DSS welcome', 'independent flat', 'fully self-contained'],
  },
  {
    title: 'Spacious 1-Bed Flat/Garden Access in Catford – DSS Welcome',
    description: 'Large one-bedroom flat with direct access to garden. Includes separate living area, fitted kitchen, and bathroom. Suitable for a couple or single tenant.',
    price: 1550,
    address: 'Catford, SE6',
    bedrooms: 1,
    bathrooms: 1,
    availability: 'Immediate',
    features: ['DSS welcome', 'private garden access', 'spacious layout'],
  },
  {
    title: 'Self-contained Studio Flat in Lambeth',
    description: 'Private studio with kitchenette and bathroom. Furnished, suitable for single person.',
    price: 1150,
    address: 'Lambeth, London',
    bedrooms: 0,
    bathrooms: 1,
    availability: 'Immediate',
    features: ['fully self-contained', 'furnished'],
  },
  {
    title: 'Self-contained Studio Flat at North Circular Road – DSS Considered',
    description: 'Independent studio with private bathroom and kitchenette, furnished, suitable for single tenant or couple.',
    price: 1436,
    address: 'North Circular Road, Neasden, London',
    bedrooms: 0,
    bathrooms: 1,
    availability: 'Immediate',
    features: ['DSS considered', 'self-contained', 'close to local transport'],
  },
  {
    title: '3–4 Bed House in Uxbridge – Sharers Welcome',
    description: 'Spacious terraced house offering 3–4 bedrooms, living room, kitchen, bathroom, and private garden. Suitable for families or sharers.',
    price: 2600,
    address: 'Uxbridge, London',
    bedrooms: 4,
    bathrooms: 1,
    availability: 'Immediate',
    features: ['sharers welcome', 'private garden', 'flexible layout'],
  },
  {
    title: 'Self-contained Studio Flat in Lambeth',
    description: 'Furnished studio with kitchenette and private bathroom. Suitable for single person.',
    price: 1150,
    address: 'Lambeth, London',
    bedrooms: 0,
    bathrooms: 1,
    availability: 'Immediate',
    features: ['fully self-contained', 'compact unit', 'furnished'],
  },
  {
    title: 'Self-contained Studio Flat in Feltham – 1st Floor – DSS Considered',
    description: 'First-floor studio with private bathroom and kitchenette. Suitable for single person or couple.',
    price: 1000,
    address: 'Feltham, London',
    bedrooms: 0,
    bathrooms: 1,
    availability: 'Immediate',
    features: ['DSS considered', 'first-floor unit', 'self-contained'],
  },
]

function isRecordValid(r) {
  const required = ['title', 'description', 'price', 'address', 'bedrooms', 'bathrooms', 'availability', 'features']
  for (const k of required) {
    if (!(k in r)) return false
    if (r[k] === null || r[k] === undefined) return false
    if (typeof r[k] === 'string' && r[k].trim() === '') return false
  }
  if (!Array.isArray(r.features)) return false
  return true
}

function onlyAllowedColumns(r) {
  return {
    title: r.title,
    description: r.description,
    price: Number(r.price),
    address: r.address,
    bedrooms: Number(r.bedrooms),
    bathrooms: Number(r.bathrooms),
    availability: r.availability,
    features: r.features,
  }
}

async function main() {
  let success = 0
  for (const rec of payload) {
    if (!isRecordValid(rec)) {
      console.warn('Skipping invalid record:', rec.title || '(no title)')
      continue
    }
    const row = onlyAllowedColumns(rec)
    try {
      const { data, error } = await supabase.from(SUPABASE_PROPERTIES_TABLE).insert(row).select('*').single()
      if (error) {
        console.error('Failed to insert:', row.title, error.message)
      } else {
        success++
        console.log('Inserted:', data.id, '-', row.title)
      }
    } catch (e) {
      console.error('Error inserting', row.title, e?.message || e)
    }
  }
  console.log(`Done. Inserted ${success}/${payload.length} records.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

