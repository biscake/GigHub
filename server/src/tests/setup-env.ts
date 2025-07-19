import { beforeAll, vi } from "vitest";

beforeAll(() => {
  vi.stubEnv('DATABASE_URL', process.env.TEST_DATABASE_URL);
})
