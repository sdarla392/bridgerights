import { CITIES, sourceById } from '@/features/cases/data/jurisdictions';
import { REASONS } from '@/features/cases/data/questions';
import type { CaseRecord } from '@/features/cases/types/case';
import { computeDeadlines, formatDate } from '@/features/cases/utils/dates';
import { runNoticeChecks } from '@/features/cases/utils/notice-checks';
import { evaluate, STATUS_LABEL } from '@/features/cases/utils/rules-engine';

export function cityName(id: string): string {
  return CITIES.find((c) => c.id === id)?.name ?? 'Other city';
}

export function reasonLabel(value: string): string {
  return REASONS.find((r) => r.value === value)?.label ?? 'Not given';
}

export function buildSummary(c: CaseRecord): string {
  const lines: string[] = ['BridgeRights case summary', 'An informational summary, not legal advice or a legal opinion.', ''];
  lines.push(`City: ${cityName(c.facts.city)}`, `Situation: ${reasonLabel(c.facts.reason)}`, '');
  lines.push('Possibly relevant protections:');
  for (const f of evaluate(c.facts).filter((x) => x.applicability !== 'not_applicable')) {
    lines.push(`- ${f.title} (${STATUS_LABEL[f.applicability]})`);
    if (f.unresolved.length) lines.push(`  Still unknown: ${f.unresolved.join('; ')}`);
    for (const s of f.sourceIds) lines.push(`  Source: ${sourceById(s)?.url ?? ''}`);
  }
  const dl = computeDeadlines(c.facts);
  if (dl.length) {
    lines.push('', 'Dates:');
    for (const d of dl) lines.push(`- ${d.label}: ${d.date ? formatDate(d.date) : 'Not verified'} (${d.trace})`);
  }
  if (c.notice) {
    lines.push('', 'Notice checks:');
    for (const k of runNoticeChecks(c, c.notice)) lines.push(`- ${k.label}: ${k.state.replace('_', ' ')}. ${k.compared}. Ask: ${k.askProfessional}`);
  }
  lines.push('', 'Tasks:');
  for (const t of c.tasks) lines.push(`${t.done ? '[x]' : '[ ]'} ${t.title}`);
  return lines.join('\n');
}
