# ♻ Carbon Footprint Tracker AI Assistant

> **Hack2Skill PromptWars Challenge 3** — Dynamic Assistant Vertical

---

## 📌 Project Overview

**Carbon Footprint Tracker AI Assistant** is a lightweight, self-contained Node.js console application that guides users through a daily context survey, computes their personal CO₂ emissions using a structured matrix of peer-reviewed emission coefficients, and delivers **three highly personalised, data-driven reduction strategies** — all without any external dependencies.

---

## 🎯 Problem Statement / Chosen Vertical

**Vertical:** Environmental Sustainability — Personal Carbon Tracking

Climate change is accelerating, yet most individuals have little visibility into their daily contribution to greenhouse gas emissions. Existing carbon calculators are either too complex, require account sign-ups, or lack personalisation.

**This assistant solves that** by providing an instant, conversational CLI experience that:

- Collects real daily behaviour (transport, diet, electricity)
- Computes an accurate CO₂ matrix in real time
- Benchmarks the result against the global average (12.01 kg CO₂/day)
- Returns three actionable, context-aware reduction strategies ranked by potential impact

---

## 🧮 Approach & Math Logic

The application builds a **three-category CO₂ emissions matrix** using standard coefficients sourced from peer-reviewed and governmental data:

### Emission Coefficients Used

| Category | Coefficient | Source |
|---|---|---|
| **Car** | 0.404 kg CO₂ per mile | U.S. EPA, 2023 |
| **Bus** | 0.089 kg CO₂ per mile per passenger | DEFRA, 2023 |
| **Train** | 0.041 kg CO₂ per mile per passenger | IEA, 2022 |
| **Bicycle / Walking** | 0.000 kg CO₂ | Zero tailpipe emission |
| **Meat-heavy diet** | 7.19 kg CO₂ per day | Poore & Nemecek, 2018 |
| **Average diet** | 5.63 kg CO₂ per day | Poore & Nemecek, 2018 |
| **Vegetarian diet** | 3.81 kg CO₂ per day | Poore & Nemecek, 2018 |
| **Vegan diet** | 2.89 kg CO₂ per day | Poore & Nemecek, 2018 |
| **Grid electricity** | 0.386 kg CO₂ per kWh | U.S. EIA, 2023 |
| **Global daily baseline** | 12.01 kg CO₂ per day | World Bank, 2022 |

### Footprint Formula

```
Total Daily CO₂ (kg) =
    (Transport coefficient × Miles travelled)
  + (Diet pattern daily coefficient)
  + (Electricity coefficient × kWh consumed)
```

### Strategy Ranking

Each possible reduction action is scored by its **potential saving in kg CO₂/day**. Candidates are sorted descending and the top result from each unique category (transport, diet, electricity) is selected, guaranteeing diverse, non-redundant advice.

---

## ⚙️ How It Works — Step-by-Step

### Prerequisites

- **Node.js** v14 or higher installed ([nodejs.org](https://nodejs.org))
- No `npm install` required — zero external dependencies

### Running the Application

```bash
node index.js
```

### Daily Context Survey — Question Flow

The assistant guides you through **four questions** in a conversational loop:

1. **Commute mode** — Choose your primary transport method:
   ```
   Options: car | bus | train | bike | walk
   ```

2. **Miles travelled** *(only asked if your mode is car, bus, or train)*:
   ```
   How many miles did you travel by car today?  > 16
   ```

3. **Diet preference** — Select the pattern that best describes today's eating:
   ```
   Options: meat-heavy | average | vegetarian | vegan
   ```

4. **Electricity usage** — Enter your estimated or metered kWh:
   ```
   How many kWh of electricity did you use today?  > 8
   ```

### Output

After input is collected the assistant prints:

- **📊 CO₂ Footprint Matrix** — A formatted table showing kg CO₂ per category, the calculation basis, and your standing vs. the global average
- **💡 3 Personalised Strategies** — Ranked by potential daily saving, each with a concrete tip and estimated annual impact

### Example Session

```
♻  Welcome to the Carbon Footprint Tracker
   Hack2Skill PromptWars Challenge 3

🌱  Daily Context Survey
─────────────────────────────────────────────────────────
  Commute mode      > car
  Miles driven      > 16
  Diet preference   > average
  Electricity (kWh) > 8

📊  Daily CO₂ Footprint Matrix
─────────────────────────────────────────────────────────
  Transportation     6.46 kg          16 mi × 0.404 kg/mi
  Diet               5.63 kg          average pattern
  Electricity        3.09 kg          8 kWh × 0.386 kg/kWh
  ─────────────────────────────────────────────────────
  TOTAL             15.18 kg CO₂
  Global average  : 12.01 kg CO₂
  Your standing   : ▲ 26% above global average

💡  3 Personalised Reduction Strategies
  🥇 Switch to Public Rail      saves ~5.81 kg CO₂/day
  🥈 Shift Toward Vegetarian    saves ~1.82 kg CO₂/day
  🥉 Switch to Renewable Energy saves ~2.78 kg CO₂/day
  ─────────────────────────────────────────────────────
  Combined potential saving: 10.41 kg CO₂/day (3,800 kg/year)
```

### Repeat or Exit

At the end of each session you are asked:
```
Would you like to track another day? (yes / no)
```
Type `yes` to run a new survey or `no` to exit gracefully.

---

## 📐 Assumptions & Defaults

The following standard assumptions are baked into the calculation engine to handle edge cases and produce safe, realistic estimates:

| Assumption | Value / Rule | Rationale |
|---|---|---|
| **Zero-emission transport** | Bike and Walk emit 0 kg CO₂ | No distance input requested; tailpipe emissions are zero |
| **Diet is a daily constant** | Each diet tier has a fixed daily kg value | Lifecycle analysis averages are more reliable than per-meal tracking for a daily survey |
| **Electricity grid mix** | 0.386 kg CO₂/kWh | U.S. national average; users on renewable tariffs will have lower actual emissions |
| **Global benchmark** | 12.01 kg CO₂/day | World Bank 2022 per-capita figure used as the comparison baseline |
| **Negative inputs rejected** | Validator blocks values < 0 | Miles and kWh cannot be negative; loop retries on bad input |
| **Non-numeric inputs rejected** | `parseFloat` + `isFinite` guard | Prevents `NaN` propagation through the matrix |
| **Strategy uniqueness** | One strategy per category max | Ensures transport, diet, and electricity are all represented in the output |
| **Vegan diet edge case** | Falls back to "local & seasonal" tip | No upgrade path beyond vegan; alternate saving strategy provided |

---

## 🗂️ Repository Structure

```
challenge2/
├── index.js        # Main application — all logic, self-contained
├── README.md       # This file
└── .gitignore      # Excludes node_modules, dist, .env, and build artefacts
```

---

## 🚀 Tech Stack

| Concern | Choice |
|---|---|
| Runtime | Node.js (v14+) |
| I/O | Built-in `readline` module |
| Dependencies | **None** — zero `npm install` required |
| Repo size | < 10 MB |

---

## 📄 License

This project was built for **Hack2Skill PromptWars Challenge 3**. Free to use and extend for educational and competition purposes.

---

*Built with 🌱 to make sustainability actionable, one conversation at a time.*
