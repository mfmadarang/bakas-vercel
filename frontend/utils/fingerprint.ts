/**
 * utils/fingerprint.ts — Fingerprint Hash Generation
 *
 * Takes the raw collected data points and generates a single SHA-256 hash
 * that serves as the fingerprint ID. The hash is deterministic — same
 * input always produces the same output.
 *
 * We sort the keys alphabetically before hashing so the order collectors
 * run in doesn't affect the result.
 */

import type { CollectorResult } from "~/composables/useFingerprint";

function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

/**
 * Generate a fingerprint hash from the collected data points.
 * Only uses available data points — unavailable ones are excluded
 * so the hash stays consistent even if a browser blocks some features.
 */
export async function generateFingerprintHash(results: CollectorResult[]): Promise<string> {
  // Build a clean object with only available data points, keys sorted
  const dataForHashing: Record<string, any> = {};

  for (const result of results) {
    if (result.status === "available" && result.value != null) {
      dataForHashing[result.name] = result.value;
    }
  }

  // Sort keys alphabetically for consistent hashing
  const sortedKeys = Object.keys(dataForHashing).sort();
  const canonical: Record<string, any> = {};
  for (const key of sortedKeys) {
    canonical[key] = dataForHashing[key];
  }

  const jsonString = JSON.stringify(canonical);
  const encoder = new TextEncoder();
  const data = encoder.encode(jsonString);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  return bufferToHex(hashBuffer);
}
