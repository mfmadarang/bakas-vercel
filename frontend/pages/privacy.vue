<script setup lang="ts">
/**
 * Privacy Notice — Professional, transparent, and well-designed.
 * Structured like a real privacy policy but written in plain language
 * because bakas genuinely has nothing to hide.
 */

import {
  ShieldCheck, Globe, Mail, Calendar
} from "lucide-vue-next";

const sections = [
  { id: "summary", label: "Summary" },
  { id: "what-happens", label: "What happens when you scan" },
  { id: "what-we-dont", label: "What we don't do" },
  { id: "opt-in", label: "Opt-in comparison" },
  { id: "local-storage", label: "Local storage" },
  { id: "your-control", label: "Your control" },
  { id: "contact", label: "Contact" },
];
</script>

<template>
  <div class="max-w-4xl mx-auto">

    <!-- ── Header ── -->
    <div class="mb-8">
      <div class="flex items-center gap-2 mb-4">
        <ShieldCheck class="w-5 h-5 text-accent dark:text-accent-dark" />
        <h1 class="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Privacy Notice</h1>
      </div>

      <div class="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-zinc-400">
        <span class="flex items-center gap-1.5">
          <Calendar class="w-3 h-3" />
          Last updated: January 2025
        </span>
        <span class="flex items-center gap-1.5">
          <Globe class="w-3 h-3" />
          bakas-project.vercel.app
        </span>
        <span class="flex items-center gap-1.5">
          <Mail class="w-3 h-3" />
          mfmadarang@up.edu.ph
        </span>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8">

      <!-- ── Sidebar nav (desktop only) ── -->
      <nav class="hidden lg:block">
        <div class="sticky top-20 space-y-1">
          <p class="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-2">On this page</p>
          <a
            v-for="s in sections"
            :key="s.id"
            :href="`#${s.id}`"
            class="block text-xs text-zinc-500 dark:text-zinc-400 hover:text-accent dark:hover:text-accent-dark transition-colors py-1"
          >
            {{ s.label }}
          </a>
        </div>
      </nav>

      <!-- ── Content ── -->
      <div>

        <!-- Summary -->
        <section id="summary" class="mb-10 scroll-mt-20">
          <div class="rounded-xl border border-green-200 dark:border-green-800/40 bg-green-50 dark:bg-green-900/10 p-5">
            <div class="flex items-start gap-3">
              <ShieldCheck class="w-5 h-5 text-safe dark:text-safe-dark shrink-0 mt-0.5" />
              <div class="text-sm text-green-700 dark:text-green-400 leading-relaxed space-y-2">
                <p class="font-semibold text-green-800 dark:text-green-300">
                  bakas does not collect your data.
                </p>
                <p>
                  Your browser fingerprint is generated and analyzed entirely on your device.
                  Nothing is sent to any server unless you explicitly opt in. There are no cookies,
                  no analytics, no tracking scripts, and no server logs. This site practices
                  what it preaches.
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- What happens when you scan -->
        <section id="what-happens" class="mb-10 scroll-mt-20">
          <h2 class="text-base font-bold text-zinc-800 dark:text-zinc-100 mb-3">What happens when you scan</h2>
          <div class="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-3">
            <p>
              When you click "Scan My Browser," bakas runs 18 fingerprint collectors using
              JavaScript in your browser. These collectors read properties such as your screen
              resolution, GPU model, installed fonts, audio processing characteristics, and
              other browser APIs.
            </p>
            <p>
              All collection happens <strong class="text-zinc-800 dark:text-zinc-200">locally on your device</strong>.
              The collected data is used to generate a SHA-256 fingerprint hash and a uniqueness
              score. None of this data leaves your browser during this process.
            </p>
            <p>
              The results are displayed to you immediately and are not saved to any server.
              When you close the tab, the scan data is gone.
            </p>
          </div>
        </section>

        <!-- What we don't do -->
        <section id="what-we-dont" class="mb-10 scroll-mt-20">
          <h2 class="text-base font-bold text-zinc-800 dark:text-zinc-100 mb-3">What we don't do</h2>

          <div class="rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] overflow-hidden">
            <table class="w-full text-sm">
              <tbody class="divide-y divide-black/[0.05] dark:divide-white/[0.05]">
                <tr v-for="item in [
                  'Set cookies of any kind',
                  'Run Google Analytics or any third-party analytics',
                  'Load third-party tracking scripts or pixels',
                  'Collect or store IP addresses',
                  'Sell, share, or transmit data to third parties',
                  'Require an account, login, or email address',
                  'Fingerprint you ourselves (the irony would be unforgivable)',
                ]" :key="item">
                  <td class="px-4 py-2.5 w-8">
                    <span class="inline-flex w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/20 items-center justify-center text-[10px] font-bold text-danger dark:text-danger-dark">✕</span>
                  </td>
                  <td class="px-2 py-2.5 text-zinc-600 dark:text-zinc-400">{{ item }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p class="text-xs text-zinc-400 mt-3">
            You can verify these claims using the live audit in the footer, which checks for cookies,
            third-party scripts, and tracking pixels on every page load.
          </p>
        </section>

        <!-- Opt-in comparison -->
        <section id="opt-in" class="mb-10 scroll-mt-20">
          <h2 class="text-base font-bold text-zinc-800 dark:text-zinc-100 mb-3">Opt-in comparison</h2>
          <div class="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-3">
            <p>
              bakas offers an optional feature that compares your fingerprint's uniqueness against
              other visitors. This requires a backend server and is only available when one is running.
            </p>

            <p class="font-medium text-zinc-800 dark:text-zinc-200">If you opt in, this is sent:</p>

            <div class="rounded-lg border border-black/[0.07] dark:border-white/[0.07] bg-zinc-50 dark:bg-zinc-900/50 p-4 font-mono text-xs text-zinc-500 space-y-0.5">
              <p>fingerprint hash (SHA-256)</p>
              <p>canvas, webgl, audio hashes (hashed client-side)</p>
              <p>font count (not the list of fonts)</p>
              <p>screen resolution, color depth, pixel ratio</p>
              <p>hardware concurrency, device memory</p>
              <p>timezone, platform, language, touch points</p>
            </div>

            <p class="font-medium text-zinc-800 dark:text-zinc-200">Never sent:</p>
            <p>
              Your IP address, raw user agent string, specific font names, cookie contents,
              browsing history, or any data that could directly re-identify you as a person.
            </p>
            <p>
              You can decline with a single click. Both buttons ("Yes, compare me" and
              "No thanks, keep it local") are designed with equal size and prominence.
              No dark patterns.
            </p>
          </div>
        </section>

        <!-- Local storage -->
        <section id="local-storage" class="mb-10 scroll-mt-20">
          <h2 class="text-base font-bold text-zinc-800 dark:text-zinc-100 mb-3">Local storage</h2>
          <div class="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-3">
            <p>bakas stores a small amount of data in your browser's localStorage:</p>

            <div class="rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] divide-y divide-black/[0.05] dark:divide-white/[0.05]">
              <div class="px-4 py-3">
                <p class="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-0.5">Theme preference</p>
                <p class="text-xs text-zinc-500">Your dark or light mode selection. Stored as a single string value.</p>
              </div>
              <div class="px-4 py-3">
                <p class="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-0.5">Scan history</p>
                <p class="text-xs text-zinc-500">Timestamp, hash preview, uniqueness score, detected browser, and whether you opted into comparison. Up to 50 entries.</p>
              </div>
            </div>

            <p>
              This data never leaves your browser. It is not synced, backed up, or accessible to
              anyone but you. You can clear it from the History page or by clearing your browser's
              site data for this domain.
            </p>
          </div>
        </section>

        <!-- Your control -->
        <section id="your-control" class="mb-10 scroll-mt-20">
          <h2 class="text-base font-bold text-zinc-800 dark:text-zinc-100 mb-3">Your control</h2>
          <div class="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-3">
            <p>
              Since bakas does not collect data by default, there is nothing to request deletion of.
              Your fingerprint data exists only in your browser's memory during a scan and is
              discarded when you navigate away.
            </p>
            <p>
              If you used the opt-in comparison feature and want your anonymized record removed,
              email <a href="mailto:mfmadarang@up.edu.ph" class="text-accent dark:text-accent-dark hover:underline">mfmadarang@up.edu.ph</a>.
              Note that the stored data consists only of hashes and summary statistics that cannot
              be traced back to you as an individual.
            </p>
          </div>
        </section>

        <!-- Contact -->
        <section id="contact" class="mb-10 scroll-mt-20">
          <h2 class="text-base font-bold text-zinc-800 dark:text-zinc-100 mb-3">Contact</h2>
          <div class="rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-5">
            <div class="text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
              <p>
                bakas is developed and maintained by
                <strong class="text-zinc-800 dark:text-zinc-200">Mikhail Madarang</strong>.
              </p>
              <p>
                For questions, concerns, or deletion requests related to this privacy notice:
              </p>
              <a
                href="mailto:mfmadarang@up.edu.ph"
                class="inline-flex items-center gap-2 mt-1 px-4 py-2 rounded-lg text-sm font-medium border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <Mail class="w-4 h-4" />
                mfmadarang@up.edu.ph
              </a>
            </div>
          </div>
        </section>

      </div>
    </div>
  </div>
</template>