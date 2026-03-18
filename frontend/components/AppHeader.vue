<script setup lang="ts">
import { Sun, Moon, Menu, X, Fingerprint } from "lucide-vue-next";

const colorMode = useColorMode();
const route = useRoute();
const { mobileMenuOpen, toggleMobileMenu } = useUiStore();

function toggleTheme() {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
}

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/demo", label: "Demo" },
  { to: "/history", label: "History" },
  { to: "/learn", label: "Learn" },
];
</script>

<template>
  <header
    class="sticky top-0 z-50 border-b backdrop-blur-md bg-white/80 dark:bg-[#0a0a0a]/80 border-black/[0.07] dark:border-white/[0.07]"
  >
    <div class="max-w-5xl mx-auto px-4 sm:px-6">
      <div class="flex items-center justify-between h-14">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 font-bold text-lg">
          <Fingerprint class="w-5 h-5 text-accent dark:text-accent-dark" />
          <span>bakas</span>
        </NuxtLink>

        <!-- Desktop nav -->
        <nav class="hidden sm:flex items-center gap-1">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            :class="
              route.path === link.to
                ? 'text-accent dark:text-accent-dark bg-accent/10 dark:bg-accent-dark/10'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            "
          >
            {{ link.label }}
          </NuxtLink>

          <!-- Theme toggle -->
          <button
            @click="toggleTheme"
            class="ml-2 p-2 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Toggle theme"
          >
            <Sun v-if="colorMode.value === 'dark'" class="w-4 h-4" />
            <Moon v-else class="w-4 h-4" />
          </button>
        </nav>

        <!-- Mobile menu button -->
        <div class="flex items-center gap-2 sm:hidden">
          <button
            @click="toggleTheme"
            class="p-2 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            aria-label="Toggle theme"
          >
            <Sun v-if="colorMode.value === 'dark'" class="w-4 h-4" />
            <Moon v-else class="w-4 h-4" />
          </button>
          <button
            @click="toggleMobileMenu"
            class="p-2 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            aria-label="Toggle menu"
          >
            <X v-if="mobileMenuOpen" class="w-5 h-5" />
            <Menu v-else class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Mobile nav dropdown -->
      <nav
        v-if="mobileMenuOpen"
        class="sm:hidden pb-3 border-t border-black/[0.07] dark:border-white/[0.07]"
      >
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          @click="toggleMobileMenu"
          class="block px-3 py-2 rounded-md text-sm font-medium transition-colors"
          :class="
            route.path === link.to
              ? 'text-accent dark:text-accent-dark bg-accent/10 dark:bg-accent-dark/10'
              : 'text-zinc-600 dark:text-zinc-400'
          "
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
