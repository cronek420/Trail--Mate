import assert from "node:assert/strict";
import test from "node:test";
import { buildPlan } from "./planner";

test("builds the expected basic plan", () => {
  const plan = buildPlan({
    startId: "springer",
    endId: "woody-gap",
    days: 2,
    bodyWeightLb: 180,
    packWeightLb: 25,
  });

  assert.equal(plan.distanceMiles, 20.5);
  assert.equal(plan.averageMilesPerDay, 10.3);
  assert.equal(plan.days.length, 2);
  assert.equal(plan.days[1].endMile, 20.5);
  assert.ok(plan.estimatedCaloriesPerDay > 0);
  assert.ok(plan.estimatedFoodWeightLb > 0);
});

test("rejects reversed route order", () => {
  assert.throws(
    () => buildPlan({ startId: "woody-gap", endId: "springer", days: 2, bodyWeightLb: 180, packWeightLb: 25 }),
    /End point must be after the start point/,
  );
});

test("rejects fractional days", () => {
  assert.throws(
    () => buildPlan({ startId: "springer", endId: "woody-gap", days: 2.5, bodyWeightLb: 180, packWeightLb: 25 }),
    /whole number between 1 and 30/,
  );
});

test("rejects non-finite numeric input", () => {
  assert.throws(
    () => buildPlan({ startId: "springer", endId: "woody-gap", days: 2, bodyWeightLb: Number.NaN, packWeightLb: 25 }),
    /Body weight must be a number/,
  );

  assert.throws(
    () => buildPlan({ startId: "springer", endId: "woody-gap", days: 2, bodyWeightLb: 180, packWeightLb: Number.NaN }),
    /Pack weight must be a number/,
  );
});

test("last day ends exactly at the selected endpoint", () => {
  const plan = buildPlan({
    startId: "three-forks",
    endId: "woody-gap",
    days: 3,
    bodyWeightLb: 150,
    packWeightLb: 20,
  });

  assert.equal(plan.days.at(-1)?.endMile, 20.5);
});
