export type TrailPoint = {
  id: string;
  name: string;
  mile: number;
  kind: "trailhead" | "shelter" | "road" | "resupply";
};

/**
 * Barebones V1 demo dataset only.
 * These points exist to prove planner behavior and UI flow.
 * They MUST be replaced by a verified Appalachian Trail dataset before field use.
 */
export const trailPoints: TrailPoint[] = [
  { id: "springer", name: "Springer Mountain", mile: 0, kind: "trailhead" },
  { id: "three-forks", name: "Three Forks", mile: 4.3, kind: "road" },
  { id: "hawk-mountain", name: "Hawk Mountain Shelter", mile: 8.1, kind: "shelter" },
  { id: "gooch-gap", name: "Gooch Gap", mile: 16.9, kind: "road" },
  { id: "woody-gap", name: "Woody Gap", mile: 20.5, kind: "resupply" },
];

export const getTrailPoint = (id: string) =>
  trailPoints.find((point) => point.id === id);
