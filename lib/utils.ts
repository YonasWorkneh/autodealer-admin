import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatPrice = (price: string | number, compacted?: boolean) => {
  if (!price) return;
  const val = typeof price === "string" ? parseFloat(price) : price;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "ETB",
    notation: compacted ? "compact" : "standard",
    compactDisplay: compacted ? "short" : undefined,
    maximumFractionDigits: compacted ? 1 : 2, // fewer decimals for compact
  }).format(val);
};
