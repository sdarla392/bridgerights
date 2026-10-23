import { RULES } from '@/features/cases/data/rules';
import { CITIES } from '@/features/cases/data/jurisdictions';
import type { Applicability, Facts, Finding } from '@/features/cases/types/case';

const isUnknown = (v: string) => v === '' || v === 'unknown';

export function evaluate(facts: Facts): Finding[] {
  const applicable = RULES.filter((r) => r.jurisdictions.includes('ca') || r.jurisdictions.includes(facts.city));
  const courtFlag = facts.court === 'yes';

  const findings = applicable.map<Finding>((rule) => {
    const matched: string[] = [];
    const unresolved: string[] = [];
    let failed = false;
    for (const c of rule.conditions) {
      const v = facts[c.key];
      if (isUnknown(v)) unresolved.push(c.label);
      else if (c.test(v)) matched.push(c.label);
      else failed = true;
    }
    let applicability: Applicability = 'potentially_applicable';
    if (failed) applicability = 'not_applicable';
    else if (unresolved.length === rule.conditions.length) applicability = 'not_enough_information';
    else if (unresolved.length > 0) applicability = 'conditionally_applicable';
    if (courtFlag && applicability !== 'not_applicable') applicability = 'professional_review_required';
    return {
      ruleId: rule.id,
      title: rule.title,
      topic: rule.topic,
      summary: rule.summary,
      applicability,
      matched,
      unresolved,
      exceptions: rule.exceptions,
      followUp: rule.followUp,
      sourceIds: rule.sourceIds,
    };
  });

  const order: Applicability[] = ['professional_review_required', 'potentially_applicable', 'conditionally_applicable', 'not_enough_information', 'not_applicable'];
  return findings.sort((a, b) => order.indexOf(a.applicability) - order.indexOf(b.applicability));
}

export function coverageFor(cityID: string): { verified: boolean; label: string } {
  const city = CITIES.find((c) => c.id === cityID);
  if (!city) return { verified: false, label: 'Outside the cities BridgeRights covers. Local protections have not been checked.' };
  if (city.coverage === 'draft') return { verified: true, label: `${city.name}: state rules plus draft local rules.` };
  return { verified: false, label: `${city.name}: state rules checked. Local rules for this city are not yet verified.` };
}

export const STATUS_LABEL: Record<Applicability, string> = {
  potentially_applicable: 'May apply',
  conditionally_applicable: 'Applies only if',
  not_enough_information: 'Not enough information',
  professional_review_required: 'Needs a professional',
  not_applicable: 'Does not appear to apply',
};
