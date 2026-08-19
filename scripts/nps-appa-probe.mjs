import { mkdir, writeFile } from "node:fs/promises";

const endpoint = "https://mapservices.nps.gov/arcgis/rest/services/NationalDatasets/NPS_Public_Trails_Geographic/FeatureServer/0/query";
const outFields = "TRLNAME,MAPLABEL,UNITCODE,UNITNAME,EDITDATE,SOURCEDATE,GEOMETRYID,FEATUREID,MAPSOURCE,ORIGINATOR";

async function query(where) {
  const params = new URLSearchParams({
    where,
    outFields,
    returnGeometry: "true",
    resultRecordCount: "2000",
    f: "geojson",
  });

  const response = await fetch(`${endpoint}?${params.toString()}`, {
    headers: { "user-agent": "Trail-Mate data validation probe" },
  });

  if (!response.ok) {
    throw new Error(`NPS probe failed for ${where}: ${response.status} ${response.statusText}`);
  }

  const geojson = await response.json();
  if (geojson?.type !== "FeatureCollection" || !Array.isArray(geojson.features)) {
    throw new Error(`NPS probe did not return a GeoJSON FeatureCollection for ${where}.`);
  }
  return geojson;
}

function bounds(features) {
  let west = Infinity, east = -Infinity, south = Infinity, north = -Infinity;
  for (const feature of features) {
    const geometry = feature?.geometry;
    const lines = geometry?.type === "LineString" ? [geometry.coordinates] : geometry?.coordinates ?? [];
    for (const line of lines) {
      for (const coordinate of line) {
        const [lon, lat] = coordinate;
        west = Math.min(west, lon); east = Math.max(east, lon);
        south = Math.min(south, lat); north = Math.max(north, lat);
      }
    }
  }
  return Number.isFinite(west) ? { west, south, east, north } : null;
}

function summarize(geojson, filter) {
  const features = geojson.features;
  const editDates = features.map((f) => f?.properties?.EDITDATE).filter(Boolean).sort();
  const sourceDates = features.map((f) => f?.properties?.SOURCEDATE).filter(Boolean).sort();
  return {
    fetchedAt: new Date().toISOString(),
    source: endpoint,
    filter,
    featureCount: features.length,
    geometryTypes: [...new Set(features.map((f) => f?.geometry?.type).filter(Boolean))],
    trailNames: [...new Set(features.map((f) => f?.properties?.TRLNAME).filter(Boolean))].sort(),
    unitCodes: [...new Set(features.map((f) => f?.properties?.UNITCODE).filter(Boolean))].sort(),
    bounds: bounds(features),
    earliestEditDate: editDates.at(0) ?? null,
    latestEditDate: editDates.at(-1) ?? null,
    earliestSourceDate: sourceDates.at(0) ?? null,
    latestSourceDate: sourceDates.at(-1) ?? null,
  };
}

const unitFilter = "UNITCODE='APPA'";
const nameFilter = "UPPER(TRLNAME)='APPALACHIAN TRAIL'";
const [appaUnit, appalachianByName] = await Promise.all([query(unitFilter), query(nameFilter)]);

const summary = {
  appaUnit: summarize(appaUnit, unitFilter),
  appalachianByName: summarize(appalachianByName, nameFilter),
};

await mkdir("artifacts/nps", { recursive: true });
await writeFile("artifacts/nps/appa-unit.geojson", JSON.stringify(appaUnit));
await writeFile("artifacts/nps/appalachian-by-name.geojson", JSON.stringify(appalachianByName));
await writeFile("artifacts/nps/appa-summary.json", JSON.stringify(summary, null, 2));

console.log(JSON.stringify(summary, null, 2));

if (appaUnit.features.length === 0 || appalachianByName.features.length === 0) {
  throw new Error("NPS returned zero Appalachian Trail features for one of the probe strategies.");
}
