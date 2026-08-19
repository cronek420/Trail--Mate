import { mkdir, writeFile } from "node:fs/promises";

const endpoint = "https://services1.arcgis.com/fBc8EJBxQRMcHlei/arcgis/rest/services/ANST_Facilities/FeatureServer/7/query";
const params = new URLSearchParams({
  where: "1=1",
  outFields: "OBJECTID,Reg_Acro,Acronym,Name,Status,Region,Trail_Club,Source,Version,Publish,Create_Date,Edit_Date,GlobalID,Shape__Length",
  returnGeometry: "true",
  resultRecordCount: "2000",
  f: "geojson",
});

const response = await fetch(`${endpoint}?${params.toString()}`, {
  headers: { "user-agent": "Trail-Mate ANST treadway validation probe" },
});
if (!response.ok) throw new Error(`ANST treadway probe failed: ${response.status} ${response.statusText}`);

const geojson = await response.json();
if (geojson?.type !== "FeatureCollection" || !Array.isArray(geojson.features) || geojson.features.length === 0) {
  throw new Error("ANST treadway probe returned no usable GeoJSON features.");
}

let west = Infinity, east = -Infinity, south = Infinity, north = -Infinity;
const geometryTypes = new Set();
for (const feature of geojson.features) {
  geometryTypes.add(feature?.geometry?.type);
  const coordinates = feature?.geometry?.type === "LineString" ? [feature.geometry.coordinates] : feature?.geometry?.coordinates ?? [];
  for (const line of coordinates) {
    for (const [lon, lat] of line) {
      west = Math.min(west, lon); east = Math.max(east, lon);
      south = Math.min(south, lat); north = Math.max(north, lat);
    }
  }
}

const summary = {
  fetchedAt: new Date().toISOString(),
  source: endpoint,
  featureCount: geojson.features.length,
  geometryTypes: [...geometryTypes].filter(Boolean),
  bounds: { west, south, east, north },
  sectionNames: [...new Set(geojson.features.map((f) => f?.properties?.Name).filter(Boolean))].sort(),
  regions: [...new Set(geojson.features.map((f) => f?.properties?.Region).filter(Boolean))].sort(),
  trailClubs: [...new Set(geojson.features.map((f) => f?.properties?.Trail_Club).filter(Boolean))].sort(),
  versions: [...new Set(geojson.features.map((f) => f?.properties?.Version).filter(Boolean))].sort(),
  latestEditDate: geojson.features.map((f) => f?.properties?.Edit_Date).filter(Boolean).sort().at(-1) ?? null,
};

await mkdir("artifacts/anst", { recursive: true });
await writeFile("artifacts/anst/treadway.geojson", JSON.stringify(geojson));
await writeFile("artifacts/anst/treadway-summary.json", JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));

if (south > 34.8 || north < 45.5) {
  throw new Error(`ANST treadway bounds do not appear to span Georgia to Maine: ${JSON.stringify(summary.bounds)}`);
}
