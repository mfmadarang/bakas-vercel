<script setup lang="ts">
/**
 * AppFooter — Live Privacy Audit
 *
 * Instead of a generic footer tagline, this actively audits the bakas
 * site itself in real time and proves it's clean. It counts cookies,
 * third-party scripts, and tracking pixels on this page. Since bakas
 * doesn't use any of them, all counters show zero.
 *
 * This isn't decorative — the numbers are real. If someone ever adds
 * a third-party script, these counters would actually reflect it.
 */

import { Cookie, Code, Radio, ShieldCheck } from "lucide-vue-next";

const cookieCount = ref(0);
const thirdPartyScripts = ref(0);
const trackingPixels = ref(0);
const auditComplete = ref(false);

function countCookies(): number {
  // document.cookie returns a semicolon-separated string of all cookies
  // If empty, there are zero cookies set
  const raw = document.cookie.trim();
  if (!raw) return 0;
  return raw.split(";").length;
}

function countThirdPartyScripts(): number {
  // Check all <script> tags on the page and count ones loaded from
  // external domains (not our own origin)
  const scripts = document.querySelectorAll("script[src]");
  let count = 0;
  const ourOrigin = window.location.origin;

  scripts.forEach((script) => {
    const src = script.getAttribute("src") || "";
    // Relative URLs and same-origin are fine
    if (src.startsWith("/") || src.startsWith(ourOrigin)) return;
    // Data URIs and blobs are internal
    if (src.startsWith("data:") || src.startsWith("blob:")) return;
    // Everything else is third-party
    if (src.startsWith("http://") || src.startsWith("https://")) {
      count++;
    }
  });

  return count;
}

function countTrackingPixels(): number {
  // Tracking pixels are typically 1x1 or 0x0 <img> tags loaded from
  // external domains, or <img> tags hidden with display:none
  const images = document.querySelectorAll("img");
  let count = 0;
  const ourOrigin = window.location.origin;

  images.forEach((img) => {
    const src = img.getAttribute("src") || "";
    if (!src || src.startsWith("/") || src.startsWith(ourOrigin)) return;
    if (src.startsWith("data:")) return;

    // Check if it's a tiny image (tracking pixel pattern)
    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;
    const isHidden = window.getComputedStyle(img).display === "none";

    if ((width <= 1 && height <= 1) || isHidden) {
      count++;
    }
  });

  return count;
}

function runAudit() {
  cookieCount.value = countCookies();
  thirdPartyScripts.value = countThirdPartyScripts();
  trackingPixels.value = countTrackingPixels();
  auditComplete.value = true;
}

onMounted(() => {
  // Small delay so the page is fully loaded before auditing
  setTimeout(runAudit, 500);
});
</script>

<template>
  <footer
    class="border-t border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#0a0a0a]"
  >
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <!-- Audit header -->
      <div class="flex items-center gap-2 mb-4">
        <ShieldCheck class="w-4 h-4 text-safe dark:text-safe-dark" />
        <p class="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          Live site audit
        </p>
        <span
          v-if="auditComplete"
          class="w-1.5 h-1.5 rounded-full bg-safe dark:bg-safe-dark animate-pulse"
        ></span>
      </div>

      <!-- Audit counters -->
      <div class="grid grid-cols-3 gap-4 mb-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center">
            <Cookie class="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <p class="text-lg font-bold leading-none">{{ cookieCount }}</p>
            <p class="text-[11px] text-zinc-400 mt-0.5">cookies set</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center">
            <Code class="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <p class="text-lg font-bold leading-none">{{ thirdPartyScripts }}</p>
            <p class="text-[11px] text-zinc-400 mt-0.5">3rd-party scripts</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center">
            <Radio class="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <p class="text-lg font-bold leading-none">{{ trackingPixels }}</p>
            <p class="text-[11px] text-zinc-400 mt-0.5">tracking pixels</p>
          </div>
        </div>
      </div>

      <!-- Bottom line -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-black/[0.05] dark:border-white/[0.05]">
        <p class="text-[11px] text-zinc-400">
          These numbers are checked live on every page load. This is not a badge. It's a real audit.
        </p>
        <div class="flex items-center gap-3 text-[11px] text-zinc-500">
          <NuxtLink
            to="/privacy"
            class="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            Privacy Notice
          </NuxtLink>
          <span class="text-zinc-300 dark:text-zinc-700">|</span>
          <span>
            <span class="font-semibold text-zinc-600 dark:text-zinc-400">bakas</span>
            · 2025
          </span>
        </div>
      </div>
    </div>
  </footer>
</template>