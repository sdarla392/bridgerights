import { Hono } from 'hono'
import type { HonoEnv } from '../env'
import { authMiddleware } from '../middleware/auth'

export const homesRoutes = new Hono<HonoEnv>()

interface OsmElement {
  type: string
  id: number
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags?: Record<string, string>
}

// Real residential buildings near a point, from OpenStreetMap (no key needed).
// OpenStreetMap has no rents or availability, so none are returned here.
homesRoutes.post('/homes', authMiddleware, async (c) => {
  const body = (await c.req.json().catch(() => null)) as { lat?: unknown; lng?: unknown; kind?: unknown } | null
  const lat = Number(body?.lat)
  const lng = Number(body?.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return c.json({ error: 'bad_location' }, 400)
  }
  const types = body?.kind === 'house' ? 'house|detached|semidetached_house|terrace' : 'apartments|residential'
  const query = `[out:json][timeout:20];nwr["building"~"^(${types})$"]["name"](around:6000,${lat},${lng});out center 40;`
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'BridgeRights/1.0' },
    body: `data=${encodeURIComponent(query)}`,
  }).catch(() => null)
  if (!res || !res.ok) return c.json({ error: 'osm_unavailable' }, 502)
  const data = (await res.json().catch(() => ({}))) as { elements?: OsmElement[] }
  const places = (data.elements ?? [])
    .filter((e) => e.tags?.name)
    .slice(0, 15)
    .map((e) => {
      const t = e.tags ?? {}
      const street = [t['addr:housenumber'], t['addr:street']].filter(Boolean).join(' ')
      const address = [street, t['addr:city']].filter(Boolean).join(', ')
      return {
        id: `${e.type}${e.id}`,
        name: t.name,
        address,
        rating: null,
        ratings: 0,
        mapsUrl: `https://www.openstreetmap.org/${e.type}/${e.id}`,
        lat: e.lat ?? e.center?.lat ?? null,
        lng: e.lon ?? e.center?.lon ?? null,
      }
    })
  return c.json({ places })
})
