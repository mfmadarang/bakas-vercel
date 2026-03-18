<script setup lang="ts">
/**
 * Results Page — Full Fingerprint Breakdown
 *
 * Shows the multi-segment gauge, detected protections, per-category
 * score breakdown, data point details, and recommendations.
 */

import {
  Fingerprint, Copy, Check, RotateCcw, Eye,
  ShieldAlert, ShieldCheck, ShieldQuestion, ShieldBan,
  Scan, EyeOff, ArrowRight, Lock, Unlock, Shuffle
} from "lucide-vue-next";
import { useFingerprint } from "~/composables/useFingerprint";
import { generateFingerprintHash } from "~/utils/fingerprint";
import { calculateUniquenessScore } from "~/utils/scoring";
import type { ScoreResult, DataPointStatus } from "~/utils/scoring";
import { generateRecommendations } from "~/utils/recommendations";

const config = useRuntimeConfig();
const store = useFingerprintStore();
const uiStore = useUiStore();
const { collectAll } = useFingerprint();

const completedItems = ref<any[]>([]);
const copied = ref(false);

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

// Threat level config
const threatConfig = computed(() => {
  if (!store.scoreResult) return null;
  const { level } = store.scoreResult;

  if (level === "high") {
    return {
      icon: ShieldAlert,
      title: "High exposure",
      description: "Your browser reveals enough information to be uniquely identified across websites.",
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
      description: "Your browser is somewhat trackable. A few changes could significantly reduce your surface.",
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
      description: "Your browser is doing a good job at limiting trackable data points.",
      bgClass: "bg-green-50 dark:bg-green-900/10",
      borderClass: "border-green-200 dark:border-green-800/40",
      iconClass: "text-safe dark:text-safe-dark",
      textClass: "text-green-800 dark:text-green-300",
      mutedClass: "text-green-600 dark:text-green-400",
    };
  }
});

// Status icon and color mapping
function getStatusConfig(status: DataPointStatus) {
  switch (status) {
    case "exposed":
      return { icon: Unlock, class: "text-danger dark:text-danger-dark", bg: "bg-red-100 dark:bg-red-900/20", label: "Exposed" };
    case "blocked":
      return { icon: ShieldBan, class: "text-zinc-400 dark:text-zinc-600", bg: "bg-zinc-100 dark:bg-zinc-800", label: "Blocked" };
    case "protected":
      return { icon: Shuffle, class: "text-safe dark:text-safe-dark", bg: "bg-green-100 dark:bg-green-900/20", label: "Protected" };
    case "low_risk":
      return { icon: Lock, class: "text-zinc-400 dark:text-zinc-500", bg: "bg-zinc-100 dark:bg-zinc-800", label: "Low risk" };
  }
}

// Protection impact badge colors
function getImpactClass(impact: "high" | "medium" | "low") {
  switch (impact) {
    case "high": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "medium": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    case "low": return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
  }
}

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

  if (config.public.apiBase) {
    uiStore.openOptIn();
  } else {
    store.saveToHistory(false);
  }
}

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
  } catch {}
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
    <!-- ═══ Scanning ═══ -->
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

      <!-- ── Hero: Visual + Gauge + Hash ── -->
      <section class="rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-6 sm:p-8 mb-6">
        <div class="flex flex-col sm:flex-row items-center gap-8">
          <div class="shrink-0">
            <FingerprintVisual :hash="store.hash" :size="130" />
          </div>

          <div class="flex-1 min-w-0 text-center sm:text-left">
            <p class="text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">
              Your fingerprint
            </p>
            <div class="flex items-center gap-2 justify-center sm:justify-start mb-3">
              <code class="text-base sm:text-lg font-mono font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                {{ store.hash.substring(0, 20) }}...
              </code>
              <button
                @click="copyHash"
                class="shrink-0 p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
              >
                <Check v-if="copied" class="w-4 h-4 text-safe dark:text-safe-dark" />
                <Copy v-else class="w-4 h-4" />
              </button>
            </div>
            <p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-md">
              Generated from your browser's unique combination of properties.
              Same setup, same hash. One change, completely different output.
            </p>
          </div>

          <div v-if="store.scoreResult" class="shrink-0">
            <UniquenessGauge
              :score="store.scoreResult.score"
              :label="store.scoreResult.label"
              :level="store.scoreResult.level"
              :categories="store.scoreResult.categories"
            />
          </div>
        </div>
      </section>

      <!-- ── Threat Banner ── -->
      <section
        v-if="threatConfig"
        class="rounded-xl border p-4 mb-6"
        :class="[threatConfig.bgClass, threatConfig.borderClass]"
      >
        <div class="flex items-start gap-3">
          <component :is="threatConfig.icon" class="w-5 h-5 shrink-0 mt-0.5" :class="threatConfig.iconClass" />
          <div>
            <p class="text-sm font-semibold" :class="threatConfig.textClass">{{ threatConfig.title }}</p>
            <p class="text-xs mt-0.5" :class="threatConfig.mutedClass">{{ threatConfig.description }}</p>
          </div>
        </div>
      </section>

      <!-- ── Status Summary ── -->
      <section class="grid grid-cols-3 gap-3 mb-6" v-if="store.scoreResult">
        <div class="rounded-lg border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] px-4 py-3 text-center">
          <p class="text-2xl font-bold text-danger dark:text-danger-dark">{{ store.scoreResult.totalExposed }}</p>
          <p class="text-[11px] text-zinc-400 mt-0.5">Exposed</p>
        </div>
        <div class="rounded-lg border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] px-4 py-3 text-center">
          <p class="text-2xl font-bold text-safe dark:text-safe-dark">{{ store.scoreResult.totalProtected }}</p>
          <p class="text-[11px] text-zinc-400 mt-0.5">Protected</p>
        </div>
        <div class="rounded-lg border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] px-4 py-3 text-center">
          <p class="text-2xl font-bold text-zinc-400">{{ store.scoreResult.totalBlocked }}</p>
          <p class="text-[11px] text-zinc-400 mt-0.5">Blocked</p>
        </div>
      </section>

      <!-- ── Detected Protections ── -->
      <section v-if="store.scoreResult && store.scoreResult.protections.length > 0" class="mb-6">
        <h2 class="text-base font-bold mb-3 flex items-center gap-2">
          <ShieldCheck class="w-4 h-4 text-safe dark:text-safe-dark" />
          Detected Protections
        </h2>
        <div class="space-y-2">
          <div
            v-for="p in store.scoreResult.protections"
            :key="p.id"
            class="rounded-lg border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] px-4 py-3 flex items-start gap-3"
          >
            <ShieldCheck class="w-4 h-4 text-safe dark:text-safe-dark shrink-0 mt-0.5" />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-0.5">
                <p class="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{{ p.label }}</p>
                <span class="text-[10px] px-1.5 py-0.5 rounded-full font-medium" :class="getImpactClass(p.impact)">
                  {{ p.impact }} impact
                </span>
              </div>
              <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{{ p.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Category Breakdown ── -->
      <section class="mb-6" v-if="store.scoreResult">
        <h2 class="text-base font-bold mb-3">Score by Category</h2>
        <div class="rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] overflow-hidden divide-y divide-black/[0.04] dark:divide-white/[0.04]">
          <div
            v-for="cat in store.scoreResult.categories"
            :key="cat.name"
            class="px-4 py-3"
          >
            <div class="flex items-center justify-between mb-1.5">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: cat.color }"></span>
                <span class="text-sm font-medium text-zinc-800 dark:text-zinc-200">{{ cat.name }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono text-zinc-400">{{ cat.points }}/{{ cat.maxPoints }}</span>
                <span
                  class="text-xs font-semibold w-10 text-right"
                  :class="{
                    'text-safe dark:text-safe-dark': cat.score <= 30,
                    'text-warning dark:text-warning-dark': cat.score > 30 && cat.score <= 60,
                    'text-danger dark:text-danger-dark': cat.score > 60,
                  }"
                >{{ cat.score }}%</span>
              </div>
            </div>
            <!-- Progress bar -->
            <div class="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-700 ease-out"
                :style="{ width: `${cat.score}%`, backgroundColor: cat.color }"
              />
            </div>
            <!-- Data point statuses -->
            <div class="flex flex-wrap gap-1.5 mt-2">
              <div
                v-for="dp in cat.dataPoints"
                :key="dp.name"
                class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
                :class="getStatusConfig(dp.status).bg"
              >
                <component :is="getStatusConfig(dp.status).icon" class="w-2.5 h-2.5" :class="getStatusConfig(dp.status).class" />
                <span :class="getStatusConfig(dp.status).class">{{ dp.name }}</span>
              </div>
            </div>
          </div>
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
              Everything your browser revealed, organized by category.
            </p>
          </div>
          <div class="hidden sm:flex items-center gap-3 text-[11px]">
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-red-500"></span>
              High
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

    <!-- Opt-in Modal -->
    <OptInPrompt
      v-if="uiStore.showOptInModal"
      @accept="handleOptIn"
      @decline="handleDecline"
    />
  </div>
</template>