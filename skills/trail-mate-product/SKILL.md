---
name: trail-mate-product
description: Master product skill for Trail-Mate. Use for any product, UX, roadmap, architecture, monetization, or feature-scope decision involving the Trail-Mate Appalachian Trail planning app and website.
---

# Trail-Mate Product Skill

## Mission
Trail-Mate helps Appalachian Trail hikers turn a desired hike into a practical, understandable, safety-aware plan. The product should reduce planning friction around route sections, daily mileage, food, resupply, shelters, water, road access, bailout options, and trip sharing.

## Core Product Promise
A hiker chooses a start point and end point (or start point plus days/miles), enters a small amount of personal trip information, and receives an editable day-by-day hike plan.

## MVP Rule
Do not build a feature in V1 unless it directly improves one of these core jobs:
1. Define the hike.
2. Estimate duration and daily mileage.
3. Estimate calories and food quantity.
4. Produce a day-by-day itinerary.
5. Identify practical resupply points.
6. Surface core shelters, water, road crossings, and bailout/access points when reliable data exists.
7. Save or share the plan.

Everything else belongs in a later phase unless it is required for correctness, safety, or basic usability.

## Product Positioning
Trail-Mate is primarily a planning and logistics assistant, not an emergency service and not initially a replacement for dedicated offline navigation products.

Primary differentiator:
"Tell Trail-Mate the hike you want to take; Trail-Mate works out the logistics."

## Target User
Design first for a section hiker or multi-day Appalachian Trail hiker using a phone, often with limited planning experience and limited attention while on trail.

The app must remain useful to experienced hikers without forcing beginners to understand trail jargon before they can make a plan.

## UX Principles
- Mobile-first.
- Essential information visible before advanced options.
- Plain-language first; trail-specific detail available on demand.
- Map and itinerary should stay synchronized.
- Every number that can materially affect a trip must show whether it is measured, calculated, estimated, or stale.
- A user should be able to adjust a day or resupply stop and immediately see downstream effects.
- Avoid generic AI/SaaS visual patterns. Trail-Mate should feel like a field tool made for hikers.
- Use domain-specific language and human microcopy.

## Safety Rules
Trail-Mate must not present uncertain information as verified fact.

For safety-sensitive data such as water, closures, weather, trail conditions, permits, emergency access, and business hours:
- show source and/or freshness when available;
- show confidence or uncertainty when appropriate;
- never imply guaranteed availability;
- prefer authoritative or directly maintained data sources;
- preserve a clear boundary between planning assistance and emergency response.

Do not claim a user is safe because of a Trail-Mate recommendation.

## AI Boundary
AI may:
- interpret user intent;
- explain options;
- compare tradeoffs;
- personalize recommendations;
- summarize deterministic calculations and trusted data.

AI must not invent:
- trail mileage;
- elevation;
- shelter locations;
- water availability;
- road crossings;
- resupply locations;
- permit rules;
- emergency resources;
- current closures or conditions.

Those values must come from deterministic calculations or trusted data sources.

## V1 Monetization Boundary
Do not allow monetization to damage the planning workflow.

Allowed later:
- free tier with limited features;
- premium planning features;
- gear/food commerce;
- curated trail boxes;
- affiliate or supplier relationships;
- optional ads in free areas that do not obstruct critical trail/safety information.

Never paywall emergency information required to understand a trip plan.

## Roadmap
### Phase 1 — Barebones Planner
- AT start/end selection
- days or miles-per-day input
- distance/duration calculation
- calorie and food estimate
- daily itinerary
- basic resupply
- shelters/water/access points when trustworthy
- save/share

### Phase 2 — Planning Intelligence
- food/resupply optimization
- pack-weight simulator
- better elevation-aware pacing
- trip condition checks
- trail-data validation
- safety plan export

### Phase 3 — On-Trail Assistance
- offline trip plan
- manual check-ins
- trusted-contact sharing
- weather/closure refresh
- gear recommendations

### Phase 4 — Advanced Ecosystem
- commerce and one-click trail boxes
- satellite-device integrations
- automatic progress sharing
- community reports
- advanced offline navigation if justified

## Feature Admission Test
Before adding any feature, answer:
1. What hiker problem does it solve?
2. Does this problem occur often enough to matter?
3. Can the result be trusted?
4. Does it simplify or complicate the primary planning flow?
5. Can it be deferred without harming V1?
6. Does it introduce safety, privacy, data-freshness, or support obligations?
7. Is there a cheaper/simpler way to prove demand first?

If the answers are weak, defer the feature.
