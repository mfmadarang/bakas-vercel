<script setup lang="ts">
/**
 * Homepage — Dense, asymmetric layout.
 *
 * Hero is split: left side has the headline and CTA, right side has
 * the live data readout. Nothing is centered except the divider stat.
 * The page fills its width with varied section layouts.
 */

import {
  Fingerprint, ArrowRight, Eye, Shield, Scan, BookOpen,
  Monitor, Globe, Cpu, Clock, ChevronRight, Lock,
  Palette, Volume2, Type, Wifi, Binary
} from "lucide-vue-next";

const store = useFingerprintStore();
const router = useRouter();

// ── Live data readout ──
interface DataLine {
  label: string;
  value: string;
}

const liveLines = ref<DataLine[]>([]);
const visibleCount = ref(0);
const allRevealed = ref(false);
let revealInterval: ReturnType<typeof setInterval> | null = null;

function grabQuickData(): DataLine[] {
  const lines: DataLine[] = [];
  lines.push({ label: "DISPLAY", value: `${screen.width}×${screen.height} @ ${window.devicePixelRatio}x` });
  lines.push({ label: "REGION", value: Intl.DateTimeFormat().resolvedOptions().timeZone });
  if (navigator.hardwareConcurrency) {
    lines.push({ label: "CPU", value: `${navigator.hardwareConcurrency} logical cores` });
  }
  lines.push({ label: "LOCALE", value: navigator.language });
  lines.push({ label: "PLATFORM", value: navigator.platform });
  lines.push({ label: "TOUCH", value: navigator.maxTouchPoints > 0 ? `${navigator.maxTouchPoints} points` : "none (desktop)" });
  lines.push({ label: "COLOR", value: `${screen.colorDepth}-bit` });
  lines.push({ label: "DNT", value: navigator.doNotTrack === "1" ? "enabled" : "not set" });
  return lines;
}

function startReveal() {
  visibleCount.value = 0;
  revealInterval = setInterval(() => {
    if (visibleCount.value < liveLines.value.length) {
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
  liveLines.value = grabQuickData();
  setTimeout(startReveal, 900);
});

onUnmounted(() => {
  if (revealInterval) clearInterval(revealInterval);
});

// Data points collected by bakas (for the grid)
const collectedSignals = [
  { icon: Palette, label: "Canvas", desc: "GPU rendering signature" },
  { icon: Monitor, label: "WebGL", desc: "Hardware model & drivers" },
  { icon: Volume2, label: "Audio", desc: "Sound processing fingerprint" },
  { icon: Type, label: "Fonts", desc: "Installed font enumeration" },
  { icon: Cpu, label: "Hardware", desc: "CPU, RAM, touch input" },
  { icon: Globe, label: "Locale", desc: "Timezone, language, region" },
  { icon: Wifi, label: "Network", desc: "Connection type & speed" },
  { icon: Binary, label: "Storage", desc: "Available APIs & quotas" },
];
</script>

<template>
  <div>
    <!-- ═══ Hero — Split layout ═══ -->
    <section class="relative py-12 sm:py-20 overflow-hidden">
      <!-- Dark mode glow -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden hidden dark:block">
        <div class="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full hero-glow" />
      </div>

      <div class="relative grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        <!-- Left: Headline + CTA -->
        <div>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 dark:bg-accent-dark/10 text-accent dark:text-accent-dark text-xs font-semibold mb-5">
            <Fingerprint class="w-3.5 h-3.5" />
            Browser Fingerprint Analyzer
          </div>

          <h1 class="text-3xl sm:text-5xl font-bold tracking-tight mb-5 leading-[1.1]">
            Your browser has a
            <span class="text-accent dark:text-accent-dark">unique face.</span>
          </h1>

          <p class="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8 max-w-md">
            No cookies. No accounts. No consent. Websites identify you
            just by reading what your browser reveals. bakas shows you everything.
          </p>

          <div class="flex flex-col sm:flex-row items-start gap-3">
            <button
              @click="startScan"
              class="group inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-accent dark:bg-accent-dark text-white font-semibold text-sm transition-all shadow-lg shadow-accent/20 dark:shadow-accent-dark/20 hover:shadow-xl hover:shadow-accent/25 dark:hover:shadow-accent-dark/25 hover:opacity-90"
            >
              <Fingerprint class="w-4 h-4" />
              See Your Full Fingerprint
              <ArrowRight class="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <NuxtLink
              to="/demo"
              class="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <Eye class="w-4 h-4" />
              Watch the demo
            </NuxtLink>
          </div>

          <p class="text-[11px] text-zinc-400 mt-4 flex items-center gap-1.5">
            <Lock class="w-3 h-3" />
            Runs entirely in your browser. Zero data leaves your device.
          </p>
        </div>

        <!-- Right: Live data readout -->
        <div>
          <div class="rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#0d0d0d] overflow-hidden">
            <!-- Header -->
            <div class="flex items-center justify-between px-4 py-2.5 border-b border-black/[0.05] dark:border-white/[0.05] bg-zinc-50 dark:bg-zinc-900/60">
              <div class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-danger dark:bg-danger-dark animate-pulse"></span>
                <span class="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-widest">live · your device</span>
              </div>
              <span class="text-[10px] font-mono text-zinc-400">{{ visibleCount }}/{{ liveLines.length }}</span>
            </div>

            <!-- Data lines -->
            <div class="px-4 py-3 font-mono text-xs space-y-1">
              <div
                v-for="(line, i) in liveLines"
                :key="line.label"
                class="flex gap-3 py-0.5 transition-all duration-300"
                :class="i < visibleCount ? 'opacity-100' : 'opacity-0 translate-x-2'"
              >
                <span class="text-zinc-400 dark:text-zinc-600 w-[70px] shrink-0 text-right">{{ line.label }}</span>
                <span class="text-accent dark:text-accent-dark font-medium truncate">{{ line.value }}</span>
              </div>
            </div>

            <!-- Footer -->
            <Transition
              enter-active-class="transition-opacity duration-500"
              enter-from-class="opacity-0"
              enter-to-class="opacity-100"
            >
              <div
                v-if="allRevealed"
                class="px-4 py-2.5 border-t border-black/[0.05] dark:border-white/[0.05] bg-zinc-50 dark:bg-zinc-900/60"
              >
                <p class="text-[10px] font-mono text-zinc-400">
                  {{ liveLines.length }} of 18+ signals · collected in &lt;100ms · no permissions
                </p>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ Signal grid — what bakas collects ═══ -->
    <section class="py-10">
      <div class="flex items-end justify-between mb-5">
        <div>
          <h2 class="text-xl font-bold">18 signals. One fingerprint.</h2>
          <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Every collector runs in your browser. Nothing is sent to a server.
          </p>
        </div>
        <button
          @click="startScan"
          class="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-accent dark:text-accent-dark hover:underline"
        >
          Run all 18
          <ArrowRight class="w-3 h-3" />
        </button>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          v-for="signal in collectedSignals"
          :key="signal.label"
          class="rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-4 transition-shadow duration-200 hover:shadow-md"
        >
          <component :is="signal.icon" class="w-5 h-5 text-accent dark:text-accent-dark mb-2.5" />
          <p class="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mb-0.5">{{ signal.label }}</p>
          <p class="text-[11px] text-zinc-400 dark:text-zinc-500 leading-snug">{{ signal.desc }}</p>
        </div>
      </div>
    </section>

    <!-- ═══ The big number ═══ -->
    <section class="py-10">
      <div class="rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
        <span class="text-5xl sm:text-7xl font-bold text-accent dark:text-accent-dark shrink-0">90%+</span>
        <div>
          <p class="text-base font-semibold text-zinc-800 dark:text-zinc-100 mb-1">
            of browsers have a unique fingerprint.
          </p>
          <p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            That means you can be singled out from millions of visitors without logging in,
            without cookies, and without any consent popup. Research consistently shows that
            the combination of browser properties is nearly as unique as a human fingerprint.
          </p>
        </div>
      </div>
    </section>

    <!-- ═══ How it works — horizontal steps ═══ -->
    <section class="py-10">
      <h2 class="text-xl font-bold mb-6">How it works</h2>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-px rounded-xl overflow-hidden border border-black/[0.07] dark:border-white/[0.07]">
        <div
          v-for="(step, i) in [
            { title: 'Scan', desc: '18 collectors run entirely in your browser. Canvas, WebGL, audio, fonts, hardware, network, and more.', icon: Scan },
            { title: 'Understand', desc: 'Every data point is explained in plain language. See what it reveals, how unique it is, and why trackers want it.', icon: Eye },
            { title: 'Protect', desc: 'Get prioritized, browser-specific recommendations. Know exactly what to change to shrink your fingerprint surface.', icon: Shield },
          ]"
          :key="step.title"
          class="bg-white dark:bg-[#111111] p-5 sm:p-6 relative"
        >
          <!-- Step number -->
          <div class="flex items-center gap-3 mb-3">
            <div class="w-8 h-8 rounded-lg bg-accent/10 dark:bg-accent-dark/10 flex items-center justify-center">
              <component :is="step.icon" class="w-4 h-4 text-accent dark:text-accent-dark" />
            </div>
            <span class="text-xs font-mono font-semibold text-accent/40 dark:text-accent-dark/40">0{{ i + 1 }}</span>
          </div>
          <h3 class="text-base font-semibold text-zinc-800 dark:text-zinc-100 mb-1">{{ step.title }}</h3>
          <p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{{ step.desc }}</p>
        </div>
      </div>
    </section>

    <!-- ═══ Trackers vs bakas ═══ -->
    <section class="py-10">
      <h2 class="text-xl font-bold mb-5">Them vs. us</h2>

      <div class="rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] overflow-hidden">
        <div class="grid grid-cols-1 sm:grid-cols-2">
          <!-- Left -->
          <div class="p-5 sm:p-6 sm:border-r border-b sm:border-b-0 border-black/[0.07] dark:border-white/[0.07]">
            <div class="flex items-center gap-2 mb-4">
              <Eye class="w-4 h-4 text-danger dark:text-danger-dark" />
              <h3 class="text-xs font-semibold text-danger dark:text-danger-dark uppercase tracking-wider">What trackers collect</h3>
            </div>
            <ul class="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li class="flex items-start gap-2">
                <span class="w-1 h-1 rounded-full bg-danger dark:bg-danger-dark mt-2 shrink-0"></span>
                Canvas rendering unique to your GPU and drivers
              </li>
              <li class="flex items-start gap-2">
                <span class="w-1 h-1 rounded-full bg-danger dark:bg-danger-dark mt-2 shrink-0"></span>
                WebGL hardware model and extension list
              </li>
              <li class="flex items-start gap-2">
                <span class="w-1 h-1 rounded-full bg-danger dark:bg-danger-dark mt-2 shrink-0"></span>
                Audio processing signature from your sound card
              </li>
              <li class="flex items-start gap-2">
                <span class="w-1 h-1 rounded-full bg-danger dark:bg-danger-dark mt-2 shrink-0"></span>
                Installed fonts, screen resolution, timezone
              </li>
              <li class="flex items-start gap-2">
                <span class="w-1 h-1 rounded-full bg-danger dark:bg-danger-dark mt-2 shrink-0"></span>
                CPU threads, RAM, battery, sensors, and more
              </li>
            </ul>
          </div>

          <!-- Right -->
          <div class="p-5 sm:p-6 bg-zinc-50/50 dark:bg-zinc-900/30">
            <div class="flex items-center gap-2 mb-4">
              <Shield class="w-4 h-4 text-safe dark:text-safe-dark" />
              <h3 class="text-xs font-semibold text-safe dark:text-safe-dark uppercase tracking-wider">What bakas does differently</h3>
            </div>
            <ul class="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li class="flex items-start gap-2">
                <span class="w-1 h-1 rounded-full bg-safe dark:bg-safe-dark mt-2 shrink-0"></span>
                100% client-side. Nothing touches a server.
              </li>
              <li class="flex items-start gap-2">
                <span class="w-1 h-1 rounded-full bg-safe dark:bg-safe-dark mt-2 shrink-0"></span>
                Every data point explained in plain language.
              </li>
              <li class="flex items-start gap-2">
                <span class="w-1 h-1 rounded-full bg-safe dark:bg-safe-dark mt-2 shrink-0"></span>
                Personalized recommendations for your browser.
              </li>
              <li class="flex items-start gap-2">
                <span class="w-1 h-1 rounded-full bg-safe dark:bg-safe-dark mt-2 shrink-0"></span>
                Zero cookies. Zero trackers. Zero analytics.
              </li>
              <li class="flex items-start gap-2">
                <span class="w-1 h-1 rounded-full bg-safe dark:bg-safe-dark mt-2 shrink-0"></span>
                Open source. Inspect every line yourself.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ Explore ═══ -->
    <section class="py-10">
      <h2 class="text-xl font-bold mb-5">Explore</h2>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <NuxtLink
          to="/demo"
          class="group rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-5 transition-shadow duration-200 hover:shadow-md"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <Eye class="w-4 h-4 text-danger dark:text-danger-dark" />
            </div>
            <ChevronRight class="w-4 h-4 text-zinc-300 dark:text-zinc-700 group-hover:text-accent dark:group-hover:text-accent-dark transition-colors" />
          </div>
          <h3 class="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mb-1">Live Demo</h3>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Watch a tracking script collect your data in real time. Uses your actual browser.
          </p>
        </NuxtLink>

        <NuxtLink
          to="/learn"
          class="group rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-5 transition-shadow duration-200 hover:shadow-md"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="w-9 h-9 rounded-lg bg-accent/10 dark:bg-accent-dark/10 flex items-center justify-center">
              <BookOpen class="w-4 h-4 text-accent dark:text-accent-dark" />
            </div>
            <ChevronRight class="w-4 h-4 text-zinc-300 dark:text-zinc-700 group-hover:text-accent dark:group-hover:text-accent-dark transition-colors" />
          </div>
          <h3 class="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mb-1">Learn</h3>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Fingerprinting explained, Philippine privacy law, and how to protect yourself.
          </p>
        </NuxtLink>

        <NuxtLink
          to="/history"
          class="group rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-5 transition-shadow duration-200 hover:shadow-md"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
              <Clock class="w-4 h-4 text-warning dark:text-warning-dark" />
            </div>
            <ChevronRight class="w-4 h-4 text-zinc-300 dark:text-zinc-700 group-hover:text-accent dark:group-hover:text-accent-dark transition-colors" />
          </div>
          <h3 class="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mb-1">Scan History</h3>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Track how your fingerprint changes across updates and setting changes.
          </p>
        </NuxtLink>
      </div>
    </section>

    <!-- ═══ Etymology — left aligned, compact ═══ -->
    <section class="py-8 pb-4">
      <div class="flex items-baseline gap-3">
        <span class="text-2xl font-bold text-zinc-800 dark:text-zinc-100">bakas</span>
        <span class="text-xs text-zinc-400 italic">Filipino, noun</span>
        <span class="text-sm text-zinc-500 dark:text-zinc-400">
          — Trace. Track. Footprint. The marks you leave behind.
        </span>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero-glow {
  background: radial-gradient(circle, #6366f1 0%, transparent 70%);
  opacity: 0.04;
  animation: slow-pulse 8s ease-in-out infinite;
}

@keyframes slow-pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.04;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.15);
    opacity: 0.02;
  }
}
</style>