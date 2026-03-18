<script setup lang="ts">
/**
 * Homepage — "Surveillance exposed" aesthetic
 *
 * The hero has a subtle animated gradient glow and grid pattern that
 * evokes the feeling of being scanned. Live browser data types itself
 * out in a monospace "intercepted file" card. The whole page is designed
 * to make the user feel like they just caught the internet looking at them.
 */

import {
  Fingerprint, ArrowRight, Eye, Shield, Scan, BookOpen,
  Monitor, Globe, Cpu, Clock, ChevronRight, Lock
} from "lucide-vue-next";

const store = useFingerprintStore();
const router = useRouter();

// ── Live data ticker ──
// Instead of pills, these type out one at a time in a monospace readout
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
  lines.push({ label: "TOUCH", value: navigator.maxTouchPoints > 0 ? `${navigator.maxTouchPoints} points (mobile)` : "none (desktop)" });
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
  }, 400);
}

function startScan() {
  store.reset();
  router.push("/results");
}

onMounted(() => {
  liveLines.value = grabQuickData();
  setTimeout(startReveal, 1200);
});

onUnmounted(() => {
  if (revealInterval) clearInterval(revealInterval);
});

const steps = [
  {
    title: "Scan",
    description: "18 collectors run entirely in your browser. Canvas, WebGL, audio, fonts, and more. Nothing is sent anywhere.",
    icon: Scan,
  },
  {
    title: "Understand",
    description: "Every data point is explained. See exactly what it reveals and how unique it makes you.",
    icon: Eye,
  },
  {
    title: "Protect",
    description: "Get prioritized, browser-specific recommendations to shrink your fingerprint surface.",
    icon: Shield,
  },
];
</script>

<template>
  <div>
    <!-- ═══ Hero ═══ -->
    <section class="relative py-16 sm:py-28 overflow-hidden">
      <!-- Background glow — only in dark mode, very subtle -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden hidden dark:block">
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] rounded-full hero-glow" />
      </div>

      <div class="relative text-center">
        <h1 class="text-4xl sm:text-6xl font-bold tracking-tight mb-5 leading-[1.1]">
          <span class="block text-zinc-800 dark:text-zinc-100">Your browser has a</span>
          <span class="block text-accent dark:text-accent-dark">unique face.</span>
        </h1>

        <p class="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed mb-10">
          Websites identify you without cookies or accounts.
          Just by reading what your browser reveals. bakas shows you everything.
        </p>

        <!-- ── Intercepted data readout ── -->
        <div class="max-w-sm mx-auto mb-10">
          <div class="rounded-lg border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#0d0d0d] overflow-hidden text-left">
            <!-- File header -->
            <div class="flex items-center gap-2 px-3 py-2 border-b border-black/[0.05] dark:border-white/[0.05] bg-zinc-50 dark:bg-zinc-900/60">
              <span class="w-1.5 h-1.5 rounded-full bg-danger dark:bg-danger-dark animate-pulse"></span>
              <span class="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-widest">intercepted · your device</span>
            </div>

            <!-- Data lines -->
            <div class="px-3 py-2 font-mono text-xs space-y-[3px]">
              <div
                v-for="(line, i) in liveLines"
                :key="line.label"
                class="flex gap-2 transition-all duration-300"
                :class="i < visibleCount ? 'opacity-100' : 'opacity-0 translate-x-1'"
              >
                <span class="text-zinc-400 dark:text-zinc-600 w-16 shrink-0 text-right">{{ line.label }}</span>
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
                class="px-3 py-2 border-t border-black/[0.05] dark:border-white/[0.05] bg-zinc-50 dark:bg-zinc-900/60"
              >
                <p class="text-[10px] font-mono text-zinc-400 text-center">
                  6 of 18+ signals · collected in &lt;100ms · no permissions asked
                </p>
              </div>
            </Transition>
          </div>
        </div>

        <!-- CTA -->
        <button
          @click="startScan"
          class="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-accent dark:bg-accent-dark text-white font-semibold text-base transition-all shadow-lg shadow-accent/20 dark:shadow-accent-dark/20 hover:shadow-xl hover:shadow-accent/30 dark:hover:shadow-accent-dark/30 hover:opacity-90"
        >
          <Fingerprint class="w-5 h-5" />
          See Your Full Fingerprint
          <ArrowRight class="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>

        <p class="text-[11px] text-zinc-400 mt-4 flex items-center justify-center gap-1.5">
          <Lock class="w-3 h-3" />
          Runs entirely in your browser. Zero data leaves your device.
        </p>
      </div>
    </section>

    <!-- ═══ Divider stat ═══ -->
    <section class="py-8 text-center">
      <div class="inline-flex items-baseline gap-2">
        <span class="text-5xl sm:text-6xl font-bold text-accent dark:text-accent-dark">90%+</span>
        <span class="text-sm text-zinc-500 dark:text-zinc-400 max-w-[200px] text-left leading-tight">
          of browsers have a unique fingerprint
        </span>
      </div>
    </section>

    <!-- ═══ How It Works ═══ -->
    <section class="py-10 mb-6">
      <h2 class="text-xl font-bold text-center mb-8">How it works</h2>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          v-for="(step, i) in steps"
          :key="step.title"
          class="relative rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-5 transition-shadow duration-200 hover:shadow-md overflow-hidden"
        >
          <!-- Step number — large, using accent color at very low opacity -->
          <span class="absolute -top-2 -right-1 text-6xl font-black text-accent/20 dark:text-accent-dark/15 select-none leading-none">
            {{ i + 1 }}
          </span>

          <div class="relative">
            <div class="w-10 h-10 rounded-xl bg-accent/10 dark:bg-accent-dark/10 flex items-center justify-center mb-4">
              <component :is="step.icon" class="w-5 h-5 text-accent dark:text-accent-dark" />
            </div>
            <h3 class="text-base font-semibold text-zinc-800 dark:text-zinc-100 mb-1.5">{{ step.title }}</h3>
            <p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {{ step.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ Trackers vs bakas ═══ -->
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
                Installed fonts, screen resolution, timezone, locale
              </li>
              <li class="flex items-start gap-2">
                <span class="w-1 h-1 rounded-full bg-danger dark:bg-danger-dark mt-2 shrink-0"></span>
                CPU threads, RAM, battery, sensors, and more
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
                100% client-side. Nothing touches a server.
              </li>
              <li class="flex items-start gap-2">
                <span class="w-1 h-1 rounded-full bg-safe dark:bg-safe-dark mt-2 shrink-0"></span>
                Every data point explained in plain language.
              </li>
              <li class="flex items-start gap-2">
                <span class="w-1 h-1 rounded-full bg-safe dark:bg-safe-dark mt-2 shrink-0"></span>
                Personalized recommendations based on your browser.
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
            Watch a tracking script collect your data in real time, using your actual browser.
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
            Fingerprinting explained, Philippine privacy law, and how to protect yourself.
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
            Track how your fingerprint changes across browser updates and setting changes.
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