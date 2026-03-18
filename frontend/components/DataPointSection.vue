<script setup lang="ts">
import { ChevronDown } from "lucide-vue-next";
import { ref } from "vue";
import type { CollectorResult } from "~/composables/useFingerprint";

const props = defineProps<{
  title: string;
  results: CollectorResult[];
}>();

const isOpen = ref(true);

function toggle() {
  isOpen.value = !isOpen.value;
}

/**
 * Map each data point to its uniqueness level and explanation.
 * These are hardcoded because the levels represent general knowledge about
 * how identifying each data point typically is — they don't change per user.
 */
function getDataPointMeta(name: string): { uniqueness: "high" | "medium" | "low"; explanation: string } {
  const meta: Record<string, { uniqueness: "high" | "medium" | "low"; explanation: string }> = {
    "User Agent": {
      uniqueness: "high",
      explanation: "Your browser name, version, and OS combined narrow down your identity significantly. Trackers use this as a starting point to identify your device.",
    },
    "Languages": {
      uniqueness: "medium",
      explanation: "Your language preferences reveal your country and cultural background. Someone with 'fil, en-US, en' is likely in the Philippines.",
    },
    "Platform": {
      uniqueness: "medium",
      explanation: "Your operating system identifier. Combined with other data points, it narrows down your device type considerably.",
    },
    "Hardware Concurrency": {
      uniqueness: "medium",
      explanation: "The number of CPU cores in your device. A machine with 16 cores is much rarer than one with 4, making it more identifiable.",
    },
    "Device Memory": {
      uniqueness: "medium",
      explanation: "Your approximate RAM in GB. Chrome exposes this; Firefox blocks it entirely. The exact value helps distinguish between devices.",
    },
    "Cookies Enabled": {
      uniqueness: "low",
      explanation: "Most people have cookies enabled, so this alone isn't very identifying. But it adds one more bit of information to your fingerprint.",
    },
    "Do Not Track": {
      uniqueness: "medium",
      explanation: "Ironic but true: turning on Do Not Track actually makes you more unique, because very few people enable it. It can be used to track you.",
    },
    "Max Touch Points": {
      uniqueness: "low",
      explanation: "Distinguishes touch devices from non-touch. Phones and tablets typically report touch support, while desktops don't.",
    },
    "Screen & Display": {
      uniqueness: "medium",
      explanation: "Your screen resolution, color depth, and pixel ratio. Common resolutions like 1920x1080 are less identifying, but unusual ones stand out.",
    },
    "Timezone & Locale": {
      uniqueness: "low",
      explanation: "Your timezone tells trackers what country or region you're in, even if you're using a VPN that hides your IP.",
    },
    "Canvas Fingerprint": {
      uniqueness: "high",
      explanation: "Your graphics card and drivers render an invisible test image slightly differently from everyone else's. This unique output acts like a silent ID for your device.",
    },
    "WebGL Fingerprint": {
      uniqueness: "high",
      explanation: "WebGL exposes your exact GPU model, driver version, and supported features. This is extremely hard to spoof and very identifying.",
    },
    "Audio Fingerprint": {
      uniqueness: "high",
      explanation: "Audio processing produces slightly different floating-point outputs on different hardware. Inaudible to you, but unique to your device.",
    },
    "Installed Fonts": {
      uniqueness: "high",
      explanation: "The fonts installed on your device reflect your OS, region, and installed software. Someone who installed Microsoft Office has different fonts than someone who didn't.",
    },
    "Connection Info": {
      uniqueness: "low",
      explanation: "Your connection type and speed. This is a Chrome-only API — Firefox doesn't expose this data at all.",
    },
    "Media Devices": {
      uniqueness: "medium",
      explanation: "The count and combination of your audio/video devices uniquely identifies your hardware setup without ever asking for microphone permission.",
    },
    "Battery Status": {
      uniqueness: "low",
      explanation: "Battery level and charging state used to be a real tracking vector. Most browsers have now restricted this API, which is why it may be unavailable.",
    },
    "Storage & APIs": {
      uniqueness: "low",
      explanation: "Which storage APIs your browser supports. Most modern browsers support all of them, so this is less identifying on its own.",
    },
  };

  return meta[name] || {
    uniqueness: "low",
    explanation: "This data point contributes to your overall browser fingerprint.",
  };
}
</script>

<template>
  <div class="mb-4">
    <!-- Section header — clickable to collapse/expand -->
    <button
      @click="toggle"
      class="w-full flex items-center justify-between py-3 px-1 text-left group"
    >
      <h3 class="text-base font-semibold text-zinc-800 dark:text-zinc-200">
        {{ title }}
        <span class="text-xs font-normal text-zinc-400 ml-2">
          {{ results.length }} data point{{ results.length !== 1 ? "s" : "" }}
        </span>
      </h3>
      <ChevronDown
        class="w-4 h-4 text-zinc-400 transition-transform duration-200"
        :class="{ 'rotate-180': !isOpen }"
      />
    </button>

    <!-- Cards grid -->
    <div
      v-if="isOpen"
      class="grid grid-cols-1 sm:grid-cols-2 gap-3"
    >
      <DataPointCard
        v-for="result in results"
        :key="result.name"
        :name="result.name"
        :value="result.value"
        :status="result.status"
        :uniqueness="getDataPointMeta(result.name).uniqueness"
        :explanation="getDataPointMeta(result.name).explanation"
      />
    </div>
  </div>
</template>
