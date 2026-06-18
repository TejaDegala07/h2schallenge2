"use strict";

(function () {
  /**
   * Distance threshold in kilometers above which car-specific reduction tips are shown.
   * @constant {number}
   */
  var COMMUTE_THRESHOLD_KM = 10;

  /**
   * Emission coefficients in kg CO2 per kilometer, keyed by transport type.
   * Values sourced from DEFRA 2023 emission factor guidelines.
   * @constant {Object<string, number>}
   */
  var EMISSION_COEFFICIENTS = {
    car:  0.24,
    bus:  0.08,
    bike: 0.00
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // PURE MATH ENGINE
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Calculates total carbon emissions from distance and a transport coefficient.
   * Uses integer-arithmetic rounding to two decimal places to avoid IEEE 754 drift.
   * @param {number} distance - Distance traveled in kilometers. Must be a finite number >= 0.
   * @param {number} coefficient - Emission factor in kg CO2 per km. Must be a finite number >= 0.
   * @returns {number|null} Emissions rounded to two decimal places, or null for invalid inputs.
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
  // INSIGHTS BUILDER ENGINE
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Builds an ordered array of personalised, context-aware CO2 reduction tips.
   * Strategy is selected based on transport type and distance against the commute threshold.
   * Always appends a universal general sustainability tip as the final element.
   * @param {string} type - Transport type key. Must be a key in EMISSION_COEFFICIENTS.
   * @param {number} distance - Daily distance traveled in kilometers.
   * @returns {string[]} Ordered array of 3 actionable reduction insights.
   */
  function buildInsights(type, distance) {
    var tips = [];

    if (type === "car" && distance > COMMUTE_THRESHOLD_KM) {
      tips.push("Your daily commute contributes a heavy carbon load. Switching to carpooling or public transport can cut emissions by roughly 60%.");
      tips.push("Smooth acceleration and cruise control can save up to 15% on fuel efficiency.");
    } else if (type === "bus") {
      tips.push("Excellent — shared public transport saves approximately 68% more emissions than single-occupancy vehicles daily.");
      tips.push("Combining errands into fewer trips reduces total journey frequency further.");
    } else if (type === "bike" || (type === "car" && distance <= COMMUTE_THRESHOLD_KM)) {
      tips.push("Perfect zero-emission profile! Your active transport completely eliminates commute atmospheric impact.");
      tips.push("Advocate for green pedestrian and cycling corridors in your urban neighbourhood.");
    }

    tips.push("General tip: Offset your footprint by choosing locally sourced food and eliminating standby power draw with smart home sockets.");

    return tips;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER FUNCTIONS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Returns the emission coefficient for a given transport type.
   * Falls back to 0 for any unrecognised type (safe default, zero-emission).
   * @param {string} type - Transport type key.
   * @returns {number} Coefficient value in kg CO2 per km.
   */
  function getCoefficient(type) {
    return EMISSION_COEFFICIENTS.hasOwnProperty(type) ? EMISSION_COEFFICIENTS[type] : 0;
  }

  /**
   * Searches a NodeList for the first element with aria-checked="true".
   * @param {NodeList} transportBtns - Collection of transport radio buttons.
   * @returns {Element|null} The selected button, or null if none is selected.
   */
  function findSelectedButton(transportBtns) {
    for (var i = 0; i < transportBtns.length; i++) {
      if (transportBtns[i].getAttribute("aria-checked") === "true") {
        return transportBtns[i];
      }
    }
    return null;
  }

  /**
   * Returns the zero-based index of a target element within a NodeList.
   * @param {NodeList} list - The collection to search.
   * @param {Element} target - The element to locate.
   * @returns {number} Index of the element, or -1 if not found.
   */
  function indexOfNode(list, target) {
    for (var i = 0; i < list.length; i++) {
      if (list[i] === target) {
        return i;
      }
    }
    return -1;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // UI CONTROLLER FUNCTIONS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Handles the form submit event. Validates inputs, calls the pure math engine,
   * and orchestrates all DOM updates including the screen-reader live region.
   * @param {Event} event - The form submit event object.
   * @param {Object} elements - Map of cached DOM element references.
   * @param {NodeList}        elements.transportBtns  - Transport radio buttons.
   * @param {HTMLInputElement} elements.distanceInput  - Distance number input.
   * @param {HTMLElement}     elements.resultBox       - Results container element.
   * @param {HTMLElement}     elements.emissionsOut    - Emissions value output span.
   * @param {HTMLUListElement} elements.insightsList   - Insights unordered list.
   * @param {HTMLElement}     elements.announcer       - Screen-reader live region.
   * @param {HTMLElement}     elements.transportErr    - Transport validation error.
   * @param {HTMLElement}     elements.distanceErr     - Distance validation error.
   */
  function handleFormSubmit(event, elements) {
    event.preventDefault();

    var selectedBtn  = findSelectedButton(elements.transportBtns);
    var selectedType = selectedBtn ? selectedBtn.dataset.type : null;
    var selectedCoeff = selectedType !== null ? getCoefficient(selectedType) : null;

    var isTransportValid = selectedCoeff !== null;
    if (!isTransportValid) {
      elements.transportErr.classList.remove("hidden");
    } else {
      elements.transportErr.classList.add("hidden");
    }

    var rawDistance    = elements.distanceInput.value.trim();
    var distance       = Number(rawDistance);
    var isDistanceValid = rawDistance !== "" && !isNaN(distance) && distance >= 0;

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

    /* calculateEmissions receives a validated non-negative distance and a
       coefficient from EMISSION_COEFFICIENTS (always a number), so result
       is always a valid number at this point. */
    var result = calculateEmissions(distance, selectedCoeff);


    elements.emissionsOut.textContent = result.toFixed(2);
    elements.insightsList.replaceChildren();

    var ownerDoc = elements.insightsList.ownerDocument || document;
    var fragment = ownerDoc.createDocumentFragment();
    var insights = buildInsights(selectedType, distance);
    for (var i = 0; i < insights.length; i++) {
      var li = ownerDoc.createElement("li");
      li.textContent = insights[i];
      fragment.appendChild(li);
    }
    elements.insightsList.appendChild(fragment);

    elements.resultBox.classList.remove("hidden");
    elements.announcer.textContent =
      "Results updated. Your daily carbon footprint is " +
      result.toFixed(2) +
      " kilograms of CO2 equivalent.";
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Bootstraps the application. Caches all DOM element references, applies
   * roving tabindex to the radiogroup, and attaches delegated event listeners
   * for click and keyboard interactions on the transport selector container.
   */
  function initializeApp() {
    var form = document.getElementById("footprint-form");
    if (!form) return;

    var transportSelector = document.getElementById("transport-selector");
    if (!transportSelector) return;

    var transportBtns = document.querySelectorAll(".transport-btn");
    var distanceInput = document.getElementById("distance-input");
    var resultBox     = document.getElementById("result-box");
    var emissionsOut  = document.getElementById("emissions-output");
    var insightsList  = document.getElementById("insights-list");
    var announcer     = document.getElementById("sr-announcer");
    var transportErr  = document.getElementById("transport-error");
    var distanceErr   = document.getElementById("distance-error");

    var elements = {
      form:          form,
      transportBtns: transportBtns,
      distanceInput: distanceInput,
      resultBox:     resultBox,
      emissionsOut:  emissionsOut,
      insightsList:  insightsList,
      announcer:     announcer,
      transportErr:  transportErr,
      distanceErr:   distanceErr,
    };

    // Apply roving tabindex — only the first button is reachable via Tab initially
    for (var i = 0; i < transportBtns.length; i++) {
      transportBtns[i].setAttribute("tabindex", i === 0 ? "0" : "-1");
    }

    // Single delegated click listener on the radiogroup container
    transportSelector.addEventListener("click", function (e) {
      var btn = e.target.closest(".transport-btn");
      if (!btn) return;

      for (var j = 0; j < transportBtns.length; j++) {
        transportBtns[j].setAttribute("aria-checked", "false");
        transportBtns[j].setAttribute("tabindex", "-1");
        transportBtns[j].classList.remove("border-green-500", "bg-green-900", "bg-opacity-30", "text-green-400");
        transportBtns[j].classList.add("border-gray-600", "bg-gray-900");
      }

      btn.setAttribute("aria-checked", "true");
      btn.setAttribute("tabindex", "0");
      btn.classList.remove("border-gray-600", "bg-gray-900");
      btn.classList.add("border-green-500", "bg-green-900", "bg-opacity-30", "text-green-400");

      transportErr.classList.add("hidden");
      btn.focus();
    });

    // Single delegated keydown listener — implements W3C radiogroup arrow-key pattern
    transportSelector.addEventListener("keydown", function (e) {
      var btn = e.target.closest(".transport-btn");
      if (!btn) return;

      var index = indexOfNode(transportBtns, btn);

      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        btn.click();
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        var nextIndex = (index + 1) % transportBtns.length;
        transportBtns[nextIndex].click();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        var prevIndex = (index - 1 + transportBtns.length) % transportBtns.length;
        transportBtns[prevIndex].click();
      }
    });

    form.addEventListener("submit", function (e) {
      handleFormSubmit(e, elements);
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // EXPORT & BOOTSTRAP
  // ─────────────────────────────────────────────────────────────────────────────

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", initializeApp);
  }

  if (typeof module !== "undefined") {
    module.exports = {
      calculateEmissions:  calculateEmissions,
      handleFormSubmit:    handleFormSubmit,
      buildInsights:       buildInsights,
      initializeApp:       initializeApp,
      findSelectedButton:  findSelectedButton,
      indexOfNode:         indexOfNode,
      getCoefficient:      getCoefficient,
      EMISSION_COEFFICIENTS: EMISSION_COEFFICIENTS
    };
  }
})();
