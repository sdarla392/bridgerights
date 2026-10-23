import type { CaseRecord, NoticeCheck, NoticeFields } from '@/features/cases/types/case';
import { daysBetween, parseDate, requiredNoticeDays } from '@/features/cases/utils/dates';

export function runNoticeChecks(c: CaseRecord, n: NoticeFields): NoticeCheck[] {
  const checks: NoticeCheck[] = [];
  const reason = n.statedReason.trim();
  const unsure = (v: string) => v === '' || v === 'unknown';

  checks.push({
    id: 'reason',
    label: 'States a reason',
    requirement: 'Where just cause applies, the notice should state the reason the landlord is ending the tenancy.',
    compared: unsure(reason) ? 'Reason not entered or illegible' : `Notice says: “${reason}”`,
    state: unsure(reason) ? 'unclear' : 'present',
    askProfessional: 'Does this stated reason match one of the reasons the law allows for my home?',
    sourceId: 'ca-civ-1946-2',
  });

  const nd = parseDate(n.noticeDate);
  const md = parseDate(n.moveOutDate);
  const need = c.facts.tenancyType === 'month' ? requiredNoticeDays(c.facts.tenancyLength) : null;
  const notFlexible = n.noticeType === 'pay' || c.facts.tenancyType === 'fixed';
  if (notFlexible) {
    checks.push({
      id: 'period', label: 'Notice length', requirement: 'Pay-or-quit notices and fixed-term leases follow different rules than month-to-month notices.',
      compared: 'Not compared: this check covers month-to-month notices', state: 'not_applicable',
      askProfessional: 'Which timing rules apply to this type of notice?', sourceId: 'ca-courts-eviction',
    });
  } else if (!nd || !md || !need) {
    checks.push({
      id: 'period', label: 'Notice length', requirement: 'A month-to-month notice generally needs 30 days (under a year) or 60 days (a year or more).',
      compared: !need ? 'Tenancy length is unknown, so the required period cannot be set' : 'A date is missing or could not be read',
      state: 'unclear', askProfessional: 'Given my move-in date and the notice date, how many days of notice are required?', sourceId: 'ca-civ-1946-1',
    });
  } else {
    const given = daysBetween(nd, md);
    checks.push({
      id: 'period', label: 'Notice length', requirement: `About ${need} days of notice for your tenancy length.`,
      compared: `Notice gives ${given} days between the notice date and move-out date`,
      state: given >= need ? 'present' : 'absent',
      askProfessional: 'Was the notice delivered in a way that counts, and does the move-out date leave enough time?', sourceId: 'ca-civ-1946-1',
    });
  }

  const noFault = ['redevelopment', 'withdraw', 'sold', 'notice', 'relocation'].includes(c.facts.reason);
  const rel = n.relocationStated.trim();
  checks.push({
    id: 'relocation', label: 'Relocation help',
    requirement: 'For no-fault endings, state law may require relocation help or a waived month of rent, and some cities require more.',
    compared: !noFault ? 'Your situation is not marked as a no-fault ending' : unsure(rel) ? 'No relocation terms entered' : rel === 'none' ? 'The notice does not mention relocation help' : `Notice says: “${rel}”`,
    state: !noFault ? 'not_applicable' : unsure(rel) ? 'unclear' : rel === 'none' ? 'absent' : 'present',
    askProfessional: 'Is relocation help owed in my case, and is the amount or waiver in the notice correct?', sourceId: 'ca-civ-1946-2',
  });
  return checks;
}
