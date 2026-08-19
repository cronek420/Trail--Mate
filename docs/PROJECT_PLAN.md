# Trail-Mate Master Project Plan

## North Star

Trail-Mate exists to turn a hiker's intended Appalachian Trail trip into a practical, understandable, safety-aware plan.

The product should answer one core question better than anything else:

> "Given where I want to start, where I want to finish, and the time I have, what should my hike realistically look like?"

Trail-Mate is primarily a planning, logistics, food, resupply, preparedness, and support product. It should not try to become a full navigation replacement before those jobs are excellent.

---

## Product Principles

1. **Useful before impressive.** Core planning must work before advanced AI, animation, commerce, or social features are added.
2. **Deterministic where facts matter.** Mileage, itinerary math, calories, food weight, route order, and similar calculations should come from code and validated data, not model improvisation.
3. **AI explains; tools calculate.** AI can interpret preferences, explain tradeoffs, personalize recommendations, and help modify plans. It should not invent trail facts.
4. **Safety data must show confidence and freshness.** Water, closures, emergency access, weather, and other safety-sensitive information must never be presented with false certainty.
5. **Mobile first.** Most hikers will eventually use Trail-Mate from a phone, sometimes with weak connectivity.
6. **Offline is a requirement for mature on-trail features.** Do not claim reliable trail use for features that disappear without service.
7. **Every feature must earn its complexity.** If it does not make planning, carrying, resupplying, preparing, or staying safer noticeably easier, postpone it.
8. **No fake coverage.** Demo data must always be labeled demo data. Field-ready claims require verified source-attributed data.

---

## Current Build Stage

### Phase 0 — Foundation

Status: **COMPLETE / IN REPO**

- Trail-Mate repository created.
- Product skill added.
- Trail planning engine skill added.
- Build/audit skill added.
- Barebones planner branch created.
- V1 acceptance criteria documented.

### Phase 1 — Barebones Planner

Status: **IN PROGRESS**

Current target flow:

**Choose Start → Choose End → Set Days → Generate Daily Plan**

Current prototype includes:

- ordered sample trail points;
- start/end selection;
- day count;
- route distance from mile markers;
- average daily mileage;
- deterministic calorie estimate;
- deterministic food-weight estimate;
- generated day-by-day itinerary;
- mobile-first UI;
- explicit demo-data warning.

### Phase 1 Exit Criteria

Do not move on until all are true:

- [ ] Application installs and builds successfully.
- [ ] Planner renders without runtime or console errors.
- [ ] Invalid start/end combinations cannot generate a plan.
- [ ] Day count validation works.
- [ ] Distance calculation is deterministic and tested.
- [ ] Daily itinerary totals reconcile with total route distance.
- [ ] Calorie and food-weight formulas have documented assumptions.
- [ ] Mobile layout is usable at common phone widths.
- [ ] Demo data is visibly labeled non-navigation data.
- [ ] Core workflow can be completed without explanation from the developer.

---

## Phase 2 — Verified Appalachian Trail Data

This is the highest-priority upgrade after the V1 shell builds correctly.

### Goal

Replace prototype trail points with a verified, source-attributed Appalachian Trail dataset.

### Required data model

Each trail point should support, where applicable:

- stable ID;
- name;
- trail mile / route position;
- latitude and longitude;
- point type;
- state / region;
- elevation;
- source;
- source timestamp or dataset version;
- verification status;
- last updated date.

### Initial point types

Prioritize:

1. major trailheads / access points;
2. shelters;
3. road crossings;
4. towns / resupply access;
5. water sources only when sufficiently reliable and sourceable;
6. emergency / bailout access.

### Rules

- Never silently mix verified and estimated data.
- Record source provenance.
- Preserve dataset version information.
- Add a validation script or test that catches broken ordering, duplicate IDs, impossible mile markers, missing coordinates, and malformed records.

### Phase 2 Exit Criteria

- [ ] Verified dataset source selected.
- [ ] Licensing / usage terms confirmed.
- [ ] Data importer created.
- [ ] Provenance stored with imported data.
- [ ] Trail ordering validated.
- [ ] Core planner works against real data.
- [ ] Representative routes manually checked against source information.

---

## Phase 3 — Better Itinerary Engine

### Goal

Stop treating every hiking day as identical.

Add:

- terrain/elevation consideration;
- user pace profile;
- shorter first/last days;
- optional maximum daily mileage;
- sensible overnight stopping choices;
- shelter/camp proximity;
- editable days;
- downstream recalculation when a day changes.

### Important behavior

If the user changes Day 3, Trail-Mate should recalculate Days 4+ instead of forcing the user to rebuild the trip.

### Phase 3 Exit Criteria

- [ ] Itinerary respects route order.
- [ ] Itinerary does not suggest impossible overnight locations.
- [ ] Editing one day produces predictable downstream updates.
- [ ] User can see why a daily target was recommended.

---

## Phase 4 — Food and Calorie Planner

### Goal

Turn energy estimates into an actual food plan.

Build in this order:

1. calorie estimate range;
2. target calories/day;
3. calorie-density target;
4. expected food weight;
5. meal/snack allocation;
6. dietary preferences;
7. shopping/packing list;
8. resupply segmentation.

### User modes planned later

- inexpensive;
- lightweight;
- high protein;
- no-cook;
- vegetarian;
- low sugar;
- comfort food;
- build my own.

### Rules

- Show estimates as estimates.
- Document formula assumptions.
- Allow users to override defaults.
- Avoid presenting nutritional estimates as medical advice.

---

## Phase 5 — Resupply Planner

### Goal

Tell hikers where carrying less food is worth the detour or logistics.

For each candidate, eventually consider:

- trail mile;
- distance from trail;
- expected arrival day;
- store availability;
- outfitter availability;
- post office / package options;
- opening hours where current data exists;
- transportation needs;
- miles to next resupply;
- estimated pack-weight savings.

### Signature output

Trail-Mate should be able to explain recommendations such as:

> "Resupplying here reduces your starting food carry by approximately X lb while adding only Y miles / Z logistics."

This is more valuable than merely showing points of interest.

---

## Phase 6 — Save, Share, and Trail Contact

### Initial version

- save trip;
- generate shareable trip view;
- print/export essential itinerary;
- designate a trusted Trail Contact;
- manual check-ins.

### Later

- missed check-in workflow;
- optional location sharing;
- Garmin/inReach or satellite integrations where feasible.

### Safety rule

Trail-Mate must never imply that a check-in or location-sharing feature is an emergency-response service unless a real supported service exists behind it.

---

## Phase 7 — Offline Trail Pack

When the core product is mature, allow the hiker to download a trip package containing:

- itinerary;
- route section data;
- shelters;
- access/bailout points;
- resupply plan;
- food plan;
- saved emergency contacts;
- critical notes;
- last synchronized conditions and timestamps.

Offline information must clearly show the time it was last synchronized.

---

## Phase 8 — Conditions and Safety Intelligence

Only add this after the underlying data pipeline can support freshness and confidence.

Potential inputs:

- weather;
- closures;
- park alerts;
- seasonal restrictions;
- permit requirements;
- water reports;
- fire / severe weather alerts where applicable.

### Mandatory display concepts

Safety-sensitive records should support labels such as:

- verified / reported / estimated;
- last checked;
- source;
- confidence;
- stale warning.

Do not reduce uncertain information to a green checkmark.

---

## Phase 9 — Gear Advisor

Gear recommendations should be contextual rather than a generic shopping catalog.

Inputs can eventually include:

- route;
- season;
- elevation;
- weather range;
- trip duration;
- shelter strategy;
- experience level;
- current gear list.

Output should explain **why** an item matters before showing purchase options.

---

## Phase 10 — Commerce

Commerce comes after useful planning.

Potential models:

- food bundles;
- custom resupply boxes;
- trail-specific gear recommendations;
- affiliate products;
- dropship hiking/camping supplies;
- one-click planned-trip supply package.

### Rule

The planner must remain useful when the user buys nothing.

Recommendations must not be distorted simply because a product generates revenue.

---

## Phase 11 — Premium / Monetization

Possible structure later:

### Free

- basic route planning;
- basic daily itinerary;
- limited saved trips;
- lightweight ads where appropriate.

### Paid

Possible premium value:

- advanced food/resupply optimization;
- offline trip packs;
- multiple saved trips;
- Trail Contact / check-in tools;
- advanced pack-weight simulator;
- current-condition overlays;
- premium exports;
- deeper personalization.

Do not lock core safety information behind a premium tier if doing so would create a foreseeable safety problem.

---

## AI / Agent Architecture

### Start with one agent

Use one **Trail-Mate Planner Agent** until real complexity justifies specialists.

Its job is to:

- understand what the hiker is trying to do;
- turn conversational input into structured planner inputs;
- call deterministic tools;
- explain results;
- compare alternatives;
- help modify the plan.

### Deterministic tools

Keep these as code/services rather than freeform model reasoning:

- route ordering;
- mileage;
- itinerary splitting;
- calorie calculations;
- food-weight calculations;
- resupply optimization;
- data validation;
- freshness/confidence rules.

### Future specialist agents only when warranted

Possible later specialists:

- Food/Resupply Agent;
- Conditions/Safety Agent;
- Gear Agent;
- Trail Contact Agent.

Do not add an agent merely because a feature has a name.

---

## Planned Skill Growth

Current skills:

- `trail-mate-product`
- `trail-plan-engine`
- `trail-mate-build-audit`

Add specialist skills only when those phases begin:

### Next

- `trail-data-validation`
- `trail-food-resupply`
- `trail-safety`

### Later

- `trail-offline`
- `trail-contact-sharing`
- `trail-commerce`
- `trail-weather`
- `trail-gear-advisor`
- `trail-community`
- `trail-navigation`
- `trail-satellite-integrations`

---

## Feature Admission Test

Before implementing any new feature, answer all of these:

1. What hiker problem does it solve?
2. Does it improve the core planning or on-trail support workflow?
3. Does another planned feature need to exist first?
4. What data does it require?
5. Is that data reliable and legally usable?
6. Is any part safety-sensitive?
7. What happens if its data is wrong or stale?
8. Does it work well on a phone?
9. Does it need offline behavior?
10. Can it be tested deterministically?
11. Does adding it make the product easier or harder to understand?
12. Is it needed now, or is it attractive scope creep?

If the answers are weak, place the feature in the backlog rather than building it.

---

## Explicitly Do Not Build Yet

Until the corresponding foundations exist, postpone:

- full turn-by-turn navigation;
- crowdsourced live water reporting;
- emergency dispatch claims;
- continuous background location tracking;
- satellite integrations;
- complex social/community feeds;
- marketplace features;
- one-click physical fulfillment;
- large multi-agent orchestration;
- gamification;
- badges/leaderboards;
- elaborate animation that competes with planning;
- national/international trail expansion.

These may become valuable later, but they are not allowed to distract Phase 1–3.

---

## Product UX Vision

Trail-Mate should feel like a capable trail partner, not an enterprise dashboard.

### Primary home action

**Plan a Hike**

### Core flow

**Where are you starting?**

→ **Where are you finishing?**

→ **How much time do you have?**

→ **Tell us a little about your pace/pack**

→ **Your Trail Plan**

The generated plan should immediately expose the most useful answers:

- distance;
- days;
- daily mileage;
- calorie requirement;
- food weight;
- likely overnight targets;
- resupply opportunities;
- important warnings.

Advanced controls should remain secondary until needed.

---

## Definition of "Field Ready"

Trail-Mate is not field-ready merely because the web app runs.

A feature can be labeled field-ready only when:

- underlying data is verified and sourced;
- freshness requirements are defined;
- important failure modes are tested;
- offline behavior is understood where applicable;
- estimates are labeled;
- safety-sensitive uncertainty is visible;
- mobile use is tested;
- the relevant build-audit checks pass.

---

## Development Discipline

For each phase:

1. inspect current repo and project plan;
2. identify the smallest useful increment;
3. build it on a branch;
4. test deterministic logic;
5. run the Trail-Mate build-audit skill;
6. document unresolved risks;
7. merge only when the phase's acceptance criteria pass;
8. update this plan with the new project state;
9. then choose the next phase.

This file is the default source of truth for scope and order. When a new idea conflicts with it, consciously update the plan rather than silently drifting away from the product vision.

---

## Immediate Next Actions

1. Run the barebones V1 application build.
2. Fix all compile/runtime issues.
3. Run the core planner manually on desktop and phone-size layouts.
4. Add automated tests for planner calculations and invalid inputs.
5. Select a verified Appalachian Trail dataset and confirm its permitted usage.
6. Build the trail-data import/validation layer.
7. Replace prototype points with the first verified real-data slice.
8. Re-run the V1 audit.
9. Only then begin the smarter itinerary phase.

## Current Focus

> **Do not expand the feature set yet. Make Start → End → Days → Daily Plan trustworthy first.**
