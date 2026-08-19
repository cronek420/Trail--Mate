---
name: trail-plan-engine
description: Planning and calculation skill for Trail-Mate. Use when designing or implementing route, pace, calorie, food, itinerary, resupply, shelter, water, and access-point logic for an Appalachian Trail trip.
---

# Trail Plan Engine Skill

## Purpose
Convert a user's intended Appalachian Trail trip into structured, reproducible planning outputs. Prefer deterministic functions and trusted data over model inference.

## Minimum Inputs
Required:
- start point
- end point OR target duration OR target mileage
- trip date or approximate season when conditions matter

Recommended:
- body weight
- pack weight
- experience level
- expected miles/day
- dietary preferences
- cooking method

Do not block the user when optional inputs are missing. Use clearly labeled defaults and ranges.

## Core Outputs
Return a structured trip plan containing:
- route segment
- total trail mileage
- estimated duration
- daily mileage targets
- elevation context when available
- daily calorie estimate range
- total calorie estimate
- estimated food weight range
- day-by-day itinerary
- candidate resupply points
- shelters/campsites when reliable
- water sources with freshness/uncertainty when available
- road crossings and bailout/access points when reliable
- warnings and unresolved data gaps

## Deterministic First
Use deterministic code/tools for:
- trail-distance calculations
- elevation gain/loss aggregation
- duration calculations
- calorie formulas
- food-weight conversions
- waypoint ordering
- distance-to-resupply calculations
- schedule dates

Use the AI layer only to interpret preferences, explain results, rank options using known values, or propose reasonable tradeoffs.

## Route Rules
- Route only along the Appalachian Trail dataset for AT planning.
- Never use generic walking directions as the authoritative trail route.
- Preserve direction of travel.
- Every waypoint should have a trail-mile position or equivalent distance-along-route representation.

## Pace Model
V1 should use a simple, explainable pace model rather than pretending to be physiologically exact.

Inputs may include:
- user-selected miles/day
- experience level
- elevation gain/loss
- pack weight
- trip length

Return a range and clearly indicate when the value is an estimate.

Do not overfit the first version. A transparent 10–15% uncertainty band is preferable to false precision.

## Calorie Model
V1 goal: produce a useful planning range, not a medical prescription.

Use body weight, pack weight, hiking duration/distance, terrain/elevation, and trip duration where available.

Output:
- estimated calories/day range
- estimated trip calories
- optional target calorie density for food planning

Always label calorie outputs as estimates.

## Food Weight Model
Convert target calories into food-weight estimates using configurable calorie-density assumptions.

Example logic:
food_weight_oz = total_calories / calories_per_ounce

Support profiles later such as:
- budget
- lightweight
- high protein
- no cook
- vegetarian
- custom

V1 only needs a sensible default plus editable calorie-density assumptions.

## Day-by-Day Itinerary
Split the route into reasonable daily sections using:
- target daily mileage
- elevation difficulty where known
- shelters/campsites
- water availability
- road crossings
- resupply locations

Do not force identical daily mileage. Prefer practical stopping points.

Every daily segment should be editable, with downstream recalculation.

## Resupply Logic
For each candidate resupply point, track when available:
- trail mile
- off-trail distance
- expected arrival day/date
- next-resupply distance
- grocery/outfitter/package options
- operating constraints
- freshness of business/post-office information

V1 should rank a small number of practical candidates rather than listing everything.

## Water and Shelter Rules
Treat these as data-sensitive.

For water:
- distinguish source existence from current flow;
- show freshness when known;
- never state availability as guaranteed unless a reliable source supports it.

For shelters/campsites:
- distinguish official/known locations from user-reported or uncertain locations;
- surface restrictions/permits only from trusted sources.

## Bailout and Access Logic
When data exists, identify road crossings and likely access points useful for changing or ending a trip.

Never label a point as an emergency evacuation route unless verified as such.

## Recalculation Contract
If the user changes:
- start/end point
- number of days
- daily mileage
- resupply stop
- calorie target
- food density

recalculate all dependent outputs rather than patching text manually.

## Data Provenance
Every structured datum should support metadata where relevant:
- source
- fetched_at / updated_at
- confidence
- authoritative flag

## Failure Behavior
When data is missing:
- say what is missing;
- continue with the parts that can be calculated;
- label assumptions;
- never fill unknown trail facts with model-generated guesses.
