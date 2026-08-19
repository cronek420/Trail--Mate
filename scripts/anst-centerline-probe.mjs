import { mkdir, writeFile } from "node:fs/promises";

const endpoint = "https://services1.arcgis.com/fBc8EJBxQRMcHlei/arcgis/rest/services/ANST_Centerline/FeatureServer/0/query";
const params = new URLSearchParams({
  where: "1=1",
  outFields: "OBJECTID,Reg_Acro,Acronym,Name,Alt_Name,Status,Length_Ft,Region,Trail_Club,GPS_Date,GNSS_Lengt,GNSS_3DLen,GFID,Source,Version,Publish,Create_Date,Edit_Date,GlobalID",
  returnGeometry: "true",
  resultRecordCount: "2000",
  outSR: "4326",
  f: "geojson",
});

const response = await fetch(`${endpoint}?${params.toString()}`, {
  headers: { "user-agent": "Trail-Mate ANST centerline validation probe" },
});
if (!response.ok) throw new Error(`ANST centerline probe failed: ${response.status} ${response.statusText}`);

const geojson = await response.json();
if (geojson?.type !== "FeatureCollection" || !Array.isArray(geojson.features) || geojson.features.length === 0) {
  throw new Error("ANST centerline probe returned no usable GeoJSON features.");
}

let west = Infinity, east = -Infinity, south = Infinity, north = -Infinity;
const geometryTypes = new Set();
for (const feature of geojson.features) {
  geometryTypes.add(feature?.geometry?.type);
  const lines = feature?.geometry?.type === "LineString" ? [feature.geometry.coordinates] : feature?.geometry?.coordinates ?? [];
  for (const line of lines) {
    for (const [lon, lat] of line) {
      west = Math.min(west, lon); east = Math.max(east, lon);
      south = Math.min(south, lat); north = Math.max(north, lat);
    }
  }
}

const featureSummary = geojson.features.map((feature) => ({
  objectId: feature.properties?.OBJECTID,
  acronym: feature.properties?.Acronym,
  name: feature.properties?.Name,
  status: feature.properties?.Status,
  lengthFt: feature.properties?.Length_Ft,
  gnssLength: feature.properties?.GNSS_Lengt,
  gnss3dLength: feature.properties?.GNSS_3DLen,
  source: feature.properties?.Source,
  version: feature.properties?.Version,
  editDate: feature.properties?.Edit_Date,
  bounds: (() => {
    let w = Infinity, e = -Infinity, s = Infinity, n = -Infinity;
    const lines = feature?.geometry?.type === "LineString" ? [feature.geometry.coordinates] : feature?.geometry?.coordinates ?? [];
    for (const line of lines) for (const [lon, lat] of line) { w=Math.min(w,lon);e=Math.max(e,lon);s=Math.min(s,lat);n=Math.max(n,lat); }
    return { west:w, south:s, east:e, north:n };
  })(),
}));

const summary = {
  fetchedAt: new Date().toISOString(),
  source: endpoint,
  featureCount: geojson.features.length,
  geometryTypes: [...geometryTypes].filter(Boolean),
  bounds: { west, south, east, north },
  versions: [...new Set(geojson.features.map((f) => f?.properties?.Version).filter(Boolean))].sort(),
  latestEditDate: geojson.features.map((f) => f?.properties?.Edit_Date).filter(Boolean).sort().at(-1) ?? null,
  features: featureSummary,
};

await mkdir("artifacts/anst-centerline", { recursive: true });
await writeFile("artifacts/anst-centerline/centerline.geojson", JSON.stringify(geojson));
await writeFile("artifacts/anst-centerline/centerline-summary.json", JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));

if (south > 34.8 || north < 45.5) {
  throw new Error(`ANST centerline bounds do not span Georgia to Maine: ${JSON.stringify(summary.bounds)}`);
}
