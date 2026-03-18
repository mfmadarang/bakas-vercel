<script setup lang="ts">
/**
 * Demo Page — "What Sites See"
 *
 * A phased, story-driven simulation of what happens behind the scenes
 * when you visit a website with tracking scripts. Uses the user's actual
 * fingerprint data to make it personal.
 *
 * Phases:
 *   1. The "website" loads, user sees a normal-looking page
 *   2. After a beat, the tracker panel slides in and starts collecting
 *   3. A live timer shows how fast it's happening
 *   4. After collection, a "profile card" reveals what the tracker built
 *   5. Punchline message
 */

import {
  RotateCcw, Eye, Fingerprint, ArrowRight,
  Clock, Hash, MonitorSmartphone, MapPin, Globe, Cpu
} from "lucide-vue-next";
import { useFingerprint } from "~/composables/useFingerprint";
import type { TerminalLine } from "~/utils/types";

const { collectAll } = useFingerprint();

// Phase state
const phase = ref<"loading" | "website" | "tracking" | "profile" | "done">("loading");
const terminalLines = ref<TerminalLine[]>([]);
const isTerminalRunning = ref(false);
const dataPointsCollected = ref(0);
const elapsedMs = ref(0);
const profileData = ref<Record<string, string>>({});

let timerInterval: ReturnType<typeof setInterval> | null = null;

// Collect real fingerprint data and build categorized terminal lines
async function buildDemoLines(): Promise<{ lines: TerminalLine[]; profile: Record<string, string> }> {
  const lines: TerminalLine[] = [];
  const profile: Record<string, string> = {};

  lines.push({ text: "Initializing tracking module...", category: "system" });
  lines.push({ text: "Injected via <script> tag in page header", category: "system" });
  lines.push({ text: "Cookie consent banner displayed as distraction", category: "system" });
  lines.push({ text: "", category: "system" });

  // Collect real data
  const results = await collectAll();

  // User Agent
  const ua = results.find((r) => r.name === "User Agent");
  if (ua && ua.status === "available") {
    const uaStr = ua.value || "";
    let browser = "Unknown";
    let os = "Unknown";
    if (uaStr.includes("Firefox")) browser = "Firefox";
    else if (uaStr.includes("Edg/")) browser = "Edge";
    else if (uaStr.includes("Chrome")) browser = "Chrome";
    else if (uaStr.includes("Safari")) browser = "Safari";
    if (uaStr.includes("Windows")) os = "Windows";
    else if (uaStr.includes("Mac")) os = "macOS";
    else if (uaStr.includes("Linux")) os = "Linux";
    else if (uaStr.includes("Android")) os = "Android";
    else if (uaStr.includes("iPhone") || uaStr.includes("iPad")) os = "iOS";
    lines.push({ text: `Browser identified: ${browser} on ${os}`, category: "collect" });
    profile["Browser"] = `${browser} on ${os}`;
  }

  // Screen
  const screen = results.find((r) => r.name === "Screen & Display");
  if (screen && screen.status === "available") {
    lines.push({ text: `Display: ${screen.value.width}x${screen.value.height} @ ${screen.value.devicePixelRatio}x`, category: "collect" });
    profile["Display"] = `${screen.value.width}x${screen.value.height}`;
    if (screen.value.devicePixelRatio > 1) {
      lines.push({ text: "Retina/HiDPI display detected — likely a premium device", category: "warn" });
      profile["Device class"] = "Premium (HiDPI)";
    } else {
      profile["Device class"] = "Standard";
    }
  }

  // Canvas
  const canvas = results.find((r) => r.name === "Canvas Fingerprint");
  if (canvas && canvas.status === "available") {
    lines.push({ text: `Canvas fingerprint: ${canvas.value.substring(0, 16)}...`, category: "collect" });
    lines.push({ text: "GPU rendering signature captured — unique to this hardware", category: "warn" });
    profile["Canvas ID"] = canvas.value.substring(0, 12) + "...";
  }

  // WebGL
  const webgl = results.find((r) => r.name === "WebGL Fingerprint");
  if (webgl && webgl.status === "available" && webgl.value) {
    const renderer = webgl.value.renderer || "Unknown";
    lines.push({ text: `GPU: ${renderer.substring(0, 55)}${renderer.length > 55 ? "..." : ""}`, category: "collect" });
    profile["GPU"] = renderer.length > 30 ? renderer.substring(0, 30) + "..." : renderer;
  }

  // Audio
  const audio = results.find((r) => r.name === "Audio Fingerprint");
  if (audio && audio.status === "available") {
    lines.push({ text: `Audio processing signature: ${audio.value.substring(0, 12)}...`, category: "collect" });
  }

  // Fonts
  const fonts = results.find((r) => r.name === "Installed Fonts");
  if (fonts && fonts.status === "available") {
    lines.push({ text: `${fonts.value.count} system fonts enumerated`, category: "collect" });
    if (fonts.value.count > 20) {
      lines.push({ text: "High font count — software installation history exposed", category: "warn" });
    }
    profile["Fonts"] = `${fonts.value.count} detected`;
  }

  // Timezone
  const tz = results.find((r) => r.name === "Timezone & Locale");
  if (tz && tz.status === "available") {
    lines.push({ text: `Timezone: ${tz.value.timezone}`, category: "collect" });
    lines.push({ text: "Geographic region identified without IP geolocation", category: "warn" });
    profile["Location"] = tz.value.timezone.split("/").pop() || tz.value.timezone;
  }

  // Hardware
  const hw = results.find((r) => r.name === "Hardware Concurrency");
  if (hw && hw.status === "available") {
    lines.push({ text: `CPU threads: ${hw.value}`, category: "collect" });
    profile["CPU"] = `${hw.value} threads`;
  }

  // Memory
  const mem = results.find((r) => r.name === "Device Memory");
  if (mem && mem.status === "available") {
    lines.push({ text: `RAM: ~${mem.value} GB`, category: "collect" });
    profile["RAM"] = `${mem.value} GB`;
  }

  // Languages
  const lang = results.find((r) => r.name === "Languages");
  if (lang && lang.status === "available") {
    lines.push({ text: `Languages: ${lang.value.all.join(", ")}`, category: "collect" });
    profile["Language"] = lang.value.primary;
  }

  // Touch
  const touch = results.find((r) => r.name === "Max Touch Points");
  if (touch && touch.status === "available") {
    const deviceType = touch.value > 0 ? "Mobile/Tablet" : "Desktop";
    lines.push({ text: `Input: ${touch.value} touch points (${deviceType})`, category: "collect" });
    profile["Device type"] = deviceType;
  }

  // Connection
  const conn = results.find((r) => r.name === "Connection Info");
  if (conn && conn.status === "available") {
    lines.push({ text: `Network: ${conn.value.effectiveType} @ ${conn.value.downlink} Mbps`, category: "collect" });
  }

  lines.push({ text: "", category: "system" });
  lines.push({ text: "All data points collected. Generating composite hash...", category: "system" });

  const fakeHash = Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  lines.push({ text: `Fingerprint hash: ${fakeHash}`, category: "done" });
  profile["Fingerprint"] = fakeHash;

  lines.push({ text: "", category: "system" });
  lines.push({ text: "Checking profile database...", category: "network" });
  lines.push({ text: "MATCH FOUND — returning visitor", category: "warn" });
  lines.push({ text: "Last seen: 3 days ago, same device", category: "network" });
  lines.push({ text: "Updating behavioral profile...", category: "network" });
  lines.push({ text: "Syncing with 14 ad network partners...", category: "network" });
  lines.push({ text: "Profile broadcast complete.", category: "network" });
  lines.push({ text: "", category: "system" });
  lines.push({ text: "Collection finished. User saw nothing.", category: "done" });

  return { lines, profile };
}

function startTimer() {
  elapsedMs.value = 0;
  timerInterval = setInterval(() => {
    elapsedMs.value += 10;
  }, 10);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function handleLineAdded(index: number) {
  // Count data collection lines
  if (index < terminalLines.value.length) {
    const line = terminalLines.value[index - 1];
    if (line && (line.category === "collect" || line.category === "warn")) {
      dataPointsCollected.value++;
    }
  }
}

function handleComplete() {
  stopTimer();
  // Brief pause before revealing the profile
  setTimeout(() => {
    phase.value = "profile";
    // Another pause before "done"
    setTimeout(() => {
      phase.value = "done";
    }, 1500);
  }, 800);
}

async function startDemo() {
  phase.value = "loading";
  terminalLines.value = [];
  isTerminalRunning.value = false;
  dataPointsCollected.value = 0;
  elapsedMs.value = 0;
  profileData.value = {};

  // Phase 1: Show the "website" loading
  await new Promise((r) => setTimeout(r, 600));
  phase.value = "website";

  // Phase 2: Start collecting behind the scenes while user looks at the site
  const { lines, profile } = await buildDemoLines();
  terminalLines.value = lines;
  profileData.value = profile;

  await new Promise((r) => setTimeout(r, 1200));
  phase.value = "tracking";
  startTimer();

  await new Promise((r) => setTimeout(r, 400));
  isTerminalRunning.value = true;
}

function restart() {
  stopTimer();
  isTerminalRunning.value = false;
  startDemo();
}

onMounted(() => {
  startDemo();
});

onUnmounted(() => {
  stopTimer();
});

const formattedTime = computed(() => {
  const seconds = (elapsedMs.value / 1000).toFixed(1);
  return `${seconds}s`;
});
</script>

<template>
  <div>
    <!-- ═══ Hero ═══ -->
    <section class="text-center pt-6 pb-8">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-danger/10 dark:bg-danger-dark/10 text-danger dark:text-danger-dark text-xs font-semibold mb-4">
        <Eye class="w-3.5 h-3.5" />
        Live Simulation
      </div>
      <h1 class="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
        What happens when you visit a website
      </h1>
      <p class="text-sm text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
        Everything below uses your <strong class="text-zinc-700 dark:text-zinc-300">real browser data</strong>.
        This is not hypothetical.
      </p>
    </section>

    <!-- ═══ Live Stats Bar ═══ -->
    <div
      v-if="phase === 'tracking' || phase === 'profile' || phase === 'done'"
      class="flex items-center justify-center gap-6 mb-5 text-xs"
    >
      <div class="flex items-center gap-1.5">
        <Clock class="w-3.5 h-3.5 text-zinc-400" />
        <span class="font-mono font-semibold text-zinc-700 dark:text-zinc-300">{{ formattedTime }}</span>
        <span class="text-zinc-400">elapsed</span>
      </div>
      <div class="w-px h-3 bg-zinc-300 dark:bg-zinc-700"></div>
      <div class="flex items-center gap-1.5">
        <Hash class="w-3.5 h-3.5 text-zinc-400" />
        <span class="font-mono font-semibold text-zinc-700 dark:text-zinc-300">{{ dataPointsCollected }}</span>
        <span class="text-zinc-400">data points</span>
      </div>
      <div class="w-px h-3 bg-zinc-300 dark:bg-zinc-700"></div>
      <div class="flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full animate-pulse" :class="phase === 'done' ? 'bg-safe dark:bg-safe-dark' : 'bg-danger dark:bg-danger-dark'"></span>
        <span class="text-zinc-400">{{ phase === 'done' ? 'complete' : 'collecting' }}</span>
      </div>
    </div>

    <!-- ═══ Split Screen ═══ -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

      <!-- Left: Fake Website -->
      <div
        class="rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] overflow-hidden transition-opacity duration-500"
        :class="phase === 'loading' ? 'opacity-0' : 'opacity-100'"
      >
        <!-- Browser chrome -->
        <div class="flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border-b border-black/[0.07] dark:border-white/[0.07]">
          <div class="flex gap-1.5">
            <div class="w-2 h-2 rounded-full bg-red-400" />
            <div class="w-2 h-2 rounded-full bg-amber-400" />
            <div class="w-2 h-2 rounded-full bg-green-400" />
          </div>
          <div class="flex-1 flex items-center justify-center">
            <div class="flex items-center gap-1.5 bg-white dark:bg-zinc-800 rounded-md px-3 py-0.5">
              <svg class="w-2.5 h-2.5 text-zinc-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/></svg>
              <span class="text-[11px] text-zinc-500">balitangayon.ph</span>
            </div>
          </div>
        </div>

        <!-- Page content -->
        <div class="p-4 sm:p-5">
          <!-- Site header -->
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-base font-bold leading-tight">Balita Ngayon</h2>
              <p class="text-[10px] text-zinc-400">Your trusted source for Philippine news</p>
            </div>
            <div class="flex gap-1.5 text-[10px]">
              <span class="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">News</span>
              <span class="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">Sports</span>
              <span class="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">Business</span>
            </div>
          </div>

          <!-- Cookie banner -->
          <div class="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40">
            <div class="flex items-start gap-2">
              <span class="text-sm">🍪</span>
              <div class="flex-1">
                <p class="text-[11px] font-medium text-blue-800 dark:text-blue-300">We value your privacy</p>
                <p class="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">
                  We use cookies to enhance your browsing experience and analyze site traffic.
                </p>
                <div class="flex gap-2 mt-2">
                  <span class="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px]">Accept All</span>
                  <span class="px-2 py-0.5 border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded text-[10px]">Manage</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Headlines -->
          <div class="space-y-2.5">
            <div class="flex gap-3 pb-2.5 border-b border-zinc-100 dark:border-zinc-800/50">
              <div class="w-16 h-10 rounded bg-zinc-100 dark:bg-zinc-800 shrink-0"></div>
              <div>
                <h3 class="text-xs font-semibold leading-snug">PAGASA: Southwest Monsoon to Bring Rainfall Across Luzon This Week</h3>
                <p class="text-[10px] text-zinc-400 mt-0.5">Weather · 2h ago</p>
              </div>
            </div>
            <div class="flex gap-3 pb-2.5 border-b border-zinc-100 dark:border-zinc-800/50">
              <div class="w-16 h-10 rounded bg-zinc-100 dark:bg-zinc-800 shrink-0"></div>
              <div>
                <h3 class="text-xs font-semibold leading-snug">BSP Signals Possible Rate Cut as Inflation Eases to 2.3%</h3>
                <p class="text-[10px] text-zinc-400 mt-0.5">Business · 4h ago</p>
              </div>
            </div>
            <div class="flex gap-3 pb-2.5 border-b border-zinc-100 dark:border-zinc-800/50">
              <div class="w-16 h-10 rounded bg-zinc-100 dark:bg-zinc-800 shrink-0"></div>
              <div>
                <h3 class="text-xs font-semibold leading-snug">Gilas Pilipinas Opens FIBA Asia Cup with Win Over South Korea</h3>
                <p class="text-[10px] text-zinc-400 mt-0.5">Sports · 5h ago</p>
              </div>
            </div>
            <div class="flex gap-3">
              <div class="w-16 h-10 rounded bg-zinc-100 dark:bg-zinc-800 shrink-0"></div>
              <div>
                <h3 class="text-xs font-semibold leading-snug">MRT-7 Partial Operations Expected by Q4, DOTr Says</h3>
                <p class="text-[10px] text-zinc-400 mt-0.5">Metro · 6h ago</p>
              </div>
            </div>
          </div>

          <!-- Fake footer -->
          <div class="mt-4 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/50 text-[10px] text-zinc-400 text-center">
            © 2025 Balita Ngayon · Privacy Policy · Terms of Service
          </div>
        </div>

        <!-- Label -->
        <div class="px-4 pb-3">
          <p class="text-center text-[11px] font-medium text-zinc-400">What you see</p>
        </div>
      </div>

      <!-- Right: Tracker Terminal -->
      <div
        class="transition-all duration-500"
        :class="phase === 'loading' || phase === 'website' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'"
      >
        <DemoTerminal
          v-if="terminalLines.length > 0"
          :lines="terminalLines"
          :running="isTerminalRunning"
          @complete="handleComplete"
          @line-added="handleLineAdded"
        />

        <p class="text-center text-[11px] font-medium text-zinc-400 mt-2">What's actually happening</p>
      </div>
    </div>

    <!-- ═══ Profile Card ═══ -->
    <Transition
      enter-active-class="transition-all duration-500 ease-out"
      enter-from-class="opacity-0 translate-y-6 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
    >
      <section
        v-if="phase === 'profile' || phase === 'done'"
        class="mb-6"
      >
        <div class="rounded-xl border border-danger/20 dark:border-danger-dark/20 bg-white dark:bg-[#111111] overflow-hidden">
          <!-- Profile header -->
          <div class="px-5 py-3 bg-danger/5 dark:bg-danger-dark/5 border-b border-danger/10 dark:border-danger-dark/10">
            <div class="flex items-center gap-2">
              <Fingerprint class="w-4 h-4 text-danger dark:text-danger-dark" />
              <p class="text-xs font-semibold text-danger dark:text-danger-dark uppercase tracking-wider">Tracker profile built</p>
            </div>
          </div>

          <!-- Profile data -->
          <div class="p-5 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
            <div v-for="(value, key) in profileData" :key="key">
              <p class="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mb-0.5">{{ key }}</p>
              <p class="text-xs font-mono text-zinc-800 dark:text-zinc-200 truncate">{{ value }}</p>
            </div>
          </div>

          <!-- Profile footer -->
          <div class="px-5 py-3 bg-zinc-50 dark:bg-zinc-900/50 border-t border-black/[0.05] dark:border-white/[0.05]">
            <p class="text-[11px] text-zinc-500">
              This profile was assembled from passive browser properties. No cookies, no permissions, no popups.
            </p>
          </div>
        </div>
      </section>
    </Transition>

    <!-- ═══ Punchline ═══ -->
    <Transition
      enter-active-class="transition-all duration-500 ease-out delay-300"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
    >
      <section v-if="phase === 'done'" class="mb-8">
        <div class="rounded-xl border border-danger/20 dark:border-danger-dark/20 bg-danger/5 dark:bg-danger-dark/5 p-6 text-center max-w-xl mx-auto">
          <p class="text-lg font-bold text-danger dark:text-danger-dark mb-2">
            All of this happened before you scrolled.
          </p>
          <p class="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            No cookies were used. No permissions were requested.
            The cookie consent banner? A distraction. The real tracking was already done.
          </p>
        </div>
      </section>
    </Transition>

    <!-- ═══ Actions ═══ -->
    <div
      v-if="phase === 'done'"
      class="flex flex-wrap justify-center gap-3 pb-4"
    >
      <button
        @click="restart"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
      >
        <RotateCcw class="w-4 h-4" />
        Run Again
      </button>
      <NuxtLink
        to="/results"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-accent dark:bg-accent-dark text-white hover:opacity-90 transition-opacity"
      >
        See your full fingerprint
        <ArrowRight class="w-4 h-4" />
      </NuxtLink>
    </div>
  </div>
</template>