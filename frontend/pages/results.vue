<script setup lang="ts">
/**
 * Results Page — Full Fingerprint Breakdown
 *
 * This is the centrepiece of bakas. When the user navigates here,
 * the scan starts automatically. After collection, it shows a
 * dashboard-style breakdown of everything the browser revealed.
 */

import {
  Fingerprint, Copy, Check, RotateCcw, Eye,
  ShieldAlert, ShieldCheck, ShieldQuestion,
  Scan, EyeOff, Hash, Layers
} from "lucide-vue-next";
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

// Computed stats for the summary strip
const availableCount = computed(() =>
  store.results.filter((r) => r.status === "available").length
);
const blockedCount = computed(() =>
  store.results.filter((r) => r.status === "unavailable").length
);

// Threat level config
const threatConfig = computed(() => {
  if (!store.scoreResult) return null;
  const { level, score } = store.scoreResult;

  if (level === "high") {
    return {
      icon: ShieldAlert,
      title: "High exposure",
      description: "Your browser reveals enough information to be uniquely identified across websites. Consider the recommendations below.",
      bgClass: "bg-red-50 dark:bg-red-900/10",
      borderClass: "border-red-200 dark:border-red-800/40",
      iconClass: "text-danger dark:text-danger-dark",
      textClass: "text-red-800 dark:text-red-300",
      mutedClass: "text-red-600 dark:text-red-400",
    };
  } else if (level === "medium") {
    return {
      icon: ShieldQuestion,
      title: "Moderate exposure",
      description: "Your browser is somewhat trackable. A few changes could significantly reduce your fingerprint surface.",
      bgClass: "bg-amber-50 dark:bg-amber-900/10",
      borderClass: "border-amber-200 dark:border-amber-800/40",
      iconClass: "text-warning dark:text-warning-dark",
      textClass: "text-amber-800 dark:text-amber-300",
      mutedClass: "text-amber-600 dark:text-amber-400",
    };
  } else {
    return {
      icon: ShieldCheck,
      title: "Low exposure",
      description: "Your browser is doing a good job at limiting trackable data points. Keep it up.",
      bgClass: "bg-green-50 dark:bg-green-900/10",
      borderClass: "border-green-200 dark:border-green-800/40",
      iconClass: "text-safe dark:text-safe-dark",
      textClass: "text-green-800 dark:text-green-300",
      mutedClass: "text-green-600 dark:text-green-400",
    };
  }
});

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
  store.hash = await generateFingerprintHash(results);
  store.scoreResult = calculateUniquenessScore(results);
  store.recommendations = generateRecommendations(results);

  store.isScanning = false;
  store.scanComplete = true;

  // Only show the opt-in prompt if the backend is configured.
  // No point asking to compare if there's nothing to compare against.
  if (config.public.apiBase) {
    uiStore.openOptIn();
  } else {
    store.saveToHistory(false);
  }
}

// Handle opt-in: send fingerprint to backend
async function handleOptIn() {
  uiStore.closeOptIn();

  if (!config.public.apiBase) {
    store.comparisonError = "Comparison unavailable. Backend not configured.";
    store.saveToHistory(true);
    return;
  }

  try {
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

function handleDecline() {
  uiStore.closeOptIn();
  store.saveToHistory(false);
}

async function copyHash() {
  try {
    await navigator.clipboard.writeText(store.hash);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch {
    // clipboard API not available
  }
}

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
    <!-- ═══ Scanning State ═══ -->
    <div v-if="store.isScanning" class="py-16">
      <ScanProgress
        :completed-items="completedItems"
        :current-name="store.currentCollector"
        :progress="store.progress"
        :total-count="store.totalCollectors"
      />
    </div>

    <!-- ═══ Results ═══ -->
    <div v-else-if="store.scanComplete">

      <!-- ── Hero Card: Visual + Gauge + Hash ── -->
      <section
        class="rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-6 sm:p-8 mb-6"
      >
        <div class="flex flex-col sm:flex-row items-center gap-8">
          <!-- Left: Fingerprint visual -->
          <div class="shrink-0">
            <FingerprintVisual :hash="store.hash" :size="140" />
          </div>

          <!-- Center: Hash + metadata -->
          <div class="flex-1 min-w-0 text-center sm:text-left">
            <p class="text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">
              Your fingerprint
            </p>

            <!-- Hash -->
            <div class="flex items-center gap-2 justify-center sm:justify-start mb-3">
              <code class="text-base sm:text-lg font-mono font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                {{ store.hash.substring(0, 20) }}...
              </code>
              <button
                @click="copyHash"
                class="shrink-0 p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                :title="copied ? 'Copied!' : 'Copy full hash'"
              >
                <Check v-if="copied" class="w-4 h-4 text-safe dark:text-safe-dark" />
                <Copy v-else class="w-4 h-4" />
              </button>
            </div>

            <p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-md">
              This hash is generated from your browser's unique combination of properties.
              Same setup, same hash. One change, completely different hash.
            </p>
          </div>

          <!-- Right: Score gauge -->
          <div v-if="store.scoreResult" class="shrink-0">
            <UniquenessGauge
              :score="store.scoreResult.score"
              :label="store.scoreResult.label"
              :level="store.scoreResult.level"
            />
          </div>
        </div>
      </section>

      <!-- ── Threat Level Banner ── -->
      <section
        v-if="threatConfig"
        class="rounded-xl border p-4 mb-6"
        :class="[threatConfig.bgClass, threatConfig.borderClass]"
      >
        <div class="flex items-start gap-3">
          <component
            :is="threatConfig.icon"
            class="w-5 h-5 shrink-0 mt-0.5"
            :class="threatConfig.iconClass"
          />
          <div>
            <p class="text-sm font-semibold" :class="threatConfig.textClass">
              {{ threatConfig.title }}
            </p>
            <p class="text-xs mt-0.5" :class="threatConfig.mutedClass">
              {{ threatConfig.description }}
            </p>
          </div>
        </div>
      </section>

      <!-- ── Quick Stats Strip ── -->
      <section class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div class="rounded-lg border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] px-4 py-3">
          <div class="flex items-center gap-2 mb-1">
            <Scan class="w-3.5 h-3.5 text-zinc-400" />
            <span class="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Collected</span>
          </div>
          <p class="text-xl font-bold">{{ store.results.length }}</p>
          <p class="text-[11px] text-zinc-400">data points</p>
        </div>

        <div class="rounded-lg border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] px-4 py-3">
          <div class="flex items-center gap-2 mb-1">
            <Eye class="w-3.5 h-3.5 text-safe dark:text-safe-dark" />
            <span class="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Exposed</span>
          </div>
          <p class="text-xl font-bold text-safe dark:text-safe-dark">{{ availableCount }}</p>
          <p class="text-[11px] text-zinc-400">available to trackers</p>
        </div>

        <div class="rounded-lg border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] px-4 py-3">
          <div class="flex items-center gap-2 mb-1">
            <EyeOff class="w-3.5 h-3.5 text-zinc-400" />
            <span class="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Blocked</span>
          </div>
          <p class="text-xl font-bold">{{ blockedCount }}</p>
          <p class="text-[11px] text-zinc-400">by your browser</p>
        </div>

        <div class="rounded-lg border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] px-4 py-3">
          <div class="flex items-center gap-2 mb-1">
            <Layers class="w-3.5 h-3.5 text-zinc-400" />
            <span class="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Categories</span>
          </div>
          <p class="text-xl font-bold">{{ Object.keys(store.groupedResults).length }}</p>
          <p class="text-[11px] text-zinc-400">signal groups</p>
        </div>
      </section>

      <!-- ── Percentile Comparison ── -->
      <section v-if="store.comparison || store.comparisonError" class="mb-6">
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

      <!-- ── Data Point Breakdown ── -->
      <section class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-xl font-bold">Data Point Breakdown</h2>
            <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Everything your browser just revealed, organized by category.
            </p>
          </div>
          <div class="hidden sm:flex items-center gap-3 text-[11px]">
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-red-500"></span>
              High risk
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-amber-500"></span>
              Medium
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-green-500"></span>
              Low
            </span>
          </div>
        </div>

        <template v-for="section in sectionOrder" :key="section">
          <DataPointSection
            v-if="store.groupedResults[section]"
            :title="section"
            :results="store.groupedResults[section]"
          />
        </template>
      </section>

      <!-- ── Recommendations ── -->
      <section v-if="store.recommendations.length > 0" class="mb-8">
        <h2 class="text-xl font-bold mb-1">Privacy Recommendations</h2>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
          Based on what was actually collected from your browser.
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <RecommendationCard
            v-for="rec in store.recommendations"
            :key="rec.id"
            :recommendation="rec"
          />
        </div>
      </section>

      <!-- ── Actions ── -->
      <div class="flex flex-wrap gap-3 justify-center pt-4 pb-2">
        <button
          @click="rescan"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <RotateCcw class="w-4 h-4" />
          Scan Again
        </button>
        <NuxtLink
          to="/demo"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-accent dark:bg-accent-dark text-white hover:opacity-90 transition-opacity"
        >
          <Eye class="w-4 h-4" />
          See what trackers see
        </NuxtLink>
      </div>
    </div>

    <!-- ── Opt-in Modal ── -->
    <OptInPrompt
      v-if="uiStore.showOptInModal"
      @accept="handleOptIn"
      @decline="handleDecline"
    />
  </div>
</template>