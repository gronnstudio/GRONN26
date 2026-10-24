import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/** Klassen samenvoegen zoals shadcn/ui verwacht. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
