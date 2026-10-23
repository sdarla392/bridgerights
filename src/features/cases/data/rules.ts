import { NOFAULT_REASONS } from '@/features/cases/data/questions';
import type { Rule } from '@/features/cases/types/case';

const oneYearPlus = { key: 'tenancyLength' as const, label: 'You have lived there a year or more', test: (v: string) => v === '1-plus' };
const notRoom = { key: 'propertyType' as const, label: 'The home is not a rented room in the owner’s own home', test: (v: string) => v !== 'room' };
const terminationReason = {
  key: 'reason' as const,
  label: 'The landlord is ending the tenancy',
  test: (v: string) => ['sold', 'redevelopment', 'withdraw', 'notice', 'relocation'].includes(v),
};

/** Draft rules, pending review by a qualified legal reviewer. Conditions are explicit data, not prose. */
export const RULES: Rule[] = [
  {
    id: 'CA-JC-001',
    jurisdictions: ['ca'],
    topic: 'Just-cause eviction',
    title: 'State just-cause protection',
    summary: 'After a year in a home, a landlord may need a listed legal reason to end a tenancy.',
    conditions: [terminationReason, oneYearPlus, notRoom],
    exceptions: ['Buildings built in the last 15 years', 'Some single-family homes and condos owned by individuals who gave the required exemption notice', 'Some deed-restricted or owner-occupied housing'],
    followUp: 'Ask a counselor whether your building is exempt and which stated reason the notice relies on.',
    sourceIds: ['ca-civ-1946-2', 'ca-ag-tenants'],
  },
  {
    id: 'CA-RELO-001',
    jurisdictions: ['ca'],
    topic: 'Relocation assistance',
    title: 'State relocation assistance for no-fault endings',
    summary: 'When a covered landlord ends a tenancy for a no-fault reason, the law may require relocation help or a waived final month of rent.',
    conditions: [
      { key: 'reason', label: 'The reason is not something the tenant did (for example redevelopment, withdrawal or a sale)', test: (v) => NOFAULT_REASONS.includes(v) },
      oneYearPlus,
    ],
    exceptions: ['The building or landlord may be exempt from the state law', 'A local ordinance may require more'],
    followUp: 'Ask whether your notice states the reason and whether relocation help or a waived month is owed.',
    sourceIds: ['ca-civ-1946-2'],
  },
  {
    id: 'CA-NOTICE-001',
    jurisdictions: ['ca'],
    topic: 'Notice period',
    title: 'Minimum notice for a month-to-month tenancy',
    summary: 'Ending a month-to-month tenancy generally takes written notice of 30 days (under a year) or 60 days (a year or more).',
    conditions: [
      { key: 'tenancyType', label: 'Your tenancy is month to month', test: (v) => v === 'month' },
      { key: 'hasNotice', label: 'You have a written notice', test: (v) => v === 'yes' },
    ],
    exceptions: ['Fixed-term leases follow their own terms', 'Other notice types, such as pay or quit, have different periods'],
    followUp: 'Confirm the notice date, how it was delivered, and the move-out date it names.',
    sourceIds: ['ca-civ-1946-1', 'ca-courts-eviction'],
  },
  {
    id: 'CA-ELLIS-001',
    jurisdictions: ['ca'],
    topic: 'Withdrawal from the rental market',
    title: 'Ellis Act withdrawal',
    summary: 'A landlord who permanently takes a building off the rental market must follow state notice rules, usually 120 days.',
    conditions: [{ key: 'reason', label: 'The landlord is taking units off the rental market', test: (v) => v === 'withdraw' }],
    exceptions: ['A longer period can apply for some seniors and people with disabilities', 'Cities may add filing and relocation requirements'],
    followUp: 'Ask a counselor to confirm the notice period for your household and whether the city requires filings.',
    sourceIds: ['ca-gov-7060'],
  },
  {
    id: 'CA-RENT-001',
    jurisdictions: ['ca'],
    topic: 'Rent increase',
    title: 'State annual rent-increase limit',
    summary: 'For covered homes the state limits how much rent can rise in a year.',
    conditions: [
      { key: 'reason', label: 'Your issue is a rent increase', test: (v) => v === 'rent' },
      notRoom,
    ],
    exceptions: ['Buildings built in the last 15 years', 'Certain single-family homes and condos', 'A stricter local rent ordinance may apply'],
    followUp: 'Gather your current and previous rent amounts and the increase notice.',
    sourceIds: ['ca-civ-1947-12'],
  },
  {
    id: 'SJ-ARO-001',
    jurisdictions: ['san-jose'],
    topic: 'Rent stabilization',
    title: 'San José Apartment Rent Ordinance',
    summary: 'San José lists specific older multifamily buildings as rent-stabilized; coverage depends on the property.',
    conditions: [
      { key: 'units', label: 'The building has 3 or more units', test: (v) => v === '3' },
      { key: 'builtEra', label: 'The building was built before 1979', test: (v) => v === 'pre-1979' },
    ],
    exceptions: ['Coverage is property-specific; check the city’s list of covered properties'],
    followUp: 'Look up your address in the city’s rent-stabilized property information.',
    sourceIds: ['sj-tenant-protection'],
  },
  {
    id: 'SJ-TPO-001',
    jurisdictions: ['san-jose'],
    topic: 'Just-cause eviction',
    title: 'San José Tenant Protection Ordinance',
    summary: 'San José’s local ordinance sets its own reasons and procedures for ending tenancies.',
    conditions: [terminationReason, notRoom],
    exceptions: ['Coverage and exemptions are defined by the ordinance, not by the state law'],
    followUp: 'Ask the city or a counselor whether your home is covered and what the notice must say.',
    sourceIds: ['sj-tenant-protection'],
  },
  {
    id: 'SJ-ELLIS-001',
    jurisdictions: ['san-jose'],
    topic: 'Withdrawal from the rental market',
    title: 'San José Ellis Act ordinance',
    summary: 'San José has separate procedures for landlords withdrawing units from the rental market.',
    conditions: [{ key: 'reason', label: 'The landlord is taking units off the rental market', test: (v) => v === 'withdraw' }],
    exceptions: ['City procedures apply in addition to the state Ellis Act'],
    followUp: 'Ask the city housing department whether the landlord filed the required paperwork.',
    sourceIds: ['sj-tenant-protection', 'ca-gov-7060'],
  },
];
