import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge and deduplicate class names.
 * It uses clsx to handle various types of input (array, object, string, etc.),
 * and twMerge to handle Tailwind CSS class names specifically.
 *
 * @param {...ClassValue[]} inputs - The class names to merge.
 * @returns {string} The merged class names.
 */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}
