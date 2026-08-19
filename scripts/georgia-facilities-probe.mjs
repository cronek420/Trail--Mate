import { mkdir, writeFile } from "node:fs/promises";

const serviceBase = "https://services1.arcgis.com/fBc8EJBxQRMcHlei/arcgis/rest/services/ANST_Facilities/FeatureServer";
const layers = {
  parking: 2,
  shelters: 4,
};

async function queryLayer(name, layerId) {
  const endpoint = `${serviceBase}/${layerId}/query`;
  const params = new URLSearchParams({
    where: "Trail_Club=30",
    outFields: "*",
    returnGeometry: "true",
    outSR: "4326",
    f: "geojson",
  });
  const response = await fetch(`${endpoint}?${params.toString()}`, {
    headers: { "user-agent": "Trail-Mate Georgia facilities validation probe" },
  });
  if (!response.ok) throw new Error(`${name} query failed: ${response.status} ${response.statusText}`);
  const geojson = await response.json();
  if (geojson?.type !== "FeatureCollection" || !Array.isArray(geojson.features)) {
    throw new Error(`${name} query did not return GeoJSON.`);
  }
  return { endpoint, geojson };
}

const results = {};
for (const [name, layerId] of Object.entries(layers)) {
  results[name] = await queryLayer(name, layerId);
}

function featureName(feature) {
  const p = feature?.properties ?? {};
  return p.Name ?? p.NAME ?? p.LOC_NAME ?? p.Location ?? p.LABEL ?? p.MAPLABEL ?? `OBJECTID ${p.OBJECTID ?? "unknown"}`;
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

const summary = {
  fetchedAt: new Date().toISOString(),
  filter: "Trail_Club=30 (Georgia Appalachian Trail Club coded value)",
  service: serviceBase,
  shelters: {
    endpoint: results.shelters.endpoint,
    count: results.shelters.geojson.features.length,
    bounds: bounds(results.shelters.geojson.features),
    names: results.shelters.geojson.features.map(featureName).sort(),
  },
  parking: {
    endpoint: results.parking.endpoint,
    count: results.parking.geojson.features.length,
    bounds: bounds(results.parking.geojson.features),
    names: results.parking.geojson.features.map(featureName).sort(),
  },
};

await mkdir("artifacts/georgia-facilities", { recursive: true });
await writeFile("artifacts/georgia-facilities/shelters.geojson", JSON.stringify(results.shelters.geojson));
await writeFile("artifacts/georgia-facilities/parking.geojson", JSON.stringify(results.parking.geojson));
await writeFile("artifacts/georgia-facilities/summary.json", JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));

if (summary.shelters.count !== 12) {
  throw new Error(`Georgia shelter cross-check failed: expected current ATC reference count 12, official facilities query returned ${summary.shelters.count}.`);
}
if (!summary.shelters.bounds || summary.shelters.bounds.south < 34.5 || summary.shelters.bounds.north > 35.1) {
  throw new Error(`Georgia shelter bounds look wrong: ${JSON.stringify(summary.shelters.bounds)}`);
}
