import { type Listing, placeById, PLACES, SAMPLE_LISTINGS } from '@/features/relocation/data/places';

export interface Needs {
  budget: number;
  household: number;
  bedrooms: number;
  workPlaceId: string;
  familiarPlaceId: string;
  needsStepFree: boolean;
  dailyCare: boolean;
  types: string[];
  pets: boolean;
  parking: boolean;
  laundry: boolean;
  transit: boolean;
  minBaths: number;
  maxCommuteMin: number;
}

export interface Factor {
  id: string;
  label: string;
  score: number;
  weight: number;
  note: string;
}

export interface Match {
  listing: Listing;
  totalMonthly: number;
  transport: number;
  score: number;
  factors: Factor[];
}

function km(aId: string, bId: string): number {
  const a = placeById(aId);
  const b = placeById(bId);
  const dLat = (b.lat - a.lat) * 111;
  const dLng = (b.lng - a.lng) * 111 * Math.cos((a.lat * Math.PI) / 180);
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const money = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;

export function minimumBedrooms(household: number): number {
  return household <= 1 ? 0 : Math.ceil(household / 2);
}

export function scoreListing(l: Listing, n: Needs): Match {
  const commuteKm = km(l.placeId, n.workPlaceId);
  const commuteMin = 8 + commuteKm * 2.2;
  const transport = commuteKm * 2 * 21 * 0.22;
  const totalMonthly = l.rent + l.utilities + transport;
  const over = totalMonthly / Math.max(1, n.budget);

  const affordability = clamp(over <= 1 ? 100 : 100 - ((over - 1) / 0.3) * 100);
  const need = Math.max(n.bedrooms, minimumBedrooms(n.household));
  const space = clamp(l.bedrooms >= need ? 100 : 100 - (need - l.bedrooms) * 55);
  const commute = clamp(100 - ((commuteMin - 20) / 40) * 100);
  const access = n.needsStepFree ? (l.stepFree ? 100 : 0) : 100;
  const familiarKm = km(l.placeId, n.familiarPlaceId);
  const community = clamp(100 - ((familiarKm - 5) / 25) * 100);

  const wants: [boolean, boolean, string][] = [
    [n.pets, l.pets, 'pets allowed'],
    [n.parking, l.parking, 'parking'],
    [n.laundry, l.laundry, 'laundry in the home'],
    [n.transit, l.transit, 'near transit'],
    [n.minBaths > 0, l.baths >= n.minBaths, `${n.minBaths}+ bathrooms`],
    [n.types.length > 0, n.types.includes(l.type), `a ${n.types.join(' or ')}`],
  ];
  const asked = wants.filter((w) => w[0]);
  const met = asked.filter((w) => w[1]);
  const missing = asked.filter((w) => !w[1]).map((w) => w[2]);
  const musts = asked.length ? clamp((met.length / asked.length) * 100) : 100;
  const commuteLimit = commuteMin > n.maxCommuteMin;

  const factors: Factor[] = [
    {
      id: 'cost',
      label: 'Monthly cost',
      score: affordability,
      weight: 35,
      note: `Rent, utilities and travel come to about ${money(totalMonthly)} a month against your ${money(n.budget)}.`,
    },
    {
      id: 'space',
      label: 'Space',
      score: space,
      weight: 20,
      note: `${l.bedrooms === 0 ? 'A studio' : `${l.bedrooms} bedroom${l.bedrooms > 1 ? 's' : ''}`} for ${n.household} ${n.household === 1 ? 'person' : 'people'}; you need about ${need === 0 ? 'a studio' : `${need} bedroom${need > 1 ? 's' : ''}`}.`,
    },
    {
      id: 'commute',
      label: 'Commute',
      score: commute,
      weight: n.dailyCare ? 25 : 15,
      note: `${commuteLimit ? 'Over your limit. ' : ''}Roughly ${Math.round(commuteMin)} minutes each way to ${placeById(n.workPlaceId).name}. This is an estimate from distance, not live traffic.`,
    },
    {
      id: 'access',
      label: 'Accessibility',
      score: access,
      weight: n.needsStepFree ? 20 : 5,
      note: n.needsStepFree ? (l.stepFree ? 'The listing says step-free access.' : 'No step-free access listed.') : 'You did not mark accessibility as needed.',
    },
    {
      id: 'community',
      label: 'Familiar community',
      score: community,
      weight: 15,
      note: `About ${Math.round(familiarKm)} km from ${placeById(n.familiarPlaceId).name}, where your community services are.`,
    },
    {
      id: 'musts',
      label: 'Your must-haves',
      score: musts,
      weight: asked.length ? 20 : 0,
      note: asked.length ? (missing.length ? `Missing: ${missing.join(', ')}.` : 'Has everything you asked for.') : 'You did not pick any extras.',
    },
  ];
  if (commuteLimit) factors[2].score = Math.min(factors[2].score, 20);
  const totalWeight = factors.reduce((s, f) => s + f.weight, 0);
  const score = Math.round(factors.reduce((s, f) => s + f.score * f.weight, 0) / totalWeight);
  return { listing: l, totalMonthly, transport, score, factors };
}

export function rankListings(n: Needs): Match[] {
  return SAMPLE_LISTINGS.map((l) => scoreListing(l, n)).sort((a, b) => b.score - a.score);
}

export function areaFit(n: Needs): { placeId: string; score: number | null }[] {
  const all = rankListings(n);
  return PLACES.map((p) => {
    const best = all.find((m) => m.listing.placeId === p.id);
    return { placeId: p.id, score: best ? best.score : null };
  });
}
