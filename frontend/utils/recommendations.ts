/**
 * utils/recommendations.ts — Privacy Recommendations
 *
 * Generates personalized recommendations based on what was actually collected
 * from the user's browser. If their browser blocked something, we don't
 * recommend fixing it — we tell them their browser is already doing well.
 *
 * Recommendations are sorted by impact (highest first).
 */

import type { CollectorResult } from "~/composables/useFingerprint";

export interface Recommendation {
  id: string;
  icon: string;        // Lucide icon name
  title: string;
  explanation: string;
  learnMoreUrl: string;
  priority: number;    // higher = show first
}

/**
 * Generate recommendations based on the collected fingerprint data.
 * Only recommends things that are actually relevant to this user's browser.
 */
export function generateRecommendations(results: CollectorResult[]): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Helper to find a specific result by name
  function find(name: string): CollectorResult | undefined {
    return results.find((r) => r.name === name);
  }

  // Canvas fingerprint was collected → recommend fingerprint-resistant browsers
  const canvas = find("Canvas Fingerprint");
  if (canvas && canvas.status === "available") {
    recommendations.push({
      id: "canvas",
      icon: "Palette",
      title: "Your canvas fingerprint is exposed",
      explanation:
        "Your browser allows websites to silently draw invisible images and use the output to identify your device. Firefox with privacy.resistFingerprinting enabled or the Brave browser blocks this technique.",
      learnMoreUrl: "https://wiki.mozilla.org/Security/Fingerprinting",
      priority: 100,
    });
  }

  // WebGL data collected → recommend blocking or spoofing WebGL
  const webgl = find("WebGL Fingerprint");
  if (webgl && webgl.status === "available") {
    recommendations.push({
      id: "webgl",
      icon: "Cpu",
      title: "Your GPU info is visible to websites",
      explanation:
        "WebGL reveals your exact GPU model and driver version. You can disable WebGL in browser settings or use an extension like WebGL Fingerprint Defender to spoof this data.",
      learnMoreUrl: "https://browserleaks.com/webgl",
      priority: 90,
    });
  }

  // Audio fingerprint collected
  const audio = find("Audio Fingerprint");
  if (audio && audio.status === "available") {
    recommendations.push({
      id: "audio",
      icon: "Volume2",
      title: "Audio processing reveals your hardware",
      explanation:
        "Websites can create silent audio signals and use the processing differences to identify your device. Firefox with privacy.resistFingerprinting normalizes this output.",
      learnMoreUrl: "https://audiofingerprint.openwpm.com/",
      priority: 80,
    });
  }

  // Many fonts detected
  const fonts = find("Installed Fonts");
  if (fonts && fonts.status === "available" && fonts.value?.count > 20) {
    recommendations.push({
      id: "fonts",
      icon: "Type",
      title: `${fonts.value.count} fonts detected — that's a lot`,
      explanation:
        "The more fonts you have installed, the more unique your combination is. Consider removing unused fonts or using a browser that limits font enumeration like Firefox or Brave.",
      learnMoreUrl: "https://browserleaks.com/fonts",
      priority: 70,
    });
  }

  // DNT is not enabled
  const dnt = find("Do Not Track");
  if (dnt && (dnt.value === null || dnt.value === "0" || dnt.value === "unspecified")) {
    recommendations.push({
      id: "dnt",
      icon: "ShieldOff",
      title: 'Enable "Do Not Track" (but know its limits)',
      explanation:
        "Do Not Track is a browser signal that asks websites not to track you. Most sites ignore it, and ironically, enabling it makes your fingerprint slightly more unique — but it's still worth enabling as a baseline signal.",
      learnMoreUrl: "https://allaboutdnt.com/",
      priority: 30,
    });
  }

  // Device memory was available — Firefox blocks this
  const deviceMem = find("Device Memory");
  if (deviceMem && deviceMem.status === "available") {
    recommendations.push({
      id: "deviceMemory",
      icon: "MemoryStick",
      title: "Your RAM amount is exposed (Chrome-only leak)",
      explanation:
        "Chrome exposes your approximate device memory to websites. Firefox blocks this API entirely. Consider using Firefox to prevent this data point from being collected.",
      learnMoreUrl: "https://developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory",
      priority: 50,
    });
  }

  // Connection info was available — Chrome-only
  const conn = find("Connection Info");
  if (conn && conn.status === "available") {
    recommendations.push({
      id: "connection",
      icon: "Wifi",
      title: "Your network type is visible (Chrome-only)",
      explanation:
        "Chrome's Network Information API reveals your connection type and speed. Firefox doesn't support this API at all, which means one less data point for trackers.",
      learnMoreUrl: "https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API",
      priority: 40,
    });
  }

  // Timezone matches language — might not be using a VPN
  const tz = find("Timezone & Locale");
  const lang = find("Languages");
  if (tz && lang && tz.status === "available" && lang.status === "available") {
    const timezone = tz.value?.timezone || "";
    const primary = lang.value?.primary || "";

    // Simple heuristic: if timezone is Asia/Manila and language starts with en or fil,
    // they're likely in PH without a VPN. Suggest VPN for IP-level privacy.
    const isLocalMatch =
      (timezone.includes("Manila") && (primary.startsWith("en") || primary.startsWith("fil"))) ||
      (timezone.includes("America") && primary.startsWith("en"));

    if (isLocalMatch) {
      recommendations.push({
        id: "vpn",
        icon: "Globe",
        title: "Consider a VPN for IP-level privacy",
        explanation:
          "Your timezone and language settings match, which suggests you're browsing without a VPN. While a VPN doesn't prevent fingerprinting, it hides your IP address from the sites you visit.",
        learnMoreUrl: "https://www.privacyguides.org/en/vpn/",
        priority: 20,
      });
    }
  }

  // Always show this recommendation last — it's the single most effective step
  recommendations.push({
    id: "overall",
    icon: "Shield",
    title: "Best single step: switch to a privacy browser",
    explanation:
      "The most effective way to reduce your fingerprint is to use Firefox with privacy.resistFingerprinting enabled, or the Brave browser. Both actively fight fingerprinting at the browser level by normalizing or blocking the data points collected above.",
    learnMoreUrl: "https://www.privacyguides.org/en/desktop-browsers/",
    priority: 10,
  });

  // Sort by priority (highest first)
  recommendations.sort((a, b) => b.priority - a.priority);

  return recommendations;
}
