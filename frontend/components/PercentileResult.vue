<script setup lang="ts">
import { Users, AlertCircle } from "lucide-vue-next";

const props = defineProps<{
  isNew: boolean;
  totalCount: number;
  percentile: number;
  error?: string;
}>();
</script>

<template>
  <!-- Error state: backend unreachable -->
  <div
    v-if="error"
    class="rounded-lg border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/10 p-4"
  >
    <div class="flex items-center gap-2 text-amber-700 dark:text-amber-400">
      <AlertCircle class="w-4 h-4 shrink-0" />
      <p class="text-sm">{{ error }}</p>
    </div>
  </div>

  <!-- Success state -->
  <div
    v-else
    class="rounded-lg border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-5"
  >
    <div class="flex items-center gap-2 mb-3">
      <Users class="w-5 h-5 text-accent dark:text-accent-dark" />
      <h3 class="text-base font-semibold text-zinc-800 dark:text-zinc-200">
        Database Comparison
      </h3>
    </div>

    <p class="text-2xl font-bold mb-1">
      More unique than
      <span class="text-accent dark:text-accent-dark">{{ percentile }}%</span>
      of visitors
    </p>

    <p class="text-sm text-zinc-500 dark:text-zinc-400">
      <template v-if="isNew">
        Your fingerprint is new — it hasn't been seen before.
      </template>
      <template v-else>
        This fingerprint has been seen before in the database.
      </template>
      Based on {{ totalCount.toLocaleString() }} total submissions.
    </p>
  </div>
</template>
