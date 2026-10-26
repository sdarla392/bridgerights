import { Hono } from 'hono'
import type { HonoEnv } from '../env'
import { authMiddleware } from '../middleware/auth'

export const homesRoutes = new Hono<HonoEnv>()

interface GooglePlace {
  id?: string
  displayName?: { text?: string }
  formattedAddress?: string
  rating?: number
  userRatingCount?: number
  googleMapsUri?: string
  location?: { latitude?: number; longitude?: number }
}

// Real rental buildings near a point, from Google Places. Google does not publish rents
// or availability, so none are returned here.
homesRoutes.post('/homes', authMiddleware, async (c) => {
  const key = (c.env as unknown as Record<string, string | undefined>).GOOGLE_MAPS_API_KEY
  if (!key) return c.json({ error: 'not_configured' }, 503)
  const body = (await c.req.json().catch(() => null)) as { lat?: unknown; lng?: unknown; kind?: unknown } | null
  const lat = Number(body?.lat)
  const lng = Number(body?.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return c.json({ error: 'bad_location' }, 400)
  }
  const kind = body?.kind === 'house' ? 'houses for rent' : 'apartments for rent'
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask':
        'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.googleMapsUri,places.location',
    },
    body: JSON.stringify({
      textQuery: kind,
      maxResultCount: 12,
      locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius: 8000 } },
    }),
  }).catch(() => null)
  if (!res || !res.ok) return c.json({ error: 'google_unavailable' }, 502)
  const data = (await res.json()) as { places?: GooglePlace[] }
  const places = (data.places ?? [])
    .filter((p) => p.id && p.displayName?.text)
    .map((p) => ({
      id: p.id,
      name: p.displayName?.text,
      address: p.formattedAddress ?? '',
      rating: p.rating ?? null,
      ratings: p.userRatingCount ?? 0,
      mapsUrl: p.googleMapsUri ?? '',
      lat: p.location?.latitude ?? null,
      lng: p.location?.longitude ?? null,
    }))
  return c.json({ places })
})
