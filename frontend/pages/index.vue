<script setup lang="ts">
/**
 * Homepage — The first thing users see.
 *
 * The key idea: don't just TELL people their browser leaks data.
 * SHOW them. On page load, we instantly grab a handful of their
 * browser properties and display them before they click anything.
 * That's the hook. Then they want to see the full picture.
 */

import {
  Fingerprint, ArrowRight, Eye, Shield, Scan, BookOpen,
  Monitor, Globe, Cpu, Clock, ChevronRight, Sparkles
} from "lucide-vue-next";

const store = useFingerprintStore();
const router = useRouter();

// ── Live data preview ──
// These are grabbed instantly on mount — no scan needed.
// Just enough to prove the point before the user clicks anything.
const liveData = ref<Array<{ label: string; value: string; icon: any }>>([]);
const liveDataReady = ref(false);

function grabQuickData() {
  const items: Array<{ label: string; value: string; icon: any }> = [];

  // Screen
  items.push({
    label: "Your screen",
    value: `${screen.width}x${screen.height} @ ${window.devicePixelRatio}x`,
    icon: Monitor,
  });

  // Timezone
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  items.push({
    label: "Your timezone",
    value: tz,
    icon: Globe,
  });

  // CPU cores
  if (navigator.hardwareConcurrency) {
    items.push({
      label: "Your CPU",
      value: `${navigator.hardwareConcurrency} threads`,
      icon: Cpu,
    });
  }

  // Platform
  items.push({
    label: "Your platform",
    value: navigator.platform,
    icon: Monitor,
  });

  // Language
  items.push({
    label: "Your language",
    value: navigator.language,
    icon: Globe,
  });

  // Local time
  items.push({
    label: "Your local time",
    value: new Date().toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" }),
    icon: Clock,
  });

  return items;
}

// Stagger the reveal of each data point
const visibleCount = ref(0);
let revealInterval: ReturnType<typeof setInterval> | null = null;

function startReveal() {
  visibleCount.value = 0;
  revealInterval = setInterval(() => {
    if (visibleCount.value < liveData.value.length) {
      visibleCount.value++;
    } else {
      if (revealInterval) clearInterval(revealInterval);
      liveDataReady.value = true;
    }
  }, 300);
}

function startScan() {
  store.reset();
  router.push("/results");
}

onMounted(() => {
  liveData.value = grabQuickData();
  // Small delay so the page renders first, then data starts appearing
  setTimeout(startReveal, 800);
});

onUnmounted(() => {
  if (revealInterval) clearInterval(revealInterval);
});

// Steps section
const steps = [
  {
    number: "01",
    title: "Scan",
    description: "We collect your browser's fingerprint entirely client-side. Nothing is sent anywhere.",
    icon: Scan,
  },
  {
    number: "02",
    title: "Understand",
    description: "Every data point is explained in plain language. See what trackers see and why they want it.",
    icon: Eye,
  },
  {
    number: "03",
    title: "Protect",
    description: "Get personalized recommendations to reduce your fingerprint based on your actual browser.",
    icon: Shield,
  },
];
</script>

<template>
  <div>
    <!-- ═══ Hero ═══ -->
    <section class="py-12 sm:py-20">
      <div class="text-center mb-10">
        <!-- Pill badge -->
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 dark:bg-accent-dark/10 text-accent dark:text-accent-dark text-xs font-semibold mb-5">
          <Fingerprint class="w-3.5 h-3.5" />
          Browser Fingerprint Analyzer
        </div>

        <h1 class="text-3xl sm:text-5xl font-bold tracking-tight mb-4 leading-[1.15]">
          Your browser is talking<br class="hidden sm:block" />
          about you. <span class="text-accent dark:text-accent-dark">Right now.</span>
        </h1>

        <p class="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Websites can identify you without cookies, accounts, or consent.
          bakas shows you exactly how.
        </p>
      </div>

      <!-- ── Live data preview ── -->
      <!-- This is the hook: real data appearing before the user clicks anything -->
      <div class="max-w-2xl mx-auto mb-10">
        <div class="rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] overflow-hidden">
          <!-- Header -->
          <div class="px-4 sm:px-5 py-3 border-b border-black/[0.07] dark:border-white/[0.07] bg-zinc-50/50 dark:bg-zinc-900/50">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-danger dark:bg-danger-dark animate-pulse"></span>
                <p class="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                  Reading your browser right now
                </p>
              </div>
              <p class="text-[11px] text-zinc-400 font-mono">
                {{ visibleCount }}/{{ liveData.length }}
              </p>
            </div>
          </div>

          <!-- Data rows -->
          <div class="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
            <div
              v-for="(item, i) in liveData"
              :key="item.label"
              class="flex items-center gap-3 px-4 sm:px-5 py-3 transition-all duration-300"
              :class="i < visibleCount ? 'opacity-100' : 'opacity-0'"
            >
              <div class="w-8 h-8 rounded-lg bg-accent/10 dark:bg-accent-dark/10 flex items-center justify-center shrink-0">
                <component :is="item.icon" class="w-4 h-4 text-accent dark:text-accent-dark" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[11px] text-zinc-400 font-medium">{{ item.label }}</p>
                <p class="text-sm font-mono font-semibold text-zinc-800 dark:text-zinc-200 truncate">{{ item.value }}</p>
              </div>
              <div class="text-[10px] px-1.5 py-0.5 rounded bg-danger/10 dark:bg-danger-dark/10 text-danger dark:text-danger-dark font-medium shrink-0">
                exposed
              </div>
            </div>
          </div>

          <!-- Footer teaser -->
          <div
            class="px-4 sm:px-5 py-3 border-t border-black/[0.07] dark:border-white/[0.07] bg-zinc-50/50 dark:bg-zinc-900/50 transition-opacity duration-500"
            :class="liveDataReady ? 'opacity-100' : 'opacity-0'"
          >
            <p class="text-xs text-zinc-500 text-center">
              That was just <strong class="text-zinc-700 dark:text-zinc-300">6 data points</strong>.
              A real tracker collects <strong class="text-zinc-700 dark:text-zinc-300">18+</strong> in under a second.
            </p>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="text-center">
        <button
          @click="startScan"
          class="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-accent dark:bg-accent-dark text-white font-semibold text-base hover:opacity-90 transition-all shadow-lg shadow-accent/25 dark:shadow-accent-dark/25 hover:shadow-xl hover:shadow-accent/30 dark:hover:shadow-accent-dark/30 hover:-translate-y-0.5"
        >
          <Fingerprint class="w-5 h-5" />
          See Your Full Fingerprint
          <ArrowRight class="w-4 h-4" />
        </button>

        <p class="text-[11px] text-zinc-400 mt-3 flex items-center justify-center gap-1.5">
          <Shield class="w-3 h-3" />
          100% client-side. Nothing leaves your browser.
        </p>
      </div>
    </section>

    <!-- ═══ How It Works ═══ -->
    <section class="py-10 mb-6">
      <h2 class="text-xl font-bold text-center mb-8">How bakas works</h2>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          v-for="step in steps"
          :key="step.number"
          class="relative rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
        >
          <!-- Step number -->
          <span class="text-3xl font-bold text-zinc-100 dark:text-zinc-800/50 absolute top-4 right-4 select-none">
            {{ step.number }}
          </span>

          <div class="w-10 h-10 rounded-xl bg-accent/10 dark:bg-accent-dark/10 flex items-center justify-center mb-4">
            <component :is="step.icon" class="w-5 h-5 text-accent dark:text-accent-dark" />
          </div>
          <h3 class="text-base font-semibold mb-1.5">{{ step.title }}</h3>
          <p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {{ step.description }}
          </p>
        </div>
      </div>
    </section>

    <!-- ═══ What We Collect ═══ -->
    <section class="py-10 mb-6">
      <div class="rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] overflow-hidden">
        <div class="grid grid-cols-1 sm:grid-cols-2">
          <!-- Left: What trackers get -->
          <div class="p-6 sm:border-r border-black/[0.07] dark:border-white/[0.07]">
            <div class="flex items-center gap-2 mb-4">
              <Eye class="w-4 h-4 text-danger dark:text-danger-dark" />
              <h3 class="text-sm font-semibold text-danger dark:text-danger-dark uppercase tracking-wider">What trackers collect</h3>
            </div>
            <ul class="space-y-2.5 text-sm text-zinc-600 dark:text-zinc-400">
              <li class="flex items-start gap-2">
                <span class="w-1 h-1 rounded-full bg-danger dark:bg-danger-dark mt-2 shrink-0"></span>
                Canvas rendering signature (unique to your GPU)
              </li>
              <li class="flex items-start gap-2">
                <span class="w-1 h-1 rounded-full bg-danger dark:bg-danger-dark mt-2 shrink-0"></span>
                WebGL hardware info and driver version
              </li>
              <li class="flex items-start gap-2">
                <span class="w-1 h-1 rounded-full bg-danger dark:bg-danger-dark mt-2 shrink-0"></span>
                Audio processing fingerprint
              </li>
              <li class="flex items-start gap-2">
                <span class="w-1 h-1 rounded-full bg-danger dark:bg-danger-dark mt-2 shrink-0"></span>
                Installed fonts, screen resolution, timezone
              </li>
              <li class="flex items-start gap-2">
                <span class="w-1 h-1 rounded-full bg-danger dark:bg-danger-dark mt-2 shrink-0"></span>
                CPU cores, RAM, device sensors, and 10+ more
              </li>
            </ul>
          </div>

          <!-- Right: What bakas does differently -->
          <div class="p-6 bg-zinc-50/50 dark:bg-zinc-900/30">
            <div class="flex items-center gap-2 mb-4">
              <Shield class="w-4 h-4 text-safe dark:text-safe-dark" />
              <h3 class="text-sm font-semibold text-safe dark:text-safe-dark uppercase tracking-wider">What bakas does differently</h3>
            </div>
            <ul class="space-y-2.5 text-sm text-zinc-600 dark:text-zinc-400">
              <li class="flex items-start gap-2">
                <span class="w-1 h-1 rounded-full bg-safe dark:bg-safe-dark mt-2 shrink-0"></span>
                Everything runs in your browser. Nothing is sent to a server.
              </li>
              <li class="flex items-start gap-2">
                <span class="w-1 h-1 rounded-full bg-safe dark:bg-safe-dark mt-2 shrink-0"></span>
                Every data point is explained in plain language.
              </li>
              <li class="flex items-start gap-2">
                <span class="w-1 h-1 rounded-full bg-safe dark:bg-safe-dark mt-2 shrink-0"></span>
                Personalized recommendations to reduce your exposure.
              </li>
              <li class="flex items-start gap-2">
                <span class="w-1 h-1 rounded-full bg-safe dark:bg-safe-dark mt-2 shrink-0"></span>
                No cookies, no tracking scripts, no analytics.
              </li>
              <li class="flex items-start gap-2">
                <span class="w-1 h-1 rounded-full bg-safe dark:bg-safe-dark mt-2 shrink-0"></span>
                Open source. Verify everything yourself.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ Explore ═══ -->
    <section class="py-10 mb-4">
      <h2 class="text-xl font-bold mb-5">Explore</h2>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <NuxtLink
          to="/demo"
          class="group rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
        >
          <div class="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-3">
            <Eye class="w-4.5 h-4.5 text-danger dark:text-danger-dark" />
          </div>
          <h3 class="text-sm font-semibold mb-1 flex items-center gap-1.5">
            Live Demo
            <ChevronRight class="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 group-hover:text-accent dark:group-hover:text-accent-dark transition-colors" />
          </h3>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Watch a tracking script collect your data in real time. Split-screen simulation using your actual browser.
          </p>
        </NuxtLink>

        <NuxtLink
          to="/learn"
          class="group rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
        >
          <div class="w-9 h-9 rounded-lg bg-accent/10 dark:bg-accent-dark/10 flex items-center justify-center mb-3">
            <BookOpen class="w-4.5 h-4.5 text-accent dark:text-accent-dark" />
          </div>
          <h3 class="text-sm font-semibold mb-1 flex items-center gap-1.5">
            Learn
            <ChevronRight class="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 group-hover:text-accent dark:group-hover:text-accent-dark transition-colors" />
          </h3>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            What fingerprinting is, how it's used, Philippine privacy law, and how to protect yourself.
          </p>
        </NuxtLink>

        <NuxtLink
          to="/history"
          class="group rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
        >
          <div class="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mb-3">
            <Clock class="w-4.5 h-4.5 text-warning dark:text-warning-dark" />
          </div>
          <h3 class="text-sm font-semibold mb-1 flex items-center gap-1.5">
            Scan History
            <ChevronRight class="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 group-hover:text-accent dark:group-hover:text-accent-dark transition-colors" />
          </h3>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Track how your fingerprint changes over time across browser updates and setting changes.
          </p>
        </NuxtLink>
      </div>
    </section>

    <!-- ═══ Etymology ═══ -->
    <section class="py-8">
      <div class="rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-6 sm:p-8 text-center max-w-lg mx-auto">
        <p class="text-2xl font-bold mb-1">bakas</p>
        <p class="text-xs text-zinc-400 mb-3 italic">Filipino, noun</p>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Trace. Track. Footprint. The marks you leave behind without realizing it.
        </p>
      </div>
    </section>
  </div>
</template>