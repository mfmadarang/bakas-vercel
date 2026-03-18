<script setup lang="ts">
/**
 * Demo Page — "What Sites See"
 *
 * Split-screen educational page showing what a normal website looks like
 * on the left, and what a tracking script silently collects on the right.
 * Uses the user's actual real-time fingerprint data to make it personal.
 */

import { Play, RotateCcw } from "lucide-vue-next";
import { useFingerprint } from "~/composables/useFingerprint";

const { collectAll } = useFingerprint();

const isRunning = ref(false);
const isComplete = ref(false);
const terminalLines = ref<string[]>([]);

// Collect real fingerprint data and build the demo script lines
async function buildDemoLines(): Promise<string[]> {
  const lines: string[] = [];
  lines.push("Initializing...");
  lines.push("Page loaded. Running fingerprint collection...");

  // Collect real data
  const results = await collectAll();

  // Build lines from actual data
  const ua = results.find((r) => r.name === "User Agent");
  if (ua && ua.status === "available") {
    // Extract a short version from the user agent
    const uaStr = ua.value || "";
    let browser = "Unknown browser";
    let os = "Unknown OS";
    if (uaStr.includes("Firefox")) browser = "Firefox";
    else if (uaStr.includes("Edg/")) browser = "Edge";
    else if (uaStr.includes("Chrome")) browser = "Chrome";
    else if (uaStr.includes("Safari")) browser = "Safari";
    if (uaStr.includes("Windows")) os = "Windows";
    else if (uaStr.includes("Mac")) os = "macOS";
    else if (uaStr.includes("Linux")) os = "Linux";
    else if (uaStr.includes("Android")) os = "Android";
    else if (uaStr.includes("iPhone") || uaStr.includes("iPad")) os = "iOS";
    lines.push(`User agent collected: ${browser} on ${os}`);
  }

  const screen = results.find((r) => r.name === "Screen & Display");
  if (screen && screen.status === "available") {
    lines.push(`Screen resolution: ${screen.value.width}x${screen.value.height}`);
    lines.push(`Pixel ratio: ${screen.value.devicePixelRatio}x (${screen.value.devicePixelRatio > 1 ? "retina display" : "standard display"})`);
  }

  const canvas = results.find((r) => r.name === "Canvas Fingerprint");
  if (canvas && canvas.status === "available") {
    lines.push(`Canvas fingerprint computed: ${canvas.value.substring(0, 12)}...`);
  }

  const webgl = results.find((r) => r.name === "WebGL Fingerprint");
  if (webgl && webgl.status === "available" && webgl.value) {
    const renderer = webgl.value.renderer || "Unknown GPU";
    lines.push(`WebGL renderer: ${renderer.substring(0, 50)}${renderer.length > 50 ? "..." : ""}`);
  }

  const fonts = results.find((r) => r.name === "Installed Fonts");
  if (fonts && fonts.status === "available") {
    lines.push(`${fonts.value.count} fonts detected`);
  }

  const tz = results.find((r) => r.name === "Timezone & Locale");
  if (tz && tz.status === "available") {
    lines.push(`Timezone: ${tz.value.timezone}`);
  }

  const audio = results.find((r) => r.name === "Audio Fingerprint");
  if (audio && audio.status === "available") {
    lines.push(`Audio fingerprint: ${audio.value.substring(0, 10)}...`);
  }

  const hw = results.find((r) => r.name === "Hardware Concurrency");
  if (hw && hw.status === "available") {
    lines.push(`CPU cores: ${hw.value}`);
  }

  const mem = results.find((r) => r.name === "Device Memory");
  if (mem && mem.status === "available") {
    lines.push(`Device memory: ${mem.value} GB`);
  }

  const lang = results.find((r) => r.name === "Languages");
  if (lang && lang.status === "available") {
    lines.push(`Language preferences: ${lang.value.all.join(", ")}`);
  }

  // Dramatic ending
  lines.push("");
  lines.push("Generating composite fingerprint hash...");
  lines.push("Fingerprint ID assigned: " + Math.random().toString(36).substring(2, 10) + "...");
  lines.push("Searching profile database...");
  lines.push("Profile match found in database.");
  lines.push("Last seen: 3 days ago from same device.");
  lines.push("Sending profile update to ad network...");
  lines.push("Done. Total time: 0.8 seconds.");

  return lines;
}

async function startDemo() {
  isRunning.value = false;
  isComplete.value = false;
  terminalLines.value = [];

  // Collect real data first, then start the animation
  const lines = await buildDemoLines();
  terminalLines.value = lines;

  // Small delay before starting the typing animation
  await new Promise((r) => setTimeout(r, 300));
  isRunning.value = true;
}

function handleComplete() {
  isComplete.value = true;
}

function restart() {
  isRunning.value = false;
  isComplete.value = false;
  terminalLines.value = [];
  startDemo();
}

onMounted(() => {
  startDemo();
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-2">What Sites See</h1>
    <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-8 max-w-2xl">
      This is a simulation of what happens when you visit a website with a tracking script.
      The left side shows what you see. The right side shows what the tracker collects in the background.
      All data shown is your <strong class="text-zinc-700 dark:text-zinc-300">actual</strong> browser data.
    </p>

    <!-- Split screen — stacks on mobile -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
      <!-- Left: Fake news site -->
      <div class="rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] overflow-hidden">
        <!-- Fake browser chrome -->
        <div class="flex items-center gap-2 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border-b border-black/[0.07] dark:border-white/[0.07]">
          <div class="flex gap-1.5">
            <div class="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div class="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div class="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <div class="flex-1 text-center">
            <div class="inline-block bg-white dark:bg-zinc-800 rounded px-3 py-0.5 text-xs text-zinc-500">
              balitangayon.ph
            </div>
          </div>
        </div>

        <!-- Fake news content -->
        <div class="p-5">
          <h2 class="text-lg font-bold mb-1">Balita Ngayon</h2>
          <p class="text-xs text-zinc-400 mb-4">Trusted Filipino News</p>

          <!-- Cookie consent banner -->
          <div class="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 text-xs">
            <p class="font-medium text-blue-800 dark:text-blue-300 mb-1">🍪 We use cookies</p>
            <p class="text-blue-600 dark:text-blue-400">
              This site uses cookies to improve your experience. By continuing, you agree to our cookie policy.
            </p>
            <button class="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs">Accept All</button>
          </div>

          <!-- Fake headlines -->
          <div class="space-y-3">
            <div class="pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 class="text-sm font-semibold mb-0.5">PAGASA: Amihan to Bring Cooler Temps Next Week</h3>
              <p class="text-xs text-zinc-500">Weather · 2 hours ago</p>
            </div>
            <div class="pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 class="text-sm font-semibold mb-0.5">BSP Holds Interest Rates Steady at 6.25%</h3>
              <p class="text-xs text-zinc-500">Business · 4 hours ago</p>
            </div>
            <div class="pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 class="text-sm font-semibold mb-0.5">Gilas Pilipinas Advances to FIBA Asia Semis</h3>
              <p class="text-xs text-zinc-500">Sports · 5 hours ago</p>
            </div>
            <div>
              <h3 class="text-sm font-semibold mb-0.5">New MRT-7 Extension to Open by End of Year</h3>
              <p class="text-xs text-zinc-500">Metro · 6 hours ago</p>
            </div>
          </div>

          <!-- Privacy footer -->
          <div class="mt-6 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-400 text-center">
            © 2025 Balita Ngayon · We respect your privacy
          </div>
        </div>

        <div class="px-5 pb-4">
          <p class="text-center text-xs font-medium text-zinc-400 italic">
            ↑ What you think you see
          </p>
        </div>
      </div>

      <!-- Right: Tracker terminal -->
      <div>
        <DemoTerminal
          v-if="terminalLines.length > 0"
          :lines="terminalLines"
          :running="isRunning"
          @complete="handleComplete"
        />

        <p class="text-center text-xs font-medium text-zinc-400 italic mt-2">
          ↑ What the tracker actually sees
        </p>
      </div>
    </div>

    <!-- Conclusion message -->
    <div
      v-if="isComplete"
      class="text-center mb-8"
    >
      <div class="inline-block rounded-xl border border-danger/30 dark:border-danger-dark/30 bg-danger/5 dark:bg-danger-dark/5 p-6 max-w-lg">
        <p class="text-base font-semibold text-danger dark:text-danger-dark mb-2">
          All of this happened before you scrolled.
        </p>
        <p class="text-sm text-zinc-600 dark:text-zinc-400">
          No cookies were used. No permissions were asked for. Everything above was collected from passive browser properties in under a second.
        </p>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-center gap-3 mb-4">
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
      </NuxtLink>
    </div>
  </div>
</template>
