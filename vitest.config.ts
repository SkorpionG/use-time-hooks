import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setupTests.ts'],
    include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', 'demos', 'examples'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      // Floors set just below current levels so coverage can't silently regress.
      thresholds: {
        statements: 97,
        branches: 84,
        functions: 98,
        lines: 98,
      },
      exclude: [
        'node_modules/',
        'tests/',
        'src/index.ts',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'demos/',
        'examples/',
      ],
    },
  },
});
