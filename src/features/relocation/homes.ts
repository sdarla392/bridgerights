import { refreshToken } from '@/features/assistant/ask';
import { API_URL } from '@/lib/auth';

export interface GoogleHome {
  id: string;
  name: string;
  address: string;
  rating: number | null;
  ratings: number;
  mapsUrl: string;
  lat: number | null;
  lng: number | null;
}

export type HomesResult = { ok: true; places: GoogleHome[] } | { ok: false; reason: 'not_configured' | 'unavailable' };

export async function fetchGoogleHomes(lat: number, lng: number, kind: 'apartment' | 'house'): Promise<HomesResult> {
  try {
    const token = await refreshToken();
    const res = await fetch(`${API_URL}/homes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ lat, lng, kind }),
    });
    if (res.status === 503) return { ok: false, reason: 'not_configured' };
    if (!res.ok) return { ok: false, reason: 'unavailable' };
    const data = (await res.json()) as { places?: GoogleHome[] };
    return { ok: true, places: data.places ?? [] };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}
