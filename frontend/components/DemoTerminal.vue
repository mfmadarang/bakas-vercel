<script setup lang="ts">
/**
 * DemoTerminal — Color-Coded Tracker Simulation
 *
 * Each line has a category that controls its color:
 *   "system"  — dim gray, for init/status messages
 *   "collect" — green, for data being collected
 *   "warn"    — amber, for concerning revelations
 *   "network" — red, for data being sent out
 *   "done"    — cyan, for completion
 *
 * Lines appear with a typewriter effect. The terminal auto-scrolls
 * to keep the latest line visible.
 */

import { ref, onMounted, watch, nextTick } from "vue";
import type { TerminalLine } from "~/utils/types";

const props = defineProps<{
  lines: TerminalLine[];
  running: boolean;
}>();

const emit = defineEmits<{
  (e: "complete"): void;
  (e: "lineAdded", index: number): void;
}>();

const terminalRef = ref<HTMLElement | null>(null);
const visibleLines = ref<TerminalLine[]>([]);
const currentLineIndex = ref(0);
const currentCharIndex = ref(0);
const currentText = ref("");
const isComplete = ref(false);

let typingInterval: ReturnType<typeof setInterval> | null = null;

const colorMap: Record<string, string> = {
  system: "text-zinc-500",
  collect: "text-green-400",
  warn: "text-amber-400",
  network: "text-red-400",
  done: "text-cyan-400",
};

const prefixMap: Record<string, string> = {
  system: "sys",
  collect: "GET",
  warn: "!!",
  network: "POST",
  done: ">>>",
};

function scrollToBottom() {
  nextTick(() => {
    if (terminalRef.value) {
      terminalRef.value.scrollTop = terminalRef.value.scrollHeight;
    }
  });
}

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

  // Vary typing speed by category — network lines type faster (urgent feel)
  const baseSpeed = line.category === "network" ? 12 : line.category === "system" ? 25 : 18;

  typingInterval = setInterval(() => {
    if (currentCharIndex.value < line.text.length) {
      currentText.value += line.text[currentCharIndex.value];
      currentCharIndex.value++;
    } else {
      if (typingInterval) clearInterval(typingInterval);
      visibleLines.value.push(line);
      currentText.value = "";
      currentLineIndex.value++;
      emit("lineAdded", currentLineIndex.value);
      scrollToBottom();

      // Delay between lines — longer pauses after network/warn lines for drama
      let delay = 150 + Math.random() * 200;
      if (line.category === "network") delay = 400 + Math.random() * 300;
      if (line.category === "warn") delay = 350 + Math.random() * 200;
      if (line.text === "") delay = 100;

      setTimeout(() => typeLine(), delay);
    }
  }, baseSpeed + Math.random() * 10);
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

onUnmounted(() => {
  stop();
});
</script>

<template>
  <div
    ref="terminalRef"
    class="rounded-lg bg-zinc-950 border border-zinc-800 p-4 font-mono text-xs sm:text-sm overflow-y-auto custom-scrollbar-dark"
    style="max-height: 480px"
  >
    <!-- Terminal chrome -->
    <div class="flex items-center gap-1.5 mb-3 pb-2 border-b border-zinc-800">
      <div class="w-2.5 h-2.5 rounded-full bg-red-500" />
      <div class="w-2.5 h-2.5 rounded-full bg-amber-500" />
      <div class="w-2.5 h-2.5 rounded-full bg-green-500" />
      <span class="ml-2 text-[10px] text-zinc-600 font-medium tracking-wider uppercase">tracker.js</span>
    </div>

    <!-- Completed lines -->
    <div
      v-for="(line, i) in visibleLines"
      :key="i"
      class="leading-relaxed py-[1px]"
    >
      <template v-if="line.text === ''">
        <div class="h-2"></div>
      </template>
      <template v-else>
        <span class="text-zinc-600 select-none">[{{ prefixMap[line.category] }}]</span>
        <span :class="colorMap[line.category]" class="ml-1.5">{{ line.text }}</span>
      </template>
    </div>

    <!-- Currently typing -->
    <div v-if="currentText && currentLineIndex < lines.length" class="leading-relaxed py-[1px]">
      <span class="text-zinc-600 select-none">[{{ prefixMap[lines[currentLineIndex].category] }}]</span>
      <span :class="colorMap[lines[currentLineIndex].category]" class="ml-1.5">{{ currentText }}</span>
      <span class="animate-pulse" :class="colorMap[lines[currentLineIndex].category]">▊</span>
    </div>

    <!-- Idle cursor -->
    <div v-if="!isComplete && !currentText && visibleLines.length === 0" class="leading-relaxed">
      <span class="text-zinc-600 select-none">[sys]</span>
      <span class="animate-pulse text-zinc-500 ml-1.5">▊</span>
    </div>
  </div>
</template>