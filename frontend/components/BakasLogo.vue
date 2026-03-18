<script setup lang="ts">
/**
 * BakasLogo — Animated logo for the navbar.
 *
 * Idle: fingerprint icon + "bakas" text.
 * Hover: a horizontal scan line sweeps across the fingerprint icon,
 * the icon briefly pulses, and the text does a subtle glitch flicker.
 * Fits the surveillance-exposure theme.
 */

const isHovered = ref(false);
</script>

<template>
  <NuxtLink
    to="/"
    class="logo-container flex items-center gap-2.5 font-bold text-lg select-none"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Fingerprint icon with scan line -->
    <div class="logo-icon relative w-7 h-7 flex items-center justify-center" :class="{ 'is-hovered': isHovered }">
      <!-- The fingerprint SVG -->
      <svg
        class="w-5 h-5 text-accent dark:text-accent-dark transition-transform duration-300"
        :class="{ 'scale-110': isHovered }"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
        <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
        <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
        <path d="M2 12a10 10 0 0 1 18-6" />
        <path d="M2 16h.01" />
        <path d="M21.8 16c.2-2 .131-5.354 0-6" />
        <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" />
        <path d="M8.65 22c.21-.66.45-1.32.57-2" />
        <path d="M9 6.8a6 6 0 0 1 9 5.2v2" />
      </svg>

      <!-- Scan line — sweeps vertically on hover -->
      <div class="scan-line absolute inset-x-0 h-[2px] bg-accent/60 dark:bg-accent-dark/60 rounded-full pointer-events-none" />

      <!-- Brief glow flash on hover -->
      <div
        class="absolute inset-0 rounded-lg bg-accent/0 dark:bg-accent-dark/0 transition-colors duration-150"
        :class="isHovered ? 'bg-accent/10 dark:bg-accent-dark/10' : ''"
      />
    </div>

    <!-- Text with glitch effect on hover -->
    <span class="logo-text relative" :class="{ 'is-hovered': isHovered }">
      <span class="relative z-10 text-zinc-800 dark:text-zinc-100">bakas</span>
      <!-- Glitch layers — only visible during hover animation -->
      <span class="glitch-layer glitch-r absolute inset-0 text-accent dark:text-accent-dark opacity-0" aria-hidden="true">bakas</span>
      <span class="glitch-layer glitch-b absolute inset-0 text-danger dark:text-danger-dark opacity-0" aria-hidden="true">bakas</span>
    </span>
  </NuxtLink>
</template>

<style scoped>
/* ── Scan line ── */
.scan-line {
  top: 0;
  opacity: 0;
  transition: opacity 0.1s;
}

.logo-icon.is-hovered .scan-line {
  animation: scan-sweep 0.6s ease-in-out forwards;
}

@keyframes scan-sweep {
  0% {
    top: 0;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    top: calc(100% - 2px);
    opacity: 0;
  }
}

/* ── Text glitch ── */
.glitch-layer {
  pointer-events: none;
  clip-path: inset(0 0 0 0);
}

.logo-text.is-hovered .glitch-r {
  animation: glitch-r 0.3s steps(2) 0.1s forwards;
}

.logo-text.is-hovered .glitch-b {
  animation: glitch-b 0.3s steps(2) 0.15s forwards;
}

@keyframes glitch-r {
  0% {
    opacity: 0;
    transform: translate(0, 0);
    clip-path: inset(0 0 70% 0);
  }
  25% {
    opacity: 0.7;
    transform: translate(2px, -1px);
    clip-path: inset(20% 0 50% 0);
  }
  50% {
    opacity: 0.5;
    transform: translate(-1px, 1px);
    clip-path: inset(60% 0 10% 0);
  }
  75% {
    opacity: 0.3;
    transform: translate(1px, 0);
    clip-path: inset(10% 0 80% 0);
  }
  100% {
    opacity: 0;
    transform: translate(0, 0);
  }
}

@keyframes glitch-b {
  0% {
    opacity: 0;
    transform: translate(0, 0);
    clip-path: inset(60% 0 0 0);
  }
  25% {
    opacity: 0.6;
    transform: translate(-2px, 1px);
    clip-path: inset(40% 0 30% 0);
  }
  50% {
    opacity: 0.4;
    transform: translate(1px, -1px);
    clip-path: inset(10% 0 60% 0);
  }
  75% {
    opacity: 0.2;
    transform: translate(-1px, 0);
    clip-path: inset(50% 0 20% 0);
  }
  100% {
    opacity: 0;
    transform: translate(0, 0);
  }
}
</style>