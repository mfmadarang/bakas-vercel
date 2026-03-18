<script setup lang="ts">
/**
 * OptInPrompt — Consent Modal for Database Comparison
 *
 * This is the moment where the user decides whether to share their
 * anonymized fingerprint with the backend. The design must make both
 * options equally prominent — this is a privacy tool and we must not
 * use dark patterns to push users toward sharing.
 */

import { ShieldCheck, ShieldOff } from "lucide-vue-next";

const emit = defineEmits<{
  (e: "accept"): void;
  (e: "decline"): void;
}>();
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div
      class="w-full max-w-md rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-6 shadow-2xl"
    >
      <h3 class="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-3">
        Compare your fingerprint?
      </h3>

      <p class="text-sm text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
        Want to see how unique your fingerprint is compared to other visitors?
        bakas will send only your
        <strong class="text-zinc-800 dark:text-zinc-200">anonymized fingerprint hash</strong>
        and a summary of data points — never your IP address or any identifying information —
        to a local database.
      </p>

      <div class="text-xs text-zinc-500 dark:text-zinc-500 mb-6 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
        <p class="font-medium mb-1">What gets sent:</p>
        <p>Fingerprint hash, canvas/WebGL/audio hashes, font count, screen resolution, platform, timezone, language, color depth, device pixel ratio, touch points, hardware concurrency, device memory.</p>
        <p class="mt-2 font-medium">What does NOT get sent:</p>
        <p>Your IP address, raw user agent, specific fonts list, or any data that could re-identify you.</p>
      </div>

      <!-- Both buttons are equal size and prominence — no dark patterns -->
      <div class="flex gap-3">
        <button
          @click="emit('decline')"
          class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <ShieldCheck class="w-4 h-4" />
          No thanks, keep it local
        </button>
        <button
          @click="emit('accept')"
          class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-accent dark:bg-accent-dark text-white hover:opacity-90 transition-opacity"
        >
          <ShieldOff class="w-4 h-4" />
          Yes, compare me
        </button>
      </div>
    </div>
  </div>
</template>
