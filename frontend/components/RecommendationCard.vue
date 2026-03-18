<script setup lang="ts">
import {
  Palette, Cpu, Volume2, Type, ShieldOff, MemoryStick,
  Wifi, Globe, Shield, ExternalLink
} from "lucide-vue-next";
import type { Recommendation } from "~/utils/recommendations";

const props = defineProps<{
  recommendation: Recommendation;
}>();

// Map icon string names to actual components
const iconMap: Record<string, any> = {
  Palette, Cpu, Volume2, Type, ShieldOff, MemoryStick,
  Wifi, Globe, Shield,
};

const iconComponent = computed(() => iconMap[props.recommendation.icon] || Shield);
</script>

<template>
  <div
    class="rounded-lg border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-4 transition-shadow duration-200 hover:shadow-md"
  >
    <div class="flex gap-3">
      <!-- Icon -->
      <div class="shrink-0 w-9 h-9 rounded-lg bg-accent/10 dark:bg-accent-dark/10 flex items-center justify-center">
        <component :is="iconComponent" class="w-4.5 h-4.5 text-accent dark:text-accent-dark" />
      </div>

      <div class="flex-1 min-w-0">
        <h4 class="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
          {{ recommendation.title }}
        </h4>
        <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-2">
          {{ recommendation.explanation }}
        </p>
        <a
          :href="recommendation.learnMoreUrl"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-1 text-xs font-medium text-accent dark:text-accent-dark hover:underline"
        >
          Learn more
          <ExternalLink class="w-3 h-3" />
        </a>
      </div>
    </div>
  </div>
</template>