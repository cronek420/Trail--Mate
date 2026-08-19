# Trail-Mate Data Source Plan

## Purpose

This document controls how Trail-Mate chooses, validates, stores, attributes, and refreshes trail data. It exists to prevent prototype/demo values from quietly becoming production facts.

## Current status

**V1 code gate: PASSED.** GitHub Actions now completes dependency installation, planner behavior tests, and the production Next.js build successfully.

**Current milestone:** prove one verified Appalachian Trail data slice in Georgia before replacing any demo values.

## Source hierarchy

### 1. Trail geometry: National Park Service public GIS

Primary candidate: the NPS `NPS_Public_Trails` FeatureServer.

Official NPS metadata states that this public dataset:
- represents publicly accessible visitor-use trails across NPS units;
- is derived from the authoritative internal NPS Trails dataset;
- is contributed/reviewed by park units and regional GIS programs;
- is intended for public uses including digital maps, trip-planning applications, recreation tools, research, and cartographic products;
- supports GeoJSON queries;
- exposes useful source metadata including trail name, unit code, edit/source dates, originator, map source, accuracy information, public/open status, and stable feature identifiers.

The Appalachian Trail proof should attempt to isolate `UNITCODE = APPA` records and then verify names, continuity, geometry, and source metadata before use.

Use NPS geometry only after we confirm:
- Appalachian Trail records can be isolated reliably;
- geometry is sufficiently current and complete for the product use case;
- metadata/attribution requirements are captured in the repo and product;
- a repeatable import/update process is documented;
- mile calculations derived from geometry are tested against trusted reference points.

Do not copy prototype mile markers into production merely because they look plausible.

### 2. Appalachian Trail Conservancy + NPS APPA map: validation/reference

Use official ATC and NPS Appalachian Trail information as the cross-check layer for total mileage, named places, trailheads, shelters, campsites, and planning references.

Known 2026 reference facts useful for validation:
- ATC lists the official 2026 A.T. length as **2,197.9 miles** and notes that official mileage can change because of relocations, measurement improvements, detours, and trail changes.
- ATC's Georgia page lists **78.3 A.T. miles in Georgia** and **12 shelters**.
- Springer Mountain is the southern terminus; ATC's Springer hike page describes the summit as approximately 1.0 mile southbound from the nearby FS 42 parking crossing.
- NPS describes its APPA interactive webapp as a general-reference tool showing the treadway plus features such as side trails, parking, shelters, campsites, privies, vistas, and trail-club sections.

These values are cross-checks, not substitutes for a measured imported centerline.

Before consuming any underlying ArcGIS service directly beyond the public NPS Trails service, verify access terms, attribution, permitted use, update behavior, and field definitions.

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

## Georgia proof-of-data sequence

Do this in order and stop on a failed gate:

1. Query NPS Public Trails for APPA records and retain source metadata.
2. Confirm the returned geometry contains the Georgia Appalachian Trail section.
3. Transform geometry into a consistent coordinate system suitable for distance calculations.
4. Determine northbound line ordering without relying on array order from the source.
5. Locate Springer Mountain as the starting anchor.
6. Locate the Georgia/North Carolina boundary as the end validation anchor.
7. Compute Georgia centerline length from the imported geometry.
8. Compare the result with ATC's 78.3-mile Georgia reference; document expected measurement tolerance and investigate material discrepancies.
9. Test recognizable intermediate locations such as Three Forks, Woody Gap, and Blood Mountain where reliable references are available.
10. Save the proof as a versioned fixture/import artifact with source timestamps and attribution.
11. Only after those checks pass, replace the current demo geometry/mileage layer.
12. Keep the UI's prototype warning until the first real-data release passes the full build-audit gate.

## Validation before replacing demo data

A production import is not accepted until:

- [x] authoritative leading source identified and documented
- [x] V1 planner tests and production build passing in CI
- [ ] source terms/attribution reviewed and recorded for shipped use
- [ ] Appalachian Trail geometry isolated correctly
- [ ] Georgia subsection isolated correctly
- [ ] northbound ordering is deterministic
- [ ] start/end selections map to real trail positions
- [ ] route distance is calculated from the selected trail path, not road distance
- [ ] Georgia length compared against the official 78.3-mile reference
- [ ] known reference segments compared against official/recognized references
- [ ] import handles geometry changes without silently corrupting saved plans
- [ ] data freshness is visible in metadata
- [ ] demo-data warning remains until all above gates pass

## Decision rule

**No demo values are replaced simply because a GIS request returns data.** A source must pass geometry, ordering, mileage, provenance, freshness, and attribution checks first.

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
