export interface Place {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export const PLACES: Place[] = [
  { id: 'san-jose', name: 'San Jose', lat: 37.34, lng: -121.89 },
  { id: 'cupertino', name: 'Cupertino', lat: 37.32, lng: -122.03 },
  { id: 'sunnyvale', name: 'Sunnyvale', lat: 37.37, lng: -122.04 },
  { id: 'mountain-view', name: 'Mountain View', lat: 37.39, lng: -122.08 },
  { id: 'santa-clara', name: 'Santa Clara', lat: 37.35, lng: -121.95 },
  { id: 'milpitas', name: 'Milpitas', lat: 37.43, lng: -121.9 },
  { id: 'campbell', name: 'Campbell', lat: 37.29, lng: -121.95 },
  { id: 'palo-alto', name: 'Palo Alto', lat: 37.44, lng: -122.14 },
  { id: 'redwood-city', name: 'Redwood City', lat: 37.49, lng: -122.24 },
  { id: 'fremont', name: 'Fremont', lat: 37.55, lng: -121.99 },
  { id: 'hayward', name: 'Hayward', lat: 37.67, lng: -122.08 },
  { id: 'gilroy', name: 'Gilroy', lat: 37.01, lng: -121.57 },
];

export const placeById = (id: string): Place => PLACES.find((p) => p.id === id) ?? PLACES[0];

export interface Listing {
  id: string;
  title: string;
  placeId: string;
  rent: number;
  bedrooms: number;
  utilities: number;
  stepFree: boolean;
}

// Sample data for the prototype. Not live listings and not real addresses.
export const SAMPLE_LISTINGS: Listing[] = [
  { id: 'l1', title: 'Garden-level 1 bed', placeId: 'san-jose', rent: 2350, bedrooms: 1, utilities: 140, stepFree: true },
  { id: 'l2', title: 'Quiet 2 bed near transit', placeId: 'san-jose', rent: 2900, bedrooms: 2, utilities: 170, stepFree: false },
  { id: 'l3', title: 'Ground-floor 2 bed', placeId: 'milpitas', rent: 2800, bedrooms: 2, utilities: 160, stepFree: true },
  { id: 'l4', title: 'Updated 3 bed duplex', placeId: 'milpitas', rent: 3500, bedrooms: 3, utilities: 210, stepFree: false },
  { id: 'l5', title: 'Studio by the park', placeId: 'campbell', rent: 2000, bedrooms: 0, utilities: 110, stepFree: true },
  { id: 'l6', title: 'Sunny 2 bed', placeId: 'santa-clara', rent: 3100, bedrooms: 2, utilities: 170, stepFree: true },
  { id: 'l7', title: 'Family 3 bed house', placeId: 'gilroy', rent: 3000, bedrooms: 3, utilities: 220, stepFree: true },
  { id: 'l8', title: '1 bed with elevator', placeId: 'sunnyvale', rent: 2750, bedrooms: 1, utilities: 140, stepFree: true },
  { id: 'l9', title: '2 bed townhome', placeId: 'fremont', rent: 3200, bedrooms: 2, utilities: 180, stepFree: false },
  { id: 'l10', title: '1 bed, step-free entry', placeId: 'hayward', rent: 2300, bedrooms: 1, utilities: 130, stepFree: true },
  { id: 'l11', title: '2 bed apartment', placeId: 'hayward', rent: 2750, bedrooms: 2, utilities: 160, stepFree: true },
  { id: 'l12', title: '2 bed near downtown', placeId: 'mountain-view', rent: 3800, bedrooms: 2, utilities: 180, stepFree: true },
  { id: 'l13', title: '3 bed family home', placeId: 'cupertino', rent: 4300, bedrooms: 3, utilities: 230, stepFree: false },
  { id: 'l14', title: '1 bed cottage', placeId: 'palo-alto', rent: 3300, bedrooms: 1, utilities: 150, stepFree: false },
  { id: 'l15', title: '2 bed, elevator building', placeId: 'redwood-city', rent: 3400, bedrooms: 2, utilities: 175, stepFree: true },
];
