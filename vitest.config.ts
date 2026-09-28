import {fileURLToPath} from 'node:url';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vitest/config';

/**
 * Test config is kept separate from `vite.config.ts` on purpose.
 *
 * The app config is wrapped in the Laravel plugin, the PWA plugin and a
 * `replace` transform, all of which exist to produce a deployable bundle.
 * None of that is meaningful in a test process, and the Laravel plugin in
 * particular wants real entry HTML. Mixing the two would make the test run
 * depend on build scaffolding.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Mirrors `tsconfig.json` `compilerOptions.paths`. Declared explicitly
    // rather than relying on `resolve.tsconfigPaths` so a test import fails
    // loudly here instead of silently resolving to nothing.
    alias: {
      '@shadcn': fileURLToPath(
        new URL('./common/foundation/resources/client/shadcn', import.meta.url),
      ),
      '@ui': fileURLToPath(
        new URL('./common/foundation/resources/client/ui/library', import.meta.url),
      ),
      '@common': fileURLToPath(
        new URL('./common/foundation/resources/client', import.meta.url),
      ),
      '@app': fileURLToPath(new URL('./resources/client', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    // jsdom dominates this suite's wall clock, and by default vitest builds a
    // fresh environment per test file. `vmThreads` reuses one environment per
    // worker while keeping per-file isolation, which was the difference between
    // a two-minute and a two-second feedback loop here.
    pool: 'vmThreads',
    globals: false,
    setupFiles: ['./resources/client/test/setup.ts'],
    include: [
      'resources/client/**/*.{test,spec}.{ts,tsx}',
      'common/foundation/resources/client/**/*.{test,spec}.{ts,tsx}',
    ],
    // Excludes Storybook stories, which match the same `*.tsx` shape and would
    // otherwise be collected as if they were tests.
    exclude: [
      '**/node_modules/**',
      '**/build/**',
      '**/*.stories.{ts,tsx}',
    ],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'lcov'],
      reportsDirectory: './build/coverage',
      include: [
        'resources/client/**/*.{ts,tsx}',
        'common/foundation/resources/client/**/*.{ts,tsx}',
      ],
      exclude: [
        '**/*.stories.{ts,tsx}',
        '**/test/**',
        '**/*.config.{ts,tsx}',
      ],
    },
  },
});
