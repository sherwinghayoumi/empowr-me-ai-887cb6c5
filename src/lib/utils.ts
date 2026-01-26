import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Caps a percentage value at 100% for display purposes.
 * Internal calculations may use values > 100%, but for UI display,
 * values are capped at 100% for user comprehension.
 */
export function capLevel(value: number | null | undefined, max = 100): number {
  if (value === null || value === undefined) return 0;
  return Math.min(value, max);
}
