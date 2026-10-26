import { Hono } from 'hono'
import type { HonoEnv } from '../env'
import { authMiddleware } from '../middleware/auth'

export const homesRoutes = new Hono<HonoEnv>()

interface PhotonFeature {
  properties?: Record<string, string | undefined> & { osm_type?: string; osm_id?: number }
  geometry?: { coordinates?: [number, number] }
}

const km = (aLat: number, aLng: number, bLat: number, bLng: number) => {
  const x = (bLng - aLng) * Math.cos((aLat * Math.PI) / 180)
  const y = bLat - aLat
  return Math.sqrt(x * x + y * y) * 111
}

// Real residential buildings near a point, from OpenStreetMap data (via Photon, no key needed).
// OpenStreetMap has no rents or availability, so none are returned here.
homesRoutes.post('/homes', authMiddleware, async (c) => {
  const body = (await c.req.json().catch(() => null)) as { lat?: unknown; lng?: unknown; kind?: unknown; city?: unknown } | null
  const lat = Number(body?.lat)
  const lng = Number(body?.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return c.json({ error: 'bad_location' }, 400)
  }
  const city = typeof body?.city === 'string' ? body.city.slice(0, 60) : ''
  const house = body?.kind === 'house'
  const q = `${house ? 'house' : 'apartments'} ${city}`.trim()
  const url =
    `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&lat=${lat}&lon=${lng}&limit=40&lang=en` +
    `&osm_tag=${house ? 'building:house' : 'building:apartments'}`
  const res = await fetch(url, { headers: { 'User-Agent': 'BridgeRights/1.0' } }).catch(() => null)
  if (!res || !res.ok) return c.json({ error: 'osm_unavailable' }, 502)
  const data = (await res.json().catch(() => ({}))) as { features?: PhotonFeature[] }
  const seen = new Set<string>()
  const places = (data.features ?? [])
    .map((f) => {
      const p = f.properties ?? {}
      const [fLng, fLat] = f.geometry?.coordinates ?? [NaN, NaN]
      return { p, fLat, fLng }
    })
    .filter(({ p, fLat, fLng }) => p.name && Number.isFinite(fLat) && km(lat, lng, fLat, fLng) <= 12)
    .filter(({ p }) => {
      const key = `${p.name}|${p.street ?? ''}|${p.housenumber ?? ''}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 15)
    .map(({ p, fLat, fLng }) => {
      const street = [p.housenumber, p.street].filter(Boolean).join(' ')
      const address = [street, p.city].filter(Boolean).join(', ')
      const kindLetter = p.osm_type === 'W' ? 'way' : p.osm_type === 'R' ? 'relation' : 'node'
      return {
        id: `${p.osm_type}${p.osm_id}`,
        name: p.name,
        address,
        rating: null,
        ratings: 0,
        mapsUrl: `https://www.openstreetmap.org/${kindLetter}/${p.osm_id}`,
        lat: fLat,
        lng: fLng,
      }
    })
  return c.json({ places })
})
