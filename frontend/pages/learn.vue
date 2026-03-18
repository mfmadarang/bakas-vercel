<script setup lang="ts">
/**
 * Learn Page — Education Center
 *
 * Static educational page about browser fingerprinting. No backend needed.
 * Written in Filipino-friendly English with some Taglish section headers
 * to make it approachable.
 */

import {
  BookOpen, AlertTriangle, Scale, Shield,
  Lightbulb, Fingerprint, Eye, Brain, Timer
} from "lucide-vue-next";
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <div class="mb-10">
      <h1 class="text-2xl font-bold mb-2">Learn About Browser Fingerprinting</h1>
      <p class="text-sm text-zinc-500 dark:text-zinc-400">
        Everything you need to know about how websites track you without cookies.
      </p>
    </div>

    <!-- Section 1: Ano ang Browser Fingerprinting? -->
    <section class="mb-10">
      <div class="flex items-center gap-2 mb-4">
        <BookOpen class="w-5 h-5 text-accent dark:text-accent-dark" />
        <h2 class="text-xl font-bold">Ano ang Browser Fingerprinting?</h2>
      </div>

      <div class="prose-sm text-zinc-600 dark:text-zinc-400 space-y-3">
        <p>
          Imagine walking into a room full of people. Even without asking anyone's name,
          you could identify specific individuals by their face, height, clothes, voice,
          and how they walk. You don't need their name — the combination of traits is enough.
        </p>
        <p>
          Browser fingerprinting works the same way. A website doesn't need cookies or an
          account to recognize you. It just reads your browser's properties — screen size,
          installed fonts, GPU model, timezone, language, and dozens of other details — and
          combines them into a unique identifier.
        </p>
        <p>
          The scary part? <strong class="text-zinc-800 dark:text-zinc-200">You have no idea it's happening.</strong>
          There's no consent popup. No cookie banner. No notification. It happens silently,
          in the background, in milliseconds.
        </p>
        <p>
          That combination of properties is your <strong class="text-zinc-800 dark:text-zinc-200">browser fingerprint</strong> — and
          research shows that over 90% of browsers have a unique one. Meaning: you can be singled
          out from millions of visitors without ever logging in.
        </p>
      </div>
    </section>

    <!-- Section 2: Paano Ito Ginagamit? -->
    <section class="mb-10">
      <div class="flex items-center gap-2 mb-4">
        <Eye class="w-5 h-5 text-accent dark:text-accent-dark" />
        <h2 class="text-xl font-bold">Paano Ito Ginagamit?</h2>
      </div>

      <div class="prose-sm text-zinc-600 dark:text-zinc-400 space-y-3">
        <p>Browser fingerprinting is used for both legitimate and concerning purposes:</p>

        <div class="space-y-3 mt-3">
          <div class="rounded-lg border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-4">
            <h4 class="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1">Ad Networks</h4>
            <p class="text-sm">
              Third-party ad trackers follow you across websites without cookies. Even in incognito mode,
              your fingerprint stays the same — so ad networks can build a profile of your browsing habits
              across hundreds of sites.
            </p>
          </div>

          <div class="rounded-lg border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-4">
            <h4 class="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1">Fraud Detection</h4>
            <p class="text-sm">
              Banks and payment platforms use fingerprinting to detect suspicious activity. If someone
              tries to log in from a device that doesn't match your usual fingerprint, it triggers a
              security alert. This is one of the more legitimate uses.
            </p>
          </div>

          <div class="rounded-lg border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-4">
            <h4 class="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1">Paywall Detection</h4>
            <p class="text-sm">
              Some news sites use fingerprinting to detect incognito mode — if they can't set cookies but
              your fingerprint matches a previous visit, they know you're trying to bypass the paywall.
            </p>
          </div>

          <div class="rounded-lg border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-4">
            <h4 class="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1">Data Brokers</h4>
            <p class="text-sm">
              Companies that buy and sell user data use fingerprinting to link your activity across
              sites and build detailed profiles — your interests, shopping habits, political views —
              all without you ever creating an account.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 3: Is It Legal in the Philippines? -->
    <section class="mb-10">
      <div class="flex items-center gap-2 mb-4">
        <Scale class="w-5 h-5 text-accent dark:text-accent-dark" />
        <h2 class="text-xl font-bold">Is It Legal in the Philippines?</h2>
      </div>

      <div class="prose-sm text-zinc-600 dark:text-zinc-400 space-y-3">
        <p>
          The Philippines has the <strong class="text-zinc-800 dark:text-zinc-200">Data Privacy Act of 2012 (RA 10173)</strong>,
          which protects the processing of personal information. Under this law, personal information
          includes any data that can identify an individual — which could arguably include a unique
          browser fingerprint.
        </p>
        <p>
          However, the law's application to passive fingerprinting (where no explicit data is "collected"
          in the traditional sense) is still a gray area. Browser fingerprinting doesn't require the user
          to input anything — the browser simply reveals its properties when asked.
        </p>
        <p>
          In the EU, the GDPR and ePrivacy Directive more explicitly cover fingerprinting — websites must
          get consent before collecting fingerprints, just like cookies. The Philippines doesn't yet have
          equivalent specific guidance on this.
        </p>

        <div class="rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 p-3 text-xs mt-3">
          <p class="font-medium text-amber-700 dark:text-amber-400">
            <AlertTriangle class="w-3.5 h-3.5 inline mr-1" />
            Note: This is informational only, not legal advice. Consult a lawyer for specific legal questions.
          </p>
        </div>
      </div>
    </section>

    <!-- Section 4: Paano Maprotektahan ang Sarili? -->
    <section class="mb-10">
      <div class="flex items-center gap-2 mb-4">
        <Shield class="w-5 h-5 text-accent dark:text-accent-dark" />
        <h2 class="text-xl font-bold">Paano Maprotektahan ang Sarili?</h2>
      </div>

      <div class="space-y-4">
        <!-- Level 1 -->
        <div class="rounded-lg border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-5">
          <div class="flex items-center gap-2 mb-2">
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Level 1 — Easy
            </span>
          </div>
          <ul class="text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
            <li>
              <strong class="text-zinc-800 dark:text-zinc-200">Enable Do Not Track.</strong>
              It's mostly symbolic (sites can ignore it), but it signals your preference and
              is a baseline privacy setting.
            </li>
            <li>
              <strong class="text-zinc-800 dark:text-zinc-200">Use incognito mode occasionally.</strong>
              It doesn't prevent fingerprinting, but it limits cookie-based tracking and
              starts each session fresh.
            </li>
            <li>
              <strong class="text-zinc-800 dark:text-zinc-200">Keep your browser updated.</strong>
              Newer versions patch known fingerprinting vectors and improve privacy defaults.
            </li>
          </ul>
        </div>

        <!-- Level 2 -->
        <div class="rounded-lg border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-5">
          <div class="flex items-center gap-2 mb-2">
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              Level 2 — Moderate
            </span>
          </div>
          <ul class="text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
            <li>
              <strong class="text-zinc-800 dark:text-zinc-200">Switch to Firefox.</strong>
              Firefox blocks many fingerprinting APIs by default (like deviceMemory and
              Network Information) and has Enhanced Tracking Protection built in.
            </li>
            <li>
              <strong class="text-zinc-800 dark:text-zinc-200">Install uBlock Origin.</strong>
              It blocks tracking scripts before they even run. This is the single most
              effective browser extension for privacy.
            </li>
            <li>
              <strong class="text-zinc-800 dark:text-zinc-200">Remove unused fonts.</strong>
              Fewer installed fonts = less unique font fingerprint. Stick to system defaults.
            </li>
          </ul>
        </div>

        <!-- Level 3 -->
        <div class="rounded-lg border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-5">
          <div class="flex items-center gap-2 mb-2">
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              Level 3 — Serious
            </span>
          </div>
          <ul class="text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
            <li>
              <strong class="text-zinc-800 dark:text-zinc-200">Firefox + privacy.resistFingerprinting.</strong>
              This setting normalizes many fingerprinting data points (canvas, audio, fonts)
              to make all users look identical. Go to <code class="text-xs bg-zinc-100 dark:bg-zinc-800 px-1 rounded">about:config</code>
              and set <code class="text-xs bg-zinc-100 dark:bg-zinc-800 px-1 rounded">privacy.resistFingerprinting</code> to true.
            </li>
            <li>
              <strong class="text-zinc-800 dark:text-zinc-200">Use the Brave browser.</strong>
              Brave randomizes fingerprinting data points on every session, making it extremely
              hard to track you consistently.
            </li>
            <li>
              <strong class="text-zinc-800 dark:text-zinc-200">Tor Browser for sensitive browsing.</strong>
              Tor forces all users to have identical fingerprints and routes traffic through
              multiple relays. It's the gold standard for anonymity.
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Section 5: Did You Know? -->
    <section class="mb-10">
      <div class="flex items-center gap-2 mb-4">
        <Lightbulb class="w-5 h-5 text-accent dark:text-accent-dark" />
        <h2 class="text-xl font-bold">Did You Know?</h2>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="rounded-lg border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-4">
          <Brain class="w-5 h-5 text-accent dark:text-accent-dark mb-2" />
          <p class="text-sm text-zinc-600 dark:text-zinc-400">
            Your browser tab count can be inferred from audio processing timing differences.
            More tabs = slower processing = detectable delay patterns.
          </p>
        </div>

        <div class="rounded-lg border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-4">
          <Fingerprint class="w-5 h-5 text-accent dark:text-accent-dark mb-2" />
          <p class="text-sm text-zinc-600 dark:text-zinc-400">
            Typing rhythm — how long you hold each key and the pauses between them —
            is unique enough to identify you. It's called keystroke dynamics.
          </p>
        </div>

        <div class="rounded-lg border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-4">
          <Timer class="w-5 h-5 text-accent dark:text-accent-dark mb-2" />
          <p class="text-sm text-zinc-600 dark:text-zinc-400">
            Your screen's refresh rate can be detected via JavaScript animation timing.
            A 144Hz monitor behaves detectably different from a 60Hz one.
          </p>
        </div>

        <div class="rounded-lg border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-4">
          <Eye class="w-5 h-5 text-accent dark:text-accent-dark mb-2" />
          <p class="text-sm text-zinc-600 dark:text-zinc-400">
            The order you installed fonts reveals your software history. Installing
            Photoshop adds fonts that a clean install doesn't have — and trackers can detect this.
          </p>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="text-center py-8">
      <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
        Ready to see your own browser fingerprint?
      </p>
      <NuxtLink
        to="/results"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent dark:bg-accent-dark text-white font-medium text-sm hover:opacity-90 transition-opacity"
      >
        <Fingerprint class="w-4 h-4" />
        Scan My Browser
      </NuxtLink>
    </section>
  </div>
</template>
