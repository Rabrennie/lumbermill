import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    // commands resolve the repo from process.cwd(), which needs a forked process per file
    pool: 'forks',
    testTimeout: 20_000,
    // oclif logs through console, which @oclif/test can only capture when vitest leaves it alone
    disableConsoleIntercept: true,
  },
});
