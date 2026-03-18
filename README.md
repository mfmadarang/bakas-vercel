<div align="center">

# 🔍 bakas

**Browser Fingerprint Analyzer & Privacy Awareness Tool**

*See how websites silently track you, without a single cookie.*

[![Nuxt 3](https://img.shields.io/badge/Nuxt-3-00DC82?logo=nuxtdotjs&logoColor=white)](https://nuxt.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D?logo=vuedotjs&logoColor=white)](https://vuejs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)](https://sqlite.org)

> **bakas** *(noun, Filipino)* : trace, track, footprint. The marks you leave behind.

[Features](#features) · [Tech Stack](#tech-stack) · [Getting Started](#getting-started) · [Design Decisions](#design-decisions) · [Privacy](#privacy-commitment)

</div>

---

## The Problem

Most people have no idea that websites can identify and track them **without using cookies at all**. By silently reading passive browser properties like your screen resolution, GPU model, installed fonts, audio processing quirks, and dozens of other signals, websites can construct a unique identifier for your device. No consent popup. No cookie banner. No notification.

**bakas makes this invisible process visible.**

<!-- Add screenshots once the app is deployed
![bakas Hero](docs/screenshots/hero.png)
![bakas Results](docs/screenshots/results.png)
-->

## Features

🔬 **18 Fingerprint Collectors.** User agent, canvas rendering, WebGL GPU data, audio processing, installed fonts, screen properties, timezone, battery status, media devices, storage APIs, and more. Each collector is written in pure JavaScript with no fingerprinting libraries.

🧠 **Plain-Language Explanations.** Every data point includes a human-readable explanation of what it reveals to trackers and why they care about it.

🎯 **Uniqueness Scoring.** A weighted 0-100 score showing how trackable your browser is, with color-coded risk levels for each data point (High / Medium / Low).

🎨 **Fingerprint Identicon.** A unique geometric visual generated deterministically from your fingerprint hash. Two identical fingerprints always produce the same image.

📊 **Opt-In Database Comparison.** With explicit consent, compare your fingerprint's uniqueness against other visitors. Both the "Yes" and "No" buttons are equally prominent. This is a privacy tool, not a data grab.

🛡️ **Dynamic Recommendations.** Personalized, prioritized privacy tips generated from what was actually collected from your specific browser.

👁️ **Live "What Sites See" Demo.** A split-screen simulation showing a normal news site on one side and a real-time terminal readout of what a tracking script silently collects on the other, using your actual fingerprint data.

📜 **Scan History.** A localStorage-only timeline of past scans. See if your fingerprint changes after browser updates or privacy setting changes.

📚 **Education Center.** Covers what fingerprinting is, how it's used (ad tracking, fraud detection, paywall circumvention), Philippine data privacy law (RA 10173), and a tiered protection guide from basic to advanced.

🌗 **Dark / Light Mode.** Persisted via VueUse `useColorMode`.

📱 **Mobile-First.** Fully responsive across all pages and components.

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Nuxt 3, Vue 3 Composition API | SSR-capable, file-based routing, auto-imports |
| **Styling** | Tailwind CSS v3 | Utility-first, dark mode via class strategy |
| **State** | Pinia | Lightweight, TypeScript-native store |
| **Icons** | Lucide Vue | Clean, consistent icon set |
| **Utilities** | VueUse | `useColorMode`, `useClipboard`, `useLocalStorage` |
| **Backend** | Python FastAPI | Async-ready, auto-generated OpenAPI docs at `/docs` |
| **Database** | SQLite via SQLAlchemy ORM | Zero-config, file-based, perfect for local-first apps |
| **Migrations** | Alembic | Schema versioning for the fingerprint table |
| **Validation** | Pydantic v2 | Type-safe request/response schemas |

No auth. No third-party services. No paid APIs. Everything runs locally.

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+

### Backend

```bash
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:3000` · Backend: `http://localhost:8000`

> The frontend works fully without the backend running. If the backend is offline, fingerprint analysis, scoring, and recommendations all still work. Only the "compare to others" percentile is unavailable, shown as a subtle notice rather than an error.

### Running Both Simultaneously

```bash
# Terminal 1
cd backend && uvicorn app.main:app --reload --port 8000

# Terminal 2
cd frontend && npm run dev
```

## Design Decisions

| Decision | Reasoning |
|----------|-----------|
| **Client-side only collection** | A privacy tool must not silently send data to a server. Collection and analysis happen entirely in the browser. |
| **Backend is purely additive** | The app works fully without the backend. No single point of failure. Graceful degradation over breakage. |
| **No fingerprinting libraries** | Every collector is hand-written for full transparency. No black-box dependencies for the core feature. |
| **SHA-256 hashing on the client** | Raw fingerprint data never leaves the browser. Only hashed summaries are sent if the user opts in. |
| **Equal-prominence opt-in buttons** | "No thanks" is the same size and style as "Yes, compare me." Privacy tools should not use dark patterns. |
| **5-second timeout per collector** | A single failing API (like a blocked Battery Status) must never stall the scan. Mark it unavailable and continue. |
| **SQLite over PostgreSQL** | Zero-config, file-based, sufficient for a local-first comparison database. No need for a full RDBMS. |

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/fingerprints` | `POST` | Submit an anonymized fingerprint (opt-in). Returns `is_new`, `total_count`, and `percentile`. |
| `/api/fingerprints/stats` | `GET` | Aggregate stats: total count, most common timezone / platform / resolution, mobile %, unique %. |
| `/` | `GET` | Health check. |

Full request/response schemas are auto-documented at `http://localhost:8000/docs` when the backend is running.

## Privacy Commitment

### Collected in-browser only

All 18 data points listed on the results page. This data **never leaves your browser** unless you explicitly opt in.

### Stored in the backend (only after explicit consent)

Anonymized, hashed summaries only: fingerprint hash, canvas/WebGL/audio hashes, font count (not names), screen resolution, color depth, pixel ratio, hardware concurrency, device memory, timezone, platform, language, and touch point count.

### Never stored

IP addresses, raw user agent strings, specific font names, cookie contents, browsing history, or any data that could directly re-identify a person.

## Acknowledgments

- [EFF Cover Your Tracks](https://coveryourtracks.eff.org/) : inspiration for making fingerprinting visible to everyday users
- [BrowserLeaks](https://browserleaks.com/) : reference for individual fingerprinting techniques
- [Privacy Guides](https://www.privacyguides.org/) : recommended reading for browser privacy
