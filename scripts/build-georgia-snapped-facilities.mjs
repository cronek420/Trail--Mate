import { mkdir, writeFile } from "node:fs/promises";

const SERVICE = "https://services1.arcgis.com/fBc8EJBxQRMcHlei/arcgis/rest/services/ANST_Facilities/FeatureServer";
const TREADWAY_LAYER = 7;
const PARKING_LAYER = 2;
const SHELTER_LAYER = 4;
const GATC_TREADWAY_OBJECT_ID = 5;
const GEORGIA_CLUB_CODE = 30;
const M_PER_MILE = 1609.344;
const FT_PER_M = 3.280839895;

async function queryGeoJSON(layerId, where) {
  const endpoint = `${SERVICE}/${layerId}/query`;
  const params = new URLSearchParams({
    where,
    outFields: "*",
    returnGeometry: "true",
    outSR: "4326",
    f: "geojson",
  });
  const response = await fetch(`${endpoint}?${params}`, {
    headers: { "user-agent": "Trail-Mate Georgia facility snapping builder" },
  });
  if (!response.ok) throw new Error(`ArcGIS query failed for layer ${layerId}: ${response.status}`);
  const data = await response.json();
  if (data?.type !== "FeatureCollection" || !Array.isArray(data.features)) {
    throw new Error(`Layer ${layerId} did not return a GeoJSON FeatureCollection.`);
  }
  return { endpoint, data };
}

function flattenLineCoordinates(geometry) {
  if (!geometry) return [];
  if (geometry.type === "LineString") return geometry.coordinates;
  if (geometry.type === "MultiLineString") return geometry.coordinates.flat();
  return [];
}

function localProjector(coords) {
  const lat0 = coords.reduce((sum, [, lat]) => sum + lat, 0) / coords.length;
  const cosLat = Math.cos((lat0 * Math.PI) / 180);
  const metersPerDegreeLat = 111132.92;
  const metersPerDegreeLon = 111412.84 * cosLat;
  return {
    xy: ([lon, lat]) => [lon * metersPerDegreeLon, lat * metersPerDegreeLat],
    ll: ([x, y]) => [x / metersPerDegreeLon, y / metersPerDegreeLat],
  };
}

function snapPointToRoute(pointLonLat, routeLonLat) {
  const projector = localProjector(routeLonLat);
  const route = routeLonLat.map(projector.xy);
  const p = projector.xy(pointLonLat);

  let best = null;
  let cumulative = 0;

  for (let i = 0; i < route.length - 1; i += 1) {
    const a = route[i];
    const b = route[i + 1];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const segLen2 = dx * dx + dy * dy;
    const segLen = Math.sqrt(segLen2);
    const rawT = segLen2 === 0 ? 0 : ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / segLen2;
    const t = Math.max(0, Math.min(1, rawT));
    const q = [a[0] + t * dx, a[1] + t * dy];
    const dist = Math.hypot(p[0] - q[0], p[1] - q[1]);
    const along = cumulative + t * segLen;

    if (!best || dist < best.distanceM) {
      best = { distanceM: dist, alongM: along, snapped: projector.ll(q), segmentIndex: i };
    }
    cumulative += segLen;
  }

  return { ...best, routeLengthM: cumulative };
}

function featureName(feature) {
  return feature?.properties?.Name ?? `OBJECTID ${feature?.properties?.OBJECTID ?? "unknown"}`;
}

function pointCoordinates(feature) {
  const c = feature?.geometry?.coordinates;
  if (!Array.isArray(c) || typeof c[0] !== "number" || typeof c[1] !== "number") {
    throw new Error(`Facility ${featureName(feature)} has invalid point geometry.`);
  }
  return c;
}

const treadwayResult = await queryGeoJSON(TREADWAY_LAYER, `OBJECTID=${GATC_TREADWAY_OBJECT_ID}`);
if (treadwayResult.data.features.length !== 1) throw new Error("Expected one Georgia treadway feature.");
const treadwayFeature = treadwayResult.data.features[0];
const route = flattenLineCoordinates(treadwayFeature.geometry);
if (route.length < 1000) throw new Error("Georgia treadway geometry is unexpectedly sparse.");

const southLat = route[0][1];
const northLat = route.at(-1)[1];
if (southLat > northLat) route.reverse();
const routeSouth = route[0][1];
const routeNorth = route.at(-1)[1];

const sheltersResult = await queryGeoJSON(SHELTER_LAYER, `Trail_Club=${GEORGIA_CLUB_CODE}`);
const parkingResult = await queryGeoJSON(PARKING_LAYER, `Trail_Club=${GEORGIA_CLUB_CODE}`);

function onGeorgiaAT(feature) {
  const [, lat] = pointCoordinates(feature);
  return lat >= routeSouth && lat <= routeNorth;
}

function normalizeFacility(feature, type) {
  const sourceCoordinates = pointCoordinates(feature);
  const snap = snapPointToRoute(sourceCoordinates, route);
  const p = feature.properties ?? {};
  return {
    id: `${type}-${p.GIS_ID ?? p.OBJECTID}`,
    type,
    name: featureName(feature),
    status: p.Status ?? null,
    sourceObjectId: p.OBJECTID ?? null,
    sourceGisId: p.GIS_ID ?? null,
    sourceGlobalId: p.GlobalID ?? null,
    sourceCoordinates,
    snappedCoordinates: snap.snapped,
    geometryMileFromSpringer: Number((snap.alongM / M_PER_MILE).toFixed(3)),
    snapDistanceFeet: Number((snap.distanceM * FT_PER_M).toFixed(1)),
    source: p.Source ?? null,
    sourceVersion: p.Version ?? null,
    sourceEditDate: p.Edit_Date ?? null,
    provenance: `${SERVICE}/${type === "shelter" ? SHELTER_LAYER : PARKING_LAYER}`,
  };
}

const shelters = sheltersResult.data.features.filter(onGeorgiaAT).map((f) => normalizeFacility(f, "shelter"));
const parking = parkingResult.data.features.filter(onGeorgiaAT).map((f) => normalizeFacility(f, "parking"));
const facilities = [...shelters, ...parking].sort((a, b) => a.geometryMileFromSpringer - b.geometryMileFromSpringer);

const farSnaps = facilities.filter((f) => f.snapDistanceFeet > 1000);
const summary = {
  releaseId: "ga-2026-anst-gatc-5-facilities-v1",
  status: "verification-artifact-not-navigation-certified",
  generatedAt: new Date().toISOString(),
  geometrySource: treadwayResult.endpoint,
  facilitySources: {
    shelters: sheltersResult.endpoint,
    parking: parkingResult.endpoint,
  },
  route: {
    sourceFeatureObjectId: treadwayFeature.properties?.OBJECTID,
    sourceFeatureName: treadwayFeature.properties?.Name,
    coordinateCount: route.length,
    southToNorth: true,
  },
  counts: {
    shelters: shelters.length,
    parking: parking.length,
    total: facilities.length,
  },
  snapping: {
    method: "nearest point on official GATC treadway using a local metric projection",
    mileField: "geometryMileFromSpringer",
    mileWarning: "This is a geometric diagnostic mile, not ATC official trail mileage. Official linear-reference calibration remains incomplete.",
    farSnapThresholdFeet: 1000,
    farSnapCount: farSnaps.length,
  },
  gates: {
    expectedShelterCount12: shelters.length === 12,
    facilitiesSortedSouthToNorth: facilities.every((f, i) => i === 0 || facilities[i - 1].geometryMileFromSpringer <= f.geometryMileFromSpringer),
    noExtremeSnapDistances: farSnaps.length === 0,
    officialMileCalibrationComplete: false,
    fieldNavigationCertified: false,
  },
  facilities,
};

await mkdir("artifacts/georgia-snapped-facilities", { recursive: true });
await writeFile("artifacts/georgia-snapped-facilities/facilities.json", JSON.stringify(summary, null, 2));
console.log(JSON.stringify({
  releaseId: summary.releaseId,
  counts: summary.counts,
  gates: summary.gates,
  maxSnapDistanceFeet: Math.max(...facilities.map((f) => f.snapDistanceFeet)),
  calibrationCandidates: facilities.filter((f) => /Springer|Three Forks|Woody Gap|Neels Gap|Unicoi Gap|Dicks Creek Gap/i.test(f.name)).map((f) => ({ name: f.name, geometryMileFromSpringer: f.geometryMileFromSpringer, snapDistanceFeet: f.snapDistanceFeet })),
}, null, 2));

if (!summary.gates.expectedShelterCount12) throw new Error(`Expected 12 Georgia A.T. shelters, got ${shelters.length}.`);
if (!summary.gates.facilitiesSortedSouthToNorth) throw new Error("Snapped facilities are not in deterministic south-to-north order.");
if (!summary.gates.noExtremeSnapDistances) throw new Error(`Facilities exceed ${summary.snapping.farSnapThresholdFeet} ft snap threshold: ${farSnaps.map((f) => f.name).join(", ")}`);
