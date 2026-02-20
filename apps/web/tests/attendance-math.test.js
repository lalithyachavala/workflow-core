import test from "node:test";
import assert from "node:assert/strict";
import { computeTotalSeconds } from "../src/attendance/math.ts";

test("computeTotalSeconds calculates expected seconds", () => {
  const inAt = new Date("2026-02-20T08:00:00.000Z");
  const outAt = new Date("2026-02-20T09:30:45.000Z");
  assert.equal(computeTotalSeconds(inAt, outAt), 5445);
});

test("computeTotalSeconds does not return negatives", () => {
  const inAt = new Date("2026-02-20T10:00:00.000Z");
  const outAt = new Date("2026-02-20T09:30:00.000Z");
  assert.equal(computeTotalSeconds(inAt, outAt), 0);
});
