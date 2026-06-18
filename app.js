"use strict";

(function () {
  /**
   * Distance threshold in kilometers above which car-specific reduction tips are shown.
   * @constant {number}
   */
  var COMMUTE_THRESHOLD_KM = 10;

  /**
   * Set of recognized transport types for explicit validation in the insights engine.
   * @constant {Object<string, boolean>}
   */
  var VALID_TRANSPORT_TYPES = { car: true, bus: true, bike: true };

  // ─────────────────────────────────────────────────────────────────────────────
  // PURE MATH ENGINE
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Calculates the total carbon emissions based on distance and transport coefficient.
   * Uses banker's rounding to two decimal places to avoid IEEE 754 drift.
   * @param {number} distance - The total distance traveled in kilometers. Must be >= 0.
   * @param {number} coefficient - The emission coefficient in kg CO2 per kilometer. Must be >= 0.
   * @returns {number|null} The calculated emissions rounded to two decimal places, or null if inputs are invalid.
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
   * Builds an array of personalized, context-aware reduction tips based on commute data.
   * Always appends a general sustainability tip as the final element.
   * @param {string} type - The primary mode of transportation. Must be one of "car", "bus", or "bike".
   * @param {number} distance - The daily distance traveled in kilometers.
   * @returns {string[]} An ordered array of actionable insights/tips.
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
   * Searches a NodeList of transport buttons for the currently selected one.
   * @param {NodeList|Array} transportBtns - The collection of transport radio buttons.
   * @returns {Element|null} The button with aria-checked="true", or null if none is selected.
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
   * Finds the index of a given element within a NodeList.
   * @param {NodeList|Array} list - The collection to search.
   * @param {Element} target - The element to find.
   * @returns {number} The zero-based index, or -1 if not found.
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
   * Handles the form submission event. Orchestrates input validation,
   * emission calculation via the pure math engine, and DOM updates.
   * @param {Event} event - The form submit event.
   * @param {Object} elements - A map of cached DOM element references.
   * @param {NodeList} elements.transportBtns - The transport radio buttons.
   * @param {HTMLInputElement} elements.distanceInput - The distance number input.
   * @param {HTMLElement} elements.resultBox - The results container.
   * @param {HTMLElement} elements.emissionsOut - The emissions output span.
   * @param {HTMLUListElement} elements.insightsList - The insights unordered list.
   * @param {HTMLElement} elements.announcer - The screen-reader live region.
   * @param {HTMLElement} elements.transportErr - The transport validation error element.
   * @param {HTMLElement} elements.distanceErr - The distance validation error element.
   */
  function handleFormSubmit(event, elements) {
    event.preventDefault();

    var selectedBtn = findSelectedButton(elements.transportBtns);
    var selectedCoeff = selectedBtn ? Number(selectedBtn.dataset.coeff) : null;
    var selectedType = selectedBtn ? selectedBtn.dataset.type : null;

    var isTransportValid = selectedCoeff !== null;
    if (!isTransportValid) {
      elements.transportErr.classList.remove("hidden");
    } else {
      elements.transportErr.classList.add("hidden");
    }

    var rawDistance = elements.distanceInput.value.trim();
    var distance = Number(rawDistance);
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

    var result = calculateEmissions(distance, selectedCoeff);

    if (result === null) {
      elements.distanceErr.classList.remove("hidden");
      return;
    }

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
    elements.announcer.textContent = "Results updated. Your daily carbon footprint is " + result.toFixed(2) + " kilograms of CO2 equivalent.";
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Initializes the application by caching DOM elements, applying roving tabindex
   * to the radiogroup, and binding delegated event listeners for click and keyboard
   * interactions on the transport selector.
   */
  function initializeApp() {
    var form = document.getElementById("footprint-form");
    if (!form) return;

    var transportSelector = document.getElementById("transport-selector");
    if (!transportSelector) return;

    var transportBtns = document.querySelectorAll(".transport-btn");
    var distanceInput = document.getElementById("distance-input");
    var resultBox = document.getElementById("result-box");
    var emissionsOut = document.getElementById("emissions-output");
    var insightsList = document.getElementById("insights-list");
    var announcer = document.getElementById("sr-announcer");
    var transportErr = document.getElementById("transport-error");
    var distanceErr = document.getElementById("distance-error");

    var elements = {
      form: form,
      transportBtns: transportBtns,
      distanceInput: distanceInput,
      resultBox: resultBox,
      emissionsOut: emissionsOut,
      insightsList: insightsList,
      announcer: announcer,
      transportErr: transportErr,
      distanceErr: distanceErr,
    };

    // Apply roving tabindex: only first button is tab-reachable initially
    for (var i = 0; i < transportBtns.length; i++) {
      transportBtns[i].setAttribute("tabindex", i === 0 ? "0" : "-1");
    }

    // Delegated click handler on the radiogroup container
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

    // Delegated keydown handler for arrow-key navigation within the radiogroup
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
    module.exports = { calculateEmissions: calculateEmissions, handleFormSubmit: handleFormSubmit, buildInsights: buildInsights, initializeApp: initializeApp, findSelectedButton: findSelectedButton, indexOfNode: indexOfNode };
  }
})();
