/**
 * stores/fingerprint.ts — Central State for Fingerprint Data
 *
 * Holds the scan results, hash, score, and comparison data.
 * Components read from this store to display the fingerprint breakdown.
 * The scan itself is triggered from the pages, but the results live here
 * so they persist across page navigation.
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { CollectorResult } from "~/composables/useFingerprint";
import type { ScoreResult } from "~/utils/scoring";
import type { Recommendation } from "~/utils/recommendations";

export interface ComparisonResult {
  isNew: boolean;
  totalCount: number;
  percentile: number;
}

export interface HistoryEntry {
  timestamp: string;       // ISO string
  hashPreview: string;     // first 16 chars of hash
  score: number;
  platform: string;
  browser: string;
  optedIn: boolean;
}

export const useFingerprintStore = defineStore("fingerprint", () => {
  // Scan state
  const isScanning = ref(false);
  const scanComplete = ref(false);
  const currentCollector = ref("");
  const progress = ref(0);       // 0 to 1
  const totalCollectors = ref(0);

  // Results
  const results = ref<CollectorResult[]>([]);
  const hash = ref("");
  const scoreResult = ref<ScoreResult | null>(null);
  const recommendations = ref<Recommendation[]>([]);

  // Opt-in comparison
  const comparison = ref<ComparisonResult | null>(null);
  const comparisonError = ref("");

  // Grouped results for the UI sections
  const groupedResults = computed(() => {
    const groups: Record<string, CollectorResult[]> = {};
    for (const result of results.value) {
      if (!groups[result.category]) {
        groups[result.category] = [];
      }
      groups[result.category].push(result);
    }
    return groups;
  });

  // Reset everything for a new scan
  function reset() {
    isScanning.value = false;
    scanComplete.value = false;
    currentCollector.value = "";
    progress.value = 0;
    totalCollectors.value = 0;
    results.value = [];
    hash.value = "";
    scoreResult.value = null;
    recommendations.value = [];
    comparison.value = null;
    comparisonError.value = "";
  }

  // Save scan to localStorage history
  function saveToHistory(optedIn: boolean) {
    if (!hash.value || !scoreResult.value) return;

    const platformResult = results.value.find((r) => r.name === "Platform");
    const uaResult = results.value.find((r) => r.name === "User Agent");

    // Try to extract a simple browser name from user agent
    let browser = "Unknown";
    const ua = uaResult?.value || "";
    if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Brave")) browser = "Brave";
    else if (ua.includes("Edg/")) browser = "Edge";
    else if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Safari")) browser = "Safari";

    const entry: HistoryEntry = {
      timestamp: new Date().toISOString(),
      hashPreview: hash.value.substring(0, 16),
      score: scoreResult.value.score,
      platform: platformResult?.value || "Unknown",
      browser,
      optedIn,
    };

    // Read existing history from localStorage
    let history: HistoryEntry[] = [];
    try {
      const stored = localStorage.getItem("bakas_history");
      if (stored) {
        history = JSON.parse(stored);
      }
    } catch {
      // corrupted data — start fresh
    }

    // Add new entry at the beginning (most recent first)
    history.unshift(entry);

    // Keep only the last 50 entries
    if (history.length > 50) {
      history = history.slice(0, 50);
    }

    localStorage.setItem("bakas_history", JSON.stringify(history));
  }

  return {
    // State
    isScanning,
    scanComplete,
    currentCollector,
    progress,
    totalCollectors,
    results,
    hash,
    scoreResult,
    recommendations,
    comparison,
    comparisonError,
    // Computed
    groupedResults,
    // Actions
    reset,
    saveToHistory,
  };
});
