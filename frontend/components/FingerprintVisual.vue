<script setup lang="ts">
/**
 * FingerprintVisual — Geometric Identicon from Hash
 *
 * Generates a unique visual "face" for a fingerprint hash by using the
 * hash bytes to deterministically seed shapes, colors, positions, and sizes.
 * Two identical hashes always produce the same visual. Changing one
 * character in the hash produces a completely different image.
 *
 * The approach: parse pairs of hex characters from the hash as numbers (0–255)
 * and use those to pick shape types, positions, colors, rotations, etc.
 */

const props = defineProps<{
  hash: string;
  size?: number;
}>();

const size = props.size || 200;

// Parse hex pairs from the hash into an array of numbers (0–255)
function hashToBytes(hash: string): number[] {
  const bytes: number[] = [];
  const clean = hash.replace(/[^0-9a-f]/gi, "");
  for (let i = 0; i < clean.length - 1; i += 2) {
    bytes.push(parseInt(clean.substring(i, i + 2), 16));
  }
  return bytes;
}

// Derive a color palette from the first 6 bytes of the hash
function getColors(bytes: number[]): string[] {
  if (bytes.length < 6) return ["#6366f1", "#4ecdc4", "#f59e0b"];

  return [
    `hsl(${bytes[0] * 1.41}, 65%, 55%)`,  // primary
    `hsl(${bytes[1] * 1.41}, 55%, 60%)`,  // secondary
    `hsl(${bytes[2] * 1.41}, 50%, 65%)`,  // tertiary
  ];
}

// Shape types we can draw
type ShapeType = "circle" | "rect" | "triangle" | "hexagon";

interface Shape {
  type: ShapeType;
  x: number;
  y: number;
  size: number;
  rotation: number;
  color: string;
  opacity: number;
}

function generateShapes(hash: string): Shape[] {
  const bytes = hashToBytes(hash);
  if (bytes.length < 16) return [];

  const colors = getColors(bytes);
  const shapeTypes: ShapeType[] = ["circle", "rect", "triangle", "hexagon"];

  // Number of shapes: 4 to 12, derived from a hash byte
  const numShapes = 4 + (bytes[6] % 9);

  const shapes: Shape[] = [];
  const viewSize = size;

  for (let i = 0; i < numShapes; i++) {
    // Use different hash bytes for each property, wrapping around if needed
    const idx = (7 + i * 5) % bytes.length;
    const b0 = bytes[idx % bytes.length];
    const b1 = bytes[(idx + 1) % bytes.length];
    const b2 = bytes[(idx + 2) % bytes.length];
    const b3 = bytes[(idx + 3) % bytes.length];
    const b4 = bytes[(idx + 4) % bytes.length];

    shapes.push({
      type: shapeTypes[b0 % shapeTypes.length],
      x: (b1 / 255) * viewSize * 0.8 + viewSize * 0.1,
      y: (b2 / 255) * viewSize * 0.8 + viewSize * 0.1,
      size: 15 + (b3 / 255) * 40,
      rotation: (b4 / 255) * 360,
      color: colors[i % colors.length],
      opacity: 0.4 + (b0 / 255) * 0.5,
    });
  }

  return shapes;
}

// SVG path for a triangle centered at origin
function trianglePath(s: number): string {
  const h = s * Math.sqrt(3) / 2;
  return `M 0 ${-h * 0.67} L ${s / 2} ${h * 0.33} L ${-s / 2} ${h * 0.33} Z`;
}

// SVG path for a hexagon centered at origin
function hexagonPath(s: number): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    points.push(`${Math.cos(angle) * s},${Math.sin(angle) * s}`);
  }
  return `M ${points.join(" L ")} Z`;
}

const shapes = computed(() => generateShapes(props.hash));

// Background color from hash
const bgColor = computed(() => {
  const bytes = hashToBytes(props.hash);
  if (bytes.length < 3) return "#1a1a2e";
  return `hsl(${bytes[3] * 1.41}, 15%, 12%)`;
});
</script>

<template>
  <svg
    :width="size"
    :height="size"
    :viewBox="`0 0 ${size} ${size}`"
    class="rounded-2xl"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- Background -->
    <rect :width="size" :height="size" :fill="bgColor" rx="16" />

    <!-- Shapes -->
    <g v-for="(shape, i) in shapes" :key="i">
      <!-- Circle -->
      <circle
        v-if="shape.type === 'circle'"
        :cx="shape.x"
        :cy="shape.y"
        :r="shape.size / 2"
        :fill="shape.color"
        :opacity="shape.opacity"
      />

      <!-- Rectangle -->
      <rect
        v-else-if="shape.type === 'rect'"
        :x="shape.x - shape.size / 2"
        :y="shape.y - shape.size / 2"
        :width="shape.size"
        :height="shape.size * 0.7"
        :fill="shape.color"
        :opacity="shape.opacity"
        :transform="`rotate(${shape.rotation} ${shape.x} ${shape.y})`"
        rx="3"
      />

      <!-- Triangle -->
      <path
        v-else-if="shape.type === 'triangle'"
        :d="trianglePath(shape.size)"
        :fill="shape.color"
        :opacity="shape.opacity"
        :transform="`translate(${shape.x} ${shape.y}) rotate(${shape.rotation})`"
      />

      <!-- Hexagon -->
      <path
        v-else-if="shape.type === 'hexagon'"
        :d="hexagonPath(shape.size / 2)"
        :fill="shape.color"
        :opacity="shape.opacity"
        :transform="`translate(${shape.x} ${shape.y}) rotate(${shape.rotation})`"
      />
    </g>
  </svg>
</template>
