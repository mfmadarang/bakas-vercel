<script setup lang="ts">
/**
 * Privacy Notice — What bakas does and does not do with your data.
 *
 * This isn't a standard legal privacy policy because bakas doesn't
 * operate like a standard website. No accounts, no analytics, no
 * server-side data collection. This page explains that clearly.
 */

import { ShieldCheck, Server, HardDrive, Eye, EyeOff, Trash2 } from "lucide-vue-next";
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <div class="mb-10">
      <h1 class="text-2xl font-bold mb-2">Privacy Notice</h1>
      <p class="text-sm text-zinc-500 dark:text-zinc-400">
        Last updated: January 2025
      </p>
    </div>

    <!-- TL;DR -->
    <section class="mb-8">
      <div class="rounded-xl border border-green-200 dark:border-green-800/40 bg-green-50 dark:bg-green-900/10 p-5">
        <div class="flex items-start gap-3">
          <ShieldCheck class="w-5 h-5 text-safe dark:text-safe-dark shrink-0 mt-0.5" />
          <div>
            <p class="text-sm font-semibold text-green-800 dark:text-green-300 mb-1">The short version</p>
            <p class="text-sm text-green-700 dark:text-green-400 leading-relaxed">
              bakas does not collect, store, or transmit any of your data unless you explicitly opt in. Your browser fingerprint is generated and analyzed entirely on your device. We have no analytics, no tracking scripts, no cookies, and no server logs.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- What happens when you scan -->
    <section class="mb-8">
      <div class="flex items-center gap-2 mb-4">
        <Eye class="w-5 h-5 text-accent dark:text-accent-dark" />
        <h2 class="text-lg font-bold">What happens when you scan</h2>
      </div>

      <div class="text-sm text-zinc-600 dark:text-zinc-400 space-y-3 leading-relaxed">
        <p>
          When you click "Scan My Browser," bakas runs 18 fingerprint collectors using JavaScript in your browser. These collectors read properties like your screen resolution, GPU model, installed fonts, audio processing characteristics, and other browser APIs.
        </p>
        <p>
          All of this happens <strong class="text-zinc-800 dark:text-zinc-200">locally on your device</strong>. The collected data is used to generate a SHA-256 fingerprint hash and a uniqueness score. None of this data leaves your browser at any point during this process.
        </p>
        <p>
          The results are displayed to you immediately. They are not saved to any server. When you close the tab, the data is gone.
        </p>
      </div>
    </section>

    <!-- What we do NOT do -->
    <section class="mb-8">
      <div class="flex items-center gap-2 mb-4">
        <EyeOff class="w-5 h-5 text-accent dark:text-accent-dark" />
        <h2 class="text-lg font-bold">What we do not do</h2>
      </div>

      <div class="rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] divide-y divide-black/[0.05] dark:divide-white/[0.05]">
        <div class="px-5 py-3 flex items-center gap-3">
          <span class="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-[10px] font-bold text-danger dark:text-danger-dark">✕</span>
          <p class="text-sm text-zinc-600 dark:text-zinc-400">We do not use cookies</p>
        </div>
        <div class="px-5 py-3 flex items-center gap-3">
          <span class="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-[10px] font-bold text-danger dark:text-danger-dark">✕</span>
          <p class="text-sm text-zinc-600 dark:text-zinc-400">We do not run Google Analytics or any third-party analytics</p>
        </div>
        <div class="px-5 py-3 flex items-center gap-3">
          <span class="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-[10px] font-bold text-danger dark:text-danger-dark">✕</span>
          <p class="text-sm text-zinc-600 dark:text-zinc-400">We do not load third-party tracking scripts</p>
        </div>
        <div class="px-5 py-3 flex items-center gap-3">
          <span class="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-[10px] font-bold text-danger dark:text-danger-dark">✕</span>
          <p class="text-sm text-zinc-600 dark:text-zinc-400">We do not collect or store IP addresses</p>
        </div>
        <div class="px-5 py-3 flex items-center gap-3">
          <span class="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-[10px] font-bold text-danger dark:text-danger-dark">✕</span>
          <p class="text-sm text-zinc-600 dark:text-zinc-400">We do not sell, share, or transmit any data to third parties</p>
        </div>
        <div class="px-5 py-3 flex items-center gap-3">
          <span class="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-[10px] font-bold text-danger dark:text-danger-dark">✕</span>
          <p class="text-sm text-zinc-600 dark:text-zinc-400">We do not require an account, login, or email address</p>
        </div>
      </div>
    </section>

    <!-- Opt-in comparison -->
    <section class="mb-8">
      <div class="flex items-center gap-2 mb-4">
        <Server class="w-5 h-5 text-accent dark:text-accent-dark" />
        <h2 class="text-lg font-bold">Opt-in comparison (when available)</h2>
      </div>

      <div class="text-sm text-zinc-600 dark:text-zinc-400 space-y-3 leading-relaxed">
        <p>
          bakas offers an optional feature that lets you compare your fingerprint's uniqueness against other visitors. This feature requires a backend server and is only available when the server is running.
        </p>
        <p>
          If you choose to opt in, the following <strong class="text-zinc-800 dark:text-zinc-200">anonymized summary</strong> is sent to the server:
        </p>

        <div class="rounded-lg bg-zinc-50 dark:bg-zinc-900/50 p-4 text-xs space-y-1 font-mono">
          <p class="text-zinc-500">fingerprint hash (SHA-256)</p>
          <p class="text-zinc-500">canvas, webgl, audio hashes (already hashed client-side)</p>
          <p class="text-zinc-500">font count (not the font list)</p>
          <p class="text-zinc-500">screen resolution, color depth, pixel ratio</p>
          <p class="text-zinc-500">hardware concurrency, device memory</p>
          <p class="text-zinc-500">timezone, platform, language, touch points</p>
        </div>

        <p>
          The following is <strong class="text-zinc-800 dark:text-zinc-200">never sent</strong>: your IP address, raw user agent string, specific font names, cookie contents, browsing history, or any data that could directly re-identify you as a person.
        </p>
        <p>
          You can decline this feature with a single click. The "No thanks, keep it local" button is the same size and prominence as the "Yes, compare me" button. We do not use dark patterns.
        </p>
      </div>
    </section>

    <!-- Local storage -->
    <section class="mb-8">
      <div class="flex items-center gap-2 mb-4">
        <HardDrive class="w-5 h-5 text-accent dark:text-accent-dark" />
        <h2 class="text-lg font-bold">Local storage</h2>
      </div>

      <div class="text-sm text-zinc-600 dark:text-zinc-400 space-y-3 leading-relaxed">
        <p>
          bakas stores a small amount of data in your browser's <code class="text-xs bg-zinc-100 dark:bg-zinc-800 px-1 rounded">localStorage</code> for two purposes:
        </p>
        <ul class="space-y-1.5">
          <li class="flex items-start gap-2">
            <span class="w-1 h-1 rounded-full bg-accent dark:bg-accent-dark mt-2 shrink-0"></span>
            <strong class="text-zinc-800 dark:text-zinc-200">Theme preference</strong> (dark or light mode)
          </li>
          <li class="flex items-start gap-2">
            <span class="w-1 h-1 rounded-full bg-accent dark:bg-accent-dark mt-2 shrink-0"></span>
            <strong class="text-zinc-800 dark:text-zinc-200">Scan history</strong> (timestamp, hash preview, score, browser, and whether you opted into comparison)
          </li>
        </ul>
        <p>
          This data never leaves your browser. It is not synced, backed up, or accessible to anyone but you. You can clear it at any time from the History page or by clearing your browser's site data.
        </p>
      </div>
    </section>

    <!-- Your rights -->
    <section class="mb-8">
      <div class="flex items-center gap-2 mb-4">
        <Trash2 class="w-5 h-5 text-accent dark:text-accent-dark" />
        <h2 class="text-lg font-bold">Your control</h2>
      </div>

      <div class="text-sm text-zinc-600 dark:text-zinc-400 space-y-3 leading-relaxed">
        <p>
          Since bakas does not collect data by default, there is nothing to request deletion of. Your fingerprint data exists only in your browser's memory during a scan session and is discarded when you navigate away.
        </p>
        <p>
          If you used the opt-in comparison and would like your anonymized record removed from the database, you can contact the project maintainer. However, the stored data consists only of hashes and summary statistics that cannot be traced back to you.
        </p>
        <p>
          The scan history stored in localStorage can be cleared from the History page using the "Clear History" button, or by clearing site data in your browser settings.
        </p>
      </div>
    </section>

    <!-- Verification -->
    <section class="mb-8">
      <div class="rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-5">
        <p class="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-2">Verify it yourself</p>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          bakas is open source. You can inspect the code to verify every claim on this page. The live audit in the footer checks for cookies, third-party scripts, and tracking pixels on every page load in real time. If anything changes, the numbers change.
        </p>
      </div>
    </section>
  </div>
</template>