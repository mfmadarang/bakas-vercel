/**
 * useFingerprint — Client-Side Browser Fingerprint Collection Engine
 *
 * This is the core of bakas. Every function here collects a specific browser
 * property that trackers use to identify users without cookies.
 *
 * ALL collection happens in the browser — nothing is sent anywhere unless the
 * user explicitly opts in later. Each collector is its own function so it's
 * easy to understand what's being collected and why.
 *
 * Each collector returns: { value, status: "available" | "unavailable" }
 * If a browser blocks a feature, we mark it unavailable and move on.
 * The scan must always complete — one failure shouldn't break everything.
 */

// Helper: convert an ArrayBuffer (from SubtleCrypto) to a hex string
function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

// Helper: hash a string using SHA-256 via the Web Crypto API
async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return bufferToHex(hashBuffer);
}

// ─── Basic Browser Info ─────────────────────────────────────────────────────

/** Browser name, version, and OS — the most basic identifier */
function getUserAgent() {
  return { value: navigator.userAgent, status: "available" as const };
}

/** Language preferences reveal the user's country and cultural background */
function getLanguages() {
  return {
    value: {
      primary: navigator.language,
      all: Array.from(navigator.languages || [navigator.language]),
    },
    status: "available" as const,
  };
}

/** Operating system identifier — narrows down the device type */
function getPlatform() {
  return { value: navigator.platform, status: "available" as const };
}

/** Number of CPU cores — surprisingly unique across devices */
function getHardwareConcurrency() {
  return {
    value: navigator.hardwareConcurrency || null,
    status: navigator.hardwareConcurrency ? "available" : "unavailable",
  } as const;
}

/**
 * Approximate device RAM in GB.
 * Firefox blocks this entirely — which is actually a good privacy move.
 * Chrome exposes it, making Chrome users more fingerprintable.
 */
function getDeviceMemory() {
  const mem = (navigator as any).deviceMemory;
  return {
    value: mem ?? null,
    status: mem != null ? "available" : "unavailable",
  } as const;
}

/** Whether cookies are enabled — a single bit, but it adds up */
function getCookieEnabled() {
  return { value: navigator.cookieEnabled, status: "available" as const };
}

/**
 * Do Not Track header — the irony: enabling DNT actually makes you MORE
 * unique because very few people turn it on. So a privacy feature
 * becomes a tracking data point.
 */
function getDoNotTrack() {
  const dnt = navigator.doNotTrack;
  return { value: dnt, status: "available" as const };
}

/** Touch support distinguishes phones/tablets from desktop machines */
function getMaxTouchPoints() {
  return { value: navigator.maxTouchPoints, status: "available" as const };
}

// ─── Screen & Display ───────────────────────────────────────────────────────

function getScreenInfo() {
  let orientationType = null;
  try {
    orientationType = screen.orientation?.type || null;
  } catch {
    // Some browsers restrict orientation access
  }

  return {
    value: {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth,
      devicePixelRatio: window.devicePixelRatio,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      orientation: orientationType,
    },
    status: "available" as const,
  };
}

// ─── Timezone & Locale ──────────────────────────────────────────────────────

function getTimezoneInfo() {
  return {
    value: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: new Date().getTimezoneOffset(),
      numberLocale: Intl.NumberFormat().resolvedOptions().locale,
    },
    status: "available" as const,
  };
}

// ─── Canvas Fingerprint ─────────────────────────────────────────────────────

/**
 * Canvas fingerprinting works because the same drawing instructions produce
 * slightly different pixel output on different machines. The differences come
 * from the GPU, graphics driver version, OS-level font rendering, and
 * anti-aliasing implementation. Two machines running the same browser version
 * will still produce different canvas output if they have different GPUs.
 *
 * We draw a specific image, export it as a PNG data URL, and hash it.
 * The hash is the canvas fingerprint — unique to this hardware/software combo.
 */
async function getCanvasFingerprint(): Promise<{ value: string | null; status: string }> {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 280;
    canvas.height = 60;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { value: null, status: "unavailable" };

    // Background gradient — GPU rendering differences affect gradient output
    const gradient = ctx.createLinearGradient(0, 0, 280, 0);
    gradient.addColorStop(0, "#ff6b6b");
    gradient.addColorStop(0.5, "#4ecdc4");
    gradient.addColorStop(1, "#45b7d1");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 280, 60);

    // Colored rectangle — tests fill rendering
    ctx.fillStyle = "#f7b731";
    ctx.fillRect(10, 10, 40, 40);

    // Arc — tests curve rendering and anti-aliasing
    ctx.beginPath();
    ctx.arc(200, 30, 25, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(131, 56, 236, 0.7)";
    ctx.fill();

    // Text — font rendering is one of the biggest sources of uniqueness
    ctx.fillStyle = "#1a1a2e";
    ctx.font = "16px Arial, sans-serif";
    ctx.fillText("bakas fingerprint test 🇵🇭 <canvas> 1.0", 10, 35);

    const dataUrl = canvas.toDataURL("image/png");
    const hash = await sha256(dataUrl);

    return { value: hash, status: "available" };
  } catch {
    return { value: null, status: "unavailable" };
  }
}

// ─── WebGL Fingerprint ──────────────────────────────────────────────────────

/**
 * WebGL exposes detailed GPU information that is very hard to spoof.
 * The renderer string (e.g. "NVIDIA GeForce RTX 3060") combined with
 * supported extensions and max values creates a highly unique signature.
 */
async function getWebGLFingerprint(): Promise<{ value: any; status: string }> {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl || !(gl instanceof WebGLRenderingContext)) {
      return { value: null, status: "unavailable" };
    }

    // WEBGL_debug_renderer_info gives the actual GPU name
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : "unknown";
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "unknown";

    // Supported extensions — sorted for consistent hashing
    const extensions = (gl.getSupportedExtensions() || []).sort();

    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const maxViewport = gl.getParameter(gl.MAX_VIEWPORT_DIMS);
    const aliasedLineRange = gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE);

    const combined = [
      vendor,
      renderer,
      extensions.join(","),
      maxTextureSize,
      maxViewport ? `${maxViewport[0]}x${maxViewport[1]}` : "",
      aliasedLineRange ? `${aliasedLineRange[0]}-${aliasedLineRange[1]}` : "",
    ].join("|");

    const hash = await sha256(combined);

    return {
      value: {
        hash,
        vendor,
        renderer,
        extensionCount: extensions.length,
        maxTextureSize,
      },
      status: "available",
    };
  } catch {
    return { value: null, status: "unavailable" };
  }
}

// ─── Audio Fingerprint ──────────────────────────────────────────────────────

/**
 * Audio fingerprinting exploits the fact that audio processing (oscillators,
 * compressors, filters) produces slightly different floating-point outputs
 * on different hardware. The differences are in the least significant bits
 * of the audio samples — inaudible to humans, but unique to hardware.
 *
 * We create a simple audio signal, process it, and hash the raw sample values.
 */
async function getAudioFingerprint(): Promise<{ value: string | null; status: string }> {
  try {
    const audioCtx = new OfflineAudioContext(1, 4096, 44100);

    // Triangle wave at 1000 Hz — a simple signal that gets processed differently
    // by different audio hardware/drivers
    const oscillator = audioCtx.createOscillator();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime);

    // Dynamics compressor adds another layer of hardware-dependent processing
    const compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-50, audioCtx.currentTime);
    compressor.knee.setValueAtTime(40, audioCtx.currentTime);
    compressor.ratio.setValueAtTime(12, audioCtx.currentTime);
    compressor.attack.setValueAtTime(0, audioCtx.currentTime);
    compressor.release.setValueAtTime(0.25, audioCtx.currentTime);

    oscillator.connect(compressor);
    compressor.connect(audioCtx.destination);
    oscillator.start(0);

    const buffer = await audioCtx.startRendering();
    const samples = buffer.getChannelData(0);

    // Hash the first 50 samples — enough to capture hardware differences
    const sampleStr = Array.from(samples.slice(0, 50))
      .map((s) => s.toFixed(6))
      .join(",");

    const hash = await sha256(sampleStr);
    return { value: hash, status: "available" };
  } catch {
    return { value: null, status: "unavailable" };
  }
}

// ─── Font Detection ─────────────────────────────────────────────────────────

/**
 * Font detection works by rendering text in a requested font and comparing
 * the width to a baseline (sans-serif). If the width changes, the font is
 * installed. The fonts on your system reflect your OS, region, and installed
 * software — someone with Microsoft Office has different fonts than someone
 * using only Linux defaults.
 *
 * This is slow so it should run last, after all other collectors finish.
 */
function getInstalledFonts(): { value: { fonts: string[]; count: number }; status: string } {
  const fontsToTest = [
    "Arial", "Verdana", "Helvetica", "Tahoma", "Trebuchet MS",
    "Times New Roman", "Georgia", "Garamond", "Courier New",
    "Brush Script MT", "Comic Sans MS", "Impact", "Lucida Console",
    "Monaco", "Palatino", "Bookman", "Candara", "Franklin Gothic Medium",
    "Futura", "Gill Sans", "Geneva", "Optima", "Century Gothic",
    "Cambria", "Calibri", "Segoe UI", "Roboto", "Open Sans",
    "Noto Sans", "Lato",
  ];

  const baseFonts = ["monospace", "sans-serif", "serif"];
  const testString = "mmmmmmmmmmlli";
  const testSize = "72px";

  // Create a hidden span to measure text width
  const span = document.createElement("span");
  span.style.position = "absolute";
  span.style.left = "-9999px";
  span.style.fontSize = testSize;
  span.style.lineHeight = "normal";
  span.innerText = testString;
  document.body.appendChild(span);

  // Measure baseline widths for each base font
  const baseWidths: Record<string, number> = {};
  for (const base of baseFonts) {
    span.style.fontFamily = base;
    baseWidths[base] = span.offsetWidth;
  }

  const detected: string[] = [];

  for (const font of fontsToTest) {
    let isDetected = false;
    for (const base of baseFonts) {
      span.style.fontFamily = `"${font}", ${base}`;
      if (span.offsetWidth !== baseWidths[base]) {
        isDetected = true;
        break;
      }
    }
    if (isDetected) {
      detected.push(font);
    }
  }

  document.body.removeChild(span);

  return {
    value: { fonts: detected, count: detected.length },
    status: "available",
  };
}

// ─── Connection Info ────────────────────────────────────────────────────────

/**
 * The Network Information API (Chrome-only) reveals connection type and speed.
 * Firefox doesn't support this at all — which is better for privacy.
 * The connection type narrows down whether you're on wifi, cellular, etc.
 */
function getConnectionInfo() {
  const conn = (navigator as any).connection;
  if (!conn) {
    return { value: null, status: "unavailable" as const };
  }
  return {
    value: {
      effectiveType: conn.effectiveType || null,
      downlink: conn.downlink || null,
    },
    status: "available" as const,
  };
}

// ─── Media Devices ──────────────────────────────────────────────────────────

/**
 * enumerateDevices() returns the *types* of audio/video devices attached
 * (audioinput, audiooutput, videoinput) even without microphone permission.
 * The count and combination of devices is unique enough to help identify
 * a specific hardware setup — e.g. someone with 2 microphones and 3
 * audio outputs has a rarer setup than someone with 1 of each.
 */
async function getMediaDevices(): Promise<{ value: any; status: string }> {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return { value: null, status: "unavailable" };
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    const counts = {
      audioinput: 0,
      audiooutput: 0,
      videoinput: 0,
    };

    for (const device of devices) {
      if (device.kind in counts) {
        counts[device.kind as keyof typeof counts]++;
      }
    }

    return { value: counts, status: "available" };
  } catch {
    return { value: null, status: "unavailable" };
  }
}

// ─── Battery Status ─────────────────────────────────────────────────────────

/**
 * Battery status used to be a real tracking vector — the exact battery level
 * plus charging state could re-identify a device within a short time window.
 * Most browsers have now restricted or removed this API, so it's likely
 * unavailable. When it IS available, it adds another data point.
 */
async function getBatteryStatus(): Promise<{ value: any; status: string }> {
  try {
    if (!("getBattery" in navigator)) {
      return { value: null, status: "unavailable" };
    }
    const battery = await (navigator as any).getBattery();
    return {
      value: {
        charging: battery.charging,
        level: battery.level,
      },
      status: "available",
    };
  } catch {
    return { value: null, status: "unavailable" };
  }
}

// ─── Storage Estimates ──────────────────────────────────────────────────────

async function getStorageInfo(): Promise<{ value: any; status: string }> {
  const info: Record<string, any> = {
    localStorage: false,
    sessionStorage: false,
    indexedDB: false,
    cacheAPI: false,
    storageQuota: null,
  };

  // Check localStorage
  try {
    localStorage.setItem("__bakas_test", "1");
    localStorage.removeItem("__bakas_test");
    info.localStorage = true;
  } catch {
    // blocked or full
  }

  // Check sessionStorage
  try {
    sessionStorage.setItem("__bakas_test", "1");
    sessionStorage.removeItem("__bakas_test");
    info.sessionStorage = true;
  } catch {
    // blocked
  }

  // Check indexedDB
  try {
    info.indexedDB = !!window.indexedDB;
  } catch {
    // blocked
  }

  // Check Cache API
  try {
    info.cacheAPI = "caches" in window;
  } catch {
    // blocked
  }

  // Storage estimate (quota)
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      info.storageQuota = {
        quota: estimate.quota || null,
        usage: estimate.usage || null,
      };
    }
  } catch {
    // blocked
  }

  return { value: info, status: "available" };
}

// ─── Main Collection Function ───────────────────────────────────────────────

export interface CollectorResult {
  name: string;
  category: string;
  value: any;
  status: "available" | "unavailable";
}

/**
 * Runs all fingerprint collectors one by one.
 * Calls the onProgress callback after each collector finishes so the UI
 * can show a live progress indicator.
 *
 * Each collector is wrapped with a 5-second timeout — if something hangs,
 * we skip it and mark it unavailable rather than blocking the whole scan.
 */
export function useFingerprint() {
  async function collectAll(
    onProgress?: (result: CollectorResult, index: number, total: number) => void
  ): Promise<CollectorResult[]> {
    const results: CollectorResult[] = [];

    // Define collectors in order — fonts last because they're slowest
    const collectors: Array<{
      name: string;
      category: string;
      collect: () => any | Promise<any>;
    }> = [
      { name: "User Agent", category: "Browser & Device", collect: getUserAgent },
      { name: "Languages", category: "Browser & Device", collect: getLanguages },
      { name: "Platform", category: "Browser & Device", collect: getPlatform },
      { name: "Hardware Concurrency", category: "Browser & Device", collect: getHardwareConcurrency },
      { name: "Device Memory", category: "Browser & Device", collect: getDeviceMemory },
      { name: "Cookies Enabled", category: "Browser & Device", collect: getCookieEnabled },
      { name: "Do Not Track", category: "Browser & Device", collect: getDoNotTrack },
      { name: "Max Touch Points", category: "Browser & Device", collect: getMaxTouchPoints },
      { name: "Screen & Display", category: "Screen & Display", collect: getScreenInfo },
      { name: "Timezone & Locale", category: "Timezone & Language", collect: getTimezoneInfo },
      { name: "Canvas Fingerprint", category: "Graphics", collect: getCanvasFingerprint },
      { name: "WebGL Fingerprint", category: "Graphics", collect: getWebGLFingerprint },
      { name: "Audio Fingerprint", category: "Audio", collect: getAudioFingerprint },
      { name: "Connection Info", category: "Network & Connection", collect: getConnectionInfo },
      { name: "Media Devices", category: "Media Devices", collect: getMediaDevices },
      { name: "Battery Status", category: "Browser & Device", collect: getBatteryStatus },
      { name: "Storage & APIs", category: "Storage & APIs", collect: getStorageInfo },
      // Font detection is last because it's the slowest (DOM measurement loop)
      { name: "Installed Fonts", category: "Installed Fonts", collect: getInstalledFonts },
    ];

    const total = collectors.length;

    // Minimum time per collector step (in ms) so the progress animation
    // is actually visible. 18 collectors × 200ms = ~3.6 seconds minimum.
    // Without this, fast devices finish the entire scan in <100ms and
    // the user never sees the progress screen.
    const MIN_STEP_DELAY = 200;

    for (let i = 0; i < collectors.length; i++) {
      const { name, category, collect } = collectors[i];
      const stepStart = Date.now();

      try {
        // 5-second timeout per collector
        const result = await Promise.race([
          Promise.resolve(collect()),
          new Promise<{ value: null; status: "unavailable" }>((resolve) =>
            setTimeout(() => resolve({ value: null, status: "unavailable" }), 5000)
          ),
        ]);

        const entry: CollectorResult = {
          name,
          category,
          value: result.value,
          status: result.status as "available" | "unavailable",
        };
        results.push(entry);

        // Wait the remaining time so each step takes at least MIN_STEP_DELAY
        const elapsed = Date.now() - stepStart;
        if (elapsed < MIN_STEP_DELAY) {
          await new Promise((r) => setTimeout(r, MIN_STEP_DELAY - elapsed));
        }

        if (onProgress) {
          onProgress(entry, i, total);
        }
      } catch {
        // If a collector completely crashes, mark it unavailable and continue
        const entry: CollectorResult = {
          name,
          category,
          value: null,
          status: "unavailable",
        };
        results.push(entry);

        const elapsed = Date.now() - stepStart;
        if (elapsed < MIN_STEP_DELAY) {
          await new Promise((r) => setTimeout(r, MIN_STEP_DELAY - elapsed));
        }

        if (onProgress) {
          onProgress(entry, i, total);
        }
      }
    }

    return results;
  }

  return { collectAll };
}