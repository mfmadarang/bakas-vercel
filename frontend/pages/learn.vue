<script setup lang="ts">
/**
 * Learn Page — Education Center
 *
 * Static educational page about browser fingerprinting. No backend needed.
 * Designed to be engaging and scannable, not a wall of text. Each section
 * has a distinct visual treatment to keep the reader moving down the page.
 */

import {
  Fingerprint, Eye, EyeOff, Scale, Shield, ShieldCheck, ShieldAlert,
  AlertTriangle, Lightbulb, Brain, Timer, Keyboard, Monitor,
  Cookie, Globe, Megaphone, CreditCard, Newspaper, BarChart3,
  ChevronRight, ArrowRight, Lock, Unlock, Check, X as XIcon
} from "lucide-vue-next";

const store = useFingerprintStore();
const router = useRouter();

function startScan() {
  store.reset();
  router.push("/results");
}

// Active protection level tab
const activeLevel = ref<1 | 2 | 3>(1);

const levels = {
  1: {
    label: "Easy",
    color: "green",
    tagClass: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    dotClass: "bg-safe dark:bg-safe-dark",
    tips: [
      {
        title: "Enable Do Not Track",
        text: "Mostly symbolic since sites can ignore it, but it signals your preference and establishes a baseline.",
      },
      {
        title: "Use incognito mode occasionally",
        text: "Doesn't prevent fingerprinting, but limits cookie-based tracking and starts each session with a clean slate.",
      },
      {
        title: "Keep your browser updated",
        text: "Newer versions patch known fingerprinting vectors and ship better privacy defaults out of the box.",
      },
    ],
  },
  2: {
    label: "Moderate",
    color: "amber",
    tagClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    dotClass: "bg-warning dark:bg-warning-dark",
    tips: [
      {
        title: "Switch to Firefox",
        text: "Firefox blocks many fingerprinting APIs by default (deviceMemory, Network Information) and has Enhanced Tracking Protection built in.",
      },
      {
        title: "Install uBlock Origin",
        text: "Blocks tracking scripts before they run. The single most effective browser extension for privacy.",
      },
      {
        title: "Remove unused fonts",
        text: "Fewer installed fonts means a less unique font fingerprint. Stick to system defaults when possible.",
      },
    ],
  },
  3: {
    label: "Serious",
    color: "red",
    tagClass: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    dotClass: "bg-danger dark:bg-danger-dark",
    tips: [
      {
        title: "Firefox + privacy.resistFingerprinting",
        text: "Normalizes canvas, audio, fonts, and other data points so all users look identical. Set it in about:config.",
      },
      {
        title: "Use the Brave browser",
        text: "Randomizes fingerprinting data points every session, making consistent tracking extremely difficult.",
      },
      {
        title: "Tor Browser for sensitive browsing",
        text: "Forces identical fingerprints for all users and routes traffic through multiple relays. The gold standard.",
      },
    ],
  },
};

const currentLevel = computed(() => levels[activeLevel.value]);
</script>

<template>
  <div>
    <!-- ═══ Hero ═══ -->
    <section class="text-center py-10 sm:py-14 mb-8">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 dark:bg-accent-dark/10 text-accent dark:text-accent-dark text-xs font-semibold mb-5">
        <Fingerprint class="w-3.5 h-3.5" />
        Education Center
      </div>
      <h1 class="text-3xl sm:text-4xl font-bold tracking-tight mb-4 max-w-2xl mx-auto">
        They don't need your cookies to know who you are.
      </h1>
      <p class="text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
        Browser fingerprinting is the invisible tracking technique most people have never heard of.
        Here's everything you need to know.
      </p>
    </section>

    <!-- ═══ The Big Number ═══ -->
    <section class="mb-12">
      <div class="rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-6 sm:p-8 text-center">
        <p class="text-5xl sm:text-6xl font-bold text-accent dark:text-accent-dark mb-2">90%+</p>
        <p class="text-base text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
          of browsers have a <strong class="text-zinc-800 dark:text-zinc-200">unique fingerprint</strong>.
          That means you can be singled out from millions of visitors without logging in, without cookies, without consent.
        </p>
      </div>
    </section>

    <!-- ═══ What is Browser Fingerprinting? ═══ -->
    <section class="mb-12 max-w-3xl mx-auto">
      <h2 class="text-xl font-bold mb-4">What is Browser Fingerprinting?</h2>

      <div class="text-sm text-zinc-600 dark:text-zinc-400 space-y-4 leading-relaxed">
        <p>
          Imagine walking into a room full of people. Even without asking anyone's name,
          you could identify them by their face, height, clothes, voice,
          and how they walk. You don't need their name. The combination of traits is enough.
        </p>
        <p>
          Browser fingerprinting works the same way. A website reads your browser's properties
          (screen size, installed fonts, GPU model, timezone, language, and dozens more) and
          combines them into a unique identifier.
          <strong class="text-zinc-800 dark:text-zinc-200">No cookies. No accounts. No consent popups.</strong>
          It happens silently, in the background, in milliseconds.
        </p>
      </div>
    </section>

    <!-- ═══ Cookies vs Fingerprinting Comparison ═══ -->
    <section class="mb-12">
      <h2 class="text-xl font-bold mb-4 max-w-3xl mx-auto">Cookies vs. Fingerprinting</h2>

      <div class="rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] overflow-hidden">
        <!-- Header row -->
        <div class="grid grid-cols-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 border-b border-black/[0.07] dark:border-white/[0.07]">
          <div class="px-4 sm:px-6 py-3"></div>
          <div class="px-4 sm:px-6 py-3 text-center border-l border-black/[0.07] dark:border-white/[0.07]">
            <div class="flex items-center justify-center gap-1.5">
              <Cookie class="w-3.5 h-3.5" />
              Cookies
            </div>
          </div>
          <div class="px-4 sm:px-6 py-3 text-center border-l border-black/[0.07] dark:border-white/[0.07]">
            <div class="flex items-center justify-center gap-1.5">
              <Fingerprint class="w-3.5 h-3.5" />
              Fingerprinting
            </div>
          </div>
        </div>

        <!-- Rows -->
        <div
          v-for="(row, i) in [
            { label: 'Requires consent', cookie: true, fp: false },
            { label: 'User can see it', cookie: true, fp: false },
            { label: 'User can delete it', cookie: true, fp: false },
            { label: 'Works in incognito', cookie: false, fp: true },
            { label: 'Survives clearing data', cookie: false, fp: true },
            { label: 'Blocked by ad blockers', cookie: true, fp: false },
          ]"
          :key="i"
          class="grid grid-cols-3 text-sm border-b border-black/[0.04] dark:border-white/[0.04] last:border-0"
          :class="i % 2 === 0 ? 'bg-zinc-50/50 dark:bg-zinc-900/20' : ''"
        >
          <div class="px-4 sm:px-6 py-3 text-zinc-600 dark:text-zinc-400">{{ row.label }}</div>
          <div class="px-4 sm:px-6 py-3 flex justify-center border-l border-black/[0.07] dark:border-white/[0.07]">
            <Check v-if="row.cookie" class="w-4 h-4 text-safe dark:text-safe-dark" />
            <XIcon v-else class="w-4 h-4 text-zinc-300 dark:text-zinc-700" />
          </div>
          <div class="px-4 sm:px-6 py-3 flex justify-center border-l border-black/[0.07] dark:border-white/[0.07]">
            <Check v-if="row.fp" class="w-4 h-4 text-danger dark:text-danger-dark" />
            <XIcon v-else class="w-4 h-4 text-zinc-300 dark:text-zinc-700" />
          </div>
        </div>
      </div>

      <p class="text-xs text-zinc-400 mt-3 text-center">
        Notice the pattern: everything that protects you from cookies doesn't work on fingerprinting.
      </p>
    </section>

    <!-- ═══ How is it Used? ═══ -->
    <section class="mb-12 max-w-3xl mx-auto">
      <h2 class="text-xl font-bold mb-5">How is it Used?</h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-5">
          <div class="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-3">
            <Megaphone class="w-4.5 h-4.5 text-danger dark:text-danger-dark" />
          </div>
          <h4 class="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1">Ad Networks</h4>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Follow you across websites without cookies. Even in incognito mode,
            your fingerprint stays the same. Hundreds of sites, one invisible profile.
          </p>
        </div>

        <div class="rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-5">
          <div class="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-3">
            <CreditCard class="w-4.5 h-4.5 text-safe dark:text-safe-dark" />
          </div>
          <h4 class="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1">Fraud Detection</h4>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Banks flag logins from unfamiliar device fingerprints.
            One of the more legitimate uses, though still done silently.
          </p>
        </div>

        <div class="rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-5">
          <div class="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mb-3">
            <Newspaper class="w-4.5 h-4.5 text-warning dark:text-warning-dark" />
          </div>
          <h4 class="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1">Paywall Detection</h4>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            News sites detect incognito mode by matching your fingerprint
            to a previous visit. No cookies needed to know you've been here.
          </p>
        </div>

        <div class="rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-5">
          <div class="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-3">
            <BarChart3 class="w-4.5 h-4.5 text-purple-600 dark:text-purple-400" />
          </div>
          <h4 class="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1">Data Brokers</h4>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Buy and sell fingerprint-linked profiles of your interests,
            shopping habits, and browsing patterns. No account required.
          </p>
        </div>
      </div>
    </section>

    <!-- ═══ Is It Legal in the Philippines? ═══ -->
    <section class="mb-12 max-w-3xl mx-auto">
      <h2 class="text-xl font-bold mb-4">Is It Legal in the Philippines?</h2>

      <div class="rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-5 sm:p-6">
        <div class="flex items-start gap-4">
          <div class="shrink-0 w-10 h-10 rounded-lg bg-accent/10 dark:bg-accent-dark/10 flex items-center justify-center">
            <Scale class="w-5 h-5 text-accent dark:text-accent-dark" />
          </div>
          <div class="text-sm text-zinc-600 dark:text-zinc-400 space-y-3 leading-relaxed">
            <p>
              The <strong class="text-zinc-800 dark:text-zinc-200">Data Privacy Act of 2012 (RA 10173)</strong>
              protects the processing of personal information, which could include a unique browser fingerprint.
              But its application to passive fingerprinting is still a gray area.
            </p>
            <p>
              Browser fingerprinting doesn't require the user to input anything.
              The browser simply reveals its properties when asked. Under the GDPR in the EU,
              this would require explicit consent. The Philippines doesn't yet have equivalent
              specific guidance.
            </p>
          </div>
        </div>

        <div class="mt-4 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 p-3 text-xs">
          <p class="font-medium text-amber-700 dark:text-amber-400">
            <AlertTriangle class="w-3.5 h-3.5 inline mr-1" />
            This is informational only, not legal advice. Consult a lawyer for specific legal questions.
          </p>
        </div>
      </div>
    </section>

    <!-- ═══ How to Protect Yourself ═══ -->
    <section class="mb-12 max-w-3xl mx-auto">
      <h2 class="text-xl font-bold mb-2">How to Protect Yourself</h2>
      <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-5">
        Pick a level that matches how far you want to go.
      </p>

      <!-- Level tabs -->
      <div class="flex gap-2 mb-5">
        <button
          v-for="lvl in [1, 2, 3] as const"
          :key="lvl"
          @click="activeLevel = lvl"
          class="flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 border"
          :class="
            activeLevel === lvl
              ? levels[lvl].tagClass + ' border-transparent'
              : 'border-black/[0.07] dark:border-white/[0.07] text-zinc-500 dark:text-zinc-400 bg-white dark:bg-[#111111] hover:bg-zinc-50 dark:hover:bg-zinc-800'
          "
        >
          Level {{ lvl }} · {{ levels[lvl].label }}
        </button>
      </div>

      <!-- Active level tips -->
      <div class="space-y-3">
        <div
          v-for="(tip, i) in currentLevel.tips"
          :key="i"
          class="rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-4 flex items-start gap-3"
        >
          <div class="shrink-0 mt-0.5">
            <div class="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white" :class="currentLevel.dotClass">
              {{ i + 1 }}
            </div>
          </div>
          <div>
            <h4 class="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-0.5">{{ tip.title }}</h4>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{{ tip.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ Did You Know? ═══ -->
    <section class="mb-12">
      <h2 class="text-xl font-bold mb-5 max-w-3xl mx-auto">Did You Know?</h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl mx-auto">
        <div class="rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-5 flex gap-4">
          <div class="shrink-0">
            <Brain class="w-6 h-6 text-accent dark:text-accent-dark" />
          </div>
          <div>
            <p class="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1">Tab count detection</p>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Your open tab count can be inferred from audio processing timing.
              More tabs means slower processing and detectable delay patterns.
            </p>
          </div>
        </div>

        <div class="rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-5 flex gap-4">
          <div class="shrink-0">
            <Keyboard class="w-6 h-6 text-accent dark:text-accent-dark" />
          </div>
          <div>
            <p class="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1">Keystroke dynamics</p>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              How long you hold each key and the pauses between them is unique enough to identify you.
              Your typing rhythm is a biometric.
            </p>
          </div>
        </div>

        <div class="rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-5 flex gap-4">
          <div class="shrink-0">
            <Monitor class="w-6 h-6 text-accent dark:text-accent-dark" />
          </div>
          <div>
            <p class="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1">Refresh rate fingerprint</p>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Your screen's refresh rate is detectable via JavaScript animation timing.
              A 144Hz monitor behaves detectably different from a 60Hz one.
            </p>
          </div>
        </div>

        <div class="rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-5 flex gap-4">
          <div class="shrink-0">
            <Eye class="w-6 h-6 text-accent dark:text-accent-dark" />
          </div>
          <div>
            <p class="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1">Font installation order</p>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Installing Photoshop adds fonts a clean install doesn't have.
              Trackers can detect exactly which software you've installed through your font list.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ CTA ═══ -->
    <section class="text-center pb-8 pt-4">
      <div class="rounded-xl border border-accent/20 dark:border-accent-dark/20 bg-accent/5 dark:bg-accent-dark/5 p-8 max-w-lg mx-auto">
        <Fingerprint class="w-8 h-8 text-accent dark:text-accent-dark mx-auto mb-3" />
        <p class="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
          Ready to see your own fingerprint?
        </p>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-5">
          Find out exactly what your browser is revealing right now.
        </p>
        <button
          @click="startScan"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent dark:bg-accent-dark text-white font-medium text-sm hover:opacity-90 transition-opacity"
        >
          Scan My Browser
          <ArrowRight class="w-4 h-4" />
        </button>
      </div>
    </section>
  </div>
</template>