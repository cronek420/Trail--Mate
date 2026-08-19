"use client";

import { useMemo, useState } from "react";
import { buildPlan, type PlannerResult } from "@/lib/planner";
import { trailPoints } from "@/lib/trail-data";

export default function Home() {
  const [startId, setStartId] = useState("springer");
  const [endId, setEndId] = useState("woody-gap");
  const [days, setDays] = useState(2);
  const [bodyWeightLb, setBodyWeightLb] = useState(180);
  const [packWeightLb, setPackWeightLb] = useState(25);
  const [result, setResult] = useState<PlannerResult | null>(null);
  const [error, setError] = useState("");

  const endOptions = useMemo(() => {
    const start = trailPoints.find((point) => point.id === startId);
    return trailPoints.filter((point) => !start || point.mile > start.mile);
  }, [startId]);

  function generatePlan() {
    try {
      const next = buildPlan({ startId, endId, days, bodyWeightLb, packWeightLb });
      setResult(next);
      setError("");
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Unable to build plan.");
    }
  }

  return (
    <main>
      <section className="hero">
        <div className="eyebrow">TRAIL-MATE / BAREBONES V1</div>
        <h1>Turn a trail section into a usable hiking plan.</h1>
        <p>
          Pick where you start, where you stop, and how many days you have. Trail-Mate handles the basic trip math.
        </p>
        <div className="warning">
          Prototype demo data only — not for navigation, emergency decisions, or field use yet.
        </div>
      </section>

      <section className="plannerCard" aria-label="Trip planner">
        <div className="stepTag">1 · Pick your section</div>
        <div className="grid two">
          <label>
            Start
            <select value={startId} onChange={(e) => {
              const nextStart = e.target.value;
              setStartId(nextStart);
              const start = trailPoints.find((p) => p.id === nextStart);
              const currentEnd = trailPoints.find((p) => p.id === endId);
              if (start && currentEnd && currentEnd.mile <= start.mile) {
                const next = trailPoints.find((p) => p.mile > start.mile);
                if (next) setEndId(next.id);
              }
            }}>
              {trailPoints.slice(0, -1).map((point) => (
                <option key={point.id} value={point.id}>{point.name}</option>
              ))}
            </select>
          </label>

          <label>
            End
            <select value={endId} onChange={(e) => setEndId(e.target.value)}>
              {endOptions.map((point) => (
                <option key={point.id} value={point.id}>{point.name}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="stepTag">2 · Tell us your pace inputs</div>
        <div className="grid three">
          <label>
            Days
            <input type="number" min={1} max={30} value={days} onChange={(e) => setDays(Number(e.target.value))} />
          </label>
          <label>
            Body weight (lb)
            <input type="number" min={70} max={400} value={bodyWeightLb} onChange={(e) => setBodyWeightLb(Number(e.target.value))} />
          </label>
          <label>
            Pack weight (lb)
            <input type="number" min={0} max={100} value={packWeightLb} onChange={(e) => setPackWeightLb(Number(e.target.value))} />
          </label>
        </div>

        <button onClick={generatePlan}>Build my trail plan</button>
        {error && <p className="error" role="alert">{error}</p>}
      </section>

      {result && (
        <section className="results" aria-live="polite">
          <div className="stepTag">3 · Your plan</div>
          <div className="statGrid">
            <article><strong>{result.distanceMiles}</strong><span>trail miles</span></article>
            <article><strong>{result.averageMilesPerDay}</strong><span>mi/day</span></article>
            <article><strong>{result.estimatedCaloriesPerDay.toLocaleString()}</strong><span>est. kcal/day</span></article>
            <article><strong>{result.estimatedFoodWeightLb}</strong><span>est. food lb</span></article>
          </div>

          <h2>Day-by-day</h2>
          <div className="days">
            {result.days.map((day) => (
              <article className="day" key={day.day}>
                <div><span>DAY</span><strong>{day.day}</strong></div>
                <div><span>DISTANCE</span><strong>{day.miles} mi</strong></div>
                <div><span>MILES</span><strong>{day.startMile} → {day.endMile}</strong></div>
                <div><span>NEARBY DEMO POINT</span><strong>{day.nearbyPoint?.name ?? "None in sample data"}</strong></div>
              </article>
            ))}
          </div>
          <p className="finePrint">
            Calorie and food values are planning estimates, not medical or nutritional advice. Verified elevation, weather, water, closures, resupply, and emergency data are intentionally outside this prototype.
          </p>
        </section>
      )}
    </main>
  );
}
