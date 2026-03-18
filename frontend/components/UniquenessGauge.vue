<script setup lang="ts">
/**
 * UniquenessGauge — Circular SVG Gauge
 *
 * Displays the uniqueness score (0–100) as a circular progress gauge.
 * The gauge is built from two SVG circles — a background track and a
 * colored arc. The arc length is calculated using stroke-dasharray/dashoffset.
 *
 * Colors:
 *   0–40  (green)  = hard to track
 *   41–70 (yellow) = moderately trackable
 *   71–100 (red)   = easily trackable
 */

const props = defineProps<{
  score: number;
  label: string;
  level: "low" | "medium" | "high";
}>();

// Circle math for the gauge arc
const gaugeSize = 160;
const strokeWidth = 10;
const radius = (gaugeSize - strokeWidth) / 2;
const circumference = 2 * Math.PI * radius;

// How much of the circle to fill based on score (0–100)
const dashOffset = computed(() => {
  const progress = props.score / 100;
  return circumference * (1 - progress);
});

// Color based on level
const gaugeColor = computed(() => {
  if (props.level === "low") return "#22c55e";    // green
  if (props.level === "medium") return "#f59e0b";  // amber
  return "#ef4444";                                 // red
});
</script>

<template>
  <div class="flex flex-col items-center gap-3">
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

    <!-- Score number overlaid in the center -->
    <div class="absolute flex flex-col items-center" style="margin-top: 50px">
      <span class="text-3xl font-bold">{{ score }}</span>
      <span class="text-xs text-zinc-500 dark:text-zinc-400">/100</span>
    </div>

    <!-- Label below the gauge -->
    <p
      class="text-sm font-medium text-center"
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
