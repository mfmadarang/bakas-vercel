<script setup lang="ts">
/**
 * History Page — Past Scan Timeline
 *
 * Shows a timeline of past fingerprint scans stored in localStorage.
 * Useful for seeing if your fingerprint changes after browser updates
 * or privacy setting changes. Everything is client-side — no backend.
 */

import { Clock, Trash2, Fingerprint, ArrowRight } from "lucide-vue-next";
import type { HistoryEntry } from "~/stores/fingerprint";

const history = ref<HistoryEntry[]>([]);

function loadHistory() {
  try {
    const stored = localStorage.getItem("bakas_history");
    if (stored) {
      history.value = JSON.parse(stored);
    }
  } catch {
    history.value = [];
  }
}

const showClearConfirm = ref(false);

function clearHistory() {
  showClearConfirm.value = true;
}

function confirmClear() {
  localStorage.removeItem("bakas_history");
  history.value = [];
  showClearConfirm.value = false;
}

function cancelClear() {
  showClearConfirm.value = false;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getScoreColor(score: number): string {
  if (score <= 40) return "text-safe dark:text-safe-dark";
  if (score <= 70) return "text-warning dark:text-warning-dark";
  return "text-danger dark:text-danger-dark";
}

onMounted(() => {
  loadHistory();
});
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">Scan History</h1>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Past fingerprint scans stored locally in your browser.
        </p>
      </div>
      <button
        v-if="history.length > 0"
        @click="clearHistory"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-danger dark:text-danger-dark border border-danger/30 dark:border-danger-dark/30 hover:bg-danger/5 dark:hover:bg-danger-dark/5 transition-colors"
      >
        <Trash2 class="w-3.5 h-3.5" />
        Clear History
      </button>
    </div>

    <!-- Empty state -->
    <div
      v-if="history.length === 0"
      class="text-center py-16"
    >
      <Clock class="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
      <h2 class="text-lg font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
        No scans yet
      </h2>
      <p class="text-sm text-zinc-400 dark:text-zinc-500 mb-4">
        Run a fingerprint scan to see your history here.
      </p>
      <NuxtLink
        to="/results"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-accent dark:bg-accent-dark text-white hover:opacity-90 transition-opacity"
      >
        <Fingerprint class="w-4 h-4" />
        Scan Now
      </NuxtLink>
    </div>

    <!-- History timeline -->
    <div v-else class="space-y-3">
      <div
        v-for="(entry, index) in history"
        :key="entry.timestamp + index"
        class="rounded-lg border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-4 transition-all duration-200 hover:shadow-md"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <!-- Score indicator dot -->
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
              :class="{
                'bg-green-100 dark:bg-green-900/20 text-safe dark:text-safe-dark': entry.score <= 40,
                'bg-amber-100 dark:bg-amber-900/20 text-warning dark:text-warning-dark': entry.score > 40 && entry.score <= 70,
                'bg-red-100 dark:bg-red-900/20 text-danger dark:text-danger-dark': entry.score > 70,
              }"
            >
              {{ entry.score }}
            </div>

            <div>
              <div class="flex items-center gap-2">
                <code class="text-sm font-mono text-zinc-700 dark:text-zinc-300">
                  {{ entry.hashPreview }}...
                </code>
                <span
                  v-if="entry.optedIn"
                  class="text-xs px-1.5 py-0.5 rounded bg-accent/10 dark:bg-accent-dark/10 text-accent dark:text-accent-dark"
                >
                  compared
                </span>
              </div>
              <p class="text-xs text-zinc-500 mt-0.5">
                {{ entry.browser }} · {{ entry.platform }} · {{ formatDate(entry.timestamp) }}
              </p>
            </div>
          </div>

          <!-- Compare hint for consecutive scans -->
          <div
            v-if="index < history.length - 1 && entry.hashPreview !== history[index + 1].hashPreview"
            class="hidden sm:block text-xs text-amber-600 dark:text-amber-400"
          >
            Fingerprint changed
          </div>
          <div
            v-else-if="index < history.length - 1"
            class="hidden sm:block text-xs text-zinc-400"
          >
            Same fingerprint
          </div>
        </div>
      </div>
    </div>

    <!-- Info note -->
    <div v-if="history.length > 0" class="mt-6 text-xs text-zinc-400 text-center">
      <p>History is stored only in your browser's localStorage. It is never sent anywhere.</p>
    </div>

    <!-- Clear history confirmation -->
    <ConfirmDialog
      v-if="showClearConfirm"
      title="Clear scan history?"
      message="This will permanently delete all saved scans from your browser. This cannot be undone."
      confirm-label="Clear history"
      cancel-label="Keep it"
      :destructive="true"
      @confirm="confirmClear"
      @cancel="cancelClear"
    />
  </div>
</template>