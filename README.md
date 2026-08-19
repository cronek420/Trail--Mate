# Trail-Mate

Trail-Mate is an Appalachian Trail planning and logistics project focused on helping hikers turn a desired route into a practical, understandable, safety-aware trip plan.

## Initial architecture

The project starts deliberately small:

- one Trail-Mate Planner Agent;
- deterministic tools for route, mileage, pace, calories, food, and itinerary calculations;
- reusable project skills that control product scope, planning logic, and release quality.

## Starter skills

- `skills/trail-mate-product/SKILL.md` — product mission, MVP scope, UX rules, safety boundaries, roadmap, and feature admission criteria.
- `skills/trail-plan-engine/SKILL.md` — deterministic planning contract for route, pace, calories, food, itinerary, resupply, water, shelters, and access points.
- `skills/trail-mate-build-audit/SKILL.md` — release gate covering purpose, correctness, data quality, safety, mobile UX, offline behavior, privacy, performance, accessibility, and scope.

## Barebones V1 build order

1. Appalachian Trail route/waypoint data model
2. Start/end selector
3. Route distance calculation
4. Days / miles-per-day controls
5. Basic itinerary generator
6. Calorie + food-weight estimates
7. Basic resupply candidates
8. Essential shelter/water/access display
9. Save/share plan
10. Run the build-audit matrix against the complete flow

The first product goal is simple: **Pick AT Start → Pick AT End → Choose Days → Generate Daily Plan.**
