<script setup lang="ts">
/**
 * DataPointCard — Single Data Point Display
 *
 * Shows one collected fingerprint data point: its name, value, uniqueness
 * level (High/Medium/Low), and a plain-language explanation of what it
 * reveals to a tracker.
 */

const props = defineProps<{
  name: string;
  value: any;
  status: "available" | "unavailable";
  uniqueness: "high" | "medium" | "low";
  explanation: string;
}>();

// Format the value for display — hashes get truncated, objects get prettified
const displayValue = computed(() => {
  if (props.status === "unavailable") return null;
  if (props.value === null || props.value === undefined) return "N/A";

  // If it's a long string (probably a hash), truncate it
  if (typeof props.value === "string" && props.value.length > 32) {
    return props.value.substring(0, 16) + "...";
  }

  // If it's an object, format it nicely
  if (typeof props.value === "object") {
    // Special handling for common shapes
    if (props.value.fonts) {
      return `${props.value.count} fonts detected`;
    }
    if (props.value.hash) {
      return props.value.hash.substring(0, 16) + "...";
    }
    if (props.value.primary) {
      return props.value.all?.join(", ") || props.value.primary;
    }
    if (props.value.timezone) {
      return props.value.timezone;
    }
    if (props.value.width !== undefined) {
      return `${props.value.width}x${props.value.height} · ${props.value.colorDepth}bit · ${props.value.devicePixelRatio}x`;
    }
    if (props.value.effectiveType) {
      return `${props.value.effectiveType} · ${props.value.downlink} Mbps`;
    }
    if (props.value.audioinput !== undefined) {
      return `${props.value.audioinput} mic · ${props.value.audiooutput} speaker · ${props.value.videoinput} cam`;
    }
    if (props.value.charging !== undefined) {
      return `${props.value.charging ? "Charging" : "Not charging"} · ${Math.round(props.value.level * 100)}%`;
    }
    if (props.value.localStorage !== undefined) {
      const available = [
        props.value.localStorage && "localStorage",
        props.value.sessionStorage && "sessionStorage",
        props.value.indexedDB && "indexedDB",
        props.value.cacheAPI && "Cache API",
      ].filter(Boolean);
      return available.join(", ") || "None available";
    }

    // Fallback: JSON stringify (shortened)
    const json = JSON.stringify(props.value);
    return json.length > 60 ? json.substring(0, 57) + "..." : json;
  }

  return String(props.value);
});

const uniquenessLabel = computed(() => {
  if (props.uniqueness === "high") return "High";
  if (props.uniqueness === "medium") return "Medium";
  return "Low";
});
</script>

<template>
  <div
    class="rounded-lg border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111111] p-4 transition-shadow duration-200 hover:shadow-md"
  >
    <!-- Header row: name + uniqueness pill -->
    <div class="flex items-start justify-between gap-2 mb-2">
      <h4 class="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
        {{ name }}
      </h4>
      <span
        v-if="status === 'available'"
        class="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium"
        :class="{
          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400': uniqueness === 'high',
          'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400': uniqueness === 'medium',
          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400': uniqueness === 'low',
        }"
      >
        {{ uniquenessLabel }}
      </span>
    </div>

    <!-- Value -->
    <div v-if="status === 'available'" class="mb-2">
      <p class="text-sm font-mono text-zinc-700 dark:text-zinc-300 break-all">
        {{ displayValue }}
      </p>
    </div>
    <div v-else class="mb-2">
      <p class="text-sm text-zinc-400 dark:text-zinc-600 italic">
        Unavailable in this browser
      </p>
    </div>

    <!-- Explanation -->
    <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
      {{ explanation }}
    </p>
  </div>
</template>