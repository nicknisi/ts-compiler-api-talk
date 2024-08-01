import { expect } from 'vitest';

interface CustomMatchers<T = unknown> {
	/**
	 * Asserts that two strings are structurally equal, ignoring whitespace.
	 * @param expected The expected string
	 */
	toStructurallyEqual(expected: string): T;
}

declare module 'vitest' {
	interface Assertion<T = any> extends CustomMatchers<T> {}
	interface AsymmetricMatchersContaining extends CustomMatchers {}
}

expect.extend({
	// FIXME: I really need this to not compare about attribute order, whitespace, etc.
	toStructurallyEqual(actual: string, expected: string) {
		const normalize = (str: string) => str.split(/\s/).filter(Boolean).join(' ');
		if (normalize(actual) !== normalize(expected)) {
			return {
				message: () => `Expected ${actual} to match ${expected}`,
				pass: false,
			};
		}
		return { pass: true, message: () => '' };
	},
});
