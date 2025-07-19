import dotenv from 'dotenv';
import { defineConfig } from 'vitest/config';

dotenv.config();

export default defineConfig({
  test: {
    include: ["src/tests/**/*.test.ts"],
    globals: true, 
    environment: 'node',
    coverage: {
      reporter: ['text', 'html'],
    },
    setupFiles: ['./src/tests/setup-env.ts']
  },
});