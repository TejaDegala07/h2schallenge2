"use strict";

/**
 * index.test.js — Jest Test Suite
 * Carbon Footprint Tracker — Hack2Skill PromptWars Challenge 3
 *
 * Full branch, statement, and edge-case coverage for calculateEmissions().
 */

const { calculateEmissions } = require("./app.js");

describe("calculateEmissions(distance, coefficient)", () => {

  // ── Valid transport mode calculations ───────────────────────────────────────

  test("Test 01 — Car:       10 km × 0.24 = 2.40 kg CO2", () => {
    expect(calculateEmissions(10, 0.24)).toBe(2.4);
  });

  test("Test 02 — Bus/Train: 10 km × 0.08 = 0.80 kg CO2", () => {
    expect(calculateEmissions(10, 0.08)).toBe(0.8);
  });

  test("Test 03 — Bike/Walk: 10 km × 0.00 = 0.00 kg CO2", () => {
    expect(calculateEmissions(10, 0.00)).toBe(0);
  });

  // ── Distance parameter — edge and boundary cases ────────────────────────────

  test("Test 04 — Zero distance is valid and returns 0", () => {
    expect(calculateEmissions(0, 0.24)).toBe(0);
  });

  test("Test 05 — Negative distance returns null", () => {
    expect(calculateEmissions(-5, 0.24)).toBeNull();
  });

  test("Test 06 — NaN distance returns null", () => {
    expect(calculateEmissions(NaN, 0.24)).toBeNull();
  });

  test("Test 07 — Infinity distance returns null", () => {
    expect(calculateEmissions(Infinity, 0.24)).toBeNull();
  });

  test("Test 08 — Negative Infinity distance returns null", () => {
    expect(calculateEmissions(-Infinity, 0.24)).toBeNull();
  });

  test("Test 09 — String (XSS injection) as distance returns null", () => {
    expect(calculateEmissions("<script>alert(1)</script>", 0.24)).toBeNull();
  });

  test("Test 10 — Undefined distance returns null", () => {
    expect(calculateEmissions(undefined, 0.24)).toBeNull();
  });

  test("Test 11 — Null distance returns null", () => {
    expect(calculateEmissions(null, 0.24)).toBeNull();
  });

  // ── Coefficient parameter — symmetrical invalid-type coverage (Fix 11) ──────

  test("Test 12 — Negative coefficient returns null", () => {
    expect(calculateEmissions(10, -0.5)).toBeNull();
  });

  test("Test 13 — Null coefficient returns null", () => {
    expect(calculateEmissions(10, null)).toBeNull();
  });

  test("Test 14 — Undefined coefficient returns null", () => {
    expect(calculateEmissions(10, undefined)).toBeNull();
  });

  test("Test 15 — String coefficient returns null", () => {
    expect(calculateEmissions(10, "0.24")).toBeNull();
  });

  test("Test 16 — NaN coefficient returns null", () => {
    expect(calculateEmissions(10, NaN)).toBeNull();
  });

  test("Test 17 — Infinity coefficient returns null", () => {
    expect(calculateEmissions(10, Infinity)).toBeNull();
  });

  // ── Floating-point precision (Fix 12) ───────────────────────────────────────

  test("Test 18 — 3.333 km × 0.24 rounds to 0.80 (not 0.7999...)", () => {
    expect(calculateEmissions(3.333, 0.24)).toBe(0.8);
  });

  test("Test 19 — 7.5 km × 0.08 returns exact 0.60", () => {
    expect(calculateEmissions(7.5, 0.08)).toBe(0.6);
  });

  test("Test 20 — 1.005 km × 1.00 returns 1.00 (IEEE 754: 1.005 stores as 1.00499... in binary)", () => {
    // 1.005 is not exactly representable in IEEE 754 double precision.
    // It resolves to ~1.00499999..., so Math.round(100.499...) = 100 → 1.00
    expect(calculateEmissions(1.005, 1.00)).toBe(1.00);
  });

  // ── Both arguments invalid ───────────────────────────────────────────────────

  test("Test 21 — Both arguments null returns null", () => {
    expect(calculateEmissions(null, null)).toBeNull();
  });

  test("Test 22 — Both arguments strings returns null", () => {
    expect(calculateEmissions("10", "0.24")).toBeNull();
  });

});
