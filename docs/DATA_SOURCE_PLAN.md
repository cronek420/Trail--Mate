# Trail-Mate Data Source Plan

## Purpose

This document controls how Trail-Mate chooses, validates, stores, attributes, and refreshes trail data. It exists to prevent prototype/demo values from quietly becoming production facts.

## Source hierarchy

### 1. Trail geometry: National Park Service public GIS

Leading candidate: the NPS public trails geographic FeatureServer / GIS datasets.

Use it for trail geometry only after we confirm:
- the Appalachian Trail records can be isolated reliably;
- geometry is sufficiently current and complete for the product use case;
- metadata/attribution requirements are captured in the repo and product;
- a repeatable import/update process is documented;
- mile calculations derived from geometry are tested against trusted reference points.

Do not copy prototype mile markers into production merely because they look plausible.

### 2. Appalachian Trail Conservancy + NPS interactive map: validation/reference

Use the official ATC/NPS interactive map as an important reference for trailheads, shelters, campsites, mile markers, and planning cross-checks.

Important limitation: the official map is described as a general-reference resource and warns that mileage can differ from guidebooks/maps and that conditions can change. Trail-Mate must preserve that uncertainty rather than presenting the map as emergency-grade navigation truth.

Before consuming any underlying ArcGIS service directly, verify access terms, attribution, permitted use, update behavior, and field definitions.

### 3. Dynamic/safety-sensitive data

Closures, conditions, water status, weather, operating hours, emergency resources, and similar time-sensitive data require separate source contracts and freshness rules. They must not be inferred from static geometry.

Every dynamic record should eventually carry:
- source;
- source URL or source identifier;
- fetched/verified timestamp;
- expected refresh interval;
- confidence/status;
- stale-data behavior.

## V1 data model direction

Keep imported source records separate from derived planner values.

Suggested layers:

1. `source_trail_geometry`
   - source id
   - source name
   - geometry
   - source updated date when available
   - imported timestamp
   - attribution

2. `trail_points`
   - stable internal id
   - source id
   - name
   - type
   - latitude/longitude
   - source trail measure or derived mile
   - source metadata

3. `planner_derived`
   - calculated route distance
   - calculated daily segments
   - calorie/food estimates
   - calculation version

The planner should never overwrite raw source data with calculated values.

## Validation before replacing demo data

A production import is not accepted until:

- [ ] authoritative source identified and documented
- [ ] source terms/attribution reviewed
- [ ] Appalachian Trail geometry isolated correctly
- [ ] northbound ordering is deterministic
- [ ] start/end selections map to real trail positions
- [ ] route distance is calculated from the selected trail path, not road distance
- [ ] known reference segments are compared against official/recognized references
- [ ] import handles geometry changes without silently corrupting saved plans
- [ ] data freshness is visible in metadata
- [ ] demo-data warning remains until all above gates pass

## Current decision

**Do not integrate live trail data yet.**

First pass CI and planner behavior tests. Once the V1 code is green, implement a small NPS-backed proof using one Georgia section, compare it against official ATC/NPS reference information, and only then expand coverage.

## Expansion order

1. verified trail centerline / geometry
2. trailheads and road crossings
3. shelters and campsites
4. resupply/town access points
5. water sources with freshness model
6. closures and trail updates
7. emergency/support resources
8. weather/conditions

This order keeps Trail-Mate useful while avoiding false confidence from stale safety-sensitive data.
