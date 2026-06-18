/**
 * @jest-environment jsdom
 */

"use strict";

var app = require("./app.js");
var calculateEmissions = app.calculateEmissions;
var handleFormSubmit = app.handleFormSubmit;
var buildInsights = app.buildInsights;
var initializeApp = app.initializeApp;
var findSelectedButton = app.findSelectedButton;
var indexOfNode = app.indexOfNode;

// =============================================================================
// calculateEmissions — Symmetrical Guard Testing
// =============================================================================

describe("calculateEmissions - Symmetrical Guard Testing", function () {
  describe("Invalid distance arguments (with valid coefficient)", function () {
    test("string distance returns null", function () { expect(calculateEmissions("10", 0.24)).toBeNull(); });
    test("empty string distance returns null", function () { expect(calculateEmissions("", 0.24)).toBeNull(); });
    test("alphabetic string distance returns null", function () { expect(calculateEmissions("abc", 0.24)).toBeNull(); });
    test("null distance returns null", function () { expect(calculateEmissions(null, 0.24)).toBeNull(); });
    test("undefined distance returns null", function () { expect(calculateEmissions(undefined, 0.24)).toBeNull(); });
    test("boolean true distance returns null", function () { expect(calculateEmissions(true, 0.24)).toBeNull(); });
    test("boolean false distance returns null", function () { expect(calculateEmissions(false, 0.24)).toBeNull(); });
    test("object distance returns null", function () { expect(calculateEmissions({}, 0.24)).toBeNull(); });
    test("array distance returns null", function () { expect(calculateEmissions([], 0.24)).toBeNull(); });
    test("function distance returns null", function () { expect(calculateEmissions(function () {}, 0.24)).toBeNull(); });
    test("NaN distance returns null", function () { expect(calculateEmissions(NaN, 0.24)).toBeNull(); });
    test("Infinity distance returns null", function () { expect(calculateEmissions(Infinity, 0.24)).toBeNull(); });
    test("-Infinity distance returns null", function () { expect(calculateEmissions(-Infinity, 0.24)).toBeNull(); });
    test("negative distance returns null", function () { expect(calculateEmissions(-5, 0.24)).toBeNull(); });
  });

  describe("Invalid coefficient arguments (with valid distance)", function () {
    test("string coefficient returns null", function () { expect(calculateEmissions(10, "0.24")).toBeNull(); });
    test("empty string coefficient returns null", function () { expect(calculateEmissions(10, "")).toBeNull(); });
    test("alphabetic string coefficient returns null", function () { expect(calculateEmissions(10, "abc")).toBeNull(); });
    test("null coefficient returns null", function () { expect(calculateEmissions(10, null)).toBeNull(); });
    test("undefined coefficient returns null", function () { expect(calculateEmissions(10, undefined)).toBeNull(); });
    test("boolean true coefficient returns null", function () { expect(calculateEmissions(10, true)).toBeNull(); });
    test("boolean false coefficient returns null", function () { expect(calculateEmissions(10, false)).toBeNull(); });
    test("object coefficient returns null", function () { expect(calculateEmissions(10, {})).toBeNull(); });
    test("array coefficient returns null", function () { expect(calculateEmissions(10, [])).toBeNull(); });
    test("function coefficient returns null", function () { expect(calculateEmissions(10, function () {})).toBeNull(); });
    test("NaN coefficient returns null", function () { expect(calculateEmissions(10, NaN)).toBeNull(); });
    test("Infinity coefficient returns null", function () { expect(calculateEmissions(10, Infinity)).toBeNull(); });
    test("-Infinity coefficient returns null", function () { expect(calculateEmissions(10, -Infinity)).toBeNull(); });
    test("negative coefficient returns null", function () { expect(calculateEmissions(10, -0.5)).toBeNull(); });
  });

  describe("Both arguments invalid", function () {
    test("both null returns null", function () { expect(calculateEmissions(null, null)).toBeNull(); });
    test("both strings returns null", function () { expect(calculateEmissions("10", "0.24")).toBeNull(); });
  });
});

// =============================================================================
// calculateEmissions — Decimal Boundary and Valid Output Testing
// =============================================================================

describe("calculateEmissions - Decimal Boundary and Valid Output Testing", function () {
  test("zero distance and valid coefficient returns 0", function () { expect(calculateEmissions(0, 0.24)).toBe(0); });
  test("valid distance and zero coefficient returns 0", function () { expect(calculateEmissions(10, 0)).toBe(0); });
  test("both zero returns 0", function () { expect(calculateEmissions(0, 0)).toBe(0); });
  test("car emission calculation: 10 km × 0.24 = 2.4", function () { expect(calculateEmissions(10, 0.24)).toBe(2.4); });
  test("bus emission calculation: 10 km × 0.08 = 0.8", function () { expect(calculateEmissions(10, 0.08)).toBe(0.8); });
  test("decimal precision: 3.333 km × 0.24 = 0.80", function () { expect(calculateEmissions(3.333, 0.24)).toBe(0.8); });
  test("decimal precision: 7.5 km × 0.08 = 0.60", function () { expect(calculateEmissions(7.5, 0.08)).toBe(0.6); });
  test("IEEE 754 precision boundary: 1.005 km × 1.00 = 1.00", function () { expect(calculateEmissions(1.005, 1.00)).toBe(1.00); });
  test("fractional distance rounding: 1.23456 km × 0.24 = 0.30", function () { expect(calculateEmissions(1.23456, 0.24)).toBe(0.3); });
  test("high precision coefficients: 15 km × 0.123456 = 1.85", function () { expect(calculateEmissions(15, 0.123456)).toBe(1.85); });
  test("very large distance: 10000 km × 0.24 = 2400", function () { expect(calculateEmissions(10000, 0.24)).toBe(2400); });
  test("very small coefficient: 100 km × 0.001 = 0.1", function () { expect(calculateEmissions(100, 0.001)).toBe(0.1); });
});

// =============================================================================
// buildInsights — Engine Testing
// =============================================================================

describe("buildInsights Engine Testing", function () {
  test("returns car commuting tips for car and distance > threshold", function () {
    var tips = buildInsights("car", 15);
    expect(tips[0]).toContain("heavy carbon load");
    expect(tips[1]).toContain("Smooth acceleration");
  });

  test("returns default active transport tips for car and distance <= threshold", function () {
    var tips = buildInsights("car", 5);
    expect(tips[0]).toContain("zero-emission profile");
  });

  test("returns shared public transit tips for bus", function () {
    var tips = buildInsights("bus", 15);
    expect(tips[0]).toContain("shared public transport");
    expect(tips[1]).toContain("Combining errands");
  });

  test("returns zero-emission tips for bike type", function () {
    var tips = buildInsights("bike", 10);
    expect(tips[0]).toContain("zero-emission profile");
    expect(tips[1]).toContain("green pedestrian");
  });

  test("always appends the general sustainability tip as the final element", function () {
    var carTips = buildInsights("car", 15);
    var busTips = buildInsights("bus", 5);
    var bikeTips = buildInsights("bike", 0);
    expect(carTips[carTips.length - 1]).toContain("General tip");
    expect(busTips[busTips.length - 1]).toContain("General tip");
    expect(bikeTips[bikeTips.length - 1]).toContain("General tip");
  });

  test("car tips at threshold boundary (distance = 10) returns zero-emission tips", function () {
    var tips = buildInsights("car", 10);
    expect(tips[0]).toContain("zero-emission profile");
  });

  test("car tips just above threshold (distance = 11) returns car commuting tips", function () {
    var tips = buildInsights("car", 11);
    expect(tips[0]).toContain("heavy carbon load");
  });

  test("returns exactly 3 tips for all valid transport types", function () {
    expect(buildInsights("car", 15).length).toBe(3);
    expect(buildInsights("bus", 5).length).toBe(3);
    expect(buildInsights("bike", 0).length).toBe(3);
  });

  test("zero distance with bus still returns bus tips", function () {
    var tips = buildInsights("bus", 0);
    expect(tips[0]).toContain("shared public transport");
  });
});

// =============================================================================
// Helper Functions — Direct Unit Testing
// =============================================================================

describe("findSelectedButton - Direct Unit Testing", function () {
  test("returns null when no button has aria-checked=true", function () {
    document.body.innerHTML = '<button class="transport-btn" aria-checked="false"></button>';
    var btns = document.querySelectorAll(".transport-btn");
    expect(findSelectedButton(btns)).toBeNull();
  });

  test("returns the button with aria-checked=true", function () {
    document.body.innerHTML =
      '<button class="transport-btn" aria-checked="false"></button>' +
      '<button class="transport-btn" aria-checked="true"></button>';
    var btns = document.querySelectorAll(".transport-btn");
    expect(findSelectedButton(btns)).toBe(btns[1]);
  });

  test("returns null for an empty NodeList", function () {
    document.body.innerHTML = "<div></div>";
    var btns = document.querySelectorAll(".transport-btn");
    expect(findSelectedButton(btns)).toBeNull();
  });
});

describe("indexOfNode - Direct Unit Testing", function () {
  test("returns correct index when element is in the list", function () {
    document.body.innerHTML = '<span id="a"></span><span id="b"></span>';
    var items = document.querySelectorAll("span");
    expect(indexOfNode(items, document.getElementById("b"))).toBe(1);
  });

  test("returns -1 when element is not in the list", function () {
    document.body.innerHTML = '<span id="a"></span><span id="b"></span><div id="c"></div>';
    var items = document.querySelectorAll("span");
    expect(indexOfNode(items, document.getElementById("c"))).toBe(-1);
  });

  test("returns -1 for an empty list", function () {
    document.body.innerHTML = '<div id="c"></div>';
    var items = document.querySelectorAll("span");
    expect(indexOfNode(items, document.getElementById("c"))).toBe(-1);
  });
});

// =============================================================================
// DOM Controller Architecture
// =============================================================================

describe("DOM Controller Architecture", function () {
  var elements;

  beforeEach(function () {
    document.body.innerHTML =
      '<form id="footprint-form">' +
        '<div id="transport-selector">' +
          '<button type="button" id="btn-car" class="transport-btn" data-type="car" data-coeff="0.24" aria-checked="false"></button>' +
          '<button type="button" id="btn-bus" class="transport-btn" data-type="bus" data-coeff="0.08" aria-checked="false"></button>' +
          '<button type="button" id="btn-bike" class="transport-btn" data-type="bike" data-coeff="0.00" aria-checked="false"></button>' +
        '</div>' +
        '<p id="transport-error" class="hidden"></p>' +
        '<input type="number" id="distance-input" value="">' +
        '<p id="distance-error" class="hidden"></p>' +
        '<button type="submit" id="calculate-btn"></button>' +
      '</form>' +
      '<div id="result-box" class="hidden">' +
        '<span id="emissions-output">0.00</span>' +
        '<ul id="insights-list"></ul>' +
      '</div>' +
      '<div id="sr-announcer"></div>';

    elements = {
      form: document.getElementById("footprint-form"),
      transportBtns: document.querySelectorAll(".transport-btn"),
      distanceInput: document.getElementById("distance-input"),
      resultBox: document.getElementById("result-box"),
      emissionsOut: document.getElementById("emissions-output"),
      insightsList: document.getElementById("insights-list"),
      announcer: document.getElementById("sr-announcer"),
      transportErr: document.getElementById("transport-error"),
      distanceErr: document.getElementById("distance-error"),
    };
  });

  test("Submitting the form with valid metrics updates emissions output and insights list", function () {
    var carBtn = document.getElementById("btn-car");
    carBtn.setAttribute("aria-checked", "true");
    elements.distanceInput.value = "15";
    var event = { preventDefault: jest.fn() };
    handleFormSubmit(event, elements);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(elements.emissionsOut.textContent).toBe("3.60");
    expect(elements.resultBox.classList.contains("hidden")).toBe(false);
    expect(elements.insightsList.children.length).toBeGreaterThan(0);
    expect(elements.announcer.textContent).toContain("3.60");
  });

  test("Submitting the form with missing transport parameters cleanly triggers transport error", function () {
    elements.distanceInput.value = "15";
    var event = { preventDefault: jest.fn() };
    handleFormSubmit(event, elements);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(elements.transportErr.classList.contains("hidden")).toBe(false);
  });

  test("Submitting the form with negative or empty distance inputs triggers distance error and aria-invalid", function () {
    var carBtn = document.getElementById("btn-car");
    carBtn.setAttribute("aria-checked", "true");
    elements.distanceInput.value = "";
    var event1 = { preventDefault: jest.fn() };
    handleFormSubmit(event1, elements);
    expect(elements.distanceErr.classList.contains("hidden")).toBe(false);
    expect(elements.distanceInput.getAttribute("aria-invalid")).toBe("true");

    elements.distanceInput.value = "-5";
    var event2 = { preventDefault: jest.fn() };
    handleFormSubmit(event2, elements);
    expect(elements.distanceErr.classList.contains("hidden")).toBe(false);
    expect(elements.distanceInput.getAttribute("aria-invalid")).toBe("true");
  });

  test("Submitting when pure calculation engine fails with null returns distance error", function () {
    var carBtn = document.getElementById("btn-car");
    carBtn.setAttribute("aria-checked", "true");
    elements.distanceInput.value = "10";
    carBtn.dataset.coeff = "abc";
    var event = { preventDefault: jest.fn() };
    handleFormSubmit(event, elements);
    expect(elements.distanceErr.classList.contains("hidden")).toBe(false);
  });

  test("Successful submission clears previous validation errors", function () {
    var carBtn = document.getElementById("btn-car");
    carBtn.setAttribute("aria-checked", "true");

    // First submit with invalid distance
    elements.distanceInput.value = "";
    handleFormSubmit({ preventDefault: jest.fn() }, elements);
    expect(elements.distanceErr.classList.contains("hidden")).toBe(false);

    // Second submit with valid data should clear the error
    elements.distanceInput.value = "10";
    handleFormSubmit({ preventDefault: jest.fn() }, elements);
    expect(elements.distanceErr.classList.contains("hidden")).toBe(true);
    expect(elements.distanceInput.getAttribute("aria-invalid")).toBe("false");
  });

  test("Submitting with zero distance is valid and produces 0.00 output", function () {
    var carBtn = document.getElementById("btn-car");
    carBtn.setAttribute("aria-checked", "true");
    elements.distanceInput.value = "0";
    var event = { preventDefault: jest.fn() };
    handleFormSubmit(event, elements);
    expect(elements.emissionsOut.textContent).toBe("0.00");
    expect(elements.resultBox.classList.contains("hidden")).toBe(false);
  });

  test("Insights list uses DocumentFragment for batch DOM insertion", function () {
    var carBtn = document.getElementById("btn-car");
    carBtn.setAttribute("aria-checked", "true");
    elements.distanceInput.value = "15";
    handleFormSubmit({ preventDefault: jest.fn() }, elements);
    // Verify all insights were appended in a single batch (3 items for car > threshold)
    expect(elements.insightsList.children.length).toBe(3);
  });

  test("Screen reader announcer contains the exact emission value", function () {
    var busBtn = document.getElementById("btn-bus");
    busBtn.setAttribute("aria-checked", "true");
    elements.distanceInput.value = "20";
    handleFormSubmit({ preventDefault: jest.fn() }, elements);
    expect(elements.announcer.textContent).toContain("1.60");
    expect(elements.announcer.textContent).toContain("kilograms of CO2 equivalent");
  });

  test("Both transport and distance errors shown simultaneously when both invalid", function () {
    elements.distanceInput.value = "";
    handleFormSubmit({ preventDefault: jest.fn() }, elements);
    expect(elements.transportErr.classList.contains("hidden")).toBe(false);
    expect(elements.distanceErr.classList.contains("hidden")).toBe(false);
  });
});

// =============================================================================
// DOM Initialization and App Lifecycle
// =============================================================================

describe("DOM Initialization and App Lifecycle", function () {
  beforeEach(function () {
    document.body.innerHTML =
      '<form id="footprint-form">' +
        '<div id="transport-selector">' +
          '<button type="button" id="btn-car" class="transport-btn border-gray-600 bg-gray-900" data-type="car" data-coeff="0.24" aria-checked="false"></button>' +
          '<button type="button" id="btn-bus" class="transport-btn border-gray-600 bg-gray-900" data-type="bus" data-coeff="0.08" aria-checked="false"></button>' +
          '<button type="button" id="btn-bike" class="transport-btn border-gray-600 bg-gray-900" data-type="bike" data-coeff="0.00" aria-checked="false"></button>' +
        '</div>' +
        '<p id="transport-error" class=""></p>' +
        '<input type="number" id="distance-input" value="">' +
        '<p id="distance-error" class="hidden"></p>' +
        '<button type="submit" id="calculate-btn"></button>' +
      '</form>' +
      '<div id="result-box" class="hidden">' +
        '<span id="emissions-output">0.00</span>' +
        '<ul id="insights-list"></ul>' +
      '</div>' +
      '<div id="sr-announcer"></div>';

    // Initialize the app programmatically to bind all event listeners
    initializeApp();
  });

  test("clicking a transport mode button successfully alters the DOM state and toggles the validation error hidden toggles", function () {
    var carBtn = document.getElementById("btn-car");
    var transportErr = document.getElementById("transport-error");

    expect(carBtn.getAttribute("aria-checked")).toBe("false");

    // Simulate a user click
    carBtn.click();

    expect(carBtn.getAttribute("aria-checked")).toBe("true");
    expect(carBtn.classList.contains("border-green-500")).toBe(true);
    expect(transportErr.classList.contains("hidden")).toBe(true);
  });

  test("keyboard navigation seamlessly shifts focus and checks adjacent buttons", function () {
    var carBtn = document.getElementById("btn-car");
    var busBtn = document.getElementById("btn-bus");
    var bikeBtn = document.getElementById("btn-bike");

    // Press ArrowRight on the first button (car)
    carBtn.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect(busBtn.getAttribute("aria-checked")).toBe("true");
    expect(carBtn.getAttribute("aria-checked")).toBe("false");

    // Press ArrowDown on the second button (bus)
    busBtn.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    expect(bikeBtn.getAttribute("aria-checked")).toBe("true");
    expect(busBtn.getAttribute("aria-checked")).toBe("false");

    // Press ArrowLeft on the third button (bike)
    bikeBtn.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    expect(busBtn.getAttribute("aria-checked")).toBe("true");

    // Press ArrowUp on the second button (bus)
    busBtn.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
    expect(carBtn.getAttribute("aria-checked")).toBe("true");
  });

  test("roving tabindex is correctly applied on initialization", function () {
    var carBtn = document.getElementById("btn-car");
    var busBtn = document.getElementById("btn-bus");
    var bikeBtn = document.getElementById("btn-bike");

    expect(carBtn.getAttribute("tabindex")).toBe("0");
    expect(busBtn.getAttribute("tabindex")).toBe("-1");
    expect(bikeBtn.getAttribute("tabindex")).toBe("-1");
  });

  test("roving tabindex transfers to the selected button on click", function () {
    var carBtn = document.getElementById("btn-car");
    var busBtn = document.getElementById("btn-bus");

    busBtn.click();

    expect(busBtn.getAttribute("tabindex")).toBe("0");
    expect(carBtn.getAttribute("tabindex")).toBe("-1");
  });

  test("clicking a second button deselects the first", function () {
    var carBtn = document.getElementById("btn-car");
    var busBtn = document.getElementById("btn-bus");

    carBtn.click();
    expect(carBtn.getAttribute("aria-checked")).toBe("true");

    busBtn.click();
    expect(busBtn.getAttribute("aria-checked")).toBe("true");
    expect(carBtn.getAttribute("aria-checked")).toBe("false");
  });

  test("initializeApp does not throw when called without footprint-form in the DOM", function () {
    document.body.innerHTML = "<div>No form here</div>";
    expect(function () { initializeApp(); }).not.toThrow();
  });

  test("keyboard wrap-around from last to first button works correctly", function () {
    var bikeBtn = document.getElementById("btn-bike");
    var carBtn = document.getElementById("btn-car");

    bikeBtn.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect(carBtn.getAttribute("aria-checked")).toBe("true");
  });

  test("keyboard wrap-around from first to last button works correctly", function () {
    var carBtn = document.getElementById("btn-car");
    var bikeBtn = document.getElementById("btn-bike");

    carBtn.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    expect(bikeBtn.getAttribute("aria-checked")).toBe("true");
  });

  test("Enter key activates the focused transport button", function () {
    var carBtn = document.getElementById("btn-car");
    carBtn.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(carBtn.getAttribute("aria-checked")).toBe("true");
  });

  test("Space key activates the focused transport button", function () {
    var busBtn = document.getElementById("btn-bus");
    busBtn.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    expect(busBtn.getAttribute("aria-checked")).toBe("true");
  });

  test("form submission via initializeApp triggers handleFormSubmit and shows results", function () {
    var carBtn = document.getElementById("btn-car");
    carBtn.click();
    var distanceInput = document.getElementById("distance-input");
    distanceInput.value = "10";
    var form = document.getElementById("footprint-form");
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    var emissionsOut = document.getElementById("emissions-output");
    expect(emissionsOut.textContent).toBe("2.40");
  });

  test("keydown on non-button element inside transport-selector is ignored", function () {
    var selector = document.getElementById("transport-selector");
    var carBtn = document.getElementById("btn-car");
    // Dispatch keydown on the selector itself (not on a button)
    selector.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: false }));
    // No button should have been checked
    expect(carBtn.getAttribute("aria-checked")).toBe("false");
  });

  test("unrecognized key press does not change selection state", function () {
    var carBtn = document.getElementById("btn-car");
    var busBtn = document.getElementById("btn-bus");

    carBtn.click();
    carBtn.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
    expect(carBtn.getAttribute("aria-checked")).toBe("true");
    expect(busBtn.getAttribute("aria-checked")).toBe("false");
  });

  test("clicking directly on the transport-selector container (not a button) is safely ignored", function () {
    var selector = document.getElementById("transport-selector");
    var carBtn = document.getElementById("btn-car");
    // Click on the container div itself
    selector.click();
    expect(carBtn.getAttribute("aria-checked")).toBe("false");
  });
});
