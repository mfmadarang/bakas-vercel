<script setup lang="ts">
/**
 * ScanProgress — Live Fingerprint Collection Progress
 *
 * Shows each collector as it completes, one by one, with its name and
 * a checkmark. The progress bar and individual item animations make the
 * scan feel informative rather than just a loading spinner — seeing
 * "Collecting canvas fingerprint..." teaches users what's happening.
 */

import { Check, Loader2, Fingerprint } from "lucide-vue-next";
import type { CollectorResult } from "~/composables/useFingerprint";

const props = defineProps<{
  completedItems: CollectorResult[];
  currentName: string;
  progress: number;     // 0 to 1
  totalCount: number;
}>();

const progressPercent = computed(() => Math.round(props.progress * 100));
</script>

<template>
  <div class="w-full max-w-md mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-center gap-3 mb-6">
      <Fingerprint class="w-6 h-6 text-accent dark:text-accent-dark animate-pulse" />
      <h2 class="text-lg font-bold">Scanning your browser...</h2>
    </div>

    <!-- Progress bar -->
    <div class="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 mb-6 overflow-hidden">
      <div
        class="h-full rounded-full bg-accent dark:bg-accent-dark transition-all duration-300 ease-out"
        :style="{ width: `${progressPercent}%` }"
      />
    </div>

    <!-- Current collector -->
    <div
      v-if="currentName"
      class="flex items-center gap-2 mb-4 text-sm text-zinc-500 dark:text-zinc-400"
    >
      <Loader2 class="w-4 h-4 animate-spin text-accent dark:text-accent-dark" />
      <span>Collecting {{ currentName }}...</span>
    </div>

    <!-- Completed items list -->
    <div class="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar">
      <div
        v-for="(item, index) in completedItems"
        :key="item.name"
        class="flex items-center gap-2 text-sm"
        :style="{ animationDelay: `${index * 50}ms` }"
      >
        <Check
          v-if="item.status === 'available'"
          class="w-4 h-4 text-safe dark:text-safe-dark shrink-0"
        />
        <span
          v-else
          class="w-4 h-4 shrink-0 flex items-center justify-center text-zinc-400 text-xs"
        >—</span>

        <span class="text-zinc-600 dark:text-zinc-400">{{ item.name }}</span>

        <span
          v-if="item.status === 'unavailable'"
          class="text-xs text-zinc-400 dark:text-zinc-600 italic"
        >
          (blocked)
        </span>
      </div>
    </div>

    <!-- Counter -->
    <p class="text-center text-xs text-zinc-400 mt-4">
      {{ completedItems.length }} / {{ totalCount }} collectors complete
    </p>
  </div>
</template>