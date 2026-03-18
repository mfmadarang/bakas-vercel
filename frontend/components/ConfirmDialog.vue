<script setup lang="ts">
/**
 * ConfirmDialog — Custom replacement for browser's confirm().
 * Styled to match the rest of the app instead of looking like a
 * system popup from 2005.
 */

import { AlertTriangle } from "lucide-vue-next";

const props = defineProps<{
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}>();

const emit = defineEmits<{
  (e: "confirm"): void;
  (e: "cancel"): void;
}>();
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div
      class="w-full max-w-sm rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-6 shadow-2xl"
    >
      <!-- Icon + Title -->
      <div class="flex items-center gap-3 mb-3">
        <div
          class="w-9 h-9 rounded-lg flex items-center justify-center"
          :class="destructive ? 'bg-red-100 dark:bg-red-900/20' : 'bg-amber-100 dark:bg-amber-900/20'"
        >
          <AlertTriangle
            class="w-4.5 h-4.5"
            :class="destructive ? 'text-danger dark:text-danger-dark' : 'text-warning dark:text-warning-dark'"
          />
        </div>
        <h3 class="text-base font-bold text-zinc-900 dark:text-zinc-100">
          {{ title }}
        </h3>
      </div>

      <!-- Message -->
      <p class="text-sm text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
        {{ message }}
      </p>

      <!-- Buttons -->
      <div class="flex gap-3">
        <button
          @click="emit('cancel')"
          class="flex-1 px-4 py-2 rounded-lg text-sm font-medium border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          {{ cancelLabel || "Cancel" }}
        </button>
        <button
          @click="emit('confirm')"
          class="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="
            destructive
              ? 'bg-danger dark:bg-danger-dark text-white hover:opacity-90'
              : 'bg-accent dark:bg-accent-dark text-white hover:opacity-90'
          "
        >
          {{ confirmLabel || "Confirm" }}
        </button>
      </div>
    </div>
  </div>
</template>