import type { DeadlineResult, Facts } from '@/features/cases/types/case';

export function parseDate(input: string): string | null {
  const t = input.trim();
  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(t);
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
  const [y, m, d] = us ? [us[3], us[1], us[2]] : iso ? [iso[1], iso[2], iso[3]] : [];
  if (!y) return null;
  const dt = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  if (dt.getUTCMonth() !== Number(m) - 1) return null;
  return dt.toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const dt = new Date(`${iso}T00:00:00Z`);
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

export function daysBetween(fromISO: string, toISO: string): number {
  return Math.round((Date.parse(`${toISO}T00:00:00Z`) - Date.parse(`${fromISO}T00:00:00Z`)) / 86400000);
}

export function formatDate(iso: string): string {
  const dt = new Date(`${iso}T00:00:00Z`);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

export function requiredNoticeDays(tenancyLength: string): number | null {
  if (tenancyLength === 'under-1') return 30;
  if (tenancyLength === '1-plus') return 60;
  return null;
}

/** Deterministic date service: never guesses; every result carries its calculation. */
export function computeDeadlines(facts: Facts): DeadlineResult[] {
  const results: DeadlineResult[] = [];
  const noticeISO = facts.hasNotice === 'yes' ? parseDate(facts.noticeDate) : null;
  if (!noticeISO) return results;

  if (facts.reason === 'withdraw') {
    results.push({
      date: addDays(noticeISO, 120),
      label: 'Earliest move-out under a withdrawal notice',
      trace: `Notice date ${formatDate(noticeISO)} + 120 days. Longer for some seniors and people with disabilities; confirm how and when the notice was served.`,
      sourceId: 'ca-gov-7060',
    });
    return results;
  }

  const days = facts.tenancyType === 'month' ? requiredNoticeDays(facts.tenancyLength) : null;
  if (days) {
    results.push({
      date: addDays(noticeISO, days),
      label: 'Earliest move-out date for a month-to-month notice',
      trace: `Notice date ${formatDate(noticeISO)} + ${days} days (${days === 30 ? 'tenancy under a year' : 'tenancy of a year or more'}). Service method can add days.`,
      sourceId: 'ca-civ-1946-1',
    });
  }
  return results;
}
