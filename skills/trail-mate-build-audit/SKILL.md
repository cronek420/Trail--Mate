---
name: trail-mate-build-audit
description: Quality and release-gate skill for Trail-Mate. Use to review planned or implemented Trail-Mate features for functionality, usefulness, mobile UX, safety, data quality, privacy, performance, and MVP scope.
---

# Trail-Mate Build Audit Skill

## Purpose
Prevent Trail-Mate from becoming feature-heavy, unreliable, or unsafe. Run this audit before accepting a feature into a release and after implementation.

## Audit Order
Review in this order:
1. Purpose
2. Correctness
3. Data reliability
4. Safety
5. Mobile usability
6. Offline/degraded behavior
7. Privacy
8. Performance
9. Accessibility
10. Scope and cost

A feature that fails an earlier category should not be rescued by polish later in the list.

## 1. Purpose Gate
Ask:
- What exact hiker problem does this solve?
- Who needs it?
- At what stage: planning, travel-to-trail, on-trail, resupply, emergency, or post-trip?
- Is the problem already solved elsewhere in the product?
- Does it improve the primary Trail-Mate promise?

Result: PASS / REWORK / DEFER / REMOVE

## 2. Functional Correctness
Verify:
- happy path
- blank/missing inputs
- invalid start/end combinations
- reverse direction
- very short trips
- long trips
- changes after a plan is generated
- downstream recalculation
- save/reload
- share/export when applicable

No feature passes based only on UI rendering.

## 3. Data Reliability
For every external data field ask:
- Where does it come from?
- Is the source authoritative?
- How old can it be?
- What happens when it is stale?
- What happens when the source is unavailable?
- Can users distinguish measured facts from estimates?

Reject silent fallback to fabricated values.

## 4. Safety Review
Identify whether incorrect output could cause:
- dehydration
- inadequate food
- route confusion
- missed permits/restrictions
- inability to access help
- false confidence in weather/closure information

Safety-sensitive fields require clear uncertainty/freshness treatment.

Trail-Mate is planning assistance, not emergency response.

## 5. Mobile UX
Test the intended task on a narrow phone viewport.

Verify:
- primary CTA is obvious
- tap targets are usable
- no critical content requires hover
- map controls do not cover key UI
- itinerary is readable without horizontal scrolling
- forms minimize typing
- loading/error states make sense outdoors

## 6. Offline / Degraded Behavior
Classify feature as:
- requires internet
- useful offline
- should cache
- unsafe if stale

For V1, it is acceptable for planning to require internet. On-trail critical saved plan information should eventually be cacheable.

Never silently display stale dynamic information as current.

## 7. Privacy
Review:
- location data
- saved trips
- trusted-contact links
- personally identifying information
- payment data

Use least-privilege collection and sharing.

Location sharing must be opt-in and revocable.

## 8. Performance
Check:
- initial load
- map load
- route computation
- itinerary recalculation
- repeated API calls
- unnecessary AI calls

Prefer local deterministic calculations where practical.

AI should not be called just to format values the application already knows.

## 9. Accessibility
Check:
- text contrast
- map information has textual equivalents
- status is not conveyed only by color
- forms have labels
- keyboard/screen-reader basics on web
- readable type sizes outdoors

## 10. Scope / Cost
Before accepting the feature ask:
- Does V1 need it?
- What API/runtime cost does it add?
- What maintenance obligation does it create?
- What support burden does it add?
- Can a simpler version prove demand?

## Required Release Matrix
Each feature must receive:
- Purpose: PASS/FAIL
- Functional: PASS/FAIL
- Data: PASS/FAIL/N/A
- Safety: PASS/FAIL/N/A
- Mobile: PASS/FAIL
- Offline behavior: DEFINED/UNDEFINED
- Privacy: PASS/FAIL/N/A
- Performance: PASS/FAIL
- Accessibility: PASS/FAIL
- Scope: KEEP/DEFER/REMOVE

## MVP Acceptance Rule
Trail-Mate V1 is ready only when a new user can:
1. choose an AT start/end section;
2. provide basic trip preferences;
3. generate a plan;
4. understand daily mileage and duration;
5. understand estimated calorie/food needs;
6. see practical resupply options;
7. inspect essential known route information;
8. edit the plan and get consistent recalculation;
9. save/share the result;
10. understand which values are estimates or potentially stale.

## Bug Severity
P0 — could materially endanger a user or corrupt core planning data.
P1 — prevents creation/use of a valid trip plan.
P2 — major feature incorrect but workaround exists.
P3 — usability/polish issue.

P0 and P1 block release.
