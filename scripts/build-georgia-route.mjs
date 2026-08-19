import { mkdir, writeFile } from "node:fs/promises";

const sourceEndpoint = "https://services1.arcgis.com/fBc8EJBxQRMcHlei/arcgis/rest/services/ANST_Facilities/FeatureServer/7/query";
const officialMileageSource = "https://appalachiantrail.org/experience/hike-the-trail/explore-by-state/georgia/";
const officialMileageYear = 2026;
const officialGeorgiaMiles = 78.3;

const params = new URLSearchParams({
  where: "Name='GATC AT Treadway'",
  outFields: "OBJECTID,Reg_Acro,Acronym,Name,Status,Region,Trail_Club,Source,Version,Publish,Create_Date,Edit_Date,GlobalID,Shape__Length",
  returnGeometry: "true",
  outSR: "4326",
  f: "geojson",
});

const response = await fetch(`${sourceEndpoint}?${params.toString()}`, {
  headers: { "user-agent": "Trail-Mate verified Georgia route builder" },
});
if (!response.ok) throw new Error(`Georgia route query failed: ${response.status} ${response.statusText}`);
const collection = await response.json();
if (collection?.type !== "FeatureCollection" || collection.features?.length !== 1) {
  throw new Error(`Expected exactly one GATC treadway feature, got ${collection?.features?.length ?? "invalid response"}.`);
}

const feature = collection.features[0];
if (feature?.geometry?.type !== "LineString" || feature.geometry.coordinates.length < 2) {
  throw new Error("Georgia treadway is not the expected contiguous LineString.");
}

const coordinates = feature.geometry.coordinates;
const southern = coordinates.reduce((best, point) => point[1] < best[1] ? point : best, coordinates[0]);
const northern = coordinates.reduce((best, point) => point[1] > best[1] ? point : best, coordinates[0]);
const first = coordinates[0];
const last = coordinates.at(-1);

const endpointOrder = first[1] <= last[1] ? "south-to-north" : "north-to-south";
const orderedCoordinates = endpointOrder === "south-to-north" ? coordinates : [...coordinates].reverse();

const EARTH_RADIUS_M = 6371008.8;
const rad = (degrees) => degrees * Math.PI / 180;
function haversineMeters(a, b) {
  const [lon1, lat1] = a;
  const [lon2, lat2] = b;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const p1 = rad(lat1);
  const p2 = rad(lat2);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

let geometryMeters = 0;
for (let index = 1; index < orderedCoordinates.length; index += 1) {
  geometryMeters += haversineMeters(orderedCoordinates[index - 1], orderedCoordinates[index]);
}
const geometryMiles = geometryMeters / 1609.344;

const fetchedAt = new Date().toISOString();
const releaseId = `ga-${officialMileageYear}-anst-gatc-${String(feature.properties?.OBJECTID ?? "unknown")}`;

const route = {
  type: "FeatureCollection",
  features: [{
    type: "Feature",
    properties: {
      releaseId,
      state: "GA",
      route: "Appalachian Trail",
      direction: "south-to-north",
      geometryRole: "route-shape-not-official-mile-measure",
      sourceObjectId: feature.properties?.OBJECTID ?? null,
    },
    geometry: { type: "LineString", coordinates: orderedCoordinates },
  }],
};

const metadata = {
  releaseId,
  status: "verification-artifact-not-navigation-certified",
  fetchedAt,
  geometry: {
    source: sourceEndpoint,
    publisher: "National Park Service Appalachian National Scenic Trail & Appalachian Trail Conservancy",
    sourceFeature: feature.properties,
    coordinateCount: orderedCoordinates.length,
    sourceEndpointOrder: endpointOrder,
    southernAnchorCandidate: southern,
    northernAnchorCandidate: northern,
    derivedHorizontalGeometryMiles: Number(geometryMiles.toFixed(3)),
    note: "Horizontal geodesic geometry length is diagnostic only and is not the official hiker mile measure.",
  },
  trailMeasure: {
    referenceYear: officialMileageYear,
    officialGeorgiaMiles,
    source: officialMileageSource,
    status: "official-state-total-reference",
    note: "Official mileage is stored separately from route geometry. Intermediate official mile mapping still requires validated anchors/linear reference data.",
  },
  gates: {
    singleContiguousTreadwayFeature: true,
    southernExtentLooksLikeSpringer: southern[1] >= 34.60 && southern[1] <= 34.66,
    northernExtentLooksLikeStateLine: northern[1] >= 34.98 && northern[1] <= 35.01,
    officialMileageStoredSeparately: true,
    intermediateMileCalibrationComplete: false,
    fieldNavigationCertified: false,
  },
};

if (!metadata.gates.southernExtentLooksLikeSpringer || !metadata.gates.northernExtentLooksLikeStateLine) {
  throw new Error(`Georgia anchor extent gate failed: ${JSON.stringify(metadata.gates)}`);
}

await mkdir("artifacts/georgia-route", { recursive: true });
await writeFile("artifacts/georgia-route/georgia-at.geojson", JSON.stringify(route));
await writeFile("artifacts/georgia-route/georgia-at.meta.json", JSON.stringify(metadata, null, 2));
console.log(JSON.stringify(metadata, null, 2));
