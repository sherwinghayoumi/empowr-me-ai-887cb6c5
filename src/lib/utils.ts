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

/**
 * Skill level classification based on percentage score.
 * Used for visual representation of skill proficiency.
 */
export type SkillLevel = "very-strong" | "strong" | "moderate" | "weak" | "very-weak";

/**
 * Converts a numeric skill score (0-100) into a categorical skill level.
 * @param score - Skill score as percentage (0-100)
 * @returns SkillLevel classification
 */
export function getSkillLevel(score: number): SkillLevel {
  if (score >= 90) return "very-strong";
  if (score >= 70) return "strong";
  if (score >= 50) return "moderate";
  if (score >= 30) return "weak";
  return "very-weak";
}
