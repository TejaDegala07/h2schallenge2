"use strict";

/**
 * index.test.js — Jest Test Suite
 * Carbon Footprint Tracker — Hack2Skill PromptWars Challenge 3
 *
 * Tests the pure calculateEmissions(distance, coefficient) function from app.js.
 */

const { calculateEmissions } = require("./app.js");

describe("calculateEmissions(distance, coefficient)", () => {

  // ── Valid calculations ──────────────────────────────────────────────────────

  test("Test 1: correct emissions for Car (10km * 0.24)", () => {
    expect(calculateEmissions(10, 0.24)).toBe(2.4);
  });

  test("Test 2: correct emissions for Bus (10km * 0.08)", () => {
    expect(calculateEmissions(10, 0.08)).toBe(0.8);
  });

  test("Test 3: correct emissions for Bike/Walk (10km * 0.00 = 0)", () => {
    expect(calculateEmissions(10, 0.00)).toBe(0);
  });

  // ── Distance edge cases ─────────────────────────────────────────────────────

  test("Test 4 (Edge Case): negative distance returns null", () => {
    expect(calculateEmissions(-5, 0.24)).toBeNull();
  });

  test("Test 5 (Security): string XSS injection as distance returns null", () => {
    expect(calculateEmissions("<script>alert(1)</script>", 0.24)).toBeNull();
  });

  test("Test 6 (Validation): undefined distance returns null", () => {
    expect(calculateEmissions(undefined, 0.24)).toBeNull();
  });

  test("Test 7 (Validation): NaN distance returns null", () => {
    expect(calculateEmissions(NaN, 0.24)).toBeNull();
  });

  test("Test 8 (Validation): Infinity distance returns null", () => {
    expect(calculateEmissions(Infinity, 0.24)).toBeNull();
  });

  test("Test 9 (Edge Case): zero distance is valid and returns 0", () => {
    expect(calculateEmissions(0, 0.24)).toBe(0);
  });

  // ── Coefficient edge cases (Fix 11 — symmetrical validation coverage) ───────

  test("Test 10 (Validation): negative coefficient returns null", () => {
    expect(calculateEmissions(10, -0.5)).toBeNull();
  });

  test("Test 11 (Validation): null coefficient returns null", () => {
    expect(calculateEmissions(10, null)).toBeNull();
  });

  test("Test 12 (Security): string coefficient returns null", () => {
    expect(calculateEmissions(10, "0.24")).toBeNull();
  });

  // ── Floating-point precision (Fix 12) ───────────────────────────────────────

  test("Test 13 (Precision): 3.333km * 0.24 rounds correctly to 0.8", () => {
    // 3.333 * 0.24 = 0.79992 — must be 0.8, not 0.7999...
    expect(calculateEmissions(3.333, 0.24)).toBe(0.8);
  });

  test("Test 14 (Precision): 7.5km * 0.08 returns exact 0.6", () => {
    expect(calculateEmissions(7.5, 0.08)).toBe(0.6);
  });

});
