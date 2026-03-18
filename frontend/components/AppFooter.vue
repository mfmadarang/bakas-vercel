<script setup lang="ts">
import { Github, Heart } from "lucide-vue-next";
</script>

<template>
  <footer
    class="mt-16 border-t border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#0a0a0a]"
  >
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-sm text-zinc-500">
          <span class="font-semibold text-zinc-700 dark:text-zinc-300">bakas</span>
          — No data is collected without your explicit consent.
        </div>
        <div class="flex items-center gap-4 text-sm text-zinc-500">
          <span class="flex items-center gap-1">
            Made with <Heart class="w-3.5 h-3.5 text-danger dark:text-danger-dark" /> in PH
          </span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener"
            class="flex items-center gap-1 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            <Github class="w-4 h-4" />
            Source
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
