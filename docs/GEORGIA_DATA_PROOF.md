# Trail-Mate Georgia Data Proof

## Status

**Milestone status: geometry/facility proof passed; planner integration not yet approved for field use.**

This document records the evidence behind Trail-Mate's first verified Appalachian Trail data slice so future development does not have to reconstruct the source investigation.

Proof date: 2026-08-19

## Authoritative sources selected

### Route shape

**ANST Facilities — A.T. Treadway, layer 7**

Publisher/attribution: National Park Service Appalachian National Scenic Trail & Appalachian Trail Conservancy.

Georgia feature: `GATC AT Treadway`, OBJECTID 5, status `Official A.T. Route`.

Source URL:
`https://services1.arcgis.com/fBc8EJBxQRMcHlei/arcgis/rest/services/ANST_Facilities/FeatureServer/7`

### Detailed geometry validation

**ANST_Centerline, layer 0**

Source URL:
`https://services1.arcgis.com/fBc8EJBxQRMcHlei/arcgis/rest/services/ANST_Centerline/FeatureServer/0`

The full service requires pagination. Trail-Mate's probe retrieves 3,025 official route features across two pages and validates Georgia-to-Maine extent.

### Official hiker-facing state mileage

**Appalachian Trail Conservancy Georgia reference:** 78.3 A.T. miles in Georgia for the current 2026 planning reference.

Source URL:
`https://appalachiantrail.org/experience/hike-the-trail/explore-by-state/georgia/`

Official mileage is intentionally stored separately from GIS geometry length.

## Rejected source for full A.T. geometry

The generic NPS Public Trails dataset was tested and rejected as Trail-Mate's full A.T. route source.

Evidence:
- `UNITCODE='APPA'` returned only 20 short features concentrated around Harpers Ferry.
- exact trail-name querying returned 80 features but only extended south to roughly 35.45° N, excluding Georgia.

The dataset remains a reference source, but it fails Trail-Mate's full-route coverage requirement.

## Georgia route proof

Reproducible script: `scripts/build-georgia-route.mjs`

Release identifier produced by the current source feature and 2026 measure reference:
`ga-2026-anst-gatc-5`

Current proof output:
- source feature: `GATC AT Treadway`
- geometry type: one contiguous LineString
- coordinate count: 33,227
- source direction: south to north
- southern endpoint candidate: `[-84.193819358661, 34.6266184970303]`
- northern endpoint candidate: `[-83.5997530885155, 34.9937684101839]`
- derived horizontal geodesic geometry length: 77.413 miles
- official 2026 Georgia A.T. measure reference: 78.3 miles

The 77.413-mile horizontal geometry length is diagnostic only. It is not substituted for the official 78.3-mile hiking measure.

## Detailed centerline proof

Reproducible script: `scripts/anst-centerline-probe.mjs`

Current full-route result:
- 3,025 official centerline features
- full bounds reach Georgia through Maine
- Georgia `GATC` subset: 108 official centerline segments

Georgia aggregate source fields demonstrate why length semantics must remain explicit:
- GIS `Length_Ft`: 76.212 miles
- GNSS length: 80.717 miles
- GNSS 3D length: 83.392 miles
- ATC official state mileage: 78.3 miles

Conclusion: route geometry, survey/GNSS length, three-dimensional survey length and official hiker mileage are different measures. Trail-Mate must never label one as another.

## Georgia facilities proof

Reproducible script: `scripts/georgia-facilities-probe.mjs`

The ANST Facilities service uses `Trail_Club=30` for facilities managed by the Georgia Appalachian Trail Club. That management filter returns 14 shelters, but two are south of the A.T. southern terminus on the Approach Trail:
- Amicalola Falls (Max Epperson) Shelter
- Black Gap Shelter

Trail-Mate classifies A.T.-section facilities using the official GATC treadway's Springer-to-GA/NC route envelope rather than hard-coded shelter names.

Result:
- GATC-managed shelters returned: 14
- shelters within the Georgia A.T. state section: **12**
- GATC-managed shelters south of Springer / outside the A.T. state section: **2**

This independently reconciles with ATC's published 12 Georgia shelters.

The same official parking layer returns 22 GATC-managed parking records. Recognizable records include:
- Springer Mtn (USFS 42) Parking Area
- Three Forks (USFS 42) Parking Area
- Gooch Gap (USFS 42) Parking Area
- Woody Gap (GA Rte 60) Parking Area
- Woody Gap Overlook Parking Area
- Dicks Creek Gap (US 76 & GA Rte 2) Parking Area
- Unicoi Gap (GA Rte 17 & GA Rte 75) Parking Area
- Walasi Yi Center (Neels Gap, US 19 & US 129) Parking Area

These validate several of the named locations used in the original demo concept without relying on hand-entered coordinates.

## CI gates

The repository now runs these checks on the V1 pull request:

1. planner unit tests + production Next.js build;
2. generic NPS public-trails probe (reference/regression only);
3. ANST treadway full-route probe;
4. paginated ANST centerline probe;
5. reproducible Georgia route proof;
6. Georgia shelter/parking proof with the 12-shelter cross-check.

The Georgia route and facility proofs are blocking gates. If the authoritative source changes in a way that breaks these assumptions, CI fails rather than silently changing product behavior.

## What is proven now

- the V1 application compiles and planner tests pass;
- an A.T.-specific authoritative geometry source has been selected;
- Georgia route geometry can be reproducibly isolated;
- Springer-side and GA/NC-side route extents are stable enough for the next integration step;
- official hiker mileage is modeled separately from geometric distance;
- official Georgia shelters reconcile with ATC's state count after Approach Trail facilities are correctly excluded;
- official data confirms several key Georgia access-point names.

## What is NOT proven yet

- intermediate official mile values for every facility;
- elevation-derived hiking effort;
- water-source status/freshness;
- current closures/alerts integrated into plans;
- emergency-grade or offline navigation accuracy;
- field-navigation certification;
- saved-trip migration across future route releases.

## Next controlled step

1. Create a persistent, versioned Georgia data release from the reproducible proof output.
2. Snap validated Georgia facilities to the treadway and store geometry position separately from official mile measure.
3. Establish a versioned mile-reference/calibration method for intermediate points.
4. Replace only the Georgia demo points after those checks pass.
5. Rerun `trail-mate-build-audit` against the planner after the switch.
6. Do not add water, live closures, commerce, social features or navigation claims until this integration is stable.
