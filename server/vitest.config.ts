import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ["src/tests/**/*.test.ts"],
    globals: true, 
    environment: 'node',
    coverage: {
      reporter: ['text', 'html'],
    },
    setupFiles: ['./src/config/dotenv.ts']
  },
});