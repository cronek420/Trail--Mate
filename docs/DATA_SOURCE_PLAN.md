# Trail-Mate Data Source Plan

## Purpose

This document controls how Trail-Mate chooses, validates, stores, attributes, and refreshes trail data. It exists to prevent prototype/demo values from quietly becoming production facts.

## Current status

**V1 code gate: PASSED.** GitHub Actions completes dependency installation, planner behavior tests, and the production Next.js build successfully.

**Current milestone:** prove and package one verified Appalachian Trail data slice in Georgia before replacing demo values.

## Source decision

### Primary route geometry: official ANST A.T. Treadway

Primary route-shape source for Trail-Mate planning: the Appalachian National Scenic Trail `ANST_Facilities` FeatureServer, layer 7 (`A.T. Treadway`), published by the National Park Service Appalachian National Scenic Trail and Appalachian Trail Conservancy.

Why this layer is preferred for planner route shape:
- it is A.T.-specific rather than a nationwide generic trail inventory;
- it spans the footpath from Georgia to Maine;
- it provides one published treadway feature per trail-club section, including `GATC AT Treadway` for Georgia;
- the Georgia treadway is a single contiguous LineString from Springer Mountain to the Georgia/North Carolina boundary;
- it is specifically intended to depict A.T. features/facilities for maps and planning.

Trail-Mate must retain source URL, publisher attribution, source/version fields, fetched timestamp, and validation metadata with every imported release.

### Detailed geometry/reference: ANST_Centerline

Use the ANST-specific `ANST_Centerline` FeatureServer as a detailed validation/reference source and for future fine-grained route processing.

The service currently requires pagination: a single query stops at 2,000 features while the full official route contains 3,025 features. The repository probe therefore pages deterministically by OBJECTID and validates full Georgia-to-Maine extent.

For Georgia (`Acronym = GATC`) the current probe found 108 official centerline segments. Its length fields demonstrate why geometry length and official hiking mileage must remain separate concepts:
- GIS `Length_Ft` aggregate: 76.212 mi
- GNSS length aggregate: 80.717 mi
- GNSS 3D length aggregate: 83.392 mi
- current ATC published Georgia A.T. mileage: 78.3 mi

None of these GIS length fields will be silently substituted for official trail mileage.

### Official trail-mile measure: ATC annual mileage/reference data

ATC's annually published trail mileage is the product's authoritative hiker-facing trail-mile reference where an official value is available.

Known 2026 validation references:
- full A.T.: 2,197.9 miles;
- Georgia: 78.3 A.T. miles;
- Springer Mountain: southern terminus.

Trail-Mate will model route geometry and official trail measure separately. Geometry answers **where the trail goes**. Official trail measure answers **what mile a hiker is at**. Derived geometric distance may be shown for diagnostics but must not overwrite the official measure.

### Rejected as full-route source: generic NPS Public Trails

The nationwide NPS Public Trails dataset remains useful as a public GIS reference, but it is **not accepted as Trail-Mate's full A.T. centerline source**.

Repository probes established:
- filtering `UNITCODE='APPA'` returned only 20 short features concentrated around the Harpers Ferry area;
- querying the generic dataset by exact trail name returned 80 features but only extended south to roughly 35.45° N, excluding Georgia;
- therefore the dataset fails the full A.T./Georgia coverage gate for this use case.

Keep the probe as a regression/reference tool, but do not build Trail-Mate route mileage from it.

## Source hierarchy

1. **Route shape:** ANST Facilities → A.T. Treadway.
2. **Detailed centerline validation:** ANST_Centerline.
3. **Official trail mileage:** current ATC published mileage/reference information.
4. **Facilities:** ANST Facilities layers for shelters, campsites, parking, privies, vistas and side trails after each layer passes its own validation gate.
5. **Dynamic safety data:** official ATC/NPS/agency sources with explicit freshness rules.

## Dynamic/safety-sensitive data

Closures, conditions, water status, weather, operating hours, emergency resources, and similar time-sensitive data require separate source contracts and freshness rules. They must not be inferred from static geometry.

Every dynamic record should eventually carry:
- source;
- source URL or stable source identifier;
- fetched/verified timestamp;
- expected refresh interval;
- confidence/status;
- stale-data behavior.

## V1 data model

Keep imported facts separate from derived planner values.

### `source_trail_geometry`
- source id
- publisher
- source URL/layer id
- source feature id
- geometry
- source version/edit date when available
- imported timestamp
- attribution

### `trail_measure`
- route release/version
- official reference year
- start anchor
- end anchor
- official mile values/reference source
- mapping method from geometry position to official trail measure

### `trail_points`
- stable internal id
- source id
- name
- type
- latitude/longitude
- official/derived trail measure with type clearly identified
- source metadata

### `planner_derived`
- selected route distance/measure
- calculated daily segments
- calorie/food estimates
- calculation version

The planner never overwrites raw source records with calculated values.

## Georgia proof-of-data sequence

1. **PASSED:** identify A.T.-specific authoritative geometry source.
2. **PASSED:** confirm official treadway spans Georgia to Maine.
3. **PASSED:** isolate `GATC AT Treadway` from Springer Mountain to the GA/NC boundary.
4. **PASSED:** independently validate detailed Georgia coverage using 108 `GATC` ANST_Centerline features.
5. **PASSED:** document that GIS length metrics differ materially from official hiking mileage and must remain separate.
6. Build a reproducible Georgia import artifact from the official treadway feature.
7. Store source metadata, attribution, source version/edit date and fetch timestamp beside the artifact.
8. Anchor Springer Mountain and the GA/NC boundary deterministically.
9. Add the 2026 Georgia 78.3-mile official reference as a separate trail-measure record, not a geometry rewrite.
10. Validate recognizable intermediate facilities/locations against authoritative layers.
11. Add an import/version identifier so future geometry changes cannot silently alter saved trips.
12. Only then wire the verified Georgia data behind the planner.
13. Keep the UI's non-navigation warning until the full V1 field-use audit passes.

## Validation before replacing demo data

- [x] authoritative A.T.-specific geometry source identified
- [x] V1 planner tests and production build passing in CI
- [x] generic NPS Public Trails evaluated and rejected as incomplete for full A.T. geometry
- [x] full A.T. treadway extent validated
- [x] Georgia treadway isolated
- [x] detailed centerline independently confirms Georgia coverage
- [x] official-vs-geometric mileage distinction documented
- [ ] shipped-use attribution text recorded in product/release metadata
- [ ] reproducible Georgia import artifact generated and versioned
- [ ] Springer and GA/NC boundary anchors validated/stored
- [ ] official 2026 Georgia trail measure stored separately
- [ ] intermediate Georgia locations validated against official facility/reference data
- [ ] import versioning protects existing saved plans from silent route changes
- [ ] data freshness visible in product metadata
- [ ] planner switched from demo data to verified Georgia release
- [ ] build-audit gate passes after the data switch

## Decision rule

**No demo value is replaced merely because a GIS request returns data.** Geometry, official mileage, facilities, and dynamic conditions are separate data classes with separate provenance and validation requirements.

## Expansion order

1. verified Georgia geometry + official trail measure
2. Georgia trailheads/road crossings/parking
3. Georgia shelters and campsites
4. expand verified route geometry state-by-state
5. resupply/town access points
6. water sources with freshness model
7. closures and trail updates
8. emergency/support resources
9. weather/conditions

This order keeps Trail-Mate useful without creating false confidence from incomplete or stale data.
