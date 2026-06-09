"use strict";

// ─────────────────────────────────────────────────────────────────────────────
// PURE MATH ENGINE — zero DOM dependencies, fully unit-testable
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculates CO₂ emissions for a single commute leg.
 *
 * @param {number} distance    - Distance in km. Must be a finite number >= 0.
 * @param {number} coefficient - Emission factor kg CO₂/km. Must be a finite number >= 0.
 * @returns {number|null}      - Result rounded to 2 dp, or null for any invalid input.
 */
function calculateEmissions(distance, coefficient) {
  // Structural type guard — rejects strings, null, undefined, objects, booleans
  if (typeof distance !== "number" || typeof coefficient !== "number") {
    return null;
  }
  // Reject NaN and Infinity (isNaN catches NaN; !isFinite catches ±Infinity)
  if (isNaN(distance) || !isFinite(distance) || distance < 0) {
    return null;
  }
  if (isNaN(coefficient) || !isFinite(coefficient) || coefficient < 0) {
    return null;
  }
  // Multiply then round symmetrically to 2 decimal places
  return Math.round(distance * coefficient * 100) / 100;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONDITIONAL EXPORT — safe for both Node (Jest) and browser environments
// ─────────────────────────────────────────────────────────────────────────────
if (typeof module !== "undefined") {
  module.exports = { calculateEmissions };
}

// ─────────────────────────────────────────────────────────────────────────────
// DOM CONTROLLER — executes only in a browser context
// ─────────────────────────────────────────────────────────────────────────────
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // ── State ──────────────────────────────────────────────────────────────────
    let selectedCoeff = null;
    let selectedType  = null;

    // ── Cached DOM references (single query per element) ───────────────────────
    const form          = document.getElementById("footprint-form");
    const transportBtns = document.querySelectorAll(".transport-btn");
    const distanceInput = document.getElementById("distance-input");
    const resultBox     = document.getElementById("result-box");
    const emissionsOut  = document.getElementById("emissions-output");
    const insightsList  = document.getElementById("insights-list");
    const announcer     = document.getElementById("sr-announcer");
    const transportErr  = document.getElementById("transport-error");
    const distanceErr   = document.getElementById("distance-error");

    // ── Transport radio group ──────────────────────────────────────────────────
    transportBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        // Reset all peers
        transportBtns.forEach(function (b) {
          b.setAttribute("aria-checked", "false");
          b.classList.remove("border-emerald-500", "bg-emerald-900/30", "text-emerald-400");
          b.classList.add("border-slate-600", "bg-slate-900");
        });

        // Activate selected
        btn.setAttribute("aria-checked", "true");
        btn.classList.remove("border-slate-600", "bg-slate-900");
        btn.classList.add("border-emerald-500", "bg-emerald-900/30", "text-emerald-400");

        selectedCoeff = parseFloat(btn.dataset.coeff);
        selectedType  = btn.dataset.type;
        transportErr.classList.add("hidden");
      });

      // WCAG 2.1 SC 2.1.1 — Space and Enter must activate radio buttons
      btn.addEventListener("keydown", function (e) {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          btn.click();
        }
      });
    });

    // ── Form submission ────────────────────────────────────────────────────────
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      let valid = true;

      // Validate transport selection
      if (selectedCoeff === null) {
        transportErr.classList.remove("hidden");
        valid = false;
      } else {
        transportErr.classList.add("hidden");
      }

      // Validate distance field
      const rawDistance = distanceInput.value.trim();
      const distance    = parseFloat(rawDistance);

      if (rawDistance === "" || isNaN(distance) || distance < 0) {
        distanceErr.classList.remove("hidden");
        distanceInput.setAttribute("aria-invalid", "true");
        valid = false;
      } else {
        distanceErr.classList.add("hidden");
        distanceInput.setAttribute("aria-invalid", "false");
      }

      if (!valid) return;

      // ── Delegate to pure math engine ────────────────────────────────────────
      const result = calculateEmissions(distance, selectedCoeff);

      if (result === null) {
        distanceErr.classList.remove("hidden");
        return;
      }

      // ── Render result — textContent only, zero innerHTML usage ───────────────
      emissionsOut.textContent = result.toFixed(2);

      // ── Rebuild insights list — replaceChildren() eliminates the innerHTML
      //    XSS sink that SAST scanners (Semgrep / CodeQL) flag ──────────────────
      insightsList.replaceChildren();
      buildInsights(selectedType, distance).forEach(function (tip) {
        const li = document.createElement("li");
        li.textContent = tip;           // textContent: safe against XSS injection
        insightsList.appendChild(li);
      });

      // ── Reveal results panel ─────────────────────────────────────────────────
      resultBox.classList.remove("hidden");

      // ── Polite screen-reader announcement ───────────────────────────────────
      announcer.textContent =
        "Results updated. Your daily carbon footprint is " +
        result.toFixed(2) +
        " kilograms of CO2 equivalent.";
    });

    // ── Insights copy builder ──────────────────────────────────────────────────
    function buildInsights(type, distance) {
      const tips = [];

      if (type === "car" && distance > 10) {
        tips.push(
          "Your daily commute contributes a heavy carbon load. Switching to carpooling or public transport can cut emissions by roughly 60%."
        );
        tips.push(
          "Smooth acceleration and cruise control can save up to 15% on fuel efficiency."
        );
      } else if (type === "bus") {
        tips.push(
          "Excellent — shared public transport saves approximately 68% more emissions than single-occupancy vehicles daily."
        );
        tips.push(
          "Combining errands into fewer trips reduces total journey frequency further."
        );
      } else {
        tips.push(
          "Perfect zero-emission profile! Your active transport completely eliminates commute atmospheric impact."
        );
        tips.push(
          "Advocate for green pedestrian and cycling corridors in your urban neighbourhood."
        );
      }

      tips.push(
        "General tip: Offset your footprint by choosing locally sourced food and eliminating standby power draw with smart home sockets."
      );

      return tips;
    }
  });
}
