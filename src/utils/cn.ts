import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

/**
 * Generate a list of css classes, merged.
 */
export default function cn(...args: Parameters<typeof clsx>): string {
	return twMerge(clsx(...args));
}
