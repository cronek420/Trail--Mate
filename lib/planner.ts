import { getTrailPoint, trailPoints, type TrailPoint } from "./trail-data";

export type PlannerInput = {
  startId: string;
  endId: string;
  days: number;
  bodyWeightLb: number;
  packWeightLb: number;
};

export type DayPlan = {
  day: number;
  startMile: number;
  endMile: number;
  miles: number;
  nearbyPoint?: TrailPoint;
};

export type PlannerResult = {
  distanceMiles: number;
  averageMilesPerDay: number;
  estimatedCaloriesPerDay: number;
  estimatedTotalCalories: number;
  estimatedFoodWeightLb: number;
  days: DayPlan[];
};

const round = (value: number, digits = 1) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const isFiniteNumber = (value: number) => Number.isFinite(value);

export function buildPlan(input: PlannerInput): PlannerResult {
  const start = getTrailPoint(input.startId);
  const end = getTrailPoint(input.endId);

  if (!start || !end) throw new Error("Choose valid start and end points.");
  if (end.mile <= start.mile) throw new Error("End point must be after the start point for V1.");

  if (!isFiniteNumber(input.days) || !Number.isInteger(input.days) || input.days < 1 || input.days > 30) {
    throw new Error("Days must be a whole number between 1 and 30.");
  }
  if (!isFiniteNumber(input.bodyWeightLb) || input.bodyWeightLb < 70 || input.bodyWeightLb > 400) {
    throw new Error("Body weight must be a number between 70 and 400 lb.");
  }
  if (!isFiniteNumber(input.packWeightLb) || input.packWeightLb < 0 || input.packWeightLb > 100) {
    throw new Error("Pack weight must be a number between 0 and 100 lb.");
  }

  const distanceMiles = end.mile - start.mile;
  const averageMilesPerDay = distanceMiles / input.days;

  // Conservative planning estimate for prototype use only, not medical advice.
  // Base daily energy + hiking load scaled by body/pack weight and mileage.
  const baseCalories = 1800 + input.bodyWeightLb * 4;
  const hikingCalories = averageMilesPerDay * (55 + input.packWeightLb * 0.7);
  const estimatedCaloriesPerDay = Math.round(baseCalories + hikingCalories);
  const estimatedTotalCalories = estimatedCaloriesPerDay * input.days;

  // 125 kcal/oz ~= 2,000 kcal/lb, a planning target for calorie-dense trail food.
  const estimatedFoodWeightLb = estimatedTotalCalories / 2000;

  const days: DayPlan[] = Array.from({ length: input.days }, (_, index) => {
    const dayStart = start.mile + averageMilesPerDay * index;
    const dayEnd = index === input.days - 1 ? end.mile : start.mile + averageMilesPerDay * (index + 1);
    const nearbyPoint = trailPoints
      .filter((point) => point.mile >= dayStart && point.mile <= dayEnd)
      .sort((a, b) => Math.abs(a.mile - dayEnd) - Math.abs(b.mile - dayEnd))[0];

    return {
      day: index + 1,
      startMile: round(dayStart),
      endMile: round(dayEnd),
      miles: round(dayEnd - dayStart),
      nearbyPoint,
    };
  });

  return {
    distanceMiles: round(distanceMiles),
    averageMilesPerDay: round(averageMilesPerDay),
    estimatedCaloriesPerDay,
    estimatedTotalCalories,
    estimatedFoodWeightLb: round(estimatedFoodWeightLb),
    days,
  };
}
