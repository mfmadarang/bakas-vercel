<script setup lang="ts">
/**
 * UniquenessGauge — Multi-Segment Ring
 *
 * Each arc segment represents a category (Graphics, Audio, Fonts, etc.).
 * The length of the segment is proportional to that category's weight.
 * The colored fill within each segment shows how exposed that category is.
 * The unfilled portion is dim, representing blocked or protected data points.
 *
 * Center shows the overall score number.
 */

import type { CategoryScore } from "~/utils/scoring";

const props = defineProps<{
  score: number;
  label: string;
  level: "low" | "medium" | "high";
  categories: CategoryScore[];
  size?: number;
}>();

const gaugeSize = props.size || 160;
const strokeWidth = 10;
const radius = (gaugeSize - strokeWidth) / 2;
const circumference = 2 * Math.PI * radius;

// Gap between segments in radians (converted to circumference units)
const GAP = 4; // px gap between each segment

// Build arc segments from category data
const segments = computed(() => {
  const cats = props.categories;
  if (!cats.length) return [];

  const totalMax = cats.reduce((sum, c) => sum + c.maxPoints, 0);
  const totalGaps = cats.length * GAP;
  const availableLength = circumference - totalGaps;

  let offset = 0;
  return cats.map((cat) => {
    const segmentLength = (cat.maxPoints / totalMax) * availableLength;
    const filledLength = segmentLength * (cat.score / 100);

    const seg = {
      name: cat.name,
      color: cat.color,
      offset,
      totalLength: segmentLength,
      filledLength,
      score: cat.score,
    };

    offset += segmentLength + GAP;
    return seg;
  });
});

const levelColor = computed(() => {
  if (props.level === "low") return "text-safe dark:text-safe-dark";
  if (props.level === "medium") return "text-warning dark:text-warning-dark";
  return "text-danger dark:text-danger-dark";
});
</script>

<template>
  <div class="flex flex-col items-center gap-2">
    <div class="relative" :style="{ width: `${gaugeSize}px`, height: `${gaugeSize}px` }">
      <svg :width="gaugeSize" :height="gaugeSize" class="transform -rotate-90">
        <!-- Background tracks (dim) for each segment -->
        <circle
          v-for="(seg, i) in segments"
          :key="'bg-' + i"
          :cx="gaugeSize / 2"
          :cy="gaugeSize / 2"
          :r="radius"
          fill="none"
          stroke="currentColor"
          class="text-zinc-200 dark:text-zinc-800"
          :stroke-width="strokeWidth"
          :stroke-dasharray="`${seg.totalLength} ${circumference - seg.totalLength}`"
          :stroke-dashoffset="-seg.offset"
          stroke-linecap="round"
        />

        <!-- Filled arcs for each segment -->
        <circle
          v-for="(seg, i) in segments"
          :key="'fill-' + i"
          :cx="gaugeSize / 2"
          :cy="gaugeSize / 2"
          :r="radius"
          fill="none"
          :stroke="seg.color"
          :stroke-width="strokeWidth"
          :stroke-dasharray="`${seg.filledLength} ${circumference - seg.filledLength}`"
          :stroke-dashoffset="-seg.offset"
          stroke-linecap="round"
          class="transition-all duration-1000 ease-out"
          :opacity="seg.filledLength > 0 ? 1 : 0"
        />
      </svg>

      <!-- Score centered inside -->
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span class="text-3xl font-bold leading-none text-zinc-800 dark:text-zinc-100">{{ score }}</span>
        <span class="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">/100</span>
      </div>
    </div>

    <!-- Label -->
    <p class="text-xs font-semibold tracking-wide uppercase" :class="levelColor">
      {{ label }}
    </p>
  </div>
</template>