<script setup lang="ts">
/**
 * Results Page — Interactive Profile Assembly
 *
 * After the scan, the profile builds itself field by field while the
 * user watches. Score ticks up in real time. Each field is tappable
 * to reveal why that data point matters to a tracker.
 */

import {
  Copy, Check, RotateCcw, Eye,
  ShieldAlert, ShieldCheck, ShieldQuestion, ShieldBan,
  ChevronDown, ChevronRight, Lock, Unlock, Shuffle,
  Monitor, Globe, Cpu, Palette, Volume2, Type,
  Wifi, Fingerprint, ArrowRight, MousePointer, Languages, Info
} from "lucide-vue-next";
import { useFingerprint } from "~/composables/useFingerprint";
import { generateFingerprintHash } from "~/utils/fingerprint";
import { calculateUniquenessScore } from "~/utils/scoring";
import type { DataPointStatus } from "~/utils/scoring";
import { generateRecommendations } from "~/utils/recommendations";

const config = useRuntimeConfig();
const store = useFingerprintStore();
const uiStore = useUiStore();
const { collectAll } = useFingerprint();

const completedItems = ref<any[]>([]);
const copied = ref(false);
const showTechnical = ref(false);

// Interactive reveal state
const revealPhase = ref<"idle" | "assembling" | "complete">("idle");
const visibleFieldCount = ref(0);
const displayScore = ref(0);
const expandedField = ref<string | null>(null);
let revealTimer: ReturnType<typeof setInterval> | null = null;
let scoreTimer: ReturnType<typeof setInterval> | null = null;

const sectionOrder = [
  "Browser & Device", "Screen & Display", "Timezone & Language",
  "Graphics", "Audio", "Installed Fonts",
  "Network & Connection", "Media Devices", "Storage & APIs",
];

// Profile fields derived from results
interface ProfileField {
  id: string;
  icon: any;
  label: string;
  value: string;
  detail?: string;
  why: string;
}

const profileFields = computed((): ProfileField[] => {
  const r = store.results;
  if (!r.length) return [];
  const fields: ProfileField[] = [];

  function find(name: string) {
    return r.find((x) => x.name === name);
  }

  const ua = find("User Agent");
  if (ua?.status === "available") {
    const uaStr = ua.value || "";
    let browser = "Unknown"; let os = "Unknown";
    if (uaStr.includes("Firefox")) browser = "Firefox";
    else if (uaStr.includes("Brave")) browser = "Brave";
    else if (uaStr.includes("Edg/")) browser = "Edge";
    else if (uaStr.includes("Chrome")) browser = "Chrome";
    else if (uaStr.includes("Safari")) browser = "Safari";
    if (uaStr.includes("Windows")) os = "Windows";
    else if (uaStr.includes("Mac")) os = "macOS";
    else if (uaStr.includes("Linux")) os = "Linux";
    else if (uaStr.includes("Android")) os = "Android";
    else if (uaStr.includes("iPhone") || uaStr.includes("iPad")) os = "iOS";
    fields.push({
      id: "browser", icon: Monitor, label: "Browser & OS",
      value: `${browser} on ${os}`,
      why: "Your browser and OS combination is the starting point for building a profile. It immediately narrows you down from billions of users to a much smaller group.",
    });
  }

  const scr = find("Screen & Display");
  if (scr?.status === "available") {
    const retina = scr.value.devicePixelRatio > 1;
    fields.push({
      id: "screen", icon: Monitor, label: "Display",
      value: `${scr.value.width}\u00d7${scr.value.height}`,
      detail: retina ? "Retina/HiDPI" : `${scr.value.colorDepth}-bit`,
      why: "Your screen resolution and pixel density narrow down your device model. A 2560\u00d71600 Retina display points to a specific MacBook generation.",
    });
  }

  const tz = find("Timezone & Locale");
  if (tz?.status === "available") {
    const city = tz.value.timezone.split("/").pop()?.replace(/_/g, " ") || tz.value.timezone;
    fields.push({
      id: "region", icon: Globe, label: "Region",
      value: city,
      detail: "via timezone, not IP",
      why: "Even with a VPN hiding your IP address, your timezone reveals your geographic region. A VPN in New York doesn't help if your timezone says Asia/Manila.",
    });
  }

  const webgl = find("WebGL Fingerprint");
  if (webgl?.status === "available" && webgl.value?.renderer) {
    const gpu = webgl.value.renderer;
    fields.push({
      id: "gpu", icon: Palette, label: "GPU",
      value: gpu.length > 38 ? gpu.substring(0, 35) + "..." : gpu,
      why: "Your exact GPU model and driver version is extremely identifying. Combined with your screen resolution, it often uniquely identifies your machine.",
    });
  }

  const canvas = find("Canvas Fingerprint");
  if (canvas?.status === "available") {
    fields.push({
      id: "canvas", icon: Fingerprint, label: "Canvas ID",
      value: canvas.value.substring(0, 12) + "...",
      detail: "hardware rendering signature",
      why: "When your browser draws an image, the exact pixel output depends on your GPU, drivers, and OS. This invisible drawing produces a unique hash \u2014 like a silent serial number.",
    });
  }

  const audio = find("Audio Fingerprint");
  if (audio?.status === "available") {
    fields.push({
      id: "audio", icon: Volume2, label: "Audio ID",
      value: audio.value.substring(0, 12) + "...",
      detail: "sound processing signature",
      why: "Your audio hardware processes sound in a way that produces unique floating-point values. You can't hear the difference, but it's enough to identify your device.",
    });
  }

  const hw = find("Hardware Concurrency");
  const mem = find("Device Memory");
  if (hw?.status === "available") {
    const ramStr = mem?.status === "available" ? ` \u00b7 ${mem.value}GB RAM` : "";
    fields.push({
      id: "hardware", icon: Cpu, label: "Hardware",
      value: `${hw.value} cores${ramStr}`,
      why: "Your CPU core count and RAM amount narrow down your device model significantly. A machine with 10 cores and 16GB RAM is a much smaller group than 'Chrome on macOS'.",
    });
  }

  const fonts = find("Installed Fonts");
  if (fonts?.status === "available") {
    fields.push({
      id: "fonts", icon: Type, label: "Fonts",
      value: `${fonts.value.count} installed`,
      why: "Every application you install adds fonts. Microsoft Office, Adobe Creative Suite, and developer tools all leave font traces. Your font list is a record of your software history.",
    });
  }

  const lang = find("Languages");
  if (lang?.status === "available" && lang.value?.all?.length) {
    fields.push({
      id: "language", icon: Languages, label: "Language",
      value: lang.value.all.join(", "),
      why: "Your language preference order reveals your nationality, whether you're multilingual, and sometimes your profession (developers often have en-US first).",
    });
  }

  const touch = find("Max Touch Points");
  if (touch?.status === "available" && touch.value > 0) {
    fields.push({
      id: "touch", icon: MousePointer, label: "Input",
      value: `Touchscreen (${touch.value} points)`,
      why: "Knowing you have a touchscreen immediately categorizes you as a mobile or tablet user, which changes the ad profile entirely.",
    });
  }

  const conn = find("Connection Info");
  if (conn?.status === "available") {
    fields.push({
      id: "network", icon: Wifi, label: "Network",
      value: `${conn.value.effectiveType} \u00b7 ${conn.value.downlink} Mbps`,
      why: "Your connection type and speed hint at whether you're on home wifi, office ethernet, or mobile data. This is a Chrome-only API \u2014 Firefox blocks it.",
    });
  }

  return fields;
});

// Avatar gradient from hash
const avatarGradient = computed(() => {
  if (!store.hash) return "linear-gradient(135deg, #6366f1, #8b5cf6)";
  const b = [];
  for (let i = 0; i < 6; i += 2) b.push(parseInt(store.hash.substring(i, i + 2), 16));
  const h1 = (b[0] * 1.41) % 360;
  const h2 = (h1 + 40 + b[1] % 60) % 360;
  return `linear-gradient(135deg, hsl(${h1}, 65%, 55%), hsl(${h2}, 55%, 50%))`;
});

const scoreColor = computed(() => {
  if (!store.scoreResult) return "#6366f1";
  if (store.scoreResult.level === "low") return "#22c55e";
  if (store.scoreResult.level === "medium") return "#f59e0b";
  return "#ef4444";
});

const levelBadge = computed(() => {
  if (!store.scoreResult) return null;
  const { level, label } = store.scoreResult;
  if (level === "high") return { text: label, class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
  if (level === "medium") return { text: label, class: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" };
  return { text: label, class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
});

// Start the progressive reveal after scan completes
function startReveal() {
  revealPhase.value = "assembling";
  visibleFieldCount.value = 0;
  displayScore.value = 0;
  expandedField.value = null;

  const targetScore = store.scoreResult?.score || 0;
  const totalFields = profileFields.value.length;

  let fieldIdx = 0;
  revealTimer = setInterval(() => {
    if (fieldIdx < totalFields) {
      visibleFieldCount.value = fieldIdx + 1;
      fieldIdx++;
    } else {
      if (revealTimer) clearInterval(revealTimer);
      revealPhase.value = "complete";
    }
  }, 280);

  const scoreStep = targetScore / Math.max(totalFields * 4, 20);
  scoreTimer = setInterval(() => {
    if (displayScore.value < targetScore) {
      displayScore.value = Math.min(displayScore.value + scoreStep, targetScore);
    } else {
      displayScore.value = targetScore;
      if (scoreTimer) clearInterval(scoreTimer);
    }
  }, 50);
}

function toggleField(id: string) {
  expandedField.value = expandedField.value === id ? null : id;
}

function getStatusConfig(status: DataPointStatus) {
  switch (status) {
    case "exposed": return { icon: Unlock, class: "text-danger dark:text-danger-dark", bg: "bg-red-100 dark:bg-red-900/20", label: "Exposed" };
    case "blocked": return { icon: ShieldBan, class: "text-zinc-400 dark:text-zinc-600", bg: "bg-zinc-100 dark:bg-zinc-800", label: "Blocked" };
    case "protected": return { icon: Shuffle, class: "text-safe dark:text-safe-dark", bg: "bg-green-100 dark:bg-green-900/20", label: "Protected" };
    case "low_risk": return { icon: Lock, class: "text-zinc-400 dark:text-zinc-500", bg: "bg-zinc-100 dark:bg-zinc-800", label: "Low risk" };
  }
}

function getImpactClass(impact: "high" | "medium" | "low") {
  switch (impact) {
    case "high": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "medium": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    case "low": return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
  }
}

// Scan lifecycle
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

  nextTick(() => startReveal());

  if (config.public.apiBase) { uiStore.openOptIn(); }
  else { store.saveToHistory(false); }
}

async function handleOptIn() {
  uiStore.closeOptIn();
  if (!config.public.apiBase) { store.comparisonError = "Comparison unavailable."; store.saveToHistory(true); return; }
  try {
    const fv = (n: string) => { const x = store.results.find((r) => r.name === n); return x?.status === "available" ? x.value : null; };
    const screen = fv("Screen & Display"); const tz = fv("Timezone & Locale");
    const body = {
      hash: store.hash, canvas_hash: fv("Canvas Fingerprint") || "unavailable",
      webgl_hash: (() => { const w = fv("WebGL Fingerprint"); return typeof w === "object" && w?.hash ? w.hash : "unavailable"; })(),
      audio_hash: fv("Audio Fingerprint") || "unavailable", font_count: fv("Installed Fonts")?.count || 0,
      screen_resolution: screen ? `${screen.width}x${screen.height}` : "unknown",
      color_depth: screen?.colorDepth || 24, device_pixel_ratio: screen?.devicePixelRatio || 1,
      hardware_concurrency: fv("Hardware Concurrency") || 1, device_memory: fv("Device Memory") || null,
      timezone: tz?.timezone || "unknown", touch_points: fv("Max Touch Points") || 0,
      platform: fv("Platform") || "unknown", language: fv("Languages")?.primary || "unknown",
    };
    const res = await fetch(`${config.public.apiBase}/api/fingerprints`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(5000) });
    if (res.ok) { const d = await res.json(); store.comparison = { isNew: d.is_new, totalCount: d.total_count, percentile: d.percentile }; }
    else { store.comparisonError = "Backend may be offline."; }
  } catch { store.comparisonError = "Comparison unavailable."; }
  store.saveToHistory(true);
}
function handleDecline() { uiStore.closeOptIn(); store.saveToHistory(false); }
async function copyHash() { try { await navigator.clipboard.writeText(store.hash); copied.value = true; setTimeout(() => (copied.value = false), 2000); } catch {} }
function rescan() { store.reset(); completedItems.value = []; showTechnical.value = false; revealPhase.value = "idle"; if (revealTimer) clearInterval(revealTimer); if (scoreTimer) clearInterval(scoreTimer); runScan(); }

onMounted(() => {
  if (store.scanComplete && store.results.length) {
    // Already have data (e.g. navigated back) — show immediately, no animation
    displayScore.value = store.scoreResult?.score || 0;
    visibleFieldCount.value = profileFields.value.length;
    revealPhase.value = "complete";
  } else {
    runScan();
  }
});
onUnmounted(() => { if (revealTimer) clearInterval(revealTimer); if (scoreTimer) clearInterval(scoreTimer); });
</script>

<template>
  <div>
    <!-- Scanning -->
    <div v-if="store.isScanning" class="py-16">
      <ScanProgress :completed-items="completedItems" :current-name="store.currentCollector" :progress="store.progress" :total-count="store.totalCollectors" />
    </div>

    <!-- Results -->
    <div v-else-if="store.scanComplete">

      <!-- Profile Card -->
      <section class="rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] overflow-hidden mb-6">
        <div class="p-5 sm:p-6">
          <div class="flex items-center gap-5 mb-5">
            <!-- Avatar with animated score ring -->
            <div class="relative shrink-0">
              <svg width="76" height="76" viewBox="0 0 76 76" class="transform -rotate-90">
                <circle cx="38" cy="38" r="34" fill="none" stroke="currentColor" class="text-zinc-200 dark:text-zinc-800" stroke-width="3.5" />
                <circle
                  cx="38" cy="38" r="34" fill="none" :stroke="scoreColor" stroke-width="3.5"
                  stroke-linecap="round"
                  :stroke-dasharray="2 * Math.PI * 34"
                  :stroke-dashoffset="2 * Math.PI * 34 - (displayScore / 100) * 2 * Math.PI * 34"
                  class="transition-[stroke-dashoffset] duration-300 ease-out"
                />
              </svg>
              <div
                class="absolute inset-[6px] rounded-full flex items-center justify-center text-white text-lg font-bold"
                :style="{ background: avatarGradient }"
              >
                {{ Math.round(displayScore) }}
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <h1 class="text-lg sm:text-xl font-bold text-zinc-800 dark:text-zinc-100">Your browser profile</h1>
                <span
                  v-if="levelBadge && revealPhase === 'complete'"
                  class="text-[10px] px-2 py-0.5 rounded-full font-semibold transition-opacity duration-500"
                  :class="levelBadge.class"
                >
                  {{ levelBadge.text }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <code class="text-xs font-mono text-zinc-400 dark:text-zinc-500 truncate">{{ store.hash.substring(0, 16) }}...</code>
                <button @click="copyHash" class="p-0.5 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                  <Check v-if="copied" class="w-3 h-3 text-safe dark:text-safe-dark" />
                  <Copy v-else class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <!-- Profile fields - revealed one by one -->
          <div class="space-y-[2px]">
            <div
              v-for="(field, i) in profileFields"
              :key="field.id"
              class="transition-all duration-300"
              :class="i < visibleFieldCount ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'"
              :style="{ transitionDelay: `${i * 30}ms` }"
            >
              <!-- Field row - clickable to expand -->
              <button
                @click="toggleField(field.id)"
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors group"
              >
                <component :is="field.icon" class="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
                <div class="flex-1 min-w-0 flex items-baseline gap-2">
                  <span class="text-[11px] text-zinc-400 dark:text-zinc-500 w-20 shrink-0">{{ field.label }}</span>
                  <span class="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{{ field.value }}</span>
                  <span v-if="field.detail" class="text-[10px] text-zinc-400 dark:text-zinc-500 hidden sm:inline">{{ field.detail }}</span>
                </div>
                <Info class="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-700 group-hover:text-accent dark:group-hover:text-accent-dark transition-colors shrink-0" />
              </button>

              <!-- Expanded explanation -->
              <Transition
                enter-active-class="transition-all duration-200 ease-out"
                enter-from-class="opacity-0 max-h-0"
                enter-to-class="opacity-100 max-h-32"
                leave-active-class="transition-all duration-150 ease-in"
                leave-from-class="opacity-100 max-h-32"
                leave-to-class="opacity-0 max-h-0"
              >
                <div
                  v-if="expandedField === field.id"
                  class="ml-10 mr-3 mb-2 px-3 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 overflow-hidden"
                >
                  <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {{ field.why }}
                  </p>
                </div>
              </Transition>
            </div>
          </div>
        </div>

        <!-- Tap hint -->
        <div
          v-if="revealPhase === 'complete'"
          class="px-5 py-2.5 bg-zinc-50 dark:bg-zinc-900/60 border-t border-black/[0.05] dark:border-white/[0.05]"
        >
          <p class="text-[10px] text-zinc-400 text-center flex items-center justify-center gap-1.5">
            <Info class="w-3 h-3" />
            Tap any row to see why it matters to a tracker
          </p>
        </div>
      </section>

      <!-- Everything below only appears after assembly completes -->
      <Transition
        enter-active-class="transition-all duration-500 ease-out"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
      >
        <div v-if="revealPhase === 'complete'">

          <!-- Threat Banner -->
          <section
            v-if="store.scoreResult"
            class="rounded-xl border p-4 mb-6"
            :class="{
              'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/40': store.scoreResult.level === 'high',
              'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/40': store.scoreResult.level === 'medium',
              'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/40': store.scoreResult.level === 'low',
            }"
          >
            <div class="flex items-start gap-3">
              <ShieldAlert v-if="store.scoreResult.level === 'high'" class="w-5 h-5 shrink-0 mt-0.5 text-danger dark:text-danger-dark" />
              <ShieldQuestion v-else-if="store.scoreResult.level === 'medium'" class="w-5 h-5 shrink-0 mt-0.5 text-warning dark:text-warning-dark" />
              <ShieldCheck v-else class="w-5 h-5 shrink-0 mt-0.5 text-safe dark:text-safe-dark" />
              <div>
                <p class="text-sm font-semibold" :class="{ 'text-red-800 dark:text-red-300': store.scoreResult.level === 'high', 'text-amber-800 dark:text-amber-300': store.scoreResult.level === 'medium', 'text-green-800 dark:text-green-300': store.scoreResult.level === 'low' }">
                  {{ store.scoreResult.totalExposed }} data points exposed, {{ store.scoreResult.totalProtected }} protected, {{ store.scoreResult.totalBlocked }} blocked
                </p>
                <p class="text-xs mt-0.5" :class="{ 'text-red-600 dark:text-red-400': store.scoreResult.level === 'high', 'text-amber-600 dark:text-amber-400': store.scoreResult.level === 'medium', 'text-green-600 dark:text-green-400': store.scoreResult.level === 'low' }">
                  {{ store.scoreResult.level === 'high' ? 'Your browser reveals enough to be uniquely identified.' : store.scoreResult.level === 'medium' ? 'A few changes could significantly reduce your surface.' : 'Your browser is doing a good job limiting exposure.' }}
                </p>
              </div>
            </div>
          </section>

          <!-- Category Bars -->
          <section class="rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-5 sm:p-6 mb-6" v-if="store.scoreResult">
            <h2 class="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Exposure by category</h2>
            <div class="space-y-3">
              <div v-for="cat in store.scoreResult.categories" :key="cat.name" class="flex items-center gap-3">
                <span class="w-2 h-2 rounded-full shrink-0" :style="{ backgroundColor: cat.color }"></span>
                <span class="text-xs text-zinc-600 dark:text-zinc-400 w-28 shrink-0">{{ cat.name }}</span>
                <div class="flex-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-700 ease-out" :style="{ width: `${cat.score}%`, backgroundColor: cat.color }" />
                </div>
                <span class="text-xs font-mono w-9 text-right shrink-0" :class="{ 'text-safe dark:text-safe-dark': cat.score <= 30, 'text-warning dark:text-warning-dark': cat.score > 30 && cat.score <= 60, 'text-danger dark:text-danger-dark': cat.score > 60 }">
                  {{ cat.score }}%
                </span>
              </div>
            </div>
          </section>

          <!-- Protections -->
          <section v-if="store.scoreResult?.protections.length" class="mb-6">
            <h2 class="text-sm font-bold mb-3 flex items-center gap-2">
              <ShieldCheck class="w-4 h-4 text-safe dark:text-safe-dark" />
              Protections detected
            </h2>
            <div class="space-y-2">
              <div v-for="p in store.scoreResult.protections" :key="p.id" class="rounded-lg border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] px-4 py-3 flex items-start gap-3">
                <ShieldCheck class="w-4 h-4 text-safe dark:text-safe-dark shrink-0 mt-0.5" />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-0.5">
                    <p class="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{{ p.label }}</p>
                    <span class="text-[10px] px-1.5 py-0.5 rounded-full font-medium" :class="getImpactClass(p.impact)">{{ p.impact }}</span>
                  </div>
                  <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{{ p.description }}</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Recommendations -->
          <section v-if="store.recommendations.length > 0" class="mb-6">
            <h2 class="text-sm font-bold mb-3">What you can do</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <RecommendationCard v-for="rec in store.recommendations" :key="rec.id" :recommendation="rec" />
            </div>
          </section>

          <!-- Percentile -->
          <section v-if="store.comparison || store.comparisonError" class="mb-6">
            <PercentileResult v-if="store.comparison" :is-new="store.comparison.isNew" :total-count="store.comparison.totalCount" :percentile="store.comparison.percentile" />
            <PercentileResult v-else :is-new="false" :total-count="0" :percentile="0" :error="store.comparisonError" />
          </section>

          <!-- Technical toggle -->
          <div class="mb-6">
            <button @click="showTechnical = !showTechnical" class="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
              {{ showTechnical ? "Hide" : "Show" }} all {{ store.results.length }} data points
              <ChevronDown class="w-4 h-4 transition-transform duration-200" :class="{ 'rotate-180': showTechnical }" />
            </button>
          </div>

          <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition-all duration-200 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
            <div v-if="showTechnical">
              <section class="mb-6" v-if="store.scoreResult">
                <div class="rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] overflow-hidden divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                  <div v-for="cat in store.scoreResult.categories" :key="cat.name" class="px-4 py-3">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-xs font-medium text-zinc-600 dark:text-zinc-300 flex items-center gap-2"><span class="w-2 h-2 rounded-full" :style="{ backgroundColor: cat.color }"></span>{{ cat.name }}</span>
                      <span class="text-[10px] font-mono text-zinc-400">{{ cat.points }}/{{ cat.maxPoints }}</span>
                    </div>
                    <div class="flex flex-wrap gap-1.5">
                      <div v-for="dp in cat.dataPoints" :key="dp.name" class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium" :class="getStatusConfig(dp.status).bg" :title="dp.note">
                        <component :is="getStatusConfig(dp.status).icon" class="w-2.5 h-2.5" :class="getStatusConfig(dp.status).class" />
                        <span :class="getStatusConfig(dp.status).class">{{ dp.name }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <section class="mb-8">
                <template v-for="section in sectionOrder" :key="section">
                  <DataPointSection v-if="store.groupedResults[section]" :title="section" :results="store.groupedResults[section]" />
                </template>
              </section>
            </div>
          </Transition>

          <!-- Actions -->
          <div class="flex flex-wrap gap-3 justify-center pt-2 pb-2">
            <button @click="rescan" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"><RotateCcw class="w-4 h-4" /> Scan Again</button>
            <NuxtLink to="/demo" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-accent dark:bg-accent-dark text-white hover:opacity-90 transition-opacity"><Eye class="w-4 h-4" /> See what trackers see</NuxtLink>
          </div>
        </div>
      </Transition>
    </div>

    <OptInPrompt v-if="uiStore.showOptInModal" @accept="handleOptIn" @decline="handleDecline" />
  </div>
</template>