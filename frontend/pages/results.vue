<script setup lang="ts">
/**
 * Results Page — Full Fingerprint Breakdown
 *
 * This is the centrepiece of bakas. When the user navigates here,
 * the scan starts automatically. After collection, it shows:
 * 1. Fingerprint visual + hash
 * 2. Uniqueness gauge
 * 3. Opt-in prompt for database comparison
 * 4. Full data point breakdown by category
 * 5. Privacy recommendations
 */

import { Fingerprint, Download, Copy, Check } from "lucide-vue-next";
import { useFingerprint } from "~/composables/useFingerprint";
import { generateFingerprintHash } from "~/utils/fingerprint";
import { calculateUniquenessScore } from "~/utils/scoring";
import { generateRecommendations } from "~/utils/recommendations";

const config = useRuntimeConfig();
const store = useFingerprintStore();
const uiStore = useUiStore();
const { collectAll } = useFingerprint();

const completedItems = ref<any[]>([]);
const copied = ref(false);

// Section ordering for the data point breakdown
const sectionOrder = [
  "Browser & Device",
  "Screen & Display",
  "Timezone & Language",
  "Graphics",
  "Audio",
  "Installed Fonts",
  "Network & Connection",
  "Media Devices",
  "Storage & APIs",
];

// Start the scan when the page loads
async function runScan() {
  if (store.scanComplete || store.isScanning) return;

  store.isScanning = true;
  completedItems.value = [];

  const results = await collectAll((result, index, total) => {
    store.currentCollector = result.name;
    store.totalCollectors = total;
    store.progress = (index + 1) / total;
    completedItems.value = [...completedItems.value, result];
  });

  store.results = results;

  // Generate the fingerprint hash
  store.hash = await generateFingerprintHash(results);

  // Calculate uniqueness score
  store.scoreResult = calculateUniquenessScore(results);

  // Generate recommendations
  store.recommendations = generateRecommendations(results);

  store.isScanning = false;
  store.scanComplete = true;

  // Show opt-in prompt
  uiStore.openOptIn();
}

// Handle opt-in: send fingerprint to backend
async function handleOptIn() {
  uiStore.closeOptIn();

  // Skip if no backend URL is configured
  if (!config.public.apiBase) {
    store.comparisonError = "Comparison unavailable. Backend not configured.";
    store.saveToHistory(true);
    return;
  }

  try {
    // Build the submission payload from collected data
    const findValue = (name: string) => {
      const r = store.results.find((r) => r.name === name);
      return r?.status === "available" ? r.value : null;
    };

    const screen = findValue("Screen & Display");
    const tz = findValue("Timezone & Locale");
    const canvas = findValue("Canvas Fingerprint");
    const webgl = findValue("WebGL Fingerprint");
    const audio = findValue("Audio Fingerprint");
    const fonts = findValue("Installed Fonts");

    const body = {
      hash: store.hash,
      canvas_hash: canvas || "unavailable",
      webgl_hash: typeof webgl === "object" && webgl?.hash ? webgl.hash : "unavailable",
      audio_hash: audio || "unavailable",
      font_count: fonts?.count || 0,
      screen_resolution: screen ? `${screen.width}x${screen.height}` : "unknown",
      color_depth: screen?.colorDepth || 24,
      device_pixel_ratio: screen?.devicePixelRatio || 1,
      hardware_concurrency: findValue("Hardware Concurrency") || 1,
      device_memory: findValue("Device Memory") || null,
      timezone: tz?.timezone || "unknown",
      touch_points: findValue("Max Touch Points") || 0,
      platform: findValue("Platform") || "unknown",
      language: findValue("Languages")?.primary || "unknown",
    };

    const response = await fetch(`${config.public.apiBase}/api/fingerprints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      store.comparison = {
        isNew: data.is_new,
        totalCount: data.total_count,
        percentile: data.percentile,
      };
    } else {
      store.comparisonError = "Failed to submit fingerprint. The backend may be offline.";
    }
  } catch {
    store.comparisonError = "Comparison unavailable. Backend offline.";
  }

  store.saveToHistory(true);
}

// Handle opt-out: just save to history without submitting
function handleDecline() {
  uiStore.closeOptIn();
  store.saveToHistory(false);
}

// Copy hash to clipboard
async function copyHash() {
  try {
    await navigator.clipboard.writeText(store.hash);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch {
    // clipboard API not available
  }
}

// Re-scan
function rescan() {
  store.reset();
  completedItems.value = [];
  runScan();
}

onMounted(() => {
  runScan();
});
</script>

<template>
  <div>
    <!-- Scanning state -->
    <div v-if="store.isScanning" class="py-16">
      <ScanProgress
        :completed-items="completedItems"
        :current-name="store.currentCollector"
        :progress="store.progress"
        :total-count="store.totalCollectors"
      />
    </div>

    <!-- Results -->
    <div v-else-if="store.scanComplete">
      <!-- Identity Summary -->
      <section class="mb-8">
        <div class="flex flex-col sm:flex-row items-center gap-6 mb-6">
          <!-- Fingerprint visual -->
          <FingerprintVisual :hash="store.hash" :size="160" />

          <div class="text-center sm:text-left">
            <h1 class="text-2xl font-bold mb-2">Your Browser Fingerprint</h1>

            <!-- Hash display -->
            <div class="flex items-center gap-2 mb-3">
              <code class="text-sm font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg">
                {{ store.hash.substring(0, 24) }}...
              </code>
              <button
                @click="copyHash"
                class="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                :title="copied ? 'Copied!' : 'Copy full hash'"
              >
                <Check v-if="copied" class="w-4 h-4 text-safe dark:text-safe-dark" />
                <Copy v-else class="w-4 h-4" />
              </button>
            </div>

            <p class="text-sm text-zinc-500 dark:text-zinc-400">
              This hash uniquely identifies your browser's configuration.
              Two identical setups produce the same hash.
            </p>
          </div>
        </div>

        <!-- Uniqueness gauge -->
        <div
          v-if="store.scoreResult"
          class="flex justify-center mb-6 relative"
        >
          <UniquenessGauge
            :score="store.scoreResult.score"
            :label="store.scoreResult.label"
            :level="store.scoreResult.level"
          />
        </div>
      </section>

      <!-- Percentile comparison (if opted in) -->
      <section v-if="store.comparison || store.comparisonError" class="mb-8">
        <PercentileResult
          v-if="store.comparison"
          :is-new="store.comparison.isNew"
          :total-count="store.comparison.totalCount"
          :percentile="store.comparison.percentile"
        />
        <PercentileResult
          v-else
          :is-new="false"
          :total-count="0"
          :percentile="0"
          :error="store.comparisonError"
        />
      </section>

      <!-- Data point breakdown -->
      <section class="mb-8">
        <h2 class="text-xl font-bold mb-4">Data Point Breakdown</h2>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Every piece of information your browser just revealed. Each data point
          contributes to your overall fingerprint uniqueness.
        </p>

        <template v-for="section in sectionOrder" :key="section">
          <DataPointSection
            v-if="store.groupedResults[section]"
            :title="section"
            :results="store.groupedResults[section]"
          />
        </template>
      </section>

      <!-- Recommendations -->
      <section v-if="store.recommendations.length > 0" class="mb-8">
        <h2 class="text-xl font-bold mb-2">Privacy Recommendations</h2>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
          Based on what was actually collected from your browser.
        </p>

        <div class="space-y-3">
          <RecommendationCard
            v-for="rec in store.recommendations"
            :key="rec.id"
            :recommendation="rec"
          />
        </div>
      </section>

      <!-- Actions -->
      <div class="flex flex-wrap gap-3 justify-center mt-8 mb-4">
        <button
          @click="rescan"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <Fingerprint class="w-4 h-4" />
          Scan Again
        </button>
        <NuxtLink
          to="/demo"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          See what trackers see
        </NuxtLink>
      </div>
    </div>

    <!-- Opt-in modal -->
    <OptInPrompt
      v-if="uiStore.showOptInModal"
      @accept="handleOptIn"
      @decline="handleDecline"
    />
  </div>
</template>
