<script setup lang="ts">
/**
 * Homepage — The first thing users see.
 *
 * The live data hook is now a row of compact pills that pop in
 * below the hero subtitle. They look like leaked data tags
 * appearing one by one — small, punchy, and doesn't eat space.
 */

import {
  Fingerprint, ArrowRight, Eye, Shield, Scan, BookOpen,
  Monitor, Globe, Cpu, Clock, ChevronRight
} from "lucide-vue-next";

const store = useFingerprintStore();
const router = useRouter();

// ── Live data pills ──
// Grabbed instantly on mount. Displayed as compact pills.
const livePills = ref<Array<{ label: string; value: string }>>([]);
const visibleCount = ref(0);
const allRevealed = ref(false);
let revealInterval: ReturnType<typeof setInterval> | null = null;

function grabQuickData() {
  const pills: Array<{ label: string; value: string }> = [];

  pills.push({ label: "Screen", value: `${screen.width}x${screen.height}` });
  pills.push({ label: "Timezone", value: Intl.DateTimeFormat().resolvedOptions().timeZone.split("/").pop() || "Unknown" });

  if (navigator.hardwareConcurrency) {
    pills.push({ label: "CPU", value: `${navigator.hardwareConcurrency} cores` });
  }

  pills.push({ label: "Language", value: navigator.language });
  pills.push({ label: "Pixel ratio", value: `${window.devicePixelRatio}x` });
  pills.push({ label: "Platform", value: navigator.platform });

  return pills;
}

function startReveal() {
  visibleCount.value = 0;
  revealInterval = setInterval(() => {
    if (visibleCount.value < livePills.value.length) {
      visibleCount.value++;
    } else {
      if (revealInterval) clearInterval(revealInterval);
      allRevealed.value = true;
    }
  }, 350);
}

function startScan() {
  store.reset();
  router.push("/results");
}

onMounted(() => {
  livePills.value = grabQuickData();
  setTimeout(startReveal, 1000);
});

onUnmounted(() => {
  if (revealInterval) clearInterval(revealInterval);
});

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
    <section class="py-14 sm:py-24">
      <div class="text-center">
        <!-- Pill badge -->
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 dark:bg-accent-dark/10 text-accent dark:text-accent-dark text-xs font-semibold mb-5">
          <Fingerprint class="w-3.5 h-3.5" />
          Browser Fingerprint Analyzer
        </div>

        <h1 class="text-3xl sm:text-5xl font-bold tracking-tight mb-4 leading-[1.15]">
          Your browser is talking<br class="hidden sm:block" />
          about you. <span class="text-accent dark:text-accent-dark">Right now.</span>
        </h1>

        <p class="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed mb-6">
          Websites can identify you without cookies, accounts, or consent.
          bakas shows you exactly how.
        </p>

        <!-- ── Live data pills ── -->
        <!-- Compact pills that pop in one by one like leaked browser properties -->
        <div class="flex flex-wrap items-center justify-center gap-2 mb-3 min-h-[36px]">
          <TransitionGroup
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 scale-90 translate-y-1"
            enter-to-class="opacity-100 scale-100 translate-y-0"
          >
            <div
              v-for="(pill, i) in livePills.slice(0, visibleCount)"
              :key="pill.label"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-danger/20 dark:border-danger-dark/20 bg-danger/5 dark:bg-danger-dark/5"
            >
              <span class="text-[10px] text-danger/60 dark:text-danger-dark/60 font-medium">{{ pill.label }}</span>
              <span class="text-[11px] font-mono font-semibold text-danger dark:text-danger-dark">{{ pill.value }}</span>
            </div>
          </TransitionGroup>
        </div>

        <!-- Teaser line after all pills revealed -->
        <Transition
          enter-active-class="transition-opacity duration-500"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
        >
          <p v-if="allRevealed" class="text-xs text-zinc-400 mb-8">
            We just read 6 properties. A real tracker collects <strong class="text-zinc-600 dark:text-zinc-300">18+</strong> in under a second.
          </p>
        </Transition>

        <!-- CTA -->
        <div>
          <button
            @click="startScan"
            class="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-accent dark:bg-accent-dark text-white font-semibold text-base transition-all shadow-lg shadow-accent/25 dark:shadow-accent-dark/25 hover:shadow-xl hover:shadow-accent/30 dark:hover:shadow-accent-dark/30 hover:opacity-90"
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
      </div>
    </section>

    <!-- ═══ How It Works ═══ -->
    <section class="py-10 mb-6">
      <h2 class="text-xl font-bold text-center mb-8">How bakas works</h2>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          v-for="step in steps"
          :key="step.number"
          class="relative rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-5 transition-shadow duration-200 hover:shadow-md"
        >
          <!-- Step number -->
          <span class="text-3xl font-bold text-zinc-200 dark:text-zinc-800 absolute top-4 right-4 select-none">
            {{ step.number }}
          </span>

          <div class="w-10 h-10 rounded-xl bg-accent/10 dark:bg-accent-dark/10 flex items-center justify-center mb-4">
            <component :is="step.icon" class="w-5 h-5 text-accent dark:text-accent-dark" />
          </div>
          <h3 class="text-base font-semibold text-zinc-800 dark:text-zinc-100 mb-1.5">{{ step.title }}</h3>
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
          class="group rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-5 transition-shadow duration-200 hover:shadow-md"
        >
          <div class="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-3">
            <Eye class="w-4 h-4 text-danger dark:text-danger-dark" />
          </div>
          <h3 class="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mb-1 flex items-center gap-1.5">
            Live Demo
            <ChevronRight class="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 group-hover:text-accent dark:group-hover:text-accent-dark transition-colors" />
          </h3>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Watch a tracking script collect your data in real time. Split-screen simulation using your actual browser.
          </p>
        </NuxtLink>

        <NuxtLink
          to="/learn"
          class="group rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-5 transition-shadow duration-200 hover:shadow-md"
        >
          <div class="w-9 h-9 rounded-lg bg-accent/10 dark:bg-accent-dark/10 flex items-center justify-center mb-3">
            <BookOpen class="w-4 h-4 text-accent dark:text-accent-dark" />
          </div>
          <h3 class="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mb-1 flex items-center gap-1.5">
            Learn
            <ChevronRight class="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 group-hover:text-accent dark:group-hover:text-accent-dark transition-colors" />
          </h3>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            What fingerprinting is, how it's used, Philippine privacy law, and how to protect yourself.
          </p>
        </NuxtLink>

        <NuxtLink
          to="/history"
          class="group rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-5 transition-shadow duration-200 hover:shadow-md"
        >
          <div class="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mb-3">
            <Clock class="w-4 h-4 text-warning dark:text-warning-dark" />
          </div>
          <h3 class="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mb-1 flex items-center gap-1.5">
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
        <p class="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-1">bakas</p>
        <p class="text-xs text-zinc-400 mb-3 italic">Filipino, noun</p>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Trace. Track. Footprint. The marks you leave behind without realizing it.
        </p>
      </div>
    </section>
  </div>
</template>