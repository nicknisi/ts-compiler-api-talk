import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		// setupFiles: 'src/test/setup.tsx',
		include: ['scripts/**/*.spec.ts'],
		exclude: ['**/node_modules/**'],
		setupFiles: ['./scripts/test/setup.ts'],
		coverage: {
			provider: 'v8',
			exclude: ['**/node_modules/**'],
		},
	},
});
