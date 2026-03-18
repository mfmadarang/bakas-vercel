/**
 * utils/scoring.ts — Uniqueness Score Calculation
 *
 * Computes a 0–100 score representing how uniquely identifiable this
 * browser fingerprint is. Higher = more unique = easier to track.
 *
 * Each data point has a weight based on how rare/identifying it typically is.
 * Canvas and WebGL fingerprints are the heaviest because they're unique
 * per hardware+driver combination.
 */

import type { CollectorResult } from "~/composables/useFingerprint";

// Weights for each data point — how much it contributes to uniqueness
const WEIGHTS: Record<string, number> = {
  "Canvas Fingerprint": 25,
  "WebGL Fingerprint": 20,
  "Audio Fingerprint": 15,
  "Installed Fonts": 10,  // full 10 points only if font count > 20
  "Screen & Display": 5,
  "Hardware Concurrency": 5,
  "Device Memory": 4,
  "Timezone & Locale": 3,
  "Max Touch Points": 3,
  "Do Not Track": 2,
  "Media Devices": 3,
  "Connection Info": 2,
  "Battery Status": 1,
  "Storage & APIs": 1,
  "Languages": 1,
};

// Maximum possible score — sum of all weights
const MAX_SCORE = Object.values(WEIGHTS).reduce((sum, w) => sum + w, 0);

export interface ScoreResult {
  score: number;           // 0–100 normalized
  rawScore: number;        // actual points before normalization
  maxPossible: number;     // max points
  level: "low" | "medium" | "high";
  label: string;           // human-readable label
}

/**
 * Calculate the uniqueness score from collected fingerprint data.
 *
 * Only counts data points that were successfully collected. If a browser
 * blocks something, those points simply don't count — which means browsers
 * that block more features naturally get a lower (less trackable) score.
 */
export function calculateUniquenessScore(results: CollectorResult[]): ScoreResult {
  let rawScore = 0;

  for (const result of results) {
    if (result.status !== "available" || result.value == null) {
      continue;
    }

    const weight = WEIGHTS[result.name];
    if (!weight) continue;

    // Special case: fonts — only full points if count > 20
    if (result.name === "Installed Fonts") {
      const fontCount = result.value?.count || 0;
      if (fontCount > 20) {
        rawScore += weight;
      } else if (fontCount > 10) {
        rawScore += Math.floor(weight * 0.6);
      } else {
        rawScore += Math.floor(weight * 0.3);
      }
      continue;
    }

    // Special case: DNT — only adds uniqueness if it's enabled (rare)
    if (result.name === "Do Not Track") {
      if (result.value === "1") {
        rawScore += weight;
      }
      continue;
    }

    // Everything else: available = full weight
    rawScore += weight;
  }

  // Normalize to 0–100
  const score = Math.round((rawScore / MAX_SCORE) * 100);

  // Determine level and label
  let level: "low" | "medium" | "high";
  let label: string;

  if (score <= 40) {
    level = "low";
    label = "Hard to track";
  } else if (score <= 70) {
    level = "medium";
    label = "Moderately trackable";
  } else {
    level = "high";
    label = "Easily trackable";
  }

  return { score, rawScore, maxPossible: MAX_SCORE, level, label };
}
