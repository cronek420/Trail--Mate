import { mkdir, writeFile } from "node:fs/promises";

const serviceBase = "https://services1.arcgis.com/fBc8EJBxQRMcHlei/arcgis/rest/services/ANST_Facilities/FeatureServer";
const layers = { parking: 2, shelters: 4 };

async function query(layerId, where, outFields = "*") {
  const endpoint = `${serviceBase}/${layerId}/query`;
  const params = new URLSearchParams({
    where,
    outFields,
    returnGeometry: "true",
    outSR: "4326",
    f: "geojson",
  });
  const response = await fetch(`${endpoint}?${params.toString()}`, {
    headers: { "user-agent": "Trail-Mate Georgia facilities validation probe" },
  });
  if (!response.ok) throw new Error(`Layer ${layerId} query failed: ${response.status} ${response.statusText}`);
  const geojson = await response.json();
  if (geojson?.type !== "FeatureCollection" || !Array.isArray(geojson.features)) {
    throw new Error(`Layer ${layerId} query did not return GeoJSON.`);
  }
  return { endpoint, geojson };
}

const [sheltersResult, parkingResult, treadwayResult] = await Promise.all([
  query(layers.shelters, "Trail_Club=30"),
  query(layers.parking, "Trail_Club=30"),
  query(7, "Name='GATC AT Treadway'", "OBJECTID,Name,Status,Trail_Club,Source,Version,Edit_Date,GlobalID"),
]);

if (treadwayResult.geojson.features.length !== 1 || treadwayResult.geojson.features[0]?.geometry?.type !== "LineString") {
  throw new Error("Could not establish the single official GATC treadway envelope.");
}

const routeCoordinates = treadwayResult.geojson.features[0].geometry.coordinates;
const routeSouth = Math.min(...routeCoordinates.map(([, lat]) => lat));
const routeNorth = Math.max(...routeCoordinates.map(([, lat]) => lat));

function featureName(feature) {
  const p = feature?.properties ?? {};
  return p.Name ?? p.NAME ?? p.LOC_NAME ?? p.Location ?? p.LABEL ?? p.MAPLABEL ?? `OBJECTID ${p.OBJECTID ?? "unknown"}`;
}

function pointLat(feature) {
  const coordinates = feature?.geometry?.coordinates;
  return Array.isArray(coordinates) && typeof coordinates[1] === "number" ? coordinates[1] : null;
}

function isWithinATStateEnvelope(feature) {
  const lat = pointLat(feature);
  return lat !== null && lat >= routeSouth && lat <= routeNorth;
}

function bounds(features) {
  const points = features
    .map((feature) => feature?.geometry?.coordinates)
    .filter((coordinates) => Array.isArray(coordinates) && typeof coordinates[0] === "number");
  if (!points.length) return null;
  return {
    west: Math.min(...points.map(([lon]) => lon)),
    south: Math.min(...points.map(([, lat]) => lat)),
    east: Math.max(...points.map(([lon]) => lon)),
    north: Math.max(...points.map(([, lat]) => lat)),
  };
}

function summarizeFacilities(features) {
  const atSection = features.filter(isWithinATStateEnvelope);
  const outsideATSection = features.filter((feature) => !isWithinATStateEnvelope(feature));
  return {
    managedByGATCCount: features.length,
    atSectionCount: atSection.length,
    atSectionBounds: bounds(atSection),
    atSectionNames: atSection.map(featureName).sort(),
    outsideATSectionCount: outsideATSection.length,
    outsideATSectionNames: outsideATSection.map(featureName).sort(),
  };
}

const shelters = summarizeFacilities(sheltersResult.geojson.features);
const parking = summarizeFacilities(parkingResult.geojson.features);

const summary = {
  fetchedAt: new Date().toISOString(),
  service: serviceBase,
  managementFilter: "Trail_Club=30 (Georgia Appalachian Trail Club coded value)",
  classificationRule: "A.T.-section facility must fall between the official GATC treadway southern and northern latitude endpoints. This separates Approach Trail facilities south of Springer from the A.T. state section without hard-coding facility names.",
  routeEnvelope: {
    source: treadwayResult.endpoint,
    south: routeSouth,
    north: routeNorth,
  },
  shelters: { endpoint: sheltersResult.endpoint, ...shelters },
  parking: { endpoint: parkingResult.endpoint, ...parking },
};

const sheltersAT = sheltersResult.geojson.features.filter(isWithinATStateEnvelope);
const parkingAT = parkingResult.geojson.features.filter(isWithinATStateEnvelope);

await mkdir("artifacts/georgia-facilities", { recursive: true });
await writeFile("artifacts/georgia-facilities/shelters-at-section.geojson", JSON.stringify({ type: "FeatureCollection", features: sheltersAT }));
await writeFile("artifacts/georgia-facilities/parking-at-section.geojson", JSON.stringify({ type: "FeatureCollection", features: parkingAT }));
await writeFile("artifacts/georgia-facilities/summary.json", JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));

if (summary.shelters.atSectionCount !== 12) {
  throw new Error(`Georgia A.T. shelter cross-check failed: expected ATC state reference 12, classified official facilities returned ${summary.shelters.atSectionCount}.`);
}
if (summary.shelters.outsideATSectionCount !== 2) {
  throw new Error(`Expected two GATC-managed shelters south of the A.T. terminus, found ${summary.shelters.outsideATSectionCount}.`);
}
if (!summary.shelters.atSectionBounds || summary.shelters.atSectionBounds.south < routeSouth || summary.shelters.atSectionBounds.north > routeNorth) {
  throw new Error(`Georgia A.T. shelter bounds failed route-envelope validation: ${JSON.stringify(summary.shelters.atSectionBounds)}`);
}
