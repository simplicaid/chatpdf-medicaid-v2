import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// conditional function to use tailwind styling much more easier.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
