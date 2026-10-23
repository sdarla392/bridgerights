import type { CaseRecord, Facts, Task } from '@/features/cases/types/case';
import { evaluate } from '@/features/cases/utils/rules-engine';

export const TASK_KIND_LABEL = {
  review: 'Review information',
  gather: 'Gather documents',
  verify: 'Verify a requirement',
  contact: 'Contact support',
  follow_up: 'Follow up',
} as const;

export function generateTasks(facts: Facts, existing: Task[] = []): Task[] {
  const tasks: Task[] = [];
  const findings = evaluate(facts).filter((f) => f.applicability !== 'not_applicable');
  tasks.push({ id: 'review-results', kind: 'review', title: 'Read your rights summary', detail: 'Go through each protection and its sources. Nothing here is a final answer.', done: false });
  if (facts.hasNotice !== 'no') tasks.push({ id: 'gather-notice', kind: 'gather', title: 'Keep the notice safe', detail: 'Photograph every page and note the date and how you received it (hand, mail, posted).', done: false });
  tasks.push({ id: 'gather-lease', kind: 'gather', title: 'Collect rent receipts and your lease', detail: 'Only what you already have. You do not need to share more than you want to.', done: false });
  for (const f of findings.slice(0, 3)) {
    tasks.push({ id: `verify-${f.ruleId}`, kind: 'verify', title: `Verify: ${f.title}`, detail: f.followUp, done: false });
  }
  if (facts.court === 'yes') tasks.push({ id: 'court', kind: 'contact', title: 'Get help with court papers right away', detail: 'Court papers have short response deadlines. Call a legal aid office or the court self-help center today.', done: false });
  tasks.push({ id: 'contact-aid', kind: 'contact', title: 'Talk to a housing counselor or legal aid', detail: 'Bring this case summary. See the Help tab for organizations.', done: false });
  tasks.push({ id: 'follow-up', kind: 'follow_up', title: 'Write down any reply from your landlord', detail: 'Keep dates and what was said. Follow up in writing when you can.', done: false });
  return tasks.map((t) => ({ ...t, done: existing.find((e) => e.id === t.id)?.done ?? false }));
}

export function progress(c: CaseRecord): number {
  return c.tasks.length === 0 ? 0 : c.tasks.filter((t) => t.done).length / c.tasks.length;
}
