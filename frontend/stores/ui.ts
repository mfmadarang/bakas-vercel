/**
 * stores/ui.ts — Global UI State
 *
 * Manages UI-level state that isn't tied to fingerprint data:
 * whether the opt-in modal is showing, mobile menu state, etc.
 */

import { defineStore } from "pinia";
import { ref } from "vue";

export const useUiStore = defineStore("ui", () => {
  const showOptInModal = ref(false);
  const mobileMenuOpen = ref(false);

  function openOptIn() {
    showOptInModal.value = true;
  }

  function closeOptIn() {
    showOptInModal.value = false;
  }

  function toggleMobileMenu() {
    mobileMenuOpen.value = !mobileMenuOpen.value;
  }

  return {
    showOptInModal,
    mobileMenuOpen,
    openOptIn,
    closeOptIn,
    toggleMobileMenu,
  };
});
