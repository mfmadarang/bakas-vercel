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
}

body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Monospace for hashes and code-like text */
.font-mono {
  font-family: "SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", monospace;
}
</style>
