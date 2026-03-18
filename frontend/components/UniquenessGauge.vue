<script setup lang="ts">
/**
 * UniquenessGauge — Circular SVG Gauge
 *
 * Displays the uniqueness score (0–100) as a circular progress gauge.
 * The gauge is two SVG circles (background track + colored arc) with
 * the score number centered inside using a proper relative/absolute layout.
 */

const props = defineProps<{
  score: number;
  label: string;
  level: "low" | "medium" | "high";
  size?: number;
}>();

const gaugeSize = props.size || 140;
const strokeWidth = 8;
const radius = (gaugeSize - strokeWidth) / 2;
const circumference = 2 * Math.PI * radius;

const dashOffset = computed(() => {
  const progress = props.score / 100;
  return circumference * (1 - progress);
});

const gaugeColor = computed(() => {
  if (props.level === "low") return "#22c55e";
  if (props.level === "medium") return "#f59e0b";
  return "#ef4444";
});
</script>

<template>
  <div class="flex flex-col items-center gap-2">
    <!-- Gauge with overlaid score — relative parent so absolute child centers properly -->
    <div class="relative" :style="{ width: `${gaugeSize}px`, height: `${gaugeSize}px` }">
      <svg :width="gaugeSize" :height="gaugeSize" class="transform -rotate-90">
        <!-- Background track -->
        <circle
          :cx="gaugeSize / 2"
          :cy="gaugeSize / 2"
          :r="radius"
          fill="none"
          stroke="currentColor"
          class="text-zinc-200 dark:text-zinc-800"
          :stroke-width="strokeWidth"
        />
        <!-- Progress arc -->
        <circle
          :cx="gaugeSize / 2"
          :cy="gaugeSize / 2"
          :r="radius"
          fill="none"
          :stroke="gaugeColor"
          :stroke-width="strokeWidth"
          stroke-linecap="round"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
          class="transition-all duration-1000 ease-out"
        />
      </svg>

      <!-- Score centered inside the gauge -->
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span class="text-3xl font-bold leading-none">{{ score }}</span>
        <span class="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">/100</span>
      </div>
    </div>

    <!-- Label below -->
    <p
      class="text-xs font-semibold tracking-wide uppercase"
      :class="{
        'text-safe dark:text-safe-dark': level === 'low',
        'text-warning dark:text-warning-dark': level === 'medium',
        'text-danger dark:text-danger-dark': level === 'high',
      }"
    >
      {{ label }}
    </p>
  </div>
</template>