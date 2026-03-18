<script setup lang="ts">
/**
 * DemoTerminal — Typewriter Tracker Simulation
 *
 * Simulates what a third-party tracking script sees when you visit a page.
 * Lines appear one at a time with a typewriter effect, using the user's
 * ACTUAL real-time fingerprint data to make it personal and visceral.
 *
 * This is purely educational — the dramatic presentation makes the privacy
 * implications feel real instead of abstract.
 */

import { ref, onMounted, watch } from "vue";

const props = defineProps<{
  lines: string[];
  running: boolean;
}>();

const emit = defineEmits<{
  (e: "complete"): void;
}>();

const visibleLines = ref<string[]>([]);
const currentLineIndex = ref(0);
const currentCharIndex = ref(0);
const currentText = ref("");
const isComplete = ref(false);

let typingInterval: ReturnType<typeof setInterval> | null = null;

function startTyping() {
  visibleLines.value = [];
  currentLineIndex.value = 0;
  currentCharIndex.value = 0;
  currentText.value = "";
  isComplete.value = false;

  typeLine();
}

function typeLine() {
  if (currentLineIndex.value >= props.lines.length) {
    isComplete.value = true;
    emit("complete");
    return;
  }

  const line = props.lines[currentLineIndex.value];
  currentCharIndex.value = 0;
  currentText.value = "";

  typingInterval = setInterval(() => {
    if (currentCharIndex.value < line.length) {
      currentText.value += line[currentCharIndex.value];
      currentCharIndex.value++;
    } else {
      // Line complete — add it to visible lines and move to next
      if (typingInterval) clearInterval(typingInterval);
      visibleLines.value.push(line);
      currentText.value = "";
      currentLineIndex.value++;

      // Small delay between lines to simulate script processing
      setTimeout(() => typeLine(), 200 + Math.random() * 300);
    }
  }, 20 + Math.random() * 15); // Vary typing speed slightly for realism
}

function stop() {
  if (typingInterval) {
    clearInterval(typingInterval);
    typingInterval = null;
  }
}

watch(() => props.running, (newVal) => {
  if (newVal) {
    startTyping();
  } else {
    stop();
  }
});

onMounted(() => {
  if (props.running) {
    startTyping();
  }
});

// Cleanup on unmount
onUnmounted(() => {
  stop();
});
</script>

<template>
  <div
    class="rounded-lg bg-zinc-950 border border-zinc-800 p-4 font-mono text-sm overflow-y-auto custom-scrollbar-dark"
    style="max-height: 400px"
  >
    <!-- Terminal header dots -->
    <div class="flex items-center gap-1.5 mb-3 pb-2 border-b border-zinc-800">
      <div class="w-2.5 h-2.5 rounded-full bg-red-500" />
      <div class="w-2.5 h-2.5 rounded-full bg-amber-500" />
      <div class="w-2.5 h-2.5 rounded-full bg-green-500" />
      <span class="ml-2 text-xs text-zinc-600">tracker.js</span>
    </div>

    <!-- Completed lines -->
    <div
      v-for="(line, i) in visibleLines"
      :key="i"
      class="leading-relaxed"
    >
      <span class="text-zinc-500">[tracker.js]</span>
      <span class="text-green-400 ml-1">{{ line }}</span>
    </div>

    <!-- Currently typing line -->
    <div v-if="currentText" class="leading-relaxed">
      <span class="text-zinc-500">[tracker.js]</span>
      <span class="text-green-400 ml-1">{{ currentText }}</span>
      <span class="animate-pulse text-green-400">▊</span>
    </div>

    <!-- Blinking cursor when idle or waiting -->
    <div v-if="!isComplete && !currentText && visibleLines.length === 0" class="leading-relaxed">
      <span class="text-zinc-500">[tracker.js]</span>
      <span class="animate-pulse text-green-400 ml-1">▊</span>
    </div>
  </div>
</template>