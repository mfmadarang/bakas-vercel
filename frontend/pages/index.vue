<script setup lang="ts">
/**
 * Homepage — Landing page with live stats ticker and scan trigger.
 *
 * This is the first thing users see. It explains what bakas does,
 * shows aggregate stats from the database (if backend is running),
 * and has a big "Scan My Browser" button.
 */

import { Fingerprint, Eye, Shield, BarChart3, AlertCircle } from "lucide-vue-next";

const config = useRuntimeConfig();
const store = useFingerprintStore();
const router = useRouter();

// Fetch live stats from the backend (if available)
interface Stats {
  total_fingerprints: number;
  most_common_timezone: string | null;
  most_common_platform: string | null;
  most_common_resolution: string | null;
  mobile_percentage: number;
  unique_percentage: number;
}

const stats = ref<Stats | null>(null);
const statsError = ref(false);

async function fetchStats() {
  // Skip if no backend URL is configured (e.g. deployed on Vercel without backend)
  if (!config.public.apiBase) {
    statsError.value = true;
    return;
  }

  try {
    const response = await fetch(`${config.public.apiBase}/api/fingerprints/stats`, {
      signal: AbortSignal.timeout(5000),
    });
    if (response.ok) {
      stats.value = await response.json();
    } else {
      statsError.value = true;
    }
  } catch {
    // Backend offline — that's fine, everything still works
    statsError.value = true;
  }
}

// Start a new scan
function startScan() {
  store.reset();
  router.push("/results");
}

onMounted(() => {
  fetchStats();
});

const features = [
  {
    icon: Eye,
    title: "See what trackers see",
    description: "Every data point your browser exposes is collected and explained in plain language.",
  },
  {
    icon: Fingerprint,
    title: "Unique to you",
    description: "Your fingerprint hash is generated entirely in your browser. Nothing leaves your device unless you say so.",
  },
  {
    icon: Shield,
    title: "Get recommendations",
    description: "Personalized tips to reduce your fingerprint based on what was actually collected from your browser.",
  },
  {
    icon: BarChart3,
    title: "Compare (opt-in)",
    description: "See how unique your fingerprint is compared to other visitors — only if you choose to share.",
  },
];
</script>

<template>
  <div>
    <!-- Hero section -->
    <section class="text-center py-12 sm:py-20">
      <div class="mb-6">
        <Fingerprint class="w-14 h-14 mx-auto text-accent dark:text-accent-dark mb-4" />
        <h1 class="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          Your browser is talking about you.
        </h1>
        <p class="text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Websites can identify and track you without cookies — just by reading passive browser properties.
          <strong class="text-zinc-800 dark:text-zinc-200">bakas</strong> makes this invisible process visible.
        </p>
      </div>

      <!-- CTA -->
      <button
        @click="startScan"
        class="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent dark:bg-accent-dark text-white font-semibold text-base hover:opacity-90 transition-opacity shadow-lg shadow-accent/20 dark:shadow-accent-dark/20"
      >
        <Fingerprint class="w-5 h-5" />
        Scan My Browser
      </button>

      <p class="text-xs text-zinc-400 mt-3">
        100% client-side. No data sent anywhere.
      </p>
    </section>

    <!-- Live stats ticker -->
    <section
      v-if="stats && stats.total_fingerprints > 0"
      class="mb-12 rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-5"
    >
      <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-3 font-medium">Live Stats</p>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <p class="text-2xl font-bold text-accent dark:text-accent-dark">
            {{ stats.total_fingerprints.toLocaleString() }}
          </p>
          <p class="text-xs text-zinc-500">Fingerprints analyzed</p>
        </div>
        <div>
          <p class="text-2xl font-bold text-danger dark:text-danger-dark">
            {{ stats.unique_percentage }}%
          </p>
          <p class="text-xs text-zinc-500">Uniquely identifiable</p>
        </div>
        <div>
          <p class="text-2xl font-bold">{{ stats.mobile_percentage }}%</p>
          <p class="text-xs text-zinc-500">Mobile devices</p>
        </div>
        <div>
          <p class="text-2xl font-bold">{{ stats.most_common_platform || "—" }}</p>
          <p class="text-xs text-zinc-500">Most common platform</p>
        </div>
      </div>
    </section>

    <!-- Backend offline notice -->
    <div
      v-if="statsError"
      class="mb-8 max-w-md mx-auto rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 p-3 text-xs -mt-6"
    >
      <p class="font-medium text-amber-700 dark:text-amber-400 text-center">
        <AlertCircle class="w-3.5 h-3.5 inline mr-1" />
        Comparison unavailable. Backend offline. Fingerprint analysis still works fully.
      </p>
    </div>

    <!-- Feature cards -->
    <section class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
      <div
        v-for="feature in features"
        :key="feature.title"
        class="rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
      >
        <component
          :is="feature.icon"
          class="w-8 h-8 text-accent dark:text-accent-dark mb-3"
        />
        <h3 class="text-base font-semibold mb-1">{{ feature.title }}</h3>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          {{ feature.description }}
        </p>
      </div>
    </section>

    <!-- What is "bakas"? -->
    <section class="text-center py-8 text-sm text-zinc-500 dark:text-zinc-400">
      <p>
        <strong class="text-zinc-700 dark:text-zinc-300">bakas</strong>
        <span class="italic">(noun, Filipino)</span> — trace, track, footprint.
        The marks you leave behind.
      </p>
    </section>
  </div>
</template>