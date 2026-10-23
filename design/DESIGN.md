# BridgeRights — design plan

**Subject:** a tenant-displacement guide for Santa Clara County renters. **Who:** a renter who just got a scary letter, often on a phone at night, anxious, sometimes with limited English. **Core action:** answer a short guided questionnaire (with "I don't know" always allowed), read source-backed findings, then work a checklist. **Moment of use:** quiet, stressed, one hand — calm contrast, large type, no jargon.

## Three directions
1. *Courthouse formal* — navy + gold, serif everywhere. Reads as intimidating.
2. *Friendly social-services* — bright coral/yellow, rounded. Reads as non-serious for a legal topic.
3. **Civic blueprint (chosen)** — cool paper, ink navy, a bridge-steel teal accent, and amber reserved for deadlines. Serif (Georgia/New York voice) for headlines only, system sans for reading. Chosen because it feels trustworthy without being cold, and amber only ever means "a date matters".

## Palette (tokens in src/global.css)
- Paper `#F3F6F8` → background (dark: Night span `#101A2B`)
- Ink `#142033` → foreground
- Span teal `#1F7A8C` → accent (dark `#58C1D3`)
- Deadline amber `#E9A23B` → warning
- Verified green `#2E8B6A` → success

## Type
Serif headlines (large, tight) for the thesis and screen titles; SF Pro for body; statuses in small semibold caps-free labels.

## Shell
```
[ Home ] [ Cases ] [ Help ]   ← native tab bar (glass on iOS)
```
Pushed screens (the questionnaire, a case) hide the bar and draw their own back chevron.

## Screens
Home: serif headline "Understand my housing situation", a bridge-span graphic, Start / Resume buttons, coverage card (which cities have checked rules), plain disclaimer.
Questionnaire: one question group per step, progress span on top, every question has "I don't know".
Case: title + span progress, segmented Rights / Notice / Plan. Rights lists findings with careful statuses and sources; Notice is a field-by-field check; Plan is the task checklist, dates with their calculation, and the shareable summary.

## Signature moment
**The span.** A row of piers, one per task. Completing a task fills its pier teal with a timed tween and a success haptic; finishing the last one fires a single celebration haptic and "Span complete".

## Unmistakable because
Nothing claims certainty: statuses are "may apply / only if / not enough information / needs a professional", amber is only for dates, and every finding points at an official source.

## Dials
variance low, motion standard, density cozy.
