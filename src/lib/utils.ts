import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9ა-ჿ]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Empty strings from forms become null so optional DB columns stay clean. */
export function emptyToNull<T>(value: T): T | null {
  return typeof value === "string" && value.trim() === "" ? null : value;
}

export function pluralize(count: number, one: string, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`;
}
