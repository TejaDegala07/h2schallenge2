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
  if (typeof distance !== "number" || typeof coefficient !== "number") {
    return null;
  }
  if (isNaN(distance) || !isFinite(distance) || distance < 0) {
    return null;
  }
  if (isNaN(coefficient) || !isFinite(coefficient) || coefficient < 0) {
    return null;
  }
  return Math.round(distance * coefficient * 100) / 100;
}

// ─────────────────────────────────────────────────────────────────────────────
// INSIGHTS BUILDER ENGINE — pure function, decoupled from DOM
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds personalized reduction insights based on transport type and distance.
 *
 * @param {string} type     - Transport type (e.g. "car", "bus", "bike").
 * @param {number} distance - Commute distance in km.
 * @returns {string[]}      - List of recommendation messages.
 */
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

// ─────────────────────────────────────────────────────────────────────────────
// UI CONTROLLER FUNCTIONS — testable DOM integration handlers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Handles form submission and updates DOM elements based on user selections.
 *
 * @param {Event} event     - Submit event instance.
 * @param {Object} elements - Collection of pre-cached DOM elements.
 */
function handleFormSubmit(event, elements) {
  event.preventDefault();

  // Retrieve selected values from elements configuration (eliminates local state variables and query selectors)
  const selectedBtn = Array.from(elements.transportBtns).find(
    (btn) => btn.getAttribute("aria-checked") === "true"
  );
  const selectedCoeff = selectedBtn ? parseFloat(selectedBtn.dataset.coeff) : null;
  const selectedType = selectedBtn ? selectedBtn.dataset.type : null;

  // Validate transport selection
  const isTransportValid = selectedCoeff !== null;
  if (!isTransportValid) {
    elements.transportErr.classList.remove("hidden");
  } else {
    elements.transportErr.classList.add("hidden");
  }

  // Validate distance field
  const rawDistance = elements.distanceInput.value.trim();
  const distance = parseFloat(rawDistance);
  const isDistanceValid = rawDistance !== "" && !isNaN(distance) && distance >= 0;

  if (!isDistanceValid) {
    elements.distanceErr.classList.remove("hidden");
    elements.distanceInput.setAttribute("aria-invalid", "true");
  } else {
    elements.distanceErr.classList.add("hidden");
    elements.distanceInput.setAttribute("aria-invalid", "false");
  }

  if (!isTransportValid || !isDistanceValid) {
    return;
  }

  // ── Delegate calculation to pure math engine ────────────────────────────
  const result = calculateEmissions(distance, selectedCoeff);

  if (result === null) {
    elements.distanceErr.classList.remove("hidden");
    return;
  }

  // ── Render result — textContent only, zero innerHTML usage ───────────────
  elements.emissionsOut.textContent = result.toFixed(2);

  // ── Rebuild insights list — replaceChildren() eliminates XSS risk ────────
  elements.insightsList.replaceChildren();
  buildInsights(selectedType, distance).forEach((tip) => {
    const ownerDoc = elements.insightsList.ownerDocument || document;
    const li = ownerDoc.createElement("li");
    li.textContent = tip;
    elements.insightsList.appendChild(li);
  });

  // ── Reveal results panel ─────────────────────────────────────────────────
  elements.resultBox.classList.remove("hidden");

  // ── Polite screen-reader announcement ────────────────────────────────────
  elements.announcer.textContent =
    "Results updated. Your daily carbon footprint is " +
    result.toFixed(2) +
    " kilograms of CO2 equivalent.";
}

// ─────────────────────────────────────────────────────────────────────────────
// CONDITIONAL EXPORT — safe for both Node (Jest) and browser environments
// ─────────────────────────────────────────────────────────────────────────────
if (typeof module !== "undefined") {
  module.exports = { calculateEmissions, handleFormSubmit, buildInsights };
}

// ─────────────────────────────────────────────────────────────────────────────
// DOM CONTROLLER INITIALIZATION — executes only in a browser context
// ─────────────────────────────────────────────────────────────────────────────
/* istanbul ignore next */
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    "use strict";

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

    const elements = {
      form,
      transportBtns,
      distanceInput,
      resultBox,
      emissionsOut,
      insightsList,
      announcer,
      transportErr,
      distanceErr,
    };

    // ── Transport button interactions ──────────────────────────────────────────
    transportBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        transportBtns.forEach((b) => {
          b.setAttribute("aria-checked", "false");
          b.classList.remove("border-emerald-500", "bg-emerald-900/30", "text-emerald-400");
          b.classList.add("border-slate-600", "bg-slate-900");
        });

        btn.setAttribute("aria-checked", "true");
        btn.classList.remove("border-slate-600", "bg-slate-900");
        btn.classList.add("border-emerald-500", "bg-emerald-900/30", "text-emerald-400");

        transportErr.classList.add("hidden");
      });

      // WCAG 2.1 SC 2.1.1 — Space and Enter must activate radio buttons
      btn.addEventListener("keydown", (e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          btn.click();
        }
      });
    });

    // ── Delegate form submit execution to external controller ───────────────
    form.addEventListener("submit", (e) => {
      handleFormSubmit(e, elements);
    });
  });
}
