export interface Option {
  value: string;
  label: string;
}

export const DONT_KNOW: Option = { value: 'unknown', label: "I don't know" };

export const PROPERTY_TYPES: Option[] = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'condo', label: 'Condominium' },
  { value: 'room', label: 'Room' },
  { value: 'other', label: 'Other' },
];

export const UNITS: Option[] = [
  { value: '1', label: 'Just one home' },
  { value: '2', label: '2 units' },
  { value: '3', label: '3 or more units' },
  DONT_KNOW,
];

export const BUILT_ERAS: Option[] = [
  { value: 'pre-1979', label: 'Before 1979' },
  { value: '1979-2010', label: '1979 to 2010' },
  { value: 'recent', label: 'After 2010' },
  DONT_KNOW,
];

export const REASONS: Option[] = [
  { value: 'sold', label: 'The building was sold or changed owners' },
  { value: 'redevelopment', label: 'Redevelopment or demolition' },
  { value: 'withdraw', label: 'Landlord is taking units off the rental market' },
  { value: 'notice', label: 'I received a notice to move out' },
  { value: 'relocation', label: 'Relocation help was offered or denied' },
  { value: 'rent', label: 'A rent increase or other tenancy issue' },
  { value: 'unsure', label: "I'm not sure what my notice means" },
];

export const YES_NO: Option[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  DONT_KNOW,
];

export const TENANCY_TYPES: Option[] = [
  { value: 'month', label: 'Month to month' },
  { value: 'fixed', label: 'Fixed term (a lease)' },
  DONT_KNOW,
];

export const TENANCY_LENGTHS: Option[] = [
  { value: 'under-1', label: 'Under a year' },
  { value: '1-plus', label: 'A year or more' },
  DONT_KNOW,
];

export const NOTICE_TYPES: Option[] = [
  { value: '30', label: '30-day notice' },
  { value: '60', label: '60-day notice' },
  { value: '90', label: '90-day notice' },
  { value: 'ellis', label: '120-day withdrawal notice' },
  { value: 'pay', label: '3-day pay or quit' },
  { value: 'other', label: 'Something else' },
];

export const NOFAULT_REASONS = ['redevelopment', 'withdraw', 'notice', 'sold', 'relocation'];
