import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Enum names as words: "CheckedOut" → "Checked Out", "PartiallyPaid" → "Partially Paid" */
export function enumLabel(name: string | undefined) {
  return (name ?? '').replace(/([a-z])([A-Z])/g, '$1 $2');
}
