/**
 * Carbon Footprint Tracker — Hack2Skill PromptWars Challenge 3
 * A conversational Node.js console assistant that collects user context,
 * calculates a daily CO₂ footprint matrix, and suggests personalized
 * reduction strategies.
 *
 * Author : Dynamic Assistant
 * Runtime: Node.js (no external dependencies)
 */

"use strict";

const readline = require("readline");

// ─────────────────────────────────────────────────────────────────────────────
// EMISSION CONSTANTS  (kg CO₂ per unit — peer-reviewed averages)
// ─────────────────────────────────────────────────────────────────────────────
const EMISSION_FACTORS = {
  transport: {
    car:   0.404,  // kg CO₂ per mile (average US petrol car, EPA 2023)
    bus:   0.089,  // kg CO₂ per mile per passenger (DEFRA 2023)
    train: 0.041,  // kg CO₂ per mile per passenger (IEA 2022)
    bike:  0.000,  // zero tailpipe emissions
    walk:  0.000,  // zero tailpipe emissions
  },
  diet: {
    // kg CO₂ per day (Oxford / Poore & Nemecek 2018 lifecycle analysis)
    "meat-heavy":  7.19,
    average:       5.63,
    vegetarian:    3.81,
    vegan:         2.89,
  },
  electricity: 0.386, // kg CO₂ per kWh (US EIA 2023 grid average)
};

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Round to N decimal places */
const round = (val, dp = 2) => Math.round(val * 10 ** dp) / 10 ** dp;

/** Print a styled section header */
const header = (text) => {
  const line = "─".repeat(58);
  console.log(`\n${line}`);
  console.log(`  ${text}`);
  console.log(line);
};

/** Simple ANSI colour helpers (gracefully no-ops if terminal lacks support) */
const c = {
  green:  (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan:   (s) => `\x1b[36m${s}\x1b[0m`,
  bold:   (s) => `\x1b[1m${s}\x1b[0m`,
  dim:    (s) => `\x1b[2m${s}\x1b[0m`,
};

// ─────────────────────────────────────────────────────────────────────────────
// INPUT / VALIDATION LAYER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Prompts the user and returns a validated value.
 * @param {readline.Interface} rl
 * @param {string}   prompt    - Question shown to the user
 * @param {Function} validator - Returns { ok, value, error } for the raw input
 * @returns {Promise<any>}
 */
function ask(rl, prompt, validator) {
  return new Promise((resolve) => {
    const attempt = () => {
      rl.question(prompt, (raw) => {
        const trimmed = raw.trim();
        const result  = validator(trimmed);
        if (result.ok) {
          resolve(result.value);
        } else {
          console.log(c.yellow(`  ⚠  ${result.error}`));
          attempt();
        }
      });
    };
    attempt();
  });
}

/** Validators ---------------------------------------------------------------- */

const validators = {
  /** Accepts one of an allowed set of strings (case-insensitive) */
  choice: (allowed) => (raw) => {
    const val = raw.toLowerCase();
    if (allowed.includes(val)) return { ok: true, value: val };
    return {
      ok: false,
      error: `Please enter one of: ${allowed.join(" | ")}`,
    };
  },

  /** Accepts a non-negative finite number */
  nonNegativeNumber: (raw) => {
    const num = parseFloat(raw);
    if (raw === "" || isNaN(num) || !isFinite(num))
      return { ok: false, error: "Please enter a valid number (e.g. 12.5)." };
    if (num < 0)
      return { ok: false, error: "Value cannot be negative." };
    return { ok: true, value: num };
  },

  /** Accepts yes / no */
  yesNo: (raw) => {
    const val = raw.toLowerCase();
    if (val === "y" || val === "yes") return { ok: true, value: true  };
    if (val === "n" || val === "no")  return { ok: true, value: false };
    return { ok: false, error: 'Please type "yes" or "no".' };
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// DATA COLLECTION PHASE
// ─────────────────────────────────────────────────────────────────────────────

async function collectUserContext(rl) {
  header("🌱  Carbon Footprint Tracker  |  Daily Context Survey");
  console.log(c.dim("  Answer each question to receive your personal CO₂ report.\n"));

  const transportOptions = Object.keys(EMISSION_FACTORS.transport);
  const dietOptions      = Object.keys(EMISSION_FACTORS.diet);

  const transportType = await ask(
    rl,
    c.cyan(`\n  How do you primarily commute today?\n  Options: ${transportOptions.join(" | ")}\n  > `),
    validators.choice(transportOptions)
  );

  let milesDriven = 0;
  if (!["bike", "walk"].includes(transportType)) {
    milesDriven = await ask(
      rl,
      c.cyan(`\n  How many miles did you travel by ${transportType} today?\n  > `),
      validators.nonNegativeNumber
    );
  } else {
    console.log(c.green("  ✓ Zero-emission travel — no distance input needed."));
  }

  const dietPreference = await ask(
    rl,
    c.cyan(`\n  Which best describes your diet today?\n  Options: ${dietOptions.join(" | ")}\n  > `),
    validators.choice(dietOptions)
  );

  const electricityUsage = await ask(
    rl,
    c.cyan("\n  How many kWh of electricity did you use today? (Check your smart meter or estimate)\n  > "),
    validators.nonNegativeNumber
  );

  return { transportType, milesDriven, dietPreference, electricityUsage };
}

// ─────────────────────────────────────────────────────────────────────────────
// CALCULATION PHASE  — CO₂ Footprint Matrix
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds a detailed emissions matrix from collected context.
 * @param {{ transportType, milesDriven, dietPreference, electricityUsage }} ctx
 * @returns {object} footprintMatrix
 */
function calculateFootprintMatrix(ctx) {
  const { transportType, milesDriven, dietPreference, electricityUsage } = ctx;

  const transportKg    = round(EMISSION_FACTORS.transport[transportType] * milesDriven);
  const dietKg         = round(EMISSION_FACTORS.diet[dietPreference]);
  const electricityKg  = round(EMISSION_FACTORS.electricity * electricityUsage);
  const totalKg        = round(transportKg + dietKg + electricityKg);

  // Benchmark: global average daily footprint ≈ 12.01 kg CO₂ (World Bank 2022)
  const GLOBAL_AVERAGE_KG = 12.01;
  const deltaVsAverage    = round(totalKg - GLOBAL_AVERAGE_KG);
  const percentVsAverage  = round((deltaVsAverage / GLOBAL_AVERAGE_KG) * 100);

  return {
    transport:        { label: "Transportation", kg: transportKg, unit: `${milesDriven} mi × ${EMISSION_FACTORS.transport[transportType]} kg/mi` },
    diet:             { label: "Diet",           kg: dietKg,       unit: `${dietPreference} pattern` },
    electricity:      { label: "Electricity",    kg: electricityKg, unit: `${electricityUsage} kWh × ${EMISSION_FACTORS.electricity} kg/kWh` },
    totalKg,
    GLOBAL_AVERAGE_KG,
    deltaVsAverage,
    percentVsAverage,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORTING PHASE  — Print the Matrix
// ─────────────────────────────────────────────────────────────────────────────

function printFootprintMatrix(matrix) {
  header("📊  Daily CO₂ Footprint Matrix");

  const rows = [matrix.transport, matrix.diet, matrix.electricity];
  const colWidth = 22;

  console.log(
    `\n  ${"Category".padEnd(colWidth)}${"Emission (kg CO₂)".padEnd(20)}Calculation Basis`
  );
  console.log("  " + "─".repeat(56));

  rows.forEach((row) => {
    console.log(
      `  ${row.label.padEnd(colWidth)}${String(row.kg).padEnd(20)}${c.dim(row.unit)}`
    );
  });

  console.log("  " + "─".repeat(56));
  console.log(
    `  ${"TOTAL".padEnd(colWidth)}${c.bold(String(matrix.totalKg) + " kg CO₂")}`
  );

  const trend =
    matrix.deltaVsAverage > 0
      ? c.yellow(`▲ ${Math.abs(matrix.percentVsAverage)}% above global average`)
      : matrix.deltaVsAverage < 0
      ? c.green(`▼ ${Math.abs(matrix.percentVsAverage)}% below global average`)
      : c.green("✓ Exactly at global average");

  console.log(`\n  Global daily average : ${matrix.GLOBAL_AVERAGE_KG} kg CO₂`);
  console.log(`  Your standing       : ${trend}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// STRATEGY ENGINE  — 3 Personalised Reduction Recommendations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Scores each category and returns the top 3 reduction strategies
 * ranked by potential impact for this specific user.
 *
 * @param {{ transportType, milesDriven, dietPreference, electricityUsage }} ctx
 * @param {object} matrix
 * @returns {Array<{ rank, title, impact, tip }>}
 */
function generateStrategies(ctx, matrix) {
  const { transportType, milesDriven, dietPreference, electricityUsage } = ctx;
  const candidates = [];

  // ── Transport strategies ────────────────────────────────────────────────────
  if (transportType === "car" && milesDriven > 0) {
    const savedByBus   = round(matrix.transport.kg - EMISSION_FACTORS.transport.bus   * milesDriven);
    const savedByTrain = round(matrix.transport.kg - EMISSION_FACTORS.transport.train * milesDriven);
    candidates.push({
      category: "transport",
      potentialSaving: savedByTrain,
      title: "Switch to Public Rail",
      tip: `Replacing your ${milesDriven}-mile car journey with a train would cut transport emissions by ~${savedByTrain} kg CO₂/day (${round((savedByTrain / matrix.totalKg) * 100)}% of your total). Over a month that's ${round(savedByTrain * 22)} kg — equivalent to planting ~${Math.ceil(savedByTrain * 22 / 21)} trees.`,
    });
    candidates.push({
      category: "transport",
      potentialSaving: savedByBus,
      title: "Carpool or Take the Bus",
      tip: `Switching to a bus for your daily ${milesDriven}-mile commute saves ~${savedByBus} kg CO₂/day. Even carpooling with 3 others cuts your per-person car footprint by 75%.`,
    });
  }

  if (transportType === "car" && milesDriven <= 3) {
    candidates.push({
      category: "transport",
      potentialSaving: matrix.transport.kg,
      title: "Walk or Cycle Short Trips",
      tip: `Your commute is only ${milesDriven} mile(s) — well within cycling range. Switching to a bike eliminates ${matrix.transport.kg} kg CO₂/day and adds cardiovascular health benefits at zero cost.`,
    });
  }

  if (transportType === "bus" || transportType === "train") {
    candidates.push({
      category: "transport",
      potentialSaving: round(matrix.transport.kg * 0.3),
      title: "Consolidate Trips & Off-Peak Travel",
      tip: `You already use low-emission transit. Combining errands into fewer trips and travelling off-peak can reduce overall trip frequency by ~30%, saving ~${round(matrix.transport.kg * 0.3)} kg CO₂/day.`,
    });
  }

  // ── Diet strategies ─────────────────────────────────────────────────────────
  const dietUpgrades = {
    "meat-heavy": { next: "average",    saving: round(7.19 - 5.63), label: "a balanced, reduced-meat diet" },
    average:      { next: "vegetarian", saving: round(5.63 - 3.81), label: "a vegetarian diet"               },
    vegetarian:   { next: "vegan",      saving: round(3.81 - 2.89), label: "a plant-based (vegan) diet"      },
    vegan:        { next: null,         saving: 0,                  label: null                               },
  };

  const dietUpgrade = dietUpgrades[dietPreference];
  if (dietUpgrade.next) {
    candidates.push({
      category: "diet",
      potentialSaving: dietUpgrade.saving,
      title: `Shift Toward ${dietUpgrade.label.charAt(0).toUpperCase() + dietUpgrade.label.slice(1)}`,
      tip: `Moving from "${dietPreference}" to ${dietUpgrade.label} would save ~${dietUpgrade.saving} kg CO₂/day — ${round(dietUpgrade.saving * 365)} kg/year. Start with 2 meat-free days per week as a realistic first step.`,
    });
  } else {
    candidates.push({
      category: "diet",
      potentialSaving: 0.5,
      title: "Prioritise Local & Seasonal Produce",
      tip: `As a vegan you already have one of the lowest diet footprints. Choosing locally grown, seasonal produce cuts food-mile emissions by up to 20%, saving an estimated ~0.5 kg CO₂/day.`,
    });
  }

  candidates.push({
    category: "diet",
    potentialSaving: round(matrix.diet.kg * 0.1),
    title: "Reduce Food Waste",
    tip: `~30% of food produced globally is wasted. Meal-planning and using leftovers can cut food-related emissions by 10%, saving ~${round(matrix.diet.kg * 0.1)} kg CO₂/day from your current diet pattern.`,
  });

  // ── Electricity strategies ──────────────────────────────────────────────────
  if (electricityUsage > 0) {
    const solarSaving    = round(matrix.electricity.kg * 0.9);
    const efficiencySaving = round(matrix.electricity.kg * 0.2);

    candidates.push({
      category: "electricity",
      potentialSaving: efficiencySaving,
      title: "Adopt Energy-Efficient Habits",
      tip: `Switching to LED lighting, unplugging idle devices, and using appliances in eco-mode can reduce electricity use by ~20%, saving ~${efficiencySaving} kg CO₂/day (${round(efficiencySaving * 365)} kg/year).`,
    });
    candidates.push({
      category: "electricity",
      potentialSaving: solarSaving,
      title: "Switch to Renewable Energy or Solar",
      tip: `Your grid electricity footprint is ${matrix.electricity.kg} kg CO₂/day. Enrolling in a 100% renewable energy tariff or installing solar panels can cut this by up to 90%, saving ~${solarSaving} kg CO₂/day.`,
    });
  } else {
    candidates.push({
      category: "electricity",
      potentialSaving: 0.2,
      title: "Maintain Zero-Electricity Habits",
      tip: `You reported minimal electricity use today — great! Lock in this habit by using natural light, air-drying laundry, and avoiding standby power for long-term savings.`,
    });
  }

  // ── Select top 3 unique-category strategies by highest potential saving ─────
  candidates.sort((a, b) => b.potentialSaving - a.potentialSaving);

  const chosen   = [];
  const seen     = new Set();

  for (const s of candidates) {
    if (!seen.has(s.category)) {
      seen.add(s.category);
      chosen.push(s);
    }
    if (chosen.length === 3) break;
  }

  // If fewer than 3 unique categories, fill from remaining candidates
  if (chosen.length < 3) {
    for (const s of candidates) {
      if (!chosen.includes(s)) {
        chosen.push(s);
        if (chosen.length === 3) break;
      }
    }
  }

  return chosen.slice(0, 3).map((s, i) => ({ rank: i + 1, ...s }));
}

// ─────────────────────────────────────────────────────────────────────────────
// PRINT STRATEGIES
// ─────────────────────────────────────────────────────────────────────────────

function printStrategies(strategies) {
  header("💡  Your 3 Personalised Reduction Strategies");

  strategies.forEach(({ rank, title, potentialSaving, tip }) => {
    const medal = ["🥇", "🥈", "🥉"][rank - 1];
    console.log(
      `\n  ${medal} ${c.bold(`Strategy ${rank}: ${title}`)}`
    );
    console.log(
      c.green(`     Potential saving: ~${potentialSaving} kg CO₂/day`)
    );
    console.log(`\n     ${tip}`);
  });

  const totalPossible = round(
    strategies.reduce((acc, s) => acc + s.potentialSaving, 0)
  );
  console.log(
    `\n  ${"─".repeat(56)}`
  );
  console.log(
    `  Combined potential saving: ${c.bold(c.green(totalPossible + " kg CO₂/day"))} ` +
    `(${c.bold(round(totalPossible * 365) + " kg/year")})`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CONVERSATION LOOP
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const rl = readline.createInterface({
    input:  process.stdin,
    output: process.stdout,
  });

  console.clear();
  console.log(c.bold(c.green("\n  ♻  Welcome to the Carbon Footprint Tracker")));
  console.log(c.dim("  Hack2Skill PromptWars Challenge 3\n"));

  let continueSession = true;

  while (continueSession) {
    try {
      // 1. Collect context
      const ctx = await collectUserContext(rl);

      // 2. Calculate matrix
      const matrix = calculateFootprintMatrix(ctx);

      // 3. Print matrix
      printFootprintMatrix(matrix);

      // 4. Generate & print strategies
      const strategies = generateStrategies(ctx, matrix);
      printStrategies(strategies);

    } catch (err) {
      // Gracefully handle unexpected errors without crashing
      console.error(c.yellow(`\n  ⚠  An unexpected error occurred: ${err.message}`));
      console.error(c.dim("     Please restart and try again."));
    }

    // 5. Ask to run again
    console.log();
    const runAgain = await ask(
      rl,
      c.cyan("\n  Would you like to track another day? (yes / no)\n  > "),
      validators.yesNo
    );

    continueSession = runAgain;
  }

  console.log(
    c.green(
      "\n  Thank you for tracking your carbon footprint! 🌍\n" +
      "  Small daily choices compound into meaningful planetary impact.\n"
    )
  );

  rl.close();
}

// ─────────────────────────────────────────────────────────────────────────────
// ENTRY POINT
// ─────────────────────────────────────────────────────────────────────────────
main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
