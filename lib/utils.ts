import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Dinamik olarak CSS sınıf adlarını birleştiren ve Tailwind çakışmalarını çözen yardımcı fonksiyon
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
