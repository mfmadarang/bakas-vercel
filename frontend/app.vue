<template>
  <div
    class="min-h-screen font-sans transition-colors duration-300 bg-page dark:bg-page-dark text-zinc-900 dark:text-zinc-100"
  >
    <AppHeader />
    <main class="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <NuxtPage />
    </main>
    <AppFooter />
  </div>
</template>

<style>
/* Global styles — kept minimal, most styling is in Tailwind */
html {
  scroll-behavior: smooth;
  overflow-y: scroll;
}

body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Monospace for hashes and code-like text */
.font-mono {
  font-family: "SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", monospace;
}

/* Custom scrollbar — used on any scrollable container */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(113, 113, 122, 0.3);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(113, 113, 122, 0.5);
}

/* Dark variant for dark backgrounds like the terminal */
.custom-scrollbar-dark::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scrollbar-dark::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar-dark::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.custom-scrollbar-dark::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Firefox scrollbar support */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(113, 113, 122, 0.3) transparent;
}

.custom-scrollbar-dark {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}
</style>