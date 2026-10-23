import type { Source } from '@/features/cases/types/case';

export interface City {
  id: string;
  name: string;
  coverage: 'draft' | 'state_only';
  note: string;
}

export const CITIES: City[] = [
  { id: 'san-jose', name: 'San José', coverage: 'draft', note: 'Apartment Rent, Tenant Protection and Ellis Act ordinances (draft rules)' },
  { id: 'cupertino', name: 'Cupertino', coverage: 'state_only', note: 'State rules only; city renter support linked' },
  { id: 'sunnyvale', name: 'Sunnyvale', coverage: 'state_only', note: 'State rules only; local rules not yet verified' },
  { id: 'mountain-view', name: 'Mountain View', coverage: 'state_only', note: 'State rules only; local rules not yet verified' },
  { id: 'santa-clara', name: 'Santa Clara', coverage: 'state_only', note: 'State rules only; local rules not yet verified' },
  { id: 'milpitas', name: 'Milpitas', coverage: 'state_only', note: 'State rules only; local rules not yet verified' },
  { id: 'campbell', name: 'Campbell', coverage: 'state_only', note: 'State rules only; local rules not yet verified' },
  { id: 'palo-alto', name: 'Palo Alto', coverage: 'state_only', note: 'State rules only; local rules not yet verified' },
];

export const SOURCES: Source[] = [
  { id: 'ca-civ-1946-2', title: 'Tenant Protection Act: just cause (Civil Code §1946.2)', type: 'State statute', jurisdiction: 'California', url: 'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1946.2' },
  { id: 'ca-civ-1947-12', title: 'Tenant Protection Act: rent cap (Civil Code §1947.12)', type: 'State statute', jurisdiction: 'California', url: 'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1947.12' },
  { id: 'ca-civ-1946-1', title: 'Notice to end a month-to-month tenancy (Civil Code §1946.1)', type: 'State statute', jurisdiction: 'California', url: 'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1946.1' },
  { id: 'ca-gov-7060', title: 'Ellis Act (Government Code §7060)', type: 'State statute', jurisdiction: 'California', url: 'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=7060' },
  { id: 'ca-courts-eviction', title: 'Eviction information for tenants', type: 'Court guidance', jurisdiction: 'California', url: 'https://selfhelp.courts.ca.gov/eviction-tenant' },
  { id: 'ca-ag-tenants', title: 'Attorney General: tenant protections', type: 'Official resource', jurisdiction: 'California', url: 'https://oag.ca.gov/tenants' },
  { id: 'ca-dre-guide', title: 'California tenant and landlord guide', type: 'Official resource', jurisdiction: 'California', url: 'https://www.dre.ca.gov/publications/ResourceGuidebook/Index.html' },
  { id: 'sj-tenant-protection', title: 'San José tenant protections (Rent, Tenant Protection and Ellis ordinances)', type: 'Municipal resource', jurisdiction: 'San José', url: 'https://www.sanjoseca.gov/your-government/departments-offices/housing/developers/affordable-housing-plans-policies/tenant-protection/' },
  { id: 'cup-renter-support', title: 'Cupertino renter support', type: 'Municipal resource', jurisdiction: 'Cupertino', url: 'https://www.cupertino.gov/Your-City/Departments/Community-Development/Housing/Renter-Support' },
];

export const sourceById = (id: string): Source | undefined => SOURCES.find((s) => s.id === id);

export interface Resource {
  id: string;
  name: string;
  kind: string;
  blurb: string;
  url: string;
}

export const RESOURCES: Resource[] = [
  { id: 'lfsv', name: 'Law Foundation of Silicon Valley', kind: 'Legal aid', blurb: 'Free legal help for lower-income Santa Clara County residents.', url: 'https://lawfoundation.org' },
  { id: 'sentinel', name: 'Project Sentinel', kind: 'Housing counseling', blurb: 'Tenant-landlord counseling and dispute mediation in the Bay Area.', url: 'https://www.housing.org' },
  { id: 'courts', name: 'California Courts Self-Help', kind: 'Court guidance', blurb: 'Plain-language steps if you receive a notice or court papers.', url: 'https://selfhelp.courts.ca.gov/eviction-tenant' },
  { id: 'sj', name: 'City of San José Housing', kind: 'City program', blurb: 'San José rent and tenant-protection information.', url: 'https://www.sanjoseca.gov/your-government/departments-offices/housing/developers/affordable-housing-plans-policies/tenant-protection/' },
  { id: 'cup', name: 'Cupertino renter support', kind: 'City program', blurb: 'Renter support and housing counseling referrals.', url: 'https://www.cupertino.gov/Your-City/Departments/Community-Development/Housing/Renter-Support' },
  { id: 'ag', name: 'California Attorney General', kind: 'State resource', blurb: 'Statewide tenant protections and complaint information.', url: 'https://oag.ca.gov/tenants' },
];
