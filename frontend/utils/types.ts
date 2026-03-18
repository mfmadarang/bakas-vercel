/**
 * utils/types.ts — Shared types used across components
 */

export interface TerminalLine {
  text: string;
  category: "system" | "collect" | "warn" | "network" | "done";
}