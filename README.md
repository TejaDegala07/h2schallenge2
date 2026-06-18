# 🌱 EcoAssistant AI — Carbon Footprint Tracker

> **Hack2Skill PromptWars Challenge 3** — Dynamic Assistant Vertical

---

## 📌 Project Overview

**EcoAssistant AI** is a fully self-contained, zero-dependency browser web application that acts as a personalised carbon footprint assistant. It guides the user through selecting their daily commute method, enters their distance traveled, computes their exact daily CO₂ emissions using peer-reviewed emission coefficients, and instantly delivers context-aware, personalised reduction strategies — all without a backend, account sign-up, or external API.

---

## 🎯 Chosen Vertical & Problem Statement

**Vertical:** Environmental Sustainability — Personal Carbon Tracking

Climate change is accelerating, yet most individuals have no visibility into their daily contribution to greenhouse gas emissions. Existing calculators are either too complex, require account registration, or deliver generic, non-actionable advice.

**EcoAssistant AI solves that** by providing an instant, conversational web experience that:

- Lets users select their primary commute mode via an accessible, keyboard-navigable radiogroup
- Accepts daily distance traveled (in kilometers)
- Computes an accurate CO₂ emission value in real time using scientifically-sourced coefficients
- Returns **3 personalised, context-aware reduction strategies** ranked by relevance to the user's specific input

---

## 🧮 Approach & Math Logic

The application uses a single-category transport CO₂ emissions model based on peer-reviewed emission factors:

### Emission Coefficients

| Transport Mode | Coefficient (kg CO₂ per km) | Source |
|---|---|---|
| **Car** | 0.24 kg CO₂/km | DEFRA / EPA average passenger car |
| **Bus / Train** | 0.08 kg CO₂/km | DEFRA shared transport factor |
| **Walk / Bike** | 0.00 kg CO₂/km | Zero tailpipe emission |

### Emission Formula

```
Daily CO₂ (kg) = Distance (km) × Emission Coefficient (kg CO₂/km)
```

The result is rounded to two decimal places using integer arithmetic (`Math.round(x * 100) / 100`) to avoid IEEE 754 floating-point drift.

### Strategy Selection Logic

Personalised strategies are determined by a context-aware branching engine:

- **Car > 10 km/day** → High-impact commute tips (carpooling, cruise control)
- **Car ≤ 10 km/day** → Short-trip active-transport promotion
- **Bus/Train** → Shared transport reinforcement tips
- **Walk/Bike** → Zero-emission celebration and infrastructure advocacy

All outputs also include a universal general sustainability tip appended as the final element.

---

## ⚙️ How It Works

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- No installation or `npm install` required to run the application

### Running the Application

Open `index.html` directly in any browser, or serve it via any static file server:

```bash
# Option 1: Direct open
open index.html

# Option 2: Python simple server
python -m http.server 8080

# Option 3: Node static server
npx serve .
```

### User Flow

1. **Select Transport Mode** — Click or use arrow keys on the radiogroup to choose Car, Bus/Train, or Walk/Bike
2. **Enter Distance** — Type the approximate daily distance traveled in kilometers
3. **Click "Analyze Footprint"** — The engine validates input, computes emissions, and renders results instantly
4. **Read Personalised Insights** — Three context-specific reduction strategies are displayed below the emission total

### Input Validation

- Transport mode must be selected (aria-live error announced to screen readers)
- Distance must be a non-negative number (validated via `Number()` strict conversion — rejects strings like `"10abc"`)
- Both errors can display simultaneously for efficient UX
- `aria-invalid` is toggled on the input field to signal state to assistive technologies

---

## 📐 Assumptions & Defaults

| Assumption | Value / Rule | Rationale |
|---|---|---|
| **Distance unit** | Kilometers | Standard SI unit; most globally applicable |
| **Car coefficient** | 0.24 kg CO₂/km | DEFRA average petrol passenger car |
| **Bus/Train coefficient** | 0.08 kg CO₂/km | DEFRA shared transport average |
| **Walk/Bike coefficient** | 0.00 kg CO₂/km | Zero tailpipe emissions |
| **Rounding method** | `Math.round(x * 100) / 100` | Avoids IEEE 754 floating-point drift |
| **Negative input rejected** | Validator blocks values < 0 | Distance cannot be negative |
| **Non-numeric input rejected** | `Number()` strict conversion | `Number("10abc")` returns `NaN`; rejected |
| **Threshold for car tips** | 10 km | Meaningful commute distance boundary |
| **Zero distance** | Valid input, returns 0.00 kg | User may walk 0 km |

---

## 🗂️ Repository Structure

```
challenge2/
├── index.html          # Application shell — semantic HTML5, WCAG 2.1 AA accessible
├── app.js              # All application logic — pure math engine, insights builder, UI controller
├── index.test.js       # Jest test suite — 80 tests, 100% line/function coverage
├── package.json        # Project metadata and dev dependencies (Jest)
├── tailwind.config.js  # Tailwind CSS configuration
└── README.md           # This file
```

---

## 🚀 Tech Stack

| Concern | Choice | Rationale |
|---|---|---|
| **Structure** | Semantic HTML5 | `<header>`, `<main>`, `<footer>`, `<section>` landmarks |
| **Styling** | Tailwind CSS (CDN) | Rapid, utility-first styling without build step |
| **Logic** | Vanilla JavaScript (ES5 strict) | Zero dependencies, maximum browser compatibility |
| **Testing** | Jest + jest-environment-jsdom | Unit and DOM integration tests |
| **Accessibility** | WCAG 2.1 AA | Roving tabindex, ARIA live regions, skip links, focus rings |
| **Security** | Strict CSP + security headers | `object-src 'none'`, `base-uri 'none'`, `frame-ancestors 'none'` |

---

## ♿ Accessibility Features

- **Skip link** — Keyboard users can jump directly to main content
- **Roving tabindex** — Radiogroup follows W3C ARIA radiogroup pattern; only selected option is in tab sequence
- **ARIA live region** — Screen reader announcer broadcasts result updates politely
- **`role="alert"`** — Validation errors are immediately announced by assistive technology
- **`aria-invalid`** — Input field state is communicated to screen readers
- **`aria-checked`** — Transport selection state is communicated semantically
- **`aria-label`** — All interactive elements have descriptive labels including coefficient values
- **`:focus-visible`** — High-contrast 3px focus ring for keyboard navigation (WCAG 2.1 AA compliant)
- **Decorative emoji** — All decorative emoji are `aria-hidden="true"` to prevent noise

---

## 🔒 Security Implementation

- **Content Security Policy** — `default-src 'self'`, `script-src 'self'`, `object-src 'none'`, `base-uri 'none'`, `form-action 'self'`, `frame-ancestors 'none'`, `upgrade-insecure-requests`
- **`X-Content-Type-Options: nosniff`** — Prevents MIME-type sniffing
- **`X-Frame-Options: DENY`** — Blocks clickjacking via iframe embedding
- **`referrer: no-referrer`** — No referrer information leaked on navigation
- **`textContent` only** — Zero `innerHTML` usage; DOM injection vectors eliminated
- **`rel="noopener noreferrer"`** — External GitHub link cannot access opener context
- **`Number()` strict parsing** — Replaces `parseFloat`; rejects partial-numeric strings

---

## 🧪 Testing

The test suite uses **Jest** with **jsdom** environment and covers:

- **Symmetrical guard clause testing** — All invalid type permutations for both function arguments
- **IEEE 754 boundary testing** — Floating-point precision edge cases
- **`buildInsights` branch coverage** — All transport types, threshold boundary (distance = 10), and general tip assertion
- **Helper function unit tests** — Direct tests for `findSelectedButton` and `indexOfNode`
- **DOM controller integration tests** — Form submission happy/sad/error paths, error clearing, zero-distance validity
- **App lifecycle tests** — `initializeApp`, roving tabindex, delegated click/keyboard events, wrap-around navigation

```bash
# Run tests
npm test

# Run with coverage report
npm run test:coverage
```

**Coverage:** 100% lines, 100% functions, 99%+ statements

---

## 📄 License

Built for **Hack2Skill PromptWars Challenge 3**. Free to use and extend for educational and competition purposes.

---

*Built with 🌱 to make sustainability actionable — one daily commute at a time.*
