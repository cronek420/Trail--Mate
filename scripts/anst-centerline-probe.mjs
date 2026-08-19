import { mkdir, writeFile } from "node:fs/promises";

const endpoint = "https://services1.arcgis.com/fBc8EJBxQRMcHlei/arcgis/rest/services/ANST_Centerline/FeatureServer/0/query";
const outFields = "OBJECTID,Reg_Acro,Acronym,Name,Alt_Name,Status,Length_Ft,Region,Trail_Club,GPS_Date,GNSS_Lengt,GNSS_3DLen,GFID,Source,Version,Publish,Create_Date,Edit_Date,GlobalID";
const pageSize = 2000;

async function fetchPage(offset) {
  const params = new URLSearchParams({
    where: "1=1",
    outFields,
    returnGeometry: "true",
    resultOffset: String(offset),
    resultRecordCount: String(pageSize),
    orderByFields: "OBJECTID ASC",
    outSR: "4326",
    f: "geojson",
  });

  const response = await fetch(`${endpoint}?${params.toString()}`, {
    headers: { "user-agent": "Trail-Mate ANST centerline validation probe" },
  });
  if (!response.ok) throw new Error(`ANST centerline page ${offset} failed: ${response.status} ${response.statusText}`);

  const page = await response.json();
  if (page?.type !== "FeatureCollection" || !Array.isArray(page.features)) {
    throw new Error(`ANST centerline page ${offset} did not return a GeoJSON FeatureCollection.`);
  }
  return page.features;
}

const features = [];
let pageCount = 0;
for (let offset = 0; ; offset += pageSize) {
  const page = await fetchPage(offset);
  pageCount += 1;
  features.push(...page);
  if (page.length < pageSize) break;
  if (pageCount > 20) throw new Error("ANST centerline pagination exceeded the expected safety limit.");
}

if (features.length === 0) throw new Error("ANST centerline probe returned no usable features.");

const geojson = { type: "FeatureCollection", features };

function geometryLines(feature) {
  if (feature?.geometry?.type === "LineString") return [feature.geometry.coordinates];
  if (feature?.geometry?.type === "MultiLineString") return feature.geometry.coordinates;
  return [];
}

function getBounds(selectedFeatures) {
  let west = Infinity, east = -Infinity, south = Infinity, north = -Infinity;
  for (const feature of selectedFeatures) {
    for (const line of geometryLines(feature)) {
      for (const [lon, lat] of line) {
        west = Math.min(west, lon); east = Math.max(east, lon);
        south = Math.min(south, lat); north = Math.max(north, lat);
      }
    }
  }
  return Number.isFinite(west) ? { west, south, east, north } : null;
}

function sumField(selectedFeatures, field) {
  return selectedFeatures.reduce((total, feature) => {
    const value = Number(feature?.properties?.[field]);
    return total + (Number.isFinite(value) ? value : 0);
  }, 0);
}

const official = features.filter((feature) => feature?.properties?.Status === "Official A.T. Route");
const georgia = official.filter((feature) => feature?.properties?.Acronym === "GATC");
const geometryTypes = [...new Set(features.map((feature) => feature?.geometry?.type).filter(Boolean))];
const versions = [...new Set(features.map((feature) => feature?.properties?.Version).filter(Boolean))].sort();
const acronyms = [...new Set(official.map((feature) => feature?.properties?.Acronym).filter(Boolean))].sort();
const latestEditDate = features.map((feature) => feature?.properties?.Edit_Date).filter(Boolean).sort((a, b) => a - b).at(-1) ?? null;

const summary = {
  fetchedAt: new Date().toISOString(),
  source: endpoint,
  pageSize,
  pageCount,
  featureCount: features.length,
  officialFeatureCount: official.length,
  geometryTypes,
  bounds: getBounds(official),
  versions,
  acronyms,
  latestEditDate,
  georgia: {
    acronym: "GATC",
    featureCount: georgia.length,
    bounds: getBounds(georgia),
    shapeLengthMiles: Number((sumField(georgia, "Length_Ft") / 5280).toFixed(3)),
    gnssLengthMiles: Number((sumField(georgia, "GNSS_Lengt") / 5280).toFixed(3)),
    gnss3dLengthMiles: Number((sumField(georgia, "GNSS_3DLen") / 5280).toFixed(3)),
    sources: [...new Set(georgia.map((feature) => feature?.properties?.Source).filter(Boolean))].sort(),
    versions: [...new Set(georgia.map((feature) => feature?.properties?.Version).filter(Boolean))].sort(),
    latestEditDate: georgia.map((feature) => feature?.properties?.Edit_Date).filter(Boolean).sort((a, b) => a - b).at(-1) ?? null,
  },
};

await mkdir("artifacts/anst-centerline", { recursive: true });
await writeFile("artifacts/anst-centerline/centerline.geojson", JSON.stringify(geojson));
await writeFile("artifacts/anst-centerline/centerline-summary.json", JSON.stringify(summary, null, 2));
await writeFile("artifacts/anst-centerline/georgia-centerline.geojson", JSON.stringify({ type: "FeatureCollection", features: georgia }));
console.log(JSON.stringify(summary, null, 2));

if (!summary.bounds || summary.bounds.south > 34.8 || summary.bounds.north < 45.5) {
  throw new Error(`Paginated ANST centerline does not span Georgia to Maine: ${JSON.stringify(summary.bounds)}`);
}
if (georgia.length === 0 || !summary.georgia.bounds || summary.georgia.bounds.south > 34.8 || summary.georgia.bounds.north < 34.95) {
  throw new Error(`GATC centerline slice failed Georgia coverage checks: ${JSON.stringify(summary.georgia)}`);
}
