/**
 * Utilities - Shared helper functions across Knightfall systems
 * Contains math, vector, timing, and type utilities
 * @module utility/Utilities
 */

import { Vector3 } from "@minecraft/server";

/**
 * Calculate distance between two positions
 */
export function calculateDistance(pos1: Vector3, pos2: Vector3): number {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  const dz = pos1.z - pos2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Calculate distance squared (faster, no sqrt)
 */
export function calculateDistanceSquared(pos1: Vector3, pos2: Vector3): number {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  const dz = pos1.z - pos2.z;
  return dx * dx + dy * dy + dz * dz;
}

/**
 * Calculate direction vector from pos1 to pos2 (normalized)
 */
export function getDirection(pos1: Vector3, pos2: Vector3): Vector3 {
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;
  const dz = pos2.z - pos1.z;
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

  if (dist === 0) return { x: 0, y: 0, z: 0 };

  return {
    x: dx / dist,
    y: dy / dist,
    z: dz / dist,
  };
}

/**
 * Add vectors together
 */
export function addVector(v1: Vector3, v2: Vector3): Vector3 {
  return {
    x: v1.x + v2.x,
    y: v1.y + v2.y,
    z: v1.z + v2.z,
  };
}

/**
 * Scale a vector by a multiplier
 */
export function scaleVector(v: Vector3, scale: number): Vector3 {
  return {
    x: v.x * scale,
    y: v.y * scale,
    z: v.z * scale,
  };
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linearly interpolate between two values
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

/**
 * Smooth step interpolation
 */
export function smoothstep(a: number, b: number, t: number): number {
  const clamped = clamp(t, 0, 1);
  return a + (b - a) * (clamped * clamped * (3 - 2 * clamped));
}

/**
 * Check if a position is within range of another
 */
export function isInRange(
  pos1: Vector3,
  pos2: Vector3,
  range: number
): boolean {
  return calculateDistanceSquared(pos1, pos2) <= range * range;
}

/**
 * Round position to nearest block
 */
export function roundPosition(pos: Vector3): Vector3 {
  return {
    x: Math.round(pos.x),
    y: Math.round(pos.y),
    z: Math.round(pos.z),
  };
}

/**
 * Floor position to block grid
 */
export function floorPosition(pos: Vector3): Vector3 {
  return {
    x: Math.floor(pos.x),
    y: Math.floor(pos.y),
    z: Math.floor(pos.z),
  };
}

/**
 * Generate a unique ID using timestamp and random value
 */
export function generateUniqueId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a UUID-like string
 */
export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Safe property access with fallback
 */
export function safeGet<T>(obj: any, path: string, fallback: T): T {
  try {
    const parts = path.split(".");
    let value = obj;

    for (const part of parts) {
      if (value && typeof value === "object" && part in value) {
        value = value[part];
      } else {
        return fallback;
      }
    }

    return (value !== undefined ? value : fallback) as T;
  } catch {
    return fallback;
  }
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map((item) => deepClone(item)) as T;
  if (obj instanceof Object) {
    const clonedObj: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone((obj as any)[key]);
      }
    }
    return clonedObj;
  }
  return obj;
}

/**
 * Delay execution (returns promise)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 100
): Promise<T> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxAttempts - 1) throw error;
      await delay(delayMs * Math.pow(2, i));
    }
  }
  throw new Error("Retry failed");
}

/**
 * Convert degrees to radians
 */
export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Convert radians to degrees
 */
export function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Normalize angle to 0-360 range
 */
export function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

/**
 * Check if arrays are equal
 */
export function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, idx) => val === b[idx]);
}

/**
 * Get random element from array
 */
export function randomElement<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Get random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Shuffle array in place
 */
export function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default {
  calculateDistance,
  calculateDistanceSquared,
  getDirection,
  addVector,
  scaleVector,
  clamp,
  lerp,
  smoothstep,
  isInRange,
  roundPosition,
  floorPosition,
  generateUniqueId,
  generateUUID,
  safeGet,
  deepClone,
  delay,
  retry,
  toRadians,
  toDegrees,
  normalizeAngle,
  arraysEqual,
  randomElement,
  randomInt,
  shuffle,
};
