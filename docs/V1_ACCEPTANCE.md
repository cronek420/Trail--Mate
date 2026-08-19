# Trail-Mate Barebones V1 Acceptance Gate

This gate is intentionally narrow. A feature does not enter V1 merely because it is useful later.

## Purpose

V1 proves one workflow:

**Pick AT start → Pick AT end → choose days → generate a basic daily plan.**

## Must work

- [x] User can choose an ordered start and end point.
- [x] End-point choices are constrained to points after the selected start in V1.
- [x] User can enter trip days, body weight, and pack weight.
- [x] Invalid values are rejected with a visible message.
- [x] Route distance is calculated deterministically from ordered trail mile markers.
- [x] Average daily mileage is calculated deterministically.
- [x] Trip distance is divided into a day-by-day itinerary.
- [x] Calories and food weight are clearly labeled as estimates.
- [x] Prototype trail data is explicitly labeled as demo-only and not safe for navigation.
- [x] Layout collapses for small mobile screens.

## Explicitly not in this prototype

- verified full Appalachian Trail dataset
- GPS navigation
- offline maps
- live weather
- live water-source status
- closures
- permits
- verified shelter/resupply hours
- emergency dispatch or SOS
- user accounts
- saved plans
- sharing/check-ins
- commerce
- AI agent orchestration

## Data safety gate before field use

Before Trail-Mate can be described as field-ready, the demo waypoint array must be replaced by a versioned, source-attributed Appalachian Trail dataset. Every dynamic or safety-sensitive datum must carry source, retrieval/update time, and freshness/confidence rules.

## Next admission order

1. Verified AT route/waypoint data.
2. Elevation-aware daily planning.
3. Resupply candidates.
4. Water/shelter/access data with freshness metadata.
5. Save/share trip plans.
6. Only then evaluate agentic personalization and additional commerce features.
