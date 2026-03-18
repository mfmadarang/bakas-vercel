/**
 * utils/scoring.ts — Fingerprint Scoring Engine v2
 *
 * Three layers of analysis:
 *   1. Per-data-point scoring (exposed / blocked / protected)
 *   2. Category-level aggregation (Graphics, Audio, etc.)
 *   3. Browser protection detection (Firefox RFP, Brave shields, etc.)
 *
 * The score accounts for whether data points are genuinely unique or
 * have been normalized/randomized by the browser's privacy features.
 * A canvas fingerprint that Brave randomizes on every load is far less
 * identifying than one Chrome exposes consistently.
 */

import type { CollectorResult } from "~/composables/useFingerprint";

// ─── Types ──────────────────────────────────────────────────────────────────

export type DataPointStatus = "exposed" | "blocked" | "protected" | "low_risk";

export interface DataPointAnalysis {
  name: string;
  category: string;
  status: DataPointStatus;
  points: number;         // actual points awarded (after protection adjustments)
  maxPoints: number;      // maximum possible points for this data point
  note: string;           // short explanation of the status
}

export interface CategoryScore {
  name: string;
  score: number;          // 0–100 within this category
  points: number;         // raw points earned
  maxPoints: number;      // max possible
  color: string;          // hex color for the gauge segment
  dataPoints: DataPointAnalysis[];
}

export interface DetectedProtection {
  id: string;
  label: string;
  description: string;
  impact: "high" | "medium" | "low";
}

export interface ScoreResult {
  score: number;                   // 0–100 overall
  level: "low" | "medium" | "high";
  label: string;
  categories: CategoryScore[];
  protections: DetectedProtection[];
  totalExposed: number;
  totalBlocked: number;
  totalProtected: number;
}

// ─── Weight table ───────────────────────────────────────────────────────────

interface WeightEntry {
  maxPoints: number;
  category: string;
}

const WEIGHTS: Record<string, WeightEntry> = {
  "Canvas Fingerprint":   { maxPoints: 25, category: "Graphics" },
  "WebGL Fingerprint":    { maxPoints: 20, category: "Graphics" },
  "Audio Fingerprint":    { maxPoints: 15, category: "Audio" },
  "Installed Fonts":      { maxPoints: 10, category: "Fonts" },
  "Screen & Display":     { maxPoints: 5,  category: "Screen & Display" },
  "User Agent":           { maxPoints: 4,  category: "Browser & Device" },
  "Hardware Concurrency": { maxPoints: 5,  category: "Browser & Device" },
  "Device Memory":        { maxPoints: 4,  category: "Browser & Device" },
  "Timezone & Locale":    { maxPoints: 3,  category: "Timezone & Language" },
  "Languages":            { maxPoints: 2,  category: "Timezone & Language" },
  "Max Touch Points":     { maxPoints: 2,  category: "Browser & Device" },
  "Do Not Track":         { maxPoints: 2,  category: "Browser & Device" },
  "Media Devices":        { maxPoints: 3,  category: "Media & Network" },
  "Connection Info":      { maxPoints: 2,  category: "Media & Network" },
  "Battery Status":       { maxPoints: 1,  category: "Media & Network" },
  "Storage & APIs":       { maxPoints: 1,  category: "Storage" },
  "Cookies Enabled":      { maxPoints: 1,  category: "Browser & Device" },
  "Platform":             { maxPoints: 1,  category: "Browser & Device" },
};

const MAX_TOTAL = Object.values(WEIGHTS).reduce((sum, w) => sum + w.maxPoints, 0);

// Category colors for the gauge segments
const CATEGORY_COLORS: Record<string, string> = {
  "Graphics":           "#6366f1",  // indigo
  "Audio":              "#8b5cf6",  // violet
  "Fonts":              "#a855f7",  // purple
  "Screen & Display":   "#ec4899",  // pink
  "Browser & Device":   "#f59e0b",  // amber
  "Timezone & Language": "#22c55e", // green
  "Media & Network":    "#06b6d4",  // cyan
  "Storage":            "#64748b",  // slate
};

// ─── Protection Detection ───────────────────────────────────────────────────

function detectProtections(results: CollectorResult[]): DetectedProtection[] {
  const protections: DetectedProtection[] = [];

  const find = (name: string) => results.find((r) => r.name === name);
  const ua = find("User Agent");
  const uaStr = (ua?.value as string) || "";
  const isFirefox = uaStr.includes("Firefox");
  const isBrave = uaStr.includes("Brave") || (navigator as any).brave !== undefined;

  // Firefox detection
  const deviceMem = find("Device Memory");
  const connInfo = find("Connection Info");
  const battery = find("Battery Status");

  if (isFirefox) {
    // Firefox blocks deviceMemory, connection, and battery by default
    const blocked = [deviceMem, connInfo, battery].filter(
      (r) => r && r.status === "unavailable"
    ).length;

    if (blocked >= 2) {
      protections.push({
        id: "firefox-defaults",
        label: "Firefox Enhanced Tracking Protection",
        description: "Firefox blocks several fingerprinting APIs by default including device memory, network info, and battery status.",
        impact: "medium",
      });
    }
  }

  // Firefox resistFingerprinting detection
  // RFP rounds screen size, spoofs timezone to UTC, limits fonts
  const screenData = find("Screen & Display");
  const tzData = find("Timezone & Locale");
  const fontData = find("Installed Fonts");

  if (isFirefox && screenData?.status === "available") {
    const w = screenData.value?.width;
    const h = screenData.value?.height;
    // RFP rounds to nearest 200x100
    const wRounded = w % 200 === 0;
    const hRounded = h % 100 === 0;
    const fontsLow = fontData?.status === "available" && fontData.value?.count < 8;
    const tzUtc = tzData?.status === "available" && tzData.value?.timezoneOffset === 0;

    if ((wRounded && hRounded) || fontsLow || tzUtc) {
      const signals = [wRounded && hRounded && "letterboxed screen", fontsLow && "restricted fonts", tzUtc && "UTC timezone"].filter(Boolean);
      if (signals.length >= 2) {
        protections.push({
          id: "firefox-rfp",
          label: "Firefox resistFingerprinting (RFP)",
          description: `Detected signals: ${signals.join(", ")}. RFP normalizes many data points to make all users look identical.`,
          impact: "high",
        });
      }
    }
  }

  // Brave detection
  if (isBrave) {
    protections.push({
      id: "brave-shields",
      label: "Brave Shields",
      description: "Brave randomizes canvas, WebGL, and audio fingerprints on every session, making consistent tracking very difficult.",
      impact: "high",
    });
  }

  // Tor detection (very limited UA, all APIs blocked, UTC timezone)
  const totalBlocked = results.filter((r) => r.status === "unavailable").length;
  if (totalBlocked > 8) {
    protections.push({
      id: "tor-like",
      label: "Tor-level privacy detected",
      description: `${totalBlocked} data points blocked. Your browser is aggressively limiting fingerprint surface.`,
      impact: "high",
    });
  }

  // Generic: many APIs blocked
  if (totalBlocked >= 4 && totalBlocked <= 8 && !protections.find((p) => p.id === "firefox-defaults")) {
    protections.push({
      id: "api-blocking",
      label: "API blocking detected",
      description: `${totalBlocked} fingerprinting APIs are blocked or unavailable. This reduces your trackability.`,
      impact: "medium",
    });
  }

  // DNT enabled (ironic protection)
  const dnt = find("Do Not Track");
  if (dnt?.value === "1") {
    protections.push({
      id: "dnt-enabled",
      label: "Do Not Track enabled",
      description: "DNT is enabled, but ironically this makes you slightly more unique since very few users enable it.",
      impact: "low",
    });
  }

  return protections;
}

// ─── Per-Data-Point Analysis ────────────────────────────────────────────────

function analyzeDataPoint(
  result: CollectorResult,
  protections: DetectedProtection[]
): DataPointAnalysis {
  const weight = WEIGHTS[result.name];
  if (!weight) {
    return {
      name: result.name,
      category: result.category,
      status: "low_risk",
      points: 0,
      maxPoints: 0,
      note: "Not scored",
    };
  }

  // Blocked — browser refused to provide this data
  if (result.status === "unavailable" || result.value == null) {
    return {
      name: result.name,
      category: weight.category,
      status: "blocked",
      points: 0,
      maxPoints: weight.maxPoints,
      note: "Blocked by your browser",
    };
  }

  const hasBraveShields = protections.some((p) => p.id === "brave-shields");
  const hasRFP = protections.some((p) => p.id === "firefox-rfp");

  // ── Special scoring rules ──

  // Canvas: if Brave (randomized) or Firefox RFP (normalized) → protected
  if (result.name === "Canvas Fingerprint") {
    if (hasBraveShields) {
      return {
        name: result.name, category: weight.category, status: "protected",
        points: Math.round(weight.maxPoints * 0.15),
        maxPoints: weight.maxPoints,
        note: "Randomized by Brave on every session",
      };
    }
    if (hasRFP) {
      return {
        name: result.name, category: weight.category, status: "protected",
        points: Math.round(weight.maxPoints * 0.2),
        maxPoints: weight.maxPoints,
        note: "Normalized by resistFingerprinting",
      };
    }
  }

  // WebGL: Brave randomizes, RFP limits
  if (result.name === "WebGL Fingerprint") {
    if (hasBraveShields) {
      return {
        name: result.name, category: weight.category, status: "protected",
        points: Math.round(weight.maxPoints * 0.2),
        maxPoints: weight.maxPoints,
        note: "Randomized by Brave shields",
      };
    }
    // Check for generic/spoofed renderer
    const renderer = result.value?.renderer || "";
    if (renderer.includes("Mozilla") || renderer === "unknown" || renderer === "") {
      return {
        name: result.name, category: weight.category, status: "protected",
        points: Math.round(weight.maxPoints * 0.3),
        maxPoints: weight.maxPoints,
        note: "GPU info hidden or spoofed",
      };
    }
  }

  // Audio: Brave randomizes, RFP normalizes
  if (result.name === "Audio Fingerprint") {
    if (hasBraveShields || hasRFP) {
      return {
        name: result.name, category: weight.category, status: "protected",
        points: Math.round(weight.maxPoints * 0.15),
        maxPoints: weight.maxPoints,
        note: hasBraveShields ? "Randomized by Brave" : "Normalized by resistFingerprinting",
      };
    }
  }

  // Fonts: low count suggests restriction
  if (result.name === "Installed Fonts") {
    const count = result.value?.count || 0;
    if (count < 8) {
      return {
        name: result.name, category: weight.category, status: "protected",
        points: Math.round(weight.maxPoints * 0.2),
        maxPoints: weight.maxPoints,
        note: `Only ${count} fonts visible (likely restricted)`,
      };
    }
    if (count <= 15) {
      return {
        name: result.name, category: weight.category, status: "exposed",
        points: Math.round(weight.maxPoints * 0.5),
        maxPoints: weight.maxPoints,
        note: `${count} fonts detected (moderate exposure)`,
      };
    }
    return {
      name: result.name, category: weight.category, status: "exposed",
      points: weight.maxPoints,
      maxPoints: weight.maxPoints,
      note: `${count} fonts detected (high exposure)`,
    };
  }

  // DNT: only adds uniqueness if enabled (rare)
  if (result.name === "Do Not Track") {
    if (result.value === "1") {
      return {
        name: result.name, category: weight.category, status: "exposed",
        points: weight.maxPoints,
        maxPoints: weight.maxPoints,
        note: "Enabled — ironically makes you more unique",
      };
    }
    return {
      name: result.name, category: weight.category, status: "low_risk",
      points: 0,
      maxPoints: weight.maxPoints,
      note: "Not set (common, low risk)",
    };
  }

  // Screen: check for RFP letterboxing
  if (result.name === "Screen & Display" && hasRFP) {
    return {
      name: result.name, category: weight.category, status: "protected",
      points: Math.round(weight.maxPoints * 0.3),
      maxPoints: weight.maxPoints,
      note: "Screen dimensions likely letterboxed by RFP",
    };
  }

  // Default: fully exposed
  return {
    name: result.name,
    category: weight.category,
    status: "exposed",
    points: weight.maxPoints,
    maxPoints: weight.maxPoints,
    note: "Fully exposed to trackers",
  };
}

// ─── Main Scoring Function ──────────────────────────────────────────────────

export function calculateUniquenessScore(results: CollectorResult[]): ScoreResult {
  // Step 1: Detect browser protections
  const protections = detectProtections(results);

  // Step 2: Analyze each data point
  const analyses: DataPointAnalysis[] = results.map((r) => analyzeDataPoint(r, protections));

  // Step 3: Group into categories
  const categoryMap: Record<string, DataPointAnalysis[]> = {};
  for (const a of analyses) {
    if (a.maxPoints === 0) continue; // skip unscored
    if (!categoryMap[a.category]) categoryMap[a.category] = [];
    categoryMap[a.category].push(a);
  }

  const categories: CategoryScore[] = Object.entries(categoryMap).map(([name, points]) => {
    const totalPoints = points.reduce((sum, p) => sum + p.points, 0);
    const totalMax = points.reduce((sum, p) => sum + p.maxPoints, 0);
    const score = totalMax > 0 ? Math.round((totalPoints / totalMax) * 100) : 0;

    return {
      name,
      score,
      points: totalPoints,
      maxPoints: totalMax,
      color: CATEGORY_COLORS[name] || "#71717a",
      dataPoints: points,
    };
  });

  // Sort categories by max points descending (most important first)
  categories.sort((a, b) => b.maxPoints - a.maxPoints);

  // Step 4: Calculate overall score
  const totalPoints = analyses.reduce((sum, a) => sum + a.points, 0);
  const score = Math.round((totalPoints / MAX_TOTAL) * 100);

  // Step 5: Determine level
  let level: "low" | "medium" | "high";
  let label: string;

  if (score <= 35) {
    level = "low";
    label = "Hard to track";
  } else if (score <= 65) {
    level = "medium";
    label = "Moderately trackable";
  } else {
    level = "high";
    label = "Easily trackable";
  }

  // Step 6: Count statuses
  const totalExposed = analyses.filter((a) => a.status === "exposed").length;
  const totalBlocked = analyses.filter((a) => a.status === "blocked").length;
  const totalProtected = analyses.filter((a) => a.status === "protected").length;

  return {
    score,
    level,
    label,
    categories,
    protections,
    totalExposed,
    totalBlocked,
    totalProtected,
  };
}