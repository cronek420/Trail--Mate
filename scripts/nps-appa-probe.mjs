import { mkdir, writeFile } from "node:fs/promises";

const endpoint = "https://mapservices.nps.gov/arcgis/rest/services/NationalDatasets/NPS_Public_Trails_Geographic/FeatureServer/0/query";
const params = new URLSearchParams({
  where: "UNITCODE='APPA'",
  outFields: "TRLNAME,MAPLABEL,UNITCODE,EDITDATE,SOURCEDATE,GEOMETRYID,FEATUREID,MAPSOURCE,ORIGINATOR",
  returnGeometry: "true",
  f: "geojson",
});

const response = await fetch(`${endpoint}?${params.toString()}`, {
  headers: { "user-agent": "Trail-Mate data validation probe" },
});

if (!response.ok) {
  throw new Error(`NPS probe failed: ${response.status} ${response.statusText}`);
}

const geojson = await response.json();
if (geojson?.type !== "FeatureCollection" || !Array.isArray(geojson.features)) {
  throw new Error("NPS probe did not return a GeoJSON FeatureCollection.");
}

const features = geojson.features;
const names = [...new Set(features.map((feature) => feature?.properties?.TRLNAME).filter(Boolean))].sort();
const editDates = features.map((feature) => feature?.properties?.EDITDATE).filter(Boolean).sort();
const sourceDates = features.map((feature) => feature?.properties?.SOURCEDATE).filter(Boolean).sort();

const summary = {
  fetchedAt: new Date().toISOString(),
  source: endpoint,
  filter: "UNITCODE='APPA'",
  featureCount: features.length,
  geometryTypes: [...new Set(features.map((feature) => feature?.geometry?.type).filter(Boolean))],
  trailNames: names,
  earliestEditDate: editDates.at(0) ?? null,
  latestEditDate: editDates.at(-1) ?? null,
  earliestSourceDate: sourceDates.at(0) ?? null,
  latestSourceDate: sourceDates.at(-1) ?? null,
};

await mkdir("artifacts/nps", { recursive: true });
await writeFile("artifacts/nps/appa.geojson", JSON.stringify(geojson));
await writeFile("artifacts/nps/appa-summary.json", JSON.stringify(summary, null, 2));

console.log(JSON.stringify(summary, null, 2));

if (features.length === 0) {
  throw new Error("NPS returned zero APPA trail features; do not advance the data gate.");
}
